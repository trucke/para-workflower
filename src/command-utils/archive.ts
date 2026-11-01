import { normalizePath, TFolder } from 'obsidian';
import type { App, TFile } from 'obsidian';

import { getParaType } from '../para';
import type { ParaType, PluginSettings } from '../types';
import { UserError } from '../utils';

export async function archive(app: App, settings: PluginSettings, file: TFile): Promise<string> {
	const type = getParaType(app, file);

	if (file.path.includes(settings.projectsPath)) {
		requireType(type, 'project');
		await archiveProject(app, settings, file);
	} else if (file.path.includes(settings.resourcesPath)) {
		requireType(type, 'resource');
		await archiveResource(app, settings.archivePath, file);
	} else if (file.path.includes(settings.areasPath)) {
		requireType(type, 'area');
		await archiveArea(app, settings.archivePath, file);
	}
	return `'${file.basename}' archived`;
}

function requireType(actual: ParaType | null, expected: ParaType): void {
	if (actual !== expected) {
		throw new UserError(`File has no tag '${expected}'`);
	}
}

export async function completeProject(app: App, settings: PluginSettings, file: TFile): Promise<string> {
	const { projectsPath, archivePath } = settings;

	const isInProjectDir = file.parent !== null && file.path.includes(projectsPath);
	if (!(isInProjectDir || getParaType(app, file) === 'project')) {
		throw new UserError('File is not an active project');
	}

	await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
		frontmatter.completed = true;
	});
	await app.vault.process(file, (data) => data.replace(/^Status::.*$/m, 'Status:: #done'));

	if (file.parent && file.parent.path !== projectsPath) {
		await app.fileManager.renameFile(file.parent, normalizePath([archivePath, file.parent.name].join('/')));
	} else {
		await app.fileManager.renameFile(file, normalizePath([archivePath, file.name].join('/')));
	}
	return 'Project completed and moved to archive';
}

async function archiveProject(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	const { archivePath, projectsPath } = settings;

	await app.vault.process(file, (data) => data.replace(/^Status::.*$/m, 'Status:: #aborted'));

	if (file.parent && file.parent.path !== projectsPath) {
		await app.fileManager.renameFile(file.parent, normalizePath([archivePath, file.parent.name].join('/')));
	} else {
		await app.fileManager.renameFile(file, normalizePath([archivePath, file.name].join('/')));
	}
}

async function archiveArea(app: App, archivePath: string, file: TFile): Promise<void> {
	const destBasePath = normalizePath([archivePath, file.basename].join('/'));
	const companionFolderPath = [
		file.path.substring(0, file.path.lastIndexOf('/')),
		`_${file.basename.toLowerCase()}`,
	].join('/');

	const companionFolder = app.vault.getAbstractFileByPath(normalizePath(companionFolderPath));

	await app.vault.createFolder(destBasePath);
	await app.fileManager.renameFile(file, normalizePath([destBasePath, file.name].join('/')));
	if (companionFolder instanceof TFolder) {
		await app.fileManager.renameFile(companionFolder, normalizePath([destBasePath, companionFolder.name].join('/')));
	}
}

async function archiveResource(app: App, archivePath: string, file: TFile): Promise<void> {
	await app.fileManager.renameFile(file, normalizePath([archivePath, file.name].join('/')));
}
