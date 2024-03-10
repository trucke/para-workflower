import { Notice, Plugin, TFile } from 'obsidian';
import { isPluginEnabled } from 'obsidian-dataview';

import {
	CreateProjectModal,
	createProject,
	archiveProject,
	restoreProjectFile,
	completeProject
} from 'src/para-project';
import { DEFAULT_SETTINGS, SettingTab } from 'src/settings';
import { initializeVault } from 'src/init';
import type {
	CreateProjectProps,
	CreateAreaProps,
	CreateResourceProps,
	PluginSettings
} from 'src/types';
import { CreateAreaModal, createArea } from 'src/para-area';
import { CreateResourceModal, createResource } from 'src/para-resource';
import { ChooseProjectModal } from 'src/fuzzy-modal-projects';


export default class ParaWorkflower extends Plugin {
	settings: PluginSettings;

	async onload() {
		if (!isPluginEnabled(this.app)) {
			new Notice('You need to install and enable dataview first!', 5000);
			return;
		}

		await this.loadSettings();

		this.addCommand({
			id: 'para-workflower-init-vault',
			name: 'Initialize vault',
			callback: () => {
				initializeVault(this.app.vault, this.settings).then(() => {
					new Notice('Vault initialized', 5000);
				});
			}
		})

		this.addCommand({
			id: 'para-workflower-create-project',
			name: 'Create new Project',
			callback: () => {
				new CreateProjectModal(this.app, (result: CreateProjectProps) => {
					createProject(this.app, this.settings, result).then(() => {
						new Notice(`Project '${result.name}' created!`);
					}).catch(() => { });
				}).open();
			},
		});

		this.addCommand({
			id: 'para-workflower-create-area',
			name: 'Create new Area',
			callback: () => {
				new CreateAreaModal(this.app, (result: CreateAreaProps) => {
					createArea(this.app, this.settings, result).then(() => {
						new Notice(`Area '${result.name}' created!`);
					}).catch(() => { });
				}).open();
			},
		});

		this.addCommand({
			id: 'para-workflower-create-resource',
			name: 'Create new Resource',
			callback: () => {
				new CreateResourceModal(this.app, (result: CreateResourceProps) => {
					createResource(this.app, this.settings, result).then(() => {
						new Notice(`Resource '${result.name}' created!`);
					}).catch(() => { });
				}).open();
			},
		});

		this.addCommand({
			id: 'para-workflower-archive-project',
			name: 'Archive current project',
			callback: () => {
				archiveProject(this.app, this.settings).then(() => {
					new Notice('Project archived');
				});
			},
		});

		this.addCommand({
			id: 'para-workflower-restore-current-project',
			name: 'Restore open project from archive',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file !== null) {
					restoreProjectFile(this.app, this.settings, file).then(() => {
						new Notice('Project restored');
					});
				}
			},
		});

		this.addCommand({
			id: 'para-workflower-restore-project',
			name: 'Restore project from archive',
			callback: async () => {
				// big shout out to ChatGPT for this coding masterpiece....
				// ... at least it produces somehow what i need ...
				const archivedFiles: TFile[] = this.app.vault.getMarkdownFiles()
					.filter((file: TFile) => file.path.contains(this.settings.archivePath));
				const archivedProjectFiles = await Promise.all(archivedFiles.map(async (file: TFile) => {
					let isProject: boolean = false;
					await this.app.fileManager.processFrontMatter(file, (frontMatter) => {
						const tags = frontMatter.tags || null;
						if (tags !== null) {
							isProject = (frontMatter.tags as Array<string>).includes('project');
						}
					});
					return isProject ? file : null;
				}));
				const resultFileList: TFile[] = archivedProjectFiles.filter((file: TFile | null): file is TFile => file !== null);

				new ChooseProjectModal(this.app, this, resultFileList).open();
			},
		});

		this.addCommand({
			id: 'para-workflower-complete-current-project',
			name: 'Complete project',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file !== null) {
					completeProject(this.app, this.settings, file).then(() => {
						new Notice('Project completed and moved to archive');
					});
				}
			},
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

