import { Modal, App, Setting, Notice, TFile, normalizePath } from "obsidian";
import type { PluginSettings, CreateAreaProps } from "src/types";

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
		new Setting(contentEl)
			.setName("Name")
			.addText((text) =>
				text.onChange((value) => {
					this.result.name = value
				}));

		new Setting(contentEl)
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
