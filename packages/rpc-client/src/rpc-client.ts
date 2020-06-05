import { RpcServerError } from './rpc-server-error';
import { RpcResponse } from './rpc-response';
import { RpcRequest } from './rpc-request';
import { RpcClientError } from './rpc-client-error';

let _requestId = 0x1000;

function serializeToObject(key: string | null, data: unknown, binaryPayload: FormData): unknown {
	const type = typeof data;

	if (type === 'undefined' || data === null) {
		return null;
	}

	switch (type) {
		case 'boolean':
		case 'string':
		case 'number':
			if (!key) {
				throw new Error('Key must be defined for primitive values');
			}

			return data;

		case 'object':
			if (Array.isArray(data) || (FileList && data instanceof FileList)) {
				if (!key) {
					throw new Error('Key must be defined for array values');
				}

				const result: any[] = [];
				for (let i = 0; i < data.length; i++) {
					const nextKey = `${key}[${i}]`;
					const item = serializeToObject(nextKey, data[i], binaryPayload);

					result.push(item);
				}
				return result;
			} else if ((data as any)._isAMomentObject === true /* hack to avoid dependency but still provide out of the box support */) {
				return (data as any).format();
			} else if ((data as any).isLuxonDateTime === true  /* hack to avoid dependency but still provide out of the box support */) {
				return (data as any).toISO();
			} else if (File && data instanceof File) {
				if (!key) {
					throw new Error('Key must be defined for file values');
				}

				binaryPayload.append(key, data);
				return key;
			} else {
				const result: any = {};
				for (const k in (data as any)) {
					if (!(data as any).hasOwnProperty(k)) {
						continue;
					}

					const nextKey = key ? `${key}.${k}` : k;
					const item = serializeToObject(nextKey, (data as any)[k], binaryPayload);

					result[k] = item;
				}
				return result;
			}

		default:
			throw new Error(`Undefined behavior for data type '${type}' and key '${key}'`);
	}
}

function serializeToFormData(request: RpcRequest, formRequestKey: string): FormData {
	const formData = new FormData();

	const result = serializeToObject(null, request, formData);

	formData.append(formRequestKey, JSON.stringify(result));

	return formData;
}

export type RequestFilter = (client: RpcClient, request: RpcRequest) => Promise<RpcRequest>;
export type ResponseFilter = (client: RpcClient, request: RpcRequest, response: RpcResponse) => Promise<RpcResponse>;
export type ErrorListener = (client: RpcClient, error: RpcClientError) => void;

export class RpcClient {
	constructor(endpoint: string) {
		this.endpoint = endpoint;
	}

	public readonly endpoint: string;
	public useJsonRpcConstant: boolean = false;
	// Used to be empty string, however iOS doesn't send `FormData` entries with an empty string as key
	public formRequestKey: string = '~request~';

	public authorization: string | null = null;

	public readonly requestFilters: RequestFilter[] = [];
	public readonly responseFilters: ResponseFilter[] = [];
	public readonly errorListeners: ErrorListener[] = [];

	private throwHelper(error: RpcClientError): never {
		for (const listener of this.errorListeners) {
			listener(this, error);
		}
		throw error;
	}

	/**
	 * Executes given RpcRequest request and returns RpcResponse. This method doesn't verify whether the remote call was successful, only whether response is well formed.
	 * @param rpcRequest Request to be executed.
	 */
	async executeAsync(rpcRequest: RpcRequest): Promise<RpcResponse> {
		const headers = new Headers();
		if (this.authorization) {
			headers.append('Authorization', this.authorization);
		}

		let httpRequestBody;
		try {
			httpRequestBody = serializeToFormData(rpcRequest, this.formRequestKey);
		} catch (err) {
			this.throwHelper(new RpcClientError('Failed to serialize RPC request', rpcRequest, undefined, err));
		}

		const httpResponse = await fetch(`${this.endpoint}?m=${encodeURIComponent(rpcRequest.method)}`, { method: 'POST', headers, body: httpRequestBody });
		if (!httpResponse.ok) {
			this.throwHelper(new RpcClientError(`RPC call failed - ${httpResponse.status}: ${httpResponse.statusText}`, rpcRequest, undefined, httpResponse));
		}

		const rpcResponse = await httpResponse.json() as RpcResponse;
		if (typeof rpcResponse !== 'object' || rpcResponse === null) {
			this.throwHelper(new RpcClientError('Malformed RPC response', rpcRequest, undefined, rpcResponse /* response is malformed, so it doesn't match 'response' parameter */));
		}

		return rpcResponse;
	}

	/**
	 * Calls remote method, verifies whether call was successful and returns response payload.
	 * @param method Method name.
	 * @param params Method params.
	 */
	async callAsync(method: string, params?: { [key: string]: unknown } | unknown[]): Promise<unknown> {
		let rpcRequest: RpcRequest = {
			id: _requestId++,
			method,
			params,
		};

		for (const filter of this.requestFilters) {
			rpcRequest = await filter(this, rpcRequest);
		}

		if (this.useJsonRpcConstant) {
			rpcRequest.jsonrpc = '2.0';
		}

		let rpcResponse = await this.executeAsync(rpcRequest);

		for (const filter of this.responseFilters) {
			rpcResponse = await filter(this, rpcRequest, rpcResponse);
		}

		if (rpcResponse.error) {
			this.throwHelper(new RpcServerError(rpcResponse.error.code, rpcResponse.error.message, rpcResponse.error.data, rpcRequest, rpcResponse));
		}

		return rpcResponse.result;
	}
}
