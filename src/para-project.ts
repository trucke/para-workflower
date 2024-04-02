import { Modal, App, Setting, Notice, TFile, normalizePath } from 'obsidian';
import { containsInvalidCharacters } from 'src/utils';
import type { PluginSettings, CreateProjectProps } from 'src/types';

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
			el.setDesc(this.error(this.INVALID_INPUT_MSG));
			el.descEl.show();
			return false;
		}

		el.setDesc('');
		return true;
	}

	submit() {
		if (this.result.name === null || this.result.name.length < 1) {
			new Notice(this.error('Project name cannot be empty'));
			return;
		}

		const projectValid = !this.projectNameSetting.descEl.isShown();
		const areaValid = !this.areaNameSetting.descEl.isShown();
		if (!projectValid || !areaValid) {
			new Notice(this.error('Cannot create project. Check your inputs'));
			return;
		}

		this.close()
		this.onSubmit(this.result);
	}

	error(msg: string): DocumentFragment {
		let errorMsg = document.createDocumentFragment();
		const div = document.createElement('div');
		div.textContent = msg;
		div.setCssProps({ 'color': 'var(--background-modifier-error)' });
		errorMsg.appendChild(div);
		return errorMsg;
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
			templateContent = templateContent.replace('Area:: [[]]', `Area:: [[${properties.area}]]`);
		}
		const fileCreated = await app.vault.create(file, templateContent);
		await app.fileManager.processFrontMatter(fileCreated, (frontMatter) => {
			frontMatter.tags = frontMatter.tags || [];
			frontMatter.tags.push(properties.area?.toLowerCase());
		});
		await app.workspace.getLeaf().openFile(fileCreated);
	}
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
		].join('/')
	);

	await app.fileManager.processFrontMatter(file, (frontMatter) => {
		frontMatter.completed = true;
	});
	await app.vault.process(file, (data) => {
		return data.replace(/^Status::.*$/m, 'Status:: #done');
	})

	return app.fileManager.renameFile(file, newFilePath);
}
