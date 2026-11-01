import { PluginSettingTab, normalizePath } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';

import type { PluginSettings } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
	projectsPath: '1-Projects',
	useFolderStructure: false,
	areasPath: '2-Areas',
	useCompanionDir: true,
	resourcesPath: '3-Resources',
	archivePath: '4-Archive',

	templatesFolder: 'Templates',
	projectTemplateName: 'Project Template',
	areaTemplateName: 'Area Template',
	resourceTemplateName: 'Resource Template',
};

/** Builds settings from stored plugin data, falling back to defaults for missing or mistyped values. */
export function parseSettings(data: unknown): PluginSettings {
	const stored: Record<string, unknown> = typeof data === 'object' && data !== null ? { ...data } : {};
	const defaults: Record<string, unknown> = DEFAULT_SETTINGS;
	const valid = Object.entries(stored).filter(([key, value]) =>
		key in defaults && typeof value === typeof defaults[key]);
	return { ...DEFAULT_SETTINGS, ...Object.fromEntries(valid) };
}

export class SettingTab extends PluginSettingTab {
	override getSettingDefinitions(): SettingDefinitionItem<keyof PluginSettings>[] {
		return [
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
		];
	}

	override async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, typeof value === 'string' ? normalizePath(value) : value);
	}
}
