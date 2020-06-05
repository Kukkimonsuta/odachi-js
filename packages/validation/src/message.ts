import { Severity } from './severity';

export interface Message {
	key: string;
	severity: Severity;
	text: string;
}
