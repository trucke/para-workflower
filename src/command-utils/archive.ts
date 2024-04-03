import { App, normalizePath, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { ParaType, PluginSettings } from "src/types";

export async function archive(app: App, settings: PluginSettings, file: TAbstractFile): Promise<void> {
	try {

		if (file.path.includes(settings.projectsPath)) {
			const projectTFile: TFile = file as TFile;
			await app.fileManager.processFrontMatter(projectTFile, (frontMatter) => {
				frontMatter.tags = frontMatter.tags || [];
				if (!frontMatter.tags.includes(ParaType.Project)) {
					throw new Error("File has no tag 'project'");
				}
			});

			await archiveProject(app, settings, projectTFile);
			return;
		}

		if (file.path.includes(settings.resourcesPath)) {
			const resourceTFile: TFile = file as TFile;
			await app.fileManager.processFrontMatter(resourceTFile, (frontMatter) => {
				frontMatter.tags = frontMatter.tags || [];
				if (!frontMatter.tags.includes(ParaType.Resource)) {
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
				if (!frontMatter.tags.includes(ParaType.Area)) {
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

export async function completeProject(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	const { projectsPath, archivePath } = settings;

	const isInProjectDir: boolean = file.parent !== null && file.path.contains(projectsPath);
	let hasProjectTag: boolean = false;
	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.tags = frontMatter.tags || [];
		hasProjectTag = frontMatter.tags.contains(ParaType.Project);
	});

	if (!(isInProjectDir || hasProjectTag)) {
		new Notice('File is not an active project');
		return Promise.reject('File is not an active project');
	}

	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.completed = true;
	});

	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, 'Status:: #done');
	});

	if (file.parent!.path !== projectsPath) {
		const dest = normalizePath([archivePath, file.parent!.name].join('/'));
		return app.fileManager.renameFile(file.parent!, dest);
	} else {
		const dest = normalizePath([archivePath, file.name].join('/'));
		return app.fileManager.renameFile(file, dest);
	}
}

async function archiveProject(app: App, setting: PluginSettings, file: TFile): Promise<void> {
	const { archivePath, projectsPath } = setting;

	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, "Status:: #aborted");
	});

	if (file.parent!.path !== projectsPath) {
		const dest = normalizePath([archivePath, file.parent!.name].join('/'));
		return app.fileManager.renameFile(file.parent!, dest);
	} else {
		const dest = normalizePath([archivePath, file.name].join('/'));
		return app.fileManager.renameFile(file, dest);
	}
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
