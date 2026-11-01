// Settings data without Obsidian imports, so loading and migration can be unit tested in Node.
import type { PluginSettings } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
	inboxPath: '0-Inbox',
	projectsPath: '1-Projects',
	useFolderStructure: false,
	areasPath: '2-Areas',
	useCompanionDir: true,
	resourcesPath: '3-Resources',
	archivePath: '4-Archive',

	projectTemplate: 'Templates/Project Template.md',
	areaTemplate: 'Templates/Area Template.md',
	resourceTemplate: 'Templates/Resource Template.md',
};

/** Up to 0.1.5, templates were stored as a folder plus note names. */
const LEGACY_TEMPLATE_KEYS = {
	projectTemplate: 'projectTemplateName',
	areaTemplate: 'areaTemplateName',
	resourceTemplate: 'resourceTemplateName',
} as const;

/** Builds settings from stored plugin data, falling back to defaults for missing or mistyped values. */
export function parseSettings(data: unknown): PluginSettings {
	const stored: Record<string, unknown> = typeof data === 'object' && data !== null ? { ...data } : {};
	const legacyFolder = typeof stored.templatesFolder === 'string' ? stored.templatesFolder : 'Templates';
	const legacyPrefix = legacyFolder === '' ? '' : `${legacyFolder}/`;
	for (const [key, legacyKey] of Object.entries(LEGACY_TEMPLATE_KEYS)) {
		const legacyName = stored[legacyKey];
		if (stored[key] === undefined && typeof legacyName === 'string') {
			stored[key] = `${legacyPrefix}${legacyName}.md`;
		}
	}
	const defaults: Record<string, unknown> = DEFAULT_SETTINGS;
	const valid = Object.entries(stored).filter(([key, value]) =>
		key in defaults && typeof value === typeof defaults[key]);
	return { ...DEFAULT_SETTINGS, ...Object.fromEntries(valid) };
}
