import { App, normalizePath, TFile, TFolder } from 'obsidian';
import { PluginSettings } from 'src/types';

// Define a map of tag values to item types
const tagItemTypeMap: { [key: string]: string } = {
	'project': 'project',
	'resource': 'resource',
	'area': 'area'
};

export async function restore(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	try {
		if (file.parent?.path == null || !file.parent.path.contains(settings.archivePath)) {
			throw new Error('Cannot restore. Current item is not archived');
		}

		let itemType: string = 'undefined';
		await app.fileManager.processFrontMatter(file, (frontMatter) => {
			frontMatter.tags = frontMatter.tags || [];
			for (const tag of frontMatter.tags) {
				if (tagItemTypeMap[tag]) {
					itemType = tagItemTypeMap[tag];
					break;
				}
			}
		});

		switch (itemType) {
			case 'project':
				restoreProject(app, settings.projectsPath, file);
				break;
			case 'resource':
				restoreResource(app, settings.resourcesPath, file);
				break;
			case 'area':
				restoreArea(app, settings.areasPath, file);
				break;
			default:
				throw new Error('Unknown or unsupported type');
		}


	} catch (error) {
		throw error;
	}
}

async function restoreProject(app: App, projectsPath: string, file: TFile): Promise<void> {
	let projectRestorePath = normalizePath([projectsPath, file.name].join('/'));
	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, 'Status:: #pending');
	})

	return app.fileManager.renameFile(file, projectRestorePath);
}

async function restoreArea(app: App, areasPath: string, file: TFile): Promise<void> {
	const areaArchiveBase = file.parent!.path;
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
	let newFilePath = normalizePath([resourcesPath, file.name].join('/'));
	return app.fileManager.renameFile(file, newFilePath);
}
