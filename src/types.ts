import type { TFile } from 'obsidian';

export const PARA_TYPES = ['project', 'area', 'resource'] as const;
export type ParaType = (typeof PARA_TYPES)[number];

export type PluginSettings = {
	/** Empty when the vault has no inbox folder. */
	inboxPath: string;
	projectsPath: string;
	useFolderStructure: boolean;
	areasPath: string;
	useCompanionDir: boolean;
	resourcesPath: string;
	archivePath: string;
	templatesFolder: string;
	projectTemplateName: string;
	areaTemplateName: string;
	resourceTemplateName: string;
};

export interface NewItem {
	name: string;
	/** Only used for projects. Empty when no area was given. */
	area: string;
}

export interface ArchivedItem {
	file: TFile;
	type: ParaType;
}
