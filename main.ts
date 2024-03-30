import { App, Notice, Plugin, TFile, normalizePath } from 'obsidian';
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
import { archive } from 'src/command-utils/archive';
import { restore } from 'src/command-utils/restore';


export default class ParaWorkflower extends Plugin {
	settings: PluginSettings;

	async onload() {
		if (!isPluginEnabled(this.app)) {
			new Notice('You need to install and enable dataview first!', 5000);
			return;
		}

		await this.loadSettings();

		this.addCommand({
			id: 'init-vault',
			name: 'Initialize vault',
			callback: () => {
				initializeVault(this.app.vault, this.settings).then(() => {
					new Notice('Vault initialized', 5000);
				});
			}
		})

		this.addCommand({
			id: 'create-project',
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
			id: 'create-area',
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
			id: 'create-resource',
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
			id: 'archive-project',
			name: 'Archive current project',
			callback: () => {
				archiveProject(this.app, this.settings).then(() => {
					new Notice('Project archived');
				});
			},
		});

		this.addCommand({
			id: 'archive-current',
			name: 'Archive current',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file !== null) {
					archive(this.app, this.settings, file)
						.then(() => {
							new Notice(`'${file.basename}' archived`);
						})
						.catch((error) => {
							console.error('[PARA Workflower] An error occurred during archiving:', error.message);
							new Notice(`FAILED: ${error.message}`);
						});
				}
			},
		});
		
		this.addCommand({
			id: 'restore-current',
			name: 'Restore current',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file !== null) {
					restore(this.app, this.settings, file)
						.then(() => {
							new Notice(`'${file.basename}' restored`);
						})
						.catch((error) => {
							console.error('[PARA Workflower] An error occurred during restoring:', error.message);
							new Notice(`FAILED: ${error.message}`);
						});
				}
			},
		});

		this.addCommand({
			id: 'restore-current-project',
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
			id: 'restore-project',
			name: 'Restore project from archive',
			callback: () => {
				getArchivedProjects(this.app, this.settings).then((files) => {
					new ChooseProjectModal(this.app, this, files).open();
				});
			},
		});

		this.addCommand({
			id: 'complete-current-project',
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

async function getArchivedProjects(app: App, settings: PluginSettings): Promise<TFile[]> {
	const items: TFile[] = [];
	const folder = app.vault.getFolderByPath(normalizePath(settings.archivePath));
	if (folder) {
		for (const child of folder.children) {
			if (child instanceof TFile) {
				await app.fileManager.processFrontMatter(child, (frontMatter) => {
					const tags = (frontMatter.tags as Array<string>) || null;
					if (tags !== null && tags.contains('project')) {
						items.push(child);
					}
				});
			}
		}
	}

	return items;
}
