import type { App } from 'obsidian';

import { ensureFolder, templateFile } from './create';
import { parentPath } from './paths';
import { builtinTemplate } from './templates';
import { PARA_TYPES } from './types';
import type { PluginSettings } from './types';

/** Creates the PARA folders and templates. Existing folders and files are left untouched. */
export async function initializeVault(app: App, settings: PluginSettings): Promise<void> {
	const folders = [settings.inboxPath, settings.projectsPath, settings.areasPath, settings.resourcesPath, settings.archivePath];
	for (const folder of folders) {
		await ensureFolder(app, folder);
	}

	for (const type of PARA_TYPES) {
		const path = templateFile(settings, type);
		if (!app.vault.getAbstractFileByPath(path)) {
			await ensureFolder(app, parentPath(path));
			await app.vault.create(path, builtinTemplate(type, settings));
		}
	}
}
