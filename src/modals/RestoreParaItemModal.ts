import ParaWorkflower from "main";
import { App, Notice, SuggestModal } from "obsidian";
import { restoreByType } from "src/command-utils/restore";
import { ArchiveItem } from "src/types";

export class RestoreParaItemModal extends SuggestModal<ArchiveItem> {
	plugin: ParaWorkflower;
	items: ArchiveItem[];

	constructor(app: App, plugin: ParaWorkflower, items: ArchiveItem[]) {
		super(app);

		this.plugin = plugin;
		this.items = items;
		this.setPlaceholder('Which PARA item do you want to restore?');
	}

	getSuggestions(query: string): ArchiveItem[] {
		return this.items.filter((item: ArchiveItem) =>
			item.file.basename.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(item: ArchiveItem, el: HTMLElement) {
		const container = el.createEl("div", { cls: 'para__item' });
		container.createEl("div", { text: item.file.basename, cls: 'para__item__text' });
		container.createEl("div", { text: item.type?.toString(), cls: 'para__item__type' });
	}

	onChooseSuggestion(item: ArchiveItem, _evt: MouseEvent | KeyboardEvent) {
		restoreByType(this.app, this.plugin.settings, item.file, item.type)
			.then(() => { })
			.catch((error) => {
				console.error('[PARA Workflower] An error occurred during restoring:', error.message);
				new Notice(`FAILED: ${error.message}`);
			});
	}
}
