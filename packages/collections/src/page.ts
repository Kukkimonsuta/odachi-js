export class Page<T> extends Array<T> {
	/**
	 * Array with additional metadata for paging.
	 * @param data Items in this page.
	 * @param number Index of this page.
	 * @param count Total number of available pages.
	 */
	constructor(data?: T[], number?: number, count?: number, size?: number, total?: number) {
		super();

		this.number = number ?? 0;
		this.count = count ?? 1;
		this.size = size ?? data?.length ?? 0;
		this.total = total ?? -1;

		if (data) {
			this.push(...data);
		}
	}

	/**
	 * Index of this page.
	 */
	readonly number: number;
	/**
	 * Total number of available pages.
	 */
	readonly count: number;
	/**
	 * Page size.
	 */
	readonly size: number;
	/**
	 * Total number of record.
	 */
	readonly total: number;

	/**
	 * Calling methods returning arrays on page will return raw arrays.
	 */
	static get [Symbol.species](): ArrayConstructor { return Array; }
}
