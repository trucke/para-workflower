/** An expected failure whose message is meant for the user, not the console. */
export class UserError extends Error {
	override name = 'UserError';
}

export const INVALID_NAME_MESSAGE = 'Name contains invalid characters: [ ] # ^ | \\ / : ?';

export function containsInvalidCharacters(text: string): boolean {
	return text.startsWith('.') || /[[\]#^|\\/:?]/.test(text);
}

export function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
