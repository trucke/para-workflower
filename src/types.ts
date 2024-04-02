import { TFile } from "obsidian";

export interface PluginSettings {
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
}

export interface CreateProjectProps {
	name: string | null;
	area: string | null;
}

export interface CreateAreaProps {
	name: string | null;
}

export interface CreateResourceProps {
	name: string | null;
}

export enum ParaType {
	Project = 'project',
	Resource = 'resource',
	Area = 'area'
}

export interface ArchiveItem {
	file: TFile;
	type: ParaType | null;
}

