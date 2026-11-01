/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isInFolder, itemPath, joinPath } from './paths.ts';

test('isInFolder matches whole path segments only', () => {
	assert.equal(isInFolder('1-Projects/Website.md', '1-Projects'), true);
	assert.equal(isInFolder('1-Projects', '1-Projects'), true);
	assert.equal(isInFolder('Notes/Old 1-Projects/Stray.md', '1-Projects'), false);
	assert.equal(isInFolder('1-Projects-old/Stray.md', '1-Projects'), false);
});

test('joinPath skips the vault root', () => {
	assert.equal(joinPath('', 'Templates', 'Area.md'), 'Templates/Area.md');
	assert.equal(joinPath('/', 'Area.md'), 'Area.md');
});

test('itemPath moves a folder-structure project as a whole', () => {
	assert.equal(itemPath('1-Projects/Book Launch/Book Launch.md', '1-Projects'), '1-Projects/Book Launch');
	assert.equal(itemPath('4-Archive/Book Launch/Book Launch.md', '4-Archive'), '4-Archive/Book Launch');
});

test('itemPath moves only the note when its folder holds other things', () => {
	assert.equal(itemPath('1-Projects/Website Relaunch.md', '1-Projects'), '1-Projects/Website Relaunch.md');
	assert.equal(itemPath('1-Projects/Client A/Website.md', '1-Projects'), '1-Projects/Client A/Website.md');
	assert.equal(itemPath('1-Projects/Client A/Website/Website.md', '1-Projects'), '1-Projects/Client A/Website/Website.md');
});

test('itemPath handles roots in subfolders and the vault root', () => {
	assert.equal(itemPath('Work/1-Projects/App/App.md', 'Work/1-Projects'), 'Work/1-Projects/App');
	assert.equal(itemPath('App/App.md', ''), 'App');
});
