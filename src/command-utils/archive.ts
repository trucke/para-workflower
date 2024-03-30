import { App, normalizePath, TAbstractFile, TFile, TFolder } from "obsidian";
import { PluginSettings } from "src/types";

export async function archive(app: App, settings: PluginSettings, file: TAbstractFile): Promise<void> {
	try {

		if (file.path.includes(settings.projectsPath)) {
			const projectTFile: TFile = file as TFile;
			await app.fileManager.processFrontMatter(projectTFile, (frontMatter) => {
				frontMatter.tags = frontMatter.tags || [];
				if (!frontMatter.tags.includes('project')) {
					throw new Error("File has no tag 'project'");
				}
			});

			await archiveProject(app, settings.archivePath, projectTFile);
			return;
		}

		if (file.path.includes(settings.resourcesPath)) {
			const resourceTFile: TFile = file as TFile;
			await app.fileManager.processFrontMatter(resourceTFile, (frontMatter) => {
				frontMatter.tags = frontMatter.tags || [];
				if (!frontMatter.tags.includes('resource')) {
					throw new Error("File has no tag 'resource'");
				}
			});

			await archiveResource(app, settings.archivePath, resourceTFile);
			return;
		}

		if (file.path.includes(settings.areasPath)) {
			const areaTFile: TFile = file as TFile;
			await app.fileManager.processFrontMatter(areaTFile, (frontMatter) => {
				frontMatter.tags = frontMatter.tags || [];
				if (!frontMatter.tags.includes('area')) {
					throw new Error("File has no tag 'area'");
				}
			});

			await archiveArea(app, settings.archivePath, areaTFile);
			return;
		}

	} catch (error) {
		throw error;
	}
}

async function archiveProject(app: App, archivePath: string, file: TFile): Promise<void> {
	let newFilePath = normalizePath([archivePath, file.name].join("/"));
	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, "Status:: #aborted");
	})

	return app.fileManager.renameFile(file, newFilePath);
}

async function archiveArea(app: App, archivePath: string, file: TFile): Promise<void> {
	const destBasePath = normalizePath([archivePath, file.basename].join("/"));
	const companionFolderPath = [
		this.app.vault.getRoot().name,
		file.path.substring(0, file.path.lastIndexOf('/')),
		`_${file.basename.toLowerCase()}`
	].join("/");

	const companionFolder = app.vault.getAbstractFileByPath(normalizePath(companionFolderPath));

	await app.vault.createFolder(destBasePath);
	await app.fileManager.renameFile(file, normalizePath([destBasePath, file.name].join('/')));
	if (companionFolder instanceof TFolder) {
		await app.fileManager.renameFile(companionFolder,
			normalizePath([destBasePath, companionFolder.name].join('/')));
	}
}

async function archiveResource(app: App, archivePath: string, file: TFile): Promise<void> {
	let newFilePath = normalizePath([archivePath, file.name].join("/"));
	return app.fileManager.renameFile(file, newFilePath);
}
