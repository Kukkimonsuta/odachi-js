// this is experimental and not really tested

export class TrieNode<T> {
	constructor(key: string, parent: TrieNode<T> | null) {
		this._key = key;
		this._parent = parent;

		this._children = new Map<string, TrieNode<T>>();
		this._depth = parent === null ? 0 : parent._depth + 1;
	}

	private _key: string;
	private _parent: TrieNode<T> | null;
	private _children: Map<string, TrieNode<T>>;
	private _depth: number;
	private _isTerminal: boolean = false;
	private _value: T | undefined = undefined;

	get key(): string { return this._key; }
	get parent(): TrieNode<T> | null { return this._parent; }
	get children(): IterableIterator<TrieNode<T>> { return this._children.values(); }
	get depth(): number { return this._depth; }
	get isTerminal(): boolean { return this._isTerminal }
	get value(): T | undefined { return this._value; }
	get isRoot(): boolean { return this._depth == 0 }
	get isBranch(): boolean { return this._depth > 0 && this._children.size > 0 }
	get isLeaf(): boolean { return this._children.size <= 0; }

	/**
	 * Set this node as terminal and optionally assign it a value.
	 */
	setTerminal(isTerminal: boolean, value?: T): void {
		this._isTerminal = isTerminal;
		this._value = isTerminal ? value : undefined;
	}

	/**
	 * Add child with given key. If child already exists, existing node is returned.
	 */
	add(key: string): TrieNode<T> {
		let child = this.find(key);

		if (child == null) {
			child = new TrieNode<T>(key, this);
			this._children.set(key, child);
		}

		return child;
	}

	/**
	 * Find child with given key.
	 */
	find(key: string): TrieNode<T> | null {
		return this._children.get(key) ?? null;
	}

	/**
	 * Remove child with given key.
	 */
	remove(key: string): void {
		this._children.delete(key);
	}
}

class Trie<TValue> {
	constructor() {
		this._root = new TrieNode<TValue>('^', null);
	}

	private _root: TrieNode<TValue>;

	private addInternal(key: string, value: TValue, replaceExisting: boolean): TrieNode<TValue> {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		let current = this.findPrefix(key);
		for (let i = current.depth; i < key.length; i++) {
			current = current.add(key[i]);
		}

		if (current.isTerminal && !replaceExisting) {
			throw new Error('Key already exists');
		}

		current.setTerminal(true, value);

		return current;
	}

	/**
	 * Add given key, throw if already exists.
	 */
	public add(key: string, value: TValue): TrieNode<TValue> {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		return this.addInternal(key, value, false);
	}

	/**
	 * Set given key replacing current if any.
	 */
	public set(key: string, value: TValue): TrieNode<TValue> {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		return this.addInternal(key, value, true);
	}

	/**
	 * Find node that matches given key.
	 */
	public findPrefix(key: string): TrieNode<TValue> {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		let currentNode: TrieNode<TValue> | null = this._root;
		let result: TrieNode<TValue> = currentNode;

		for (let i = 0; i < key.length; i++) {
			const c = key[i];

			currentNode = currentNode.find(c);
			if (currentNode == null) {
				break;
			}

			result = currentNode;
		}

		return result;
	}

	/**
	 * Find terminal node that matches given key.
	 */
	public find(key: string, allowPartialMatch: boolean = false): TrieNode<TValue> | null {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		let node: TrieNode<TValue> = this.findPrefix(key);

		if (allowPartialMatch) {
			// roll back to nearest terminal node
			while (!node.isTerminal) {
				if (node.parent === null) {
					return null;
				}

				node = node.parent;
			}
		}
		else {
			// return only nodes which match key exactly
			if (node.depth != key.length || !node.isTerminal) {
				return null;
			}
		}

		return node;
	}

	/**
	 * Search given text for longest value in this trie.
	 */
	public search(text: string): [number, TrieNode<TValue> | null] {
		if (text.length <= 0)
			throw new Error('Text cannot be empty.');

		let selectedIndex = -1;
		let selectedNode: TrieNode<TValue> | null = null;

		for (let i = 0; i < text.length; i++) {
			const node = this.find(text.substr(i), true);
			if (node == null) {
				continue;
			}

			if (selectedNode && selectedNode.depth >= node.depth) {
				continue;
			}

			selectedIndex = i;
			selectedNode = node;
		}

		return [selectedIndex, selectedNode];
	}

	/**
	 * Check whether this trie contains given key.
	 */
	public containsKey(key: string): boolean {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		const prefix = this.findPrefix(key);

		return prefix.depth == key.length && prefix.isTerminal;
	}

	/**
	 * Remove given key.
	 */
	public remove(key: string): boolean {
		if (key.length <= 0)
			throw new Error('Key cannot be empty.');

		let node = this.find(key);
		if (node == null || !node.isTerminal) {
			return false;
		}

		node.setTerminal(false);

		while (node && node.isLeaf && !node.isTerminal && node.parent) {
			const parent: TrieNode<TValue> = node.parent;
			parent.remove(node.key);
			node = parent;
		}

		return true;
	}
}
