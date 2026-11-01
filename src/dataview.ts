import { Notice } from 'obsidian';
import type { App } from 'obsidian';

// `app.plugins` is not part of Obsidian's public API, but it is stable and the
// only way to see which community plugins are enabled without bundling one.
declare module 'obsidian' {
	interface App {
		plugins: { enabledPlugins: Set<string> };
	}
}

/** Area notes render their lists with Dataview. Everything else works without it. */
export function warnIfDataviewDisabled(app: App): void {
	if (!app.plugins.enabledPlugins.has('dataview')) {
		new Notice('Area notes use Dataview to list their projects and resources. Install and enable Dataview to see them.', 8000);
	}
}
