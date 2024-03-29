
export function containsInvalidCharacters(text: string): Boolean {
	if (text.startsWith('.')) {
		return true;
	}
	const pattern: RegExp = /[\[\]#^|\\\/:?]/;
	return pattern.test(text);
}
