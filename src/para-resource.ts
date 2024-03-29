import { Modal, App, Setting, Notice, TFile, normalizePath } from "obsidian";
import type { PluginSettings, CreateResourceProps } from "src/types";
import { containsInvalidCharacters } from "./utils";

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
		const resourceNameSetting = new Setting(contentEl)
			.setName("Name")
			.addText((text) =>
				text.onChange((value) => {
					if (containsInvalidCharacters(value)) {
						submit.setDisabled(true);
						resourceNameSetting.descEl.show();
					} else {
						resourceNameSetting.descEl.hide();
						submit.setDisabled(false);
					}
					this.result.name = value
				}));
		resourceNameSetting.setDesc('Name contains invalid characters: [ ] # ^ | \\ / : ?');
		resourceNameSetting.descEl.setCssProps({ 'color': 'var(--background-modifier-error)' });
		resourceNameSetting.descEl.hide();

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

export async function createResource(app: App, settings: PluginSettings, properties: CreateResourceProps): Promise<void> {
	if (!properties.name) {
		new Notice('The resource needs a name!');
		return Promise.reject();
	}

	const folder: string = settings.resourcesPath;
	const file = `${folder}/${properties.name}.md`;
	const templateFile = `${settings.templatesFolder}/${settings.resourceTemplateName}.md`;

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
		await app.workspace.getLeaf().openFile(fileCreated);
	}
}
