import { RpcRequest } from './rpc-request';
import { RpcResponse } from './rpc-response';

export class RpcClientError extends Error {
	constructor(message: string, request: RpcRequest, response?: RpcResponse, data?: unknown) {
		super(message);

		Object.setPrototypeOf(this, RpcClientError.prototype);

		this.message = message;
		this.request = request;
		this.response = response;
		this.data = data;
	}

	public message: string;
	public request: RpcRequest;
	public response?: RpcResponse;
	public data?: unknown;

	public static getParamsErrorString(params?: { [key: string]: any }): string {
		let result = '';
		let index = 1;

		if (!params) {
			return result;
		}

		Object.keys(params).forEach((property: string) => {
			result += '\n' + index + ') Key: ' + JSON.stringify(property) + ' | Value: ' + JSON.stringify(params[property]);
			index++;
		});

		return result;
	}
}
