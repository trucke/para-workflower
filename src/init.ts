import {
	Vault,
} from 'obsidian';

import { AREA_TEMPLATE, PROJECT_TEMPLATE, RESOURCE_TEMPLATE } from './templates';
import type { PluginSettings } from './types';

export async function initializeVault(vault: Vault, settings: PluginSettings) {
	const templatesPath: string = 'Templates';
	if (vault.getFolderByPath(templatesPath) == null) {
		await vault.createFolder(templatesPath);
	}

	createTemplates(vault, templatesPath);

	// create para project structure
	await vault.createFolder(settings.projectsPath);
	await vault.createFolder(settings.areasPath);
	await vault.createFolder(settings.resourcesPath);
	await vault.createFolder(settings.archivePath);
}

async function createTemplates(vault: Vault, templatesPath: string) {
	// const configDir = vault.configDir;
	// const pluginPath = path.join(getBasePath(), configDir, 'plugins', 'basb-para-workflower');
	// const areaTemplateData = await readFileAsync(path.join(pluginPath, 'templates', 'area-template.md'));
	// const projectTemplateData = await readFileAsync(path.join(pluginPath, 'templates', 'project-template.md'));
	// const resourceTemplateData = await readFileAsync(path.join(pluginPath, 'templates', 'resource-template.md'));



	await vault.create(`${templatesPath}/Project Template.md`, PROJECT_TEMPLATE);
	await vault.create(`${templatesPath}/Area Template.md`, AREA_TEMPLATE);
	await vault.create(`${templatesPath}/Resource Template.md`, RESOURCE_TEMPLATE);
}
