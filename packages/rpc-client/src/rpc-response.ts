export interface RpcErrorData {
	code: number;
	message: string;
	data?: unknown;
}

export interface RpcResponse {
	id: number | string;
	result: unknown;
	error: RpcErrorData;
}
