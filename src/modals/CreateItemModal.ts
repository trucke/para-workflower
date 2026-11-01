import { Modal, Notice, Setting } from 'obsidian';
import type { App } from 'obsidian';

import type { NewItem, ParaType } from '../types';
import { INVALID_NAME_MESSAGE, containsInvalidCharacters } from '../utils';

export class CreateItemModal extends Modal {
	private readonly values: NewItem = { name: '', area: '' };

	constructor(
		app: App,
		private readonly type: ParaType,
		private readonly onSubmit: (item: NewItem) => void,
	) {
		super(app);
	}

	override onOpen(): void {
		this.setTitle(`What's the ${this.type}?`);
		this.addField('name', 'Name');
		if (this.type === 'project') {
			this.addField('area', 'Area', 'Optional. Tags the project with this area.');
		}
		new Setting(this.contentEl).addButton((button) => button
			.setButtonText('Create')
			.setCta()
			.onClick(() => this.submit()));

		this.scope.register([], 'Enter', (event) => {
			event.preventDefault();
			this.submit();
			return false;
		});
	}

	override onClose(): void {
		this.contentEl.empty();
	}

	private addField(key: keyof NewItem, name: string, desc = ''): void {
		const setting = new Setting(this.contentEl).setName(name).setDesc(desc);
		setting.addText((text) => text.onChange((value) => {
			this.values[key] = value;
			const invalid = containsInvalidCharacters(value);
			setting.setDesc(invalid ? INVALID_NAME_MESSAGE : desc);
			setting.descEl.toggleClass('para-workflower-error', invalid);
		}));
	}

	private submit(): void {
		if (this.values.name.trim() === '') {
			new Notice(`The ${this.type} needs a name`);
			return;
		}
		if (containsInvalidCharacters(this.values.name) || containsInvalidCharacters(this.values.area)) {
			new Notice(INVALID_NAME_MESSAGE);
			return;
		}
		this.close();
		this.onSubmit({ ...this.values });
	}
}
