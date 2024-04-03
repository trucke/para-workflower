import { App, normalizePath, Notice, TFile, TFolder } from 'obsidian';
import { ParaType, PluginSettings } from 'src/types';
import { capitalize } from 'src/utils';

export async function restore(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	try {
		if (file.parent?.path == null || !file.parent.path.contains(settings.archivePath)) {
			throw new Error('Cannot restore. Current item is not archived');
		}

		let itemType: ParaType | null = null;
		await app.fileManager.processFrontMatter(file, (frontMatter) => {
			frontMatter.tags = frontMatter.tags || [];
			for (const tag of frontMatter.tags) {
				if (Object.values(ParaType).includes(tag)) {
					itemType = tag;
					break;
				}
			}
		});

		await restoreByType(app, settings, file, itemType);
	} catch (error) {
		throw error;
	}
}

export async function restoreByType(app: App, settings: PluginSettings, file: TFile, type: ParaType | null): Promise<void> {
	try {
		switch (type) {
			case ParaType.Project:
				restoreProject(app, settings, file);
				break;
			case ParaType.Resource:
				restoreResource(app, settings.resourcesPath, file);
				break;
			case ParaType.Area:
				restoreArea(app, settings.areasPath, file);
				break;
			default:
				throw new Error('File is not a known PARA type');
		}

		new Notice(`${capitalize(type)} '${file.basename}' restored`);
	} catch (error) {
		throw error;
	}
}

async function restoreProject(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	const { projectsPath, archivePath } = settings;

	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, 'Status:: #pending');
	});

	if (file.parent!.path !== archivePath) {
		const dest = normalizePath([projectsPath, file.parent!.name].join('/'));
		return app.fileManager.renameFile(file.parent!, dest);
	} else {
		const dest = normalizePath([projectsPath, file.name].join('/'));
		return app.fileManager.renameFile(file, dest);
	}
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
