
export function containsInvalidCharacters(text: string): Boolean {
	if (text.startsWith('.')) {
		return true;
	}
	const pattern: RegExp = /[\[\]#^|\\\/:?]/;
	return pattern.test(text);
}


export function error(msg: string): DocumentFragment {
	let errorMsg = document.createDocumentFragment();
	const div = document.createElement('div');
	div.textContent = msg;
	div.setCssProps({ 'color': 'var(--background-modifier-error)' });
	errorMsg.appendChild(div);
	return errorMsg;
}

export function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
