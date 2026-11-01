import { normalizePath, TFile, TFolder } from 'obsidian';
import type { App } from 'obsidian';

import { getParaType } from '../para';
import type { ArchivedItem, ParaType, PluginSettings } from '../types';
import { UserError, capitalize } from '../utils';

export async function restore(app: App, settings: PluginSettings, file: TFile): Promise<string> {
	if (file.parent === null || !file.parent.path.includes(settings.archivePath)) {
		throw new UserError('Cannot restore. Current item is not archived');
	}

	const type = getParaType(app, file);
	if (type === null) {
		throw new UserError('File is not a known PARA type');
	}
	return restoreByType(app, settings, file, type);
}

export async function restoreByType(app: App, settings: PluginSettings, file: TFile, type: ParaType): Promise<string> {
	switch (type) {
		case 'project':
			await restoreProject(app, settings, file);
			break;
		case 'resource':
			await restoreResource(app, settings.resourcesPath, file);
			break;
		case 'area':
			await restoreArea(app, settings.areasPath, file);
			break;
	}
	return `${capitalize(type)} '${file.basename}' restored`;
}

/** Archived PARA items, skipping area companion folders (`_<area>`). */
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

async function restoreProject(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	const { projectsPath, archivePath } = settings;

	await app.vault.process(file, (data) => data.replace(/^Status::.*$/m, 'Status:: #pending'));

	if (file.parent && file.parent.path !== archivePath) {
		await app.fileManager.renameFile(file.parent, normalizePath([projectsPath, file.parent.name].join('/')));
	} else {
		await app.fileManager.renameFile(file, normalizePath([projectsPath, file.name].join('/')));
	}
}

async function restoreArea(app: App, areasPath: string, file: TFile): Promise<void> {
	const areaArchiveBase = file.parent?.path ?? '';
	const areaCompanionArchive = normalizePath([areaArchiveBase, `_${file.basename.toLowerCase()}`].join('/'));

	const areaRestorePath = normalizePath([areasPath, file.name].join('/'));
	const areaCompanionRestorePath = normalizePath([areasPath, `_${file.basename.toLowerCase()}`].join('/'));

	await app.fileManager.renameFile(file, areaRestorePath);

	const companionFolder = app.vault.getAbstractFileByPath(areaCompanionArchive);
	if (companionFolder instanceof TFolder) {
		await app.fileManager.renameFile(companionFolder, areaCompanionRestorePath);
	}

	const archiveFolder = app.vault.getAbstractFileByPath(areaArchiveBase);
	if (archiveFolder !== null) {
		await app.vault.delete(archiveFolder, true);
	}
}

async function restoreResource(app: App, resourcesPath: string, file: TFile): Promise<void> {
	await app.fileManager.renameFile(file, normalizePath([resourcesPath, file.name].join('/')));
}
