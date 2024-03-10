import { PluginSettingTab, Setting, debounce } from 'obsidian';
import type { App } from 'obsidian';

import type ParaWorkflower from 'main';
import type { PluginSettings } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
	projectsPath: '1-Projects',
	areasPath: '2-Areas',
	useCompanionDir: true,
	resourcesPath: '3-Resources',
	archivePath: '4-Archive',

	templatesFolder: 'Templates',
	projectTemplateName: 'Project Template',
	areaTemplateName: 'Area Template',
	resourceTemplateName: 'Resource Template',
};

export class SettingTab extends PluginSettingTab {
	plugin: ParaWorkflower;

	constructor(app: App, plugin: ParaWorkflower) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Projects Folder:')
			.setDesc('Where to place your projects?')
			.addText((text) => text
				.setPlaceholder(DEFAULT_SETTINGS.projectsPath)
				.setValue(this.plugin.settings.projectsPath)
				.onChange(
					debounce(async (value) => {
						this.plugin.settings.projectsPath = value;
						await this.plugin.saveSettings();
					}, 500)
				)
			);

		new Setting(containerEl).setName('Areas Folder:')
			.setDesc('Where to place your areas?')
			.addText((text) => text
				.setPlaceholder(DEFAULT_SETTINGS.areasPath)
				.setValue(this.plugin.settings.areasPath)
				.onChange(
					debounce(async (value) => {
						this.plugin.settings.areasPath = value;
						await this.plugin.saveSettings();
					}, 500)
				)
			);

		new Setting(containerEl).setName('Enable area companion folder?')
			.setDesc('Folder name `_<name_of_area>` which contains directly related notes to this area.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.useCompanionDir)
				.onChange(async (value) => {
					this.plugin.settings.useCompanionDir = value;
					await this.plugin.saveSettings();
					this.display();
				})
			);

		new Setting(containerEl).setName('Resources Folder:')
			.setDesc('Where to place your resources?')
			.addText((text) => text
				.setPlaceholder(DEFAULT_SETTINGS.resourcesPath)
				.setValue(this.plugin.settings.resourcesPath)
				.onChange(
					debounce(async (value) => {
						this.plugin.settings.resourcesPath = value;
						await this.plugin.saveSettings();
					}, 500)
				)
			);

		new Setting(containerEl).setName('Archive Folder:')
			.setDesc('Where to place your archived files?')
			.addText((text) => text
				.setPlaceholder(DEFAULT_SETTINGS.archivePath)
				.setValue(this.plugin.settings.archivePath)
				.onChange(
					debounce(async (value) => {
						this.plugin.settings.archivePath = value;
						await this.plugin.saveSettings();
					}, 500)
				)
			);
	}
}
