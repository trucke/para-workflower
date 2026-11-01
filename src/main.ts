import { Notice, Plugin } from 'obsidian';
import type { TFile } from 'obsidian';

import { archiveItem, completeProject, getArchivedItems, restoreItem } from './archive';
import { createItem } from './create';
import { warnIfDataviewDisabled } from './dataview';
import { initializeVault } from './init';
import { CreateItemModal } from './modals/CreateItemModal';
import { RestoreItemModal } from './modals/RestoreItemModal';
import { isInFolder } from './paths';
import { SettingTab } from './settings';
import { parseSettings } from './settings-data';
import type { ParaType, PluginSettings } from './types';
import { UserError } from './utils';

export default class ParaWorkflower extends Plugin {
	settings!: PluginSettings;

	override async onload(): Promise<void> {
		this.settings = parseSettings(await this.loadData());

		this.addCommand({
			id: 'init-vault',
			name: 'Initialize vault',
			callback: () => void this.run(async () => {
				await initializeVault(this.app, this.settings);
				warnIfDataviewDisabled(this.app);
				return 'Vault initialized';
			}),
		});

		this.addCreateCommand('project');
		this.addCreateCommand('area');
		this.addCreateCommand('resource');

		this.addCommand({
			id: 'move-to-archive',
			name: 'Move to archive',
			callback: () => void this.run(() => archiveItem(this.app, this.settings, this.requireActiveFile())),
		});

		this.addCommand({
			id: 'restore-from-archive',
			name: 'Restore from archive',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (file && isInFolder(file.path, this.settings.archivePath)) {
					void this.run(() => restoreItem(this.app, this.settings, file));
					return;
				}
				const items = getArchivedItems(this.app, this.settings.archivePath);
				new RestoreItemModal(this.app, items, (item) =>
					void this.run(() => restoreItem(this.app, this.settings, item.file))).open();
			},
		});

		this.addCommand({
			id: 'complete-current-project',
			name: 'Complete project',
			callback: () => void this.run(() => completeProject(this.app, this.settings, this.requireActiveFile())),
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	private addCreateCommand(type: ParaType): void {
		this.addCommand({
			id: `create-${type}`,
			name: `Create new ${type}`,
			callback: () => new CreateItemModal(this.app, type, (item) => void this.run(async () => {
				const message = await createItem(this.app, this.settings, type, item);
				if (type === 'area') {
					warnIfDataviewDisabled(this.app);
				}
				return message;
			})).open(),
		});
	}

	private requireActiveFile(): TFile {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			throw new UserError('Open a project, area or resource first');
		}
		return file;
	}

	/** Runs a command action and reports its result or error as a notice. */
	private async run(action: () => Promise<string>): Promise<void> {
		try {
			new Notice(await action());
		} catch (error) {
			if (error instanceof UserError) {
				new Notice(error.message);
				return;
			}
			console.error('[PARA Workflower]', error);
			new Notice(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
