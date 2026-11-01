import type { Vault } from 'obsidian';

import { AREA_TEMPLATE, PROJECT_TEMPLATE, RESOURCE_TEMPLATE } from './templates';
import type { PluginSettings } from './types';

export async function initializeVault(vault: Vault, settings: PluginSettings) {
	const templatesPath: string = 'Templates';
	if (vault.getFolderByPath(templatesPath) == null) {
		await vault.createFolder(templatesPath);
	}

	await createTemplates(vault, templatesPath);

	// create para project structure
	await vault.createFolder(settings.projectsPath);
	await vault.createFolder(settings.areasPath);
	await vault.createFolder(settings.resourcesPath);
	await vault.createFolder(settings.archivePath);
}

async function createTemplates(vault: Vault, templatesPath: string) {
	await vault.create(`${templatesPath}/Project Template.md`, PROJECT_TEMPLATE);
	await vault.create(`${templatesPath}/Area Template.md`, AREA_TEMPLATE);
	await vault.create(`${templatesPath}/Resource Template.md`, RESOURCE_TEMPLATE);
}
