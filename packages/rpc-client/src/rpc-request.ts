export interface RpcRequest {
	id: number | string | null;
	jsonrpc?: '2.0';
	method: string;
	params?: {
		[key: string]: unknown;
	} | unknown[];
}
