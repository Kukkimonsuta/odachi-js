import { RpcClientError } from './rpc-client-error';
import { RpcRequest } from './rpc-request';
import { RpcResponse } from './rpc-response';

export class RpcServerError extends RpcClientError {

	/// <summary>
	/// Invalid JSON was received by the server.
	/// An error occurred on the server while parsing the JSON text.
	/// </summary>
	static readonly PARSE_ERROR = -32700;
	/// <summary>
	/// The JSON sent is not a valid Request object.
	/// </summary>
	static readonly INVALID_REQUEST = -32600;
	/// <summary>
	/// The method does not exist / is not available.
	/// </summary>
	static readonly METHOD_NOT_FOUND = -32601;
	/// <summary>
	/// Invalid method parameter(s).
	/// </summary>
	static readonly INVALID_PARAMS = -32602;
	/// <summary>
	/// Internal JSON-RPC error.
	/// </summary>
	static readonly INTERNAL_ERROR = -32603;

	// -32000 to -32099	Server error reserved for implementation-defined server-errors.

	/// <summary>
	/// The server method doesn't return any value and is expected to be only called as notification.
	/// </summary>
	static readonly NOTIFICATION_EXPECTED = -32000;

	/// <summary>
	/// Client is not authorized to call given method (authenticate and try again).
	/// </summary>
	static readonly UNAUTHORIZED = -32001;

	/// <summary>
	/// Client is not allowd to call given method (display error).
	/// </summary>
	static readonly FORBIDDEN = -32002;

	constructor(code: number, message: string, data: unknown, request: RpcRequest, response?: RpcResponse) {
		super(message, request, response, data);

		Object.setPrototypeOf(this, RpcServerError.prototype);

		this.code = code;
	}

	public code: number;
}
