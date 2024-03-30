import { Modal, App, Setting, Notice, TFile, normalizePath, TFolder } from "obsidian";
import type { PluginSettings, CreateAreaProps } from "src/types";
import { containsInvalidCharacters } from "./utils";

export class CreateAreaModal extends Modal {
	result: CreateAreaProps = {
		name: null
	};
	onSubmit: (result: CreateAreaProps) => void;

	constructor(app: App, onSubmit: (result: CreateAreaProps) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'What\'s the area?' });
		const areaNameSetting = new Setting(contentEl)
			.setName("Name")
			.addText((text) =>
				text.onChange((value) => {
					if (containsInvalidCharacters(value)) {
						submit.setDisabled(true);
						areaNameSetting.descEl.show();
					} else {
						areaNameSetting.descEl.hide();
						submit.setDisabled(false);
					}
					this.result.name = value
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

export async function createArea(app: App, settings: PluginSettings, properties: CreateAreaProps): Promise<void> {
	if (!properties.name) {
		new Notice('The area needs a name!');
		return Promise.reject();
	}

	const folder: string = settings.areasPath;
	const file = `${folder}/${properties.name}.md`;
	const companionFoloder = `${folder}/_${properties.name.toLowerCase()}`;
	const templateFile = `${settings.templatesFolder}/${settings.areaTemplateName}.md`;

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

		const fileCreated = await app.vault.create(file, templateContent);
		if (settings.useCompanionDir) {
			await app.vault.createFolder(companionFoloder);
		}
		await app.workspace.getLeaf().openFile(fileCreated);
	}
}


export async function archiveArea(app: App, settings: PluginSettings): Promise<void> {
	const file: TFile = this.app.workspace.getActiveFile();
	if (file === null) {
		return Promise.reject();
	}

	const isInAreaDir: boolean = file.path.contains(settings.areasPath);
	let hasAreaTag: boolean = false;
	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.tags = frontMatter.tags || [];
		hasAreaTag = frontMatter.tags.contains('area');
	});

	if (!isInAreaDir && !hasAreaTag) {
		new Notice('File is not an area expected by the "PARA Workflower" plugin');
		return Promise.reject();
	}

	let newBaseFilePath = normalizePath(
		[
			this.app.vault.getRoot().name,
			settings.archivePath,
			file.basename
		].join("/")
	);

	await app.vault.createFolder(newBaseFilePath);
	await app.fileManager.renameFile(file, normalizePath([newBaseFilePath, file.name].join('/')));

	const companionFolder = [
		this.app.vault.getRoot().name,
		settings.areasPath,
		`_${file.basename.toLowerCase()}`
	].join("/");
	const companionFolderTFolder = app.vault.getAbstractFileByPath(normalizePath(companionFolder));
	if (companionFolderTFolder instanceof TFolder) {
		await app.fileManager.renameFile(companionFolderTFolder,
			normalizePath([newBaseFilePath, companionFolderTFolder.name].join('/')));
	}
}

