import { App, Notice, Plugin, TFile, TFolder } from 'obsidian';
import { isPluginEnabled } from 'obsidian-dataview';

import {
	CreateProjectModal,
	createProject,
	completeProject
} from 'src/para-project';
import { DEFAULT_SETTINGS, SettingTab } from 'src/settings';
import { initializeVault } from 'src/init';
import {
	CreateProjectProps,
	CreateAreaProps,
	CreateResourceProps,
	PluginSettings,
	ArchiveItem,
	ParaType
} from 'src/types';
import { CreateAreaModal, createArea } from 'src/para-area';
import { CreateResourceModal, createResource } from 'src/para-resource';
import { archive } from 'src/command-utils/archive';
import { restore } from 'src/command-utils/restore';
import { RestoreParaItemModal } from 'src/modals/RestoreParaItemModal';


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
			name: 'Create new project',
			callback: () => {
				new CreateProjectModal(this.app, (result: CreateProjectProps) => {
					createProject(this.app, this.settings, result).then(() => {
						new Notice(`Project '${result.name}' created!`);
					}).catch((error) => {
						if (typeof error == 'string') {
							new Notice(error);
						}
						console.log(error);
					});
				}).open();
			},
		});

		this.addCommand({
			id: 'create-area',
			name: 'Create new area',
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
			name: 'Create new resource',
			callback: () => {
				new CreateResourceModal(this.app, (result: CreateResourceProps) => {
					createResource(this.app, this.settings, result).then(() => {
						new Notice(`Resource '${result.name}' created!`);
					}).catch(() => { });
				}).open();
			},
		});

		this.addCommand({
			id: 'move-to-archive',
			name: 'Move to archive',
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
			id: 'restore-from-archive',
			name: 'Restore from archive',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file !== null && this.isArchived(file)) {
					restore(this.app, this.settings, file)
						.then(() => {
							new Notice(`'${file.basename}' restored`);
						})
						.catch((error) => {
							console.error('[PARA Workflower] An error occurred during restoring:', error.message);
							new Notice(`FAILED: ${error.message}`);
						});
				} else {
					getArchivedParaItems(this.app, this.settings.archivePath)
						.then((items) => {
							new RestoreParaItemModal(this.app, this, items).open();
						});
				}
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

	isArchived(file: TFile): boolean {
		if (file.parent === null) {
			return false;
		}

		return file.parent.path.contains(this.settings.archivePath);
	}
}

async function getArchivedParaItems(app: App, archivePath: string) {
	const items: ArchiveItem[] = [];
	const archive = app.vault.getFolderByPath(archivePath);
	if (archive) {
		await walkArchive(archive, items, app);
	}

	return items;
}

async function walkArchive(folder: TFolder, items: ArchiveItem[], app: App) {
	for (const child of folder.children) {
		if (child instanceof TFolder && !child.name.startsWith('_')) {
			await walkArchive(child, items, app);
		}

		if (child instanceof TFile) {
			await app.fileManager.processFrontMatter(child, (frontMatter) => {
				const tags = (frontMatter.tags as Array<string>) || null;
				if (tags !== null) {
					const archiveItem: ArchiveItem = { file: child, type: null };
					if (tags.contains(ParaType.Project)) {
						archiveItem.type = ParaType.Project;
					} else if (tags.contains(ParaType.Resource)) {
						archiveItem.type = ParaType.Resource;
					} else if (tags.contains(ParaType.Area)) {
						archiveItem.type = ParaType.Area;
					}

					if (archiveItem.type !== null) {
						items.push(archiveItem);
					}
				}
			});
		}
	}
}

