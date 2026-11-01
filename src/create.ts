import type { App, TFile } from 'obsidian';

import { getParaType, toStringList } from './para';
import { isInFolder, joinPath } from './paths';
import type { NewItem, ParaType, PluginSettings } from './types';
import { INVALID_NAME_MESSAGE, UserError, capitalize, containsInvalidCharacters } from './utils';

export async function createItem(app: App, settings: PluginSettings, type: ParaType, input: NewItem): Promise<string> {
	const name = input.name.trim();
	const area = input.area.trim();
	if (name === '') {
		throw new UserError(`The ${type} needs a name`);
	}
	if (containsInvalidCharacters(name) || containsInvalidCharacters(area)) {
		throw new UserError(INVALID_NAME_MESSAGE);
	}

	const folder = rootFolder(settings, type);
	const existing = findItem(app, settings, type, name);
	if (existing) {
		await app.workspace.getLeaf().openFile(existing);
		return `${capitalize(type)} '${existing.basename}' already exists`;
	}

	const templatePath = joinPath(settings.templatesFolder, `${templateName(settings, type)}.md`);
	const template = app.vault.getFileByPath(templatePath);
	if (!template) {
		throw new UserError(`The template '${templatePath}' does not exist`);
	}

	const ownFolder = type === 'project' && settings.useFolderStructure;
	const itemFolder = ownFolder ? joinPath(folder, name) : folder;
	const path = joinPath(itemFolder, `${name}.md`);
	// A project's own folder moves with it when archived, so never adopt one that holds other notes.
	if (ownFolder && await app.vault.adapter.exists(itemFolder) && app.vault.getFolderByPath(itemFolder)?.children.length !== 0) {
		throw new UserError(`The folder '${itemFolder}' already exists. Choose another name or move that folder first.`);
	}
	if (await app.vault.adapter.exists(path)) {
		throw new UserError(`'${path}' already exists`);
	}

	await ensureFolder(app, itemFolder);
	const file = await app.vault.create(path, await app.vault.cachedRead(template));

	if (type === 'area' && settings.useCompanionDir) {
		await ensureFolder(app, joinPath(folder, `_${name.toLowerCase()}`));
	}
	if (type === 'project' && area !== '') {
		await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			frontmatter.tags = [...toStringList(frontmatter.tags), area.toLowerCase()];
		});
		await app.vault.process(file, (data) => data.replace('Area:: [[]]', `Area:: [[${area}]]`));
	}

	await app.workspace.getLeaf().openFile(file);
	return `${capitalize(type)} '${name}' created`;
}

/** Finds an active or archived item of the same type and name, ignoring case. */
function findItem(app: App, settings: PluginSettings, type: ParaType, name: string): TFile | undefined {
	const folders = [rootFolder(settings, type), settings.archivePath];
	return app.vault.getMarkdownFiles().find((file) =>
		file.basename.toLowerCase() === name.toLowerCase() &&
		folders.some((folder) => isInFolder(file.path, folder)) &&
		getParaType(app, file) === type);
}

export async function ensureFolder(app: App, path: string): Promise<void> {
	if (path !== '' && !app.vault.getFolderByPath(path)) {
		await app.vault.createFolder(path);
	}
}

export function rootFolder(settings: PluginSettings, type: ParaType): string {
	switch (type) {
		case 'project': return settings.projectsPath;
		case 'area': return settings.areasPath;
		case 'resource': return settings.resourcesPath;
	}
}

function templateName(settings: PluginSettings, type: ParaType): string {
	switch (type) {
		case 'project': return settings.projectTemplateName;
		case 'area': return settings.areaTemplateName;
		case 'resource': return settings.resourceTemplateName;
	}
}
