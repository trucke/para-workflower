import type { Vault } from 'obsidian';

import { joinPath } from './paths';
import { AREA_TEMPLATE, PROJECT_TEMPLATE, RESOURCE_TEMPLATE } from './templates';
import type { PluginSettings } from './types';

/** Creates the PARA folders and templates. Existing folders and files are left untouched. */
export async function initializeVault(vault: Vault, settings: PluginSettings): Promise<void> {
	const folders = [
		settings.inboxPath,
		settings.projectsPath,
		settings.areasPath,
		settings.resourcesPath,
		settings.archivePath,
		settings.templatesFolder,
	];
	for (const folder of folders) {
		if (folder !== '' && !vault.getFolderByPath(folder)) {
			await vault.createFolder(folder);
		}
	}

	const templates = [
		[settings.projectTemplateName, PROJECT_TEMPLATE],
		[settings.areaTemplateName, AREA_TEMPLATE],
		[settings.resourceTemplateName, RESOURCE_TEMPLATE],
	] as const;
	for (const [name, content] of templates) {
		const path = joinPath(settings.templatesFolder, `${name}.md`);
		if (!vault.getAbstractFileByPath(path)) {
			await vault.create(path, content);
		}
	}
}
