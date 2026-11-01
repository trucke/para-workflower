import { TFile, TFolder } from 'obsidian';
import type { App, TAbstractFile } from 'obsidian';

import { ensureFolder, rootFolder } from './create';
import { getParaType } from './para';
import { isInFolder, itemPath, joinPath, parentPath } from './paths';
import type { ArchivedItem, ParaType, PluginSettings } from './types';
import { UserError, capitalize } from './utils';

interface Move {
	item: TAbstractFile;
	to: string;
}

export async function archiveItem(app: App, settings: PluginSettings, file: TFile): Promise<string> {
	const type = requireActiveItem(app, settings, file);
	await moveAll(app, archiveMoves(app, settings, file, type));
	if (type === 'project') {
		await app.vault.process(file, (data) => setStatus(data, 'aborted'));
	}
	return `${capitalize(type)} '${file.basename}' archived`;
}

export async function completeProject(app: App, settings: PluginSettings, file: TFile): Promise<string> {
	if (requireActiveItem(app, settings, file) !== 'project') {
		throw new UserError(`'${file.basename}' is not a project`);
	}
	await moveAll(app, archiveMoves(app, settings, file, 'project'));
	await app.vault.process(file, (data) => setStatus(data, 'done'));
	await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
		frontmatter.completed = true;
	});
	return `Project '${file.basename}' completed and archived`;
}

export async function restoreItem(app: App, settings: PluginSettings, file: TFile): Promise<string> {
	if (!isInFolder(file.path, settings.archivePath)) {
		throw new UserError(`'${file.basename}' is not archived`);
	}
	const type = getParaType(app, file);
	if (type === null) {
		throw new UserError(`'${file.basename}' is not tagged as project, area or resource`);
	}

	const container = file.parent;
	await moveAll(app, restoreMoves(app, settings, file, type));
	if (type === 'project') {
		await app.vault.process(file, (data) => setStatus(data, 'pending'));
		await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			if (frontmatter.completed === true) {
				frontmatter.completed = false;
			}
		});
	}

	const message = `${capitalize(type)} '${file.basename}' restored`;
	if (type === 'area' && container && container.path !== settings.archivePath) {
		// The area's archive folder is removed only if nothing else is left in it.
		if (container.children.length === 0) {
			await app.fileManager.trashFile(container);
		} else {
			return `${message}. Kept '${container.path}' because it still contains other files.`;
		}
	}
	return message;
}

/** Archived projects, areas and resources, skipping area companion folders (`_<area>`). */
export function getArchivedItems(app: App, archivePath: string): ArchivedItem[] {
	const items: ArchivedItem[] = [];
	const walk = (folder: TFolder): void => {
		for (const child of folder.children) {
			if (child instanceof TFolder && !child.name.startsWith('_')) {
				walk(child);
			} else if (child instanceof TFile && child.extension === 'md') {
				const type = getParaType(app, child);
				if (type !== null) {
					items.push({ file: child, type });
				}
			}
		}
	};

	const archive = app.vault.getFolderByPath(archivePath);
	if (archive) {
		walk(archive);
	}
	return items;
}

/** Checks that `file` is a tagged project, area or resource inside its own folder. */
function requireActiveItem(app: App, settings: PluginSettings, file: TFile): ParaType {
	if (isInFolder(file.path, settings.archivePath)) {
		throw new UserError(`'${file.basename}' is already archived`);
	}
	const type = getParaType(app, file);
	if (type === null) {
		throw new UserError(`'${file.basename}' is not tagged as project, area or resource`);
	}
	const root = rootFolder(settings, type);
	if (!isInFolder(file.path, root)) {
		throw new UserError(`'${file.basename}' is a ${type} but not inside '${root}'`);
	}
	return type;
}

function archiveMoves(app: App, settings: PluginSettings, file: TFile, type: ParaType): Move[] {
	const { archivePath } = settings;
	switch (type) {
		case 'project': {
			const item = getItem(app, itemPath(file.path, settings.projectsPath));
			return [{ item, to: joinPath(archivePath, item.name) }];
		}
		case 'resource':
			return [{ item: file, to: joinPath(archivePath, file.name) }];
		case 'area': {
			// Areas are archived as `<archive>/<Area>/` holding the note and its companion folder.
			const target = joinPath(archivePath, file.basename);
			return withCompanion(app, file, target);
		}
	}
}

function restoreMoves(app: App, settings: PluginSettings, file: TFile, type: ParaType): Move[] {
	const root = rootFolder(settings, type);
	switch (type) {
		case 'project': {
			const item = getItem(app, itemPath(file.path, settings.archivePath));
			return [{ item, to: joinPath(root, item.name) }];
		}
		case 'resource':
			return [{ item: file, to: joinPath(root, file.name) }];
		case 'area':
			return withCompanion(app, file, root);
	}
}

/** Moves an area note and, if present, its `_<area>` companion folder into `target`. */
function withCompanion(app: App, file: TFile, target: string): Move[] {
	const moves: Move[] = [{ item: file, to: joinPath(target, file.name) }];
	const companion = app.vault.getFolderByPath(joinPath(file.parent?.path ?? '', `_${file.basename.toLowerCase()}`));
	if (companion) {
		moves.push({ item: companion, to: joinPath(target, companion.name) });
	}
	return moves;
}

function getItem(app: App, path: string): TAbstractFile {
	const item = app.vault.getAbstractFileByPath(path);
	if (!item) {
		throw new UserError(`'${path}' does not exist`);
	}
	return item;
}

/**
 * Moves all items or none. Every destination is checked before the first move, and
 * items already moved are moved back if a later move fails. Notes are edited only
 * after this succeeded, so a failed move never leaves a changed status behind.
 */
async function moveAll(app: App, moves: Move[]): Promise<void> {
	for (const { to } of moves) {
		// Unlike getAbstractFileByPath, the adapter follows the file system's case rules.
		if (await app.vault.adapter.exists(to)) {
			throw new UserError(`Nothing was moved: '${to}' already exists`);
		}
	}

	const moved: { item: TAbstractFile; from: string }[] = [];
	try {
		for (const { item, to } of moves) {
			const from = item.path;
			await ensureFolder(app, parentPath(to));
			await app.fileManager.renameFile(item, to);
			moved.push({ item, from });
		}
	} catch (error) {
		for (const { item, from } of moved.reverse()) {
			await app.fileManager.renameFile(item, from).catch((rollbackError: unknown) => {
				console.error(`[PARA Workflower] Could not move '${item.path}' back to '${from}'`, rollbackError);
			});
		}
		throw error;
	}
}

function setStatus(data: string, status: string): string {
	return data.replace(/^Status::.*$/m, `Status:: #${status}`);
}
