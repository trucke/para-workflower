import * as fs from 'fs';
import { FileSystemAdapter } from 'obsidian';

export async function readFileAsync(filePath: string): Promise<string> {
	try {
		const data: string = await fs.promises.readFile(filePath, 'utf8');
		return data;
	} catch (err) {
		throw new Error(`Error reading file: ${err}`);
	}
}

export function getBasePath(): string {
	const fsAdapter: FileSystemAdapter = this.app.vault.adapter as FileSystemAdapter;
	return fsAdapter.getBasePath();
}

