# Contributing

Bug reports, ideas and pull requests are welcome.

## Report a bug or suggest a feature

Open an [issue](https://github.com/trucke/para-workflower/issues). For bugs, include:

- the Obsidian version and platform (desktop or mobile)
- the plugin version
- the steps that cause the problem, and what you expected instead
- your plugin settings, if they differ from the defaults

## Set up a development environment

You need Git and Node.js 26. If you use [mise](https://mise.jdx.dev/), run `mise install` in the repository to get the pinned Node.js version.

> [!warning]
> Commands in this plugin move, edit and delete notes. Always develop in a separate test vault, never in a vault you care about.

1. Create an empty test vault in Obsidian.
2. Clone the repository into the vault's plugin folder:

   ```sh
   cd <test-vault>/.obsidian/plugins
   git clone https://github.com/trucke/para-workflower.git
   cd para-workflower
   ```

3. Install dependencies:

   ```sh
   npm ci
   ```

4. Start the build in watch mode:

   ```sh
   npm run dev
   ```

   The build writes `main.js` and rebuilds it on every change.

5. In Obsidian, open **Settings → Community plugins** and enable **PARA Workflower**.

To reload the plugin after a change, run **Reload app without saving** from the command palette. The [Hot-Reload](https://github.com/pjeby/hot-reload) plugin reloads it automatically.

## Before you open a pull request

Run the same checks as CI:

```sh
npm run lint
npm run build
```

`npm run lint` uses [`eslint-plugin-obsidianmd`](https://github.com/obsidianmd/eslint-plugin), which applies the rules of Obsidian's automated plugin review.

Keep each pull request focused on one change, and describe how you tested it in your test vault.

## Publish a release (maintainers)

1. Run `npm version <version>`, for example `npm version 0.2.0`. The command updates `package.json`, `manifest.json` and `versions.json`. It does not commit or tag.
2. Commit the change and push it to `master`.
3. Push a tag named exactly like the version, without a `v` prefix, for example `0.2.0`.
4. Wait for the release workflow to finish. It builds the plugin, attests `main.js`, `manifest.json` and `styles.css`, and creates a draft release.
5. Add release notes to the draft and publish it on GitHub.
