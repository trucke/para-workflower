import { Modal, App, Setting, Notice, TFile, normalizePath } from "obsidian";
import type { PluginSettings, CreateResourceProps } from "src/types";
import { containsInvalidCharacters, error } from "./utils";

export class CreateResourceModal extends Modal {
	INVALID_INPUT_MSG: string = 'Name contains invalid characters: [ ] # ^ | \\ / : ?';

	result: CreateResourceProps = {
		name: null
	};
	onSubmit: (result: CreateResourceProps) => void;

	resourceNameSetting: Setting;
	submitControl: Setting;

	constructor(app: App, onSubmit: (result: CreateResourceProps) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'What\'s the resource?' });
		this.resourceNameSetting = new Setting(contentEl)
			.setName("Name")
			.addText((text) => text.onChange((value) => {
				this.isInputValid(this.resourceNameSetting, value)
				this.result.name = value;
			}));

		this.resourceNameSetting.controlEl.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') { event.preventDefault(); this.submit(); }
		});

		this.submitControl = new Setting(contentEl)
			.addButton((btn) => btn
				.setButtonText('Submit')
				.setCta()
				.onClick(() => { this.submit() }));
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
			new Notice(error('Resource name cannot be empty'));
			return;
		}

		if (this.resourceNameSetting.descEl.isShown()) {
			new Notice(error('Cannot create resource. Check your inputs'));
			return;
		}

		this.close()
		this.onSubmit(this.result);
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
