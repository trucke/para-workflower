import { Modal, App, Setting, Notice, TFile, normalizePath } from "obsidian";
import { containsInvalidCharacters } from "src/utils";
import type { PluginSettings, CreateProjectProps } from "src/types";

export class CreateProjectModal extends Modal {
	result: CreateProjectProps = {
		name: null,
		area: null
	};
	onSubmit: (result: CreateProjectProps) => void;

	projectNameValid: boolean = true;
	areaNameValid: boolean = true;

	constructor(app: App, onSubmit: (result: CreateProjectProps) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	canSubmit(submitControl: Setting) {
		if (this.projectNameValid && this.areaNameValid) {
			submitControl.setDisabled(false);
		} else {
			submitControl.setDisabled(true);
		}
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'What\'s the project?' });
		const projectNameSetting = new Setting(contentEl)
			.setName("Name")
			.addText((text) =>
				text.onChange((value) => {
					if (containsInvalidCharacters(value)) {
						this.projectNameValid = false;
						submit.setDisabled(true);
						projectNameSetting.descEl.show();
					} else {
						this.projectNameValid = true;
						projectNameSetting.descEl.hide();
						this.canSubmit(submit);
					}
					this.result.name = value
				}));
		projectNameSetting.setDesc('Name contains invalid characters: [ ] # ^ | \\ / : ?');
		projectNameSetting.descEl.setCssProps({ 'color': 'var(--background-modifier-error)' });
		projectNameSetting.descEl.hide();

		contentEl.createEl('h2', { text: 'In which area you want to progress?' });
		const areaNameSetting = new Setting(contentEl)
			.setName("Area")
			.addText((text) =>
				text.onChange((value) => {
					if (containsInvalidCharacters(value)) {
						this.areaNameValid = false;
						submit.setDisabled(true);
						areaNameSetting.descEl.show();
					} else {
						this.areaNameValid = true;
						areaNameSetting.descEl.hide();
						this.canSubmit(submit);
					}
					this.result.area = value
				}));
		areaNameSetting.setDesc('Name contains invalid characters: [ ] # ^ | \\ / : ?');
		areaNameSetting.descEl.setCssProps({ 'color': 'var(--background-modifier-error)' });
		areaNameSetting.descEl.hide();

		const submit = new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this.result);
					}));
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

export async function createProject(app: App, settings: PluginSettings, properties: CreateProjectProps): Promise<void> {
	if (!properties.name) {
		new Notice('The project needs a name!');
		return Promise.reject();
	}

	const folder: string = settings.projectsPath;
	const file = `${folder}/${properties.name}.md`;
	const templateFile = `${settings.templatesFolder}/${settings.projectTemplateName}.md`;

	const templateTFile = app.vault.getAbstractFileByPath(normalizePath(templateFile));
	if (!templateTFile) {
		new Notice(`The template '${templateFile}' does not exist!`);
		return Promise.reject();
	}

	if (templateTFile instanceof TFile) {
		let templateContent = await app.vault.cachedRead(templateTFile);
		// sanity check
		if (!folder || !file) {
			return Promise.reject();
		}
		// sanity check
		if (!app.vault.getAbstractFileByPath(folder)) {
			app.vault.createFolder(folder);
		}

		const tFile = app.vault.getAbstractFileByPath(file);
		if (tFile && tFile instanceof TFile) {
			await app.workspace.getLeaf().openFile(tFile);
			return Promise.reject();
		}

		if (properties.area !== null) {
			templateContent = templateContent.replace("Area:: [[]]", `Area:: [[${properties.area}]]`);
		}
		const fileCreated = await app.vault.create(file, templateContent);
		await app.fileManager.processFrontMatter(fileCreated, (frontMatter) => {
			frontMatter.tags = frontMatter.tags || [];
			frontMatter.tags.push(properties.area?.toLowerCase());
		});
		await app.workspace.getLeaf().openFile(fileCreated);
	}
}

export async function archiveProject(app: App, settings: PluginSettings): Promise<void> {
	const file: TFile = this.app.workspace.getActiveFile();
	if (file === null) {
		return Promise.reject();
	}

	const isInProjectDir: boolean = file.path.contains(settings.projectsPath);
	let hasProjectTag: boolean = false;
	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.tags = frontMatter.tags || [];
		hasProjectTag = frontMatter.tags.contains('project');
	});

	if (!isInProjectDir && !hasProjectTag) {
		new Notice('File is not an active project');
		return Promise.reject();
	}

	let newFilePath = normalizePath(
		[
			this.app.vault.getRoot().name,
			settings.archivePath,
			file.name
		].join("/")
	);

	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, "Status:: #aborted");
	})

	return app.fileManager.renameFile(file, newFilePath);
}

export async function restoreProjectFile(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	let hasProjectTag: boolean = false;
	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.tags = frontMatter.tags || [];
		hasProjectTag = frontMatter.tags.contains('project');
	});

	if (!hasProjectTag) {
		new Notice('File is not a project');
		return Promise.reject();
	}

	let newFilePath = normalizePath(
		[
			this.app.vault.getRoot().name,
			settings.projectsPath,
			file.name
		].join("/")
	);

	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, "Status:: #pending");
	})

	return app.fileManager.renameFile(file, newFilePath);
}

export async function completeProject(app: App, settings: PluginSettings, file: TFile): Promise<void> {
	const isInProjectDir: boolean = file.path.contains(settings.projectsPath);
	let hasProjectTag: boolean = false;
	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.tags = frontMatter.tags || [];
		hasProjectTag = frontMatter.tags.contains('project');
	});

	if (!isInProjectDir && !hasProjectTag) {
		new Notice('File is not an active project');
		return Promise.reject();
	}

	let newFilePath = normalizePath(
		[
			this.app.vault.getRoot().name,
			settings.archivePath,
			file.name
		].join("/")
	);

	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.completed = true;
	});
	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, "Status:: #done");
	})

	return app.fileManager.renameFile(file, newFilePath);
}
