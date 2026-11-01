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

export function parentPath(path: string): string {
	const index = path.lastIndexOf('/');
	return index === -1 ? '' : path.slice(0, index);
}

export function lastSegment(path: string): string {
	return path.slice(path.lastIndexOf('/') + 1);
}

/**
 * The path that moves when an item moves. A note in a same-named folder directly
 * under `root` (`root/Name/Name.md`) is a folder-structure item: the folder moves.
 * Any other note moves alone, so unrelated notes next to it stay put.
 */
export function itemPath(notePath: string, root: string): string {
	const folder = parentPath(notePath);
	const noteName = lastSegment(notePath).replace(/\.md$/, '');
	const isOwnFolder = folder !== root && parentPath(folder) === joinPath(root) && lastSegment(folder) === noteName;
	return isOwnFolder ? folder : notePath;
}
