import { FuzzySuggestModal, renderMatches } from 'obsidian';
import type { App, FuzzyMatch } from 'obsidian';

import type { ArchivedItem } from '../types';

export class RestoreItemModal extends FuzzySuggestModal<ArchivedItem> {
	constructor(
		app: App,
		private readonly items: ArchivedItem[],
		private readonly onChoose: (item: ArchivedItem) => void,
	) {
		super(app);
		this.setPlaceholder('Which item do you want to restore?');
		this.emptyStateText = 'No archived projects, areas or resources found.';
	}

	override getItems(): ArchivedItem[] {
		return this.items;
	}

	override getItemText(item: ArchivedItem): string {
		return item.file.basename;
	}

	override renderSuggestion(match: FuzzyMatch<ArchivedItem>, el: HTMLElement): void {
		el.addClass('para__item');
		renderMatches(el.createDiv({ cls: 'para__item__text' }), match.item.file.basename, match.match.matches);
		el.createDiv({ cls: 'para__item__type', text: match.item.type });
	}

	override onChooseItem(item: ArchivedItem): void {
		this.onChoose(item);
	}
}
