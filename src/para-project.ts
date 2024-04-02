import { Modal, App, Setting, Notice, TFile, normalizePath, TFolder } from 'obsidian';
import { containsInvalidCharacters, error } from 'src/utils';
import { PluginSettings, CreateProjectProps, ParaType } from 'src/types';

export class CreateProjectModal extends Modal {
	INVALID_INPUT_MSG: string = 'Name contains invalid characters: [ ] # ^ | \\ / : ?';

	result: CreateProjectProps = {
		name: null,
		area: null
	};
	onSubmit: (result: CreateProjectProps) => void;

	projectNameSetting: Setting;
	areaNameSetting: Setting;
	submitControl: Setting;

	constructor(app: App, onSubmit: (result: CreateProjectProps) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'What\'s the project?' });
		this.projectNameSetting = new Setting(contentEl)
			.setName('Name')
			.addText((text) => text.onChange((value) => {
				this.isInputValid(this.projectNameSetting, value)
				this.result.name = value;
			}));

		this.projectNameSetting.controlEl.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') { event.preventDefault(); this.submit(); }
		});

		contentEl.createEl('h2', { text: 'In which area you want to progress?' });
		this.areaNameSetting = new Setting(contentEl)
			.setName('Area')
			.addText((text) => text.onChange((value) => {
				this.isInputValid(this.areaNameSetting, value);
				this.result.area = value;
			}));

		this.areaNameSetting.controlEl.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') { event.preventDefault(); this.submit(); }
		});

		this.submitControl = new Setting(contentEl)
			.addButton((btn) => btn
				.setButtonText('Submit')
				.setCta()
				.onClick(() => { this.submit() }));
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}

	isInputValid(el: Setting, value: string): boolean {
		if (containsInvalidCharacters(value)) {
			el.setDesc(error(this.INVALID_INPUT_MSG));
			el.descEl.show();
			return false;
		}

		el.setDesc('');
		return true;
	}

	submit() {
		if (this.result.name === null || this.result.name.length < 1) {
			new Notice(error('Project name cannot be empty'));
			return;
		}

		const projectValid = !this.projectNameSetting.descEl.isShown();
		const areaValid = !this.areaNameSetting.descEl.isShown();
		if (!projectValid || !areaValid) {
			new Notice(error('Cannot create project. Check your inputs'));
			return;
		}

		this.close()
		this.onSubmit(this.result);
	}
}

async function getAllProjectFiles(app: App, path: string) {
	const items: TFile[] = [];
	const projects = app.vault.getFolderByPath(path);
	if (projects) {
		await walkProjects(projects, items, app);
	}

	return items;
}

async function walkProjects(folder: TFolder, items: TFile[], app: App) {
	for (const child of folder.children) {
		if (child instanceof TFolder) {
			await walkProjects(child, items, app);
		}

		if (child instanceof TFile) {
			await app.fileManager.processFrontMatter(child, (frontMatter) => {
				const tags = (frontMatter.tags as Array<string>) || null;
				if (tags !== null && tags.contains(ParaType.Project)) {
					items.push(child);
				}
			});
		}
	}
}
export async function createProject(app: App, settings: PluginSettings, properties: CreateProjectProps): Promise<void> {
	const { name, area } = properties;
	if (!name) { // sanity check
		new Notice(error('The project needs a name!'));
		return Promise.reject();
	}

	const { projectsPath, templatesFolder, projectTemplateName, useFolderStructure } = settings;
	if (!projectsPath || (projectsPath && projectsPath.length === 0)) {
		new Notice('Projects folder path is not configured');
		throw new Error('Project path is not configured');
	}

	const activeProjects = await getAllProjectFiles(app, projectsPath);
	const archivedProjects = await getAllProjectFiles(app, settings.archivePath);
	const projects = [...activeProjects, ...archivedProjects];
	const project = projects.find((project) =>
		project.basename.toLowerCase() === name.toLowerCase()) || null;
	if (project && project instanceof TFile) {
		await app.workspace.getLeaf().openFile(project);
		return Promise.reject('Project already exists');
	}

	const templatePath: string = normalizePath([templatesFolder, `${projectTemplateName}.md`].join('/'));
	const projectFilePath: string[] = [projectsPath];
	if (useFolderStructure) {
		projectFilePath.push(name);
	}
	projectFilePath.push(`${name}.md`);
	const path: string = normalizePath(projectFilePath.join('/'));

	const templateTFile = app.vault.getAbstractFileByPath(templatePath);
	if (!templateTFile) {
		new Notice(error(`The template '${templatePath}' does not exist!`));
		return Promise.reject();
	}

	// make sure projects folder exists
	if (!app.vault.getAbstractFileByPath(projectsPath)) {
		app.vault.createFolder(projectsPath);
	}

	// TODO: if template file does not exist, create templates
	if (templateTFile instanceof TFile) {
		if (useFolderStructure) {
			const f = path.substring(0, path.lastIndexOf('/'));
			await app.vault.createFolder(f);
		}

		let templateContent = await app.vault.cachedRead(templateTFile);
		const projectFile: TFile = await app.vault.create(path, templateContent);
		if (area !== null) {
			await app.fileManager.processFrontMatter(projectFile, (frontMatter) => {
				frontMatter.tags = frontMatter.tags || [];
				frontMatter.tags.push(area?.toLowerCase());
			});

			await app.vault.process(projectFile, (data) => {
				return data.replace('Area:: [[]]', `Area:: [[${area}]]`);
			});

		}
		await app.workspace.getLeaf().openFile(projectFile);
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
