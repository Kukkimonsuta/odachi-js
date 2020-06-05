import { Message } from './message';
import { Severity } from './severity';

function matchesPrefix(key: string, prefix: string) {
	const actualKey = key.toUpperCase();
	const actualPrefix = prefix.toUpperCase();

	return actualKey === actualPrefix ||
		actualKey.startsWith(`${actualPrefix}.`) ||
		actualKey.startsWith(`${actualPrefix}[`);
}

function removePrefix(key: string, prefix: string) {
	const actualKey = key.toUpperCase();
	const actualPrefix = prefix.toUpperCase();

	if (actualKey === actualPrefix) {
		return '';
	}

	if (actualKey.startsWith(`${actualPrefix}.`)) {
		return actualKey.substring(actualPrefix.length + 1);
	}

	if (actualKey.startsWith(`${actualPrefix}[`)) {
		return actualKey.substring(actualPrefix.length);
	}

	throw new Error(`Key doesn't start with given prefix`);
}

export class ValidationState {
	/**
	 * Collection of validation messages.
	 * @param messages All validation messages.
	 */
	constructor(messages: Message[] = []) {
		this.messages = messages;
	}

	private readonly messages: Message[] = [];

	/**
	 * Create new `ValidationState` with messages from current `ValidationState` prefixed by `prefix`.
	 */
	scope(prefix: string): ValidationState {
		// TODO: might be better idea not to create copy but use the same backing array and filter dynamically
		// TODO: might be better idea to just have trie instead of array

		const relevantMessages = this.messages
			.filter(x => matchesPrefix(x.key, prefix))
			.map(x => ({
				key: removePrefix(x.key, prefix),
				severity: x.severity,
				text: x.text,
			}));

		return new ValidationState(relevantMessages);
	}

	/**
	 * Total number of messages.
	 **/
	get messageCount(): number {
		return this.messages.length;
	}

	/**
	 * Total number of warning messages.
	 **/
	get warningCount(): number {
		return this.messages.filter(x => x.severity === Severity.warning).length;
	}

	/**
	 * Total number of error messages.
	 **/
	get errorCount(): number {
		return this.messages.filter(x => x.severity === Severity.error).length;
	}

	/**
	 * Get all messages.
	 **/
	getMessages(): IterableIterator<Message>;
	/**
	 * Get all messages for given key.
	 * @param key Key under which requested messages are stored.
	 **/
	getMessages(key: string): IterableIterator<Message>;
	*getMessages(key?: string): IterableIterator<Message> {
		for (let i = 0; i < this.messages.length; i++) {
			const message = this.messages[i];

			if (key === null || key === undefined || message.key.toUpperCase() === key.toUpperCase()) {
				yield message;
			}
		}
	}

	/**
	 * Get first warning message for given key.
	 **/
	getWarningMessage(key: string): Message | null {
		for (const message of this.getMessages(key)) {
			if (message.severity === Severity.warning) {
				return message;
			}
		}

		return null;
	}

	/**
	 * Get first error message for given key.
	 **/
	getErrorMessage(key: string): Message | null {
		for (const message of this.getMessages(key)) {
			if (message.severity === Severity.error) {
				return message;
			}
		}

		return null;
	}

	/**
	 * Get first warning text for given key.
	 **/
	getWarningText(key: string): string | null {
		const message = this.getWarningMessage(key);

		if (message === null) {
			return null;
		}

		return message.text;
	}

	/**
	 * Get first error text for given key.
	 **/
	getErrorText(key: string): string | null {
		const message = this.getErrorMessage(key);

		if (message === null) {
			return null;
		}

		return message.text;
	}
}
