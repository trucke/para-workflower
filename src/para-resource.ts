import { Modal, App, Setting, Notice, TFile } from "obsidian";
import type { PluginSettings, CreateResourceProps } from "src/types";

export class CreateResourceModal extends Modal {
	result: CreateResourceProps = {
		name: null
	};
	onSubmit: (result: CreateResourceProps) => void;

	constructor(app: App, onSubmit: (result: CreateResourceProps) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'What\'s the resource?' });
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

export async function createResource(app: App, settings: PluginSettings, properties: CreateResourceProps): Promise<void> {
	if (!properties.name) {
		new Notice('The resource needs a name!');
		return Promise.reject();
	}

	const folder: string = settings.resourcesPath;
	const file = `${folder}/${properties.name}.md`;
	const templateFile = `${settings.templatesFolder}/${settings.resourceTemplateName}.md`;

	const templateTFile = app.vault.getAbstractFileByPath(templateFile!);
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
		await app.workspace.getLeaf().openFile(fileCreated);
	}
}
