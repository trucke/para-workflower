import ParaWorkflower from 'main';
import { App, FuzzySuggestModal, TFile, Notice } from 'obsidian';
import { restoreProjectFile } from './para-project';


export class ChooseProjectModal extends FuzzySuggestModal<TFile> {
	plugin: ParaWorkflower;
	files: TFile[];

	constructor(app: App, plugin: ParaWorkflower, files: TFile[]) {
		super(app);

		this.plugin = plugin;
		this.files = files;
		this.setPlaceholder('Which project do you want to restore?');
	}

	getItems(): TFile[] {
		return this.files;
	}

	getItemText(file: TFile): string {
		return file.basename;
	}

	onChooseItem(file: TFile, _evt: MouseEvent | KeyboardEvent) {
		restoreProjectFile(this.app, this.plugin.settings, file).then(() => {
			new Notice('Project restored');
		});
	}
}
