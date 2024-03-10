# PARA Workflower

`PARA Workflower` is an Obsidian plugin to make managing your Vault using the PARA Method, by Tiago Forte, a lot easier.  
This plugin offers you a handful of very useful commands to  
- Initialize your Vault and prepare it to use PARA method with this plugin
- Create a new Project / Area / Resource
- Archive the current Project
- Restore the current Project or an archived Project by using fuzzy search


## What is the PARA Method?

A full article on the PARA method and its benefits can be found on this [blog post](https://fortelabs.co/blog/para/) by Tiago Forte.

## Installation

> [Dataview](https://github.com/blacksmithgu/obsidian-dataview) is required, please install it first.  

> Enable core plugin `Templates` and configure the templates folder to `Templates`

#### Recommended

`PARA Workflower` is available in the Obsidian community plugin browser!

1. Search for "PARA Workflower" in Obsidian's community plugins browser
2. Enable the plugin in your Obsidian settings (find "PARA Workflower" under "Community plugins").
3. Check the settings (You can customize the directory of your PARA notes)

#### Manual

Go to the [releases](https://github.com/trucke/para-workflower/releases) and download the latest `main.js` and `manifest.json` files.
Create a folder called `para-workflower` inside `.obsidian/plugins` and place both files in it.


## Commands
> Open command palette (default): `CTRL+p` or `CMD+p`

| Command                             | Description                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Initialize vault`                  | Initialize your vault by creating PARA folder structure and generate Templates for project, area, resource                                      |
| `Create new Project`                | Opens a modal to speed up creating a new Project, puts the new project under your Projects folder and sets the status of the project to `draft` |
| `Create new Area`                   | Opens a modal to speed up creating a new Area, puts the new area under your Areas folder and also creates an companion folder for the new area  |
| `Create new Resource`               | Opens a modal to speed up creating a new Resource, puts the new resource under your Resources folder                                            |
| `Archive current project`           | Set the status for the currently open project to `aborted` and move it to your Archives folder                                                  |
| `Restore open project from archive` | Set the status for the currently open and archived project to `pending` and move it from your Archive to your Projects folder                   |
| `Restore project from archive`      | Opens a modal with a fuzzy search to quickly find an archived project you want to restore                                                       |
| `Complete project`                  | Set current open and active project as completed, set `completed` to `true`, set status to `done` and move to archive                           |

## Tips

For a better UX consider to configure the following settings:  
- `Editor -> 'Default view for new tabs'` --> `Reading view`
- `Editor -> 'Default editing mode'` --> `Source mode`
- `Editor -> 'Properties in document'` --> `Source`

#### Tags i use for project status

| Status           | Description                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `draft`          | Project created or initialized; has to be defined or needs some more specification                              |
| `pending`        | Project is specified and ready to go                                                                            |
| `in_process`     | Project is currently under development                                                                          |
| `postprocessing` | Project is mostly done but needs some additional documentation or other post processing (this step is optional) |
| `done`           | Project is done and documented                                                                                  |


## Acknowledgements

Big shout out, to the following amazing projects i relied on:

- [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes)
- [Obsidian Periodic PARA](https://github.com/quanru/obsidian-periodic-para)
- [para-shortcuts](https://github.com/gOATiful/para-shortcuts)


## Further Improvements & Support

Feel free to contribute.

Contributors are very welcome and I appreciate every input.

You can create an issue to report a bug, suggest an improvement for this plugin, ask a question, etc.

You can make a pull request to contribute to this plugin development.

