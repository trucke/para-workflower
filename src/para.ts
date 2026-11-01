import { parseFrontMatterTags } from 'obsidian';
import type { App, TFile } from 'obsidian';

import { PARA_TYPES } from './types';
import type { ParaType } from './types';

/**
 * Frontmatter tags in lower case and without `#`. Reads Obsidian's metadata
 * cache, so looking at a note never rewrites it.
 */
export function getTags(app: App, file: TFile): string[] {
	const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter ?? null;
	return (parseFrontMatterTags(frontmatter) ?? []).map((tag) => tag.replace(/^#/, '').toLowerCase());
}

export function getParaType(app: App, file: TFile): ParaType | null {
	const tags = getTags(app, file);
	return PARA_TYPES.find((type) => tags.includes(type)) ?? null;
}

/** Normalizes a frontmatter list property, which YAML allows as a list or a single string. */
export function toStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === 'string');
	}
	return typeof value === 'string' ? value.split(/[,\s]+/).filter(Boolean) : [];
}
