/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_SETTINGS, parseSettings } from './settings-data.ts';

test('parseSettings falls back to defaults for missing data', () => {
	assert.deepEqual(parseSettings(null), DEFAULT_SETTINGS);
	assert.deepEqual(parseSettings('garbage'), DEFAULT_SETTINGS);
});

test('parseSettings keeps valid values and drops mistyped or unknown ones', () => {
	const settings = parseSettings({ projectsPath: 'Projects', useFolderStructure: 'yes', unknown: 1 });
	assert.equal(settings.projectsPath, 'Projects');
	assert.equal(settings.useFolderStructure, DEFAULT_SETTINGS.useFolderStructure);
	assert.equal('unknown' in settings, false);
});

test('parseSettings migrates template settings from 0.1.5', () => {
	const settings = parseSettings({ templatesFolder: 'Meta/Templates', projectTemplateName: 'ProjectTemplate' });
	assert.equal(settings.projectTemplate, 'Meta/Templates/ProjectTemplate.md');
	assert.equal(settings.areaTemplate, DEFAULT_SETTINGS.areaTemplate);
	assert.equal('templatesFolder' in settings, false);
});

test('parseSettings prefers current template settings over legacy ones', () => {
	const settings = parseSettings({ projectTemplate: 'T/Project.md', projectTemplateName: 'Old' });
	assert.equal(settings.projectTemplate, 'T/Project.md');
});
