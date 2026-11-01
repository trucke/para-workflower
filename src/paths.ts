// Path helpers without Obsidian imports, so they can be unit tested in Node.

/** True if `path` is `folder` itself or anything inside it. */
export function isInFolder(path: string, folder: string): boolean {
	if (folder === '' || folder === '/') {
		return true;
	}
	return path === folder || path.startsWith(`${folder}/`);
}

/** Joins vault path segments, skipping empty ones (the vault root). */
export function joinPath(...segments: string[]): string {
	return segments.filter((segment) => segment !== '' && segment !== '/').join('/');
}
