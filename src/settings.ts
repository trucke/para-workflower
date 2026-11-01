import { PluginSettingTab, normalizePath } from 'obsidian';
import type { SettingDefinitionItem, SettingGroupItem } from 'obsidian';

import { DEFAULT_SETTINGS } from './settings-data';
import type { PluginSettings } from './types';

export class SettingTab extends PluginSettingTab {
	override getSettingDefinitions(): SettingDefinitionItem<keyof PluginSettings>[] {
		return [
			{
				name: 'Inbox folder',
				desc: 'Created by "Initialize vault". Leave empty for no inbox. To collect new notes there, set it as the default location for new notes under Files and links.',
				control: { type: 'folder', key: 'inboxPath', placeholder: 'No inbox' },
			},
			{
				name: 'Projects folder',
				desc: 'Where to place your projects.',
				control: { type: 'folder', key: 'projectsPath', placeholder: DEFAULT_SETTINGS.projectsPath },
			},
			{
				name: 'Use folder structure for projects',
				desc: 'Create a folder for each new project instead of a single note.',
				control: { type: 'toggle', key: 'useFolderStructure' },
			},
			{
				name: 'Areas folder',
				desc: 'Where to place your areas.',
				control: { type: 'folder', key: 'areasPath', placeholder: DEFAULT_SETTINGS.areasPath },
			},
			{
				name: 'Create area companion folders',
				desc: 'Create a folder named `_<area>` next to each new area for notes that belong to it.',
				control: { type: 'toggle', key: 'useCompanionDir' },
			},
			{
				name: 'Resources folder',
				desc: 'Where to place your resources.',
				control: { type: 'folder', key: 'resourcesPath', placeholder: DEFAULT_SETTINGS.resourcesPath },
			},
			{
				name: 'Archive folder',
				desc: 'Where to place archived projects, areas and resources.',
				control: { type: 'folder', key: 'archivePath', placeholder: DEFAULT_SETTINGS.archivePath },
			},
			{
				type: 'group',
				heading: 'Templates',
				items: [
					templateSetting('Project template', 'projectTemplate'),
					templateSetting('Area template', 'areaTemplate',
						'Its Dataview queries use the folder names from when the template was created. Update them if you rename folders.'),
					templateSetting('Resource template', 'resourceTemplate'),
				],
			},
		];
	}

	override async setControlValue(key: string, value: unknown): Promise<void> {
		// normalizePath turns an empty value into '/', but empty means "no folder" here.
		if (typeof value === 'string') {
			await super.setControlValue(key, value.trim() === '' ? '' : normalizePath(value));
		} else {
			await super.setControlValue(key, value);
		}
	}
}

function templateSetting(
	name: string,
	key: 'projectTemplate' | 'areaTemplate' | 'resourceTemplate',
	extraDesc = '',
): SettingGroupItem<keyof PluginSettings> {
	return {
		name,
		desc: `"Initialize vault" creates this note. If it is missing, the built-in template is used. ${extraDesc}`.trim(),
		control: { type: 'file', key, placeholder: DEFAULT_SETTINGS[key], filter: (file) => file.extension === 'md' },
	};
}
