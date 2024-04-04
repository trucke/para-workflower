# PARA Workflower

`PARA Workflower` is an Obsidian plugin to make managing your Vault using the PARA Method, by Tiago Forte, a lot easier.  
This plugin offers you a handful of very useful commands to  
- Initialize your Vault and prepare it to use PARA method with this plugin
- Create a new Project, Area or Resource
- Easily archive your PARA items (Project, Area, Resource) using the plugin commands
- Restore projects, areas and resources directly or via the plugin's handy fuzzy search function

## Changelog v0.1.5

> [!warning] 
> THIS VERSION MAY CONTAINS BREAKING CHANGES

- added input validation in modal when creating a project, area or resource   

- added command `Move to archive`  
This command will move the currently open project / area / resource to the archive.  
If the file is an `area`, the companion folder (if exists) is also moved. The area note and companion folder are then placed within a subfolder named after the area in your archive folder.  
If the file is a `project` and within a project folder the whole project folder will be moved to the archive  
	
- added command `Restore from archive`  
Restores the currently open PARA item or opens a modal in which you can search for an archived project, area or resource that you want to restore.  
This change is for a more convenient use of the plugin and is now the only command for restoring archived elements.  
If you call the command without a file being open or not archived, the search modal is opened.  
If you call the command with a currently open and archived PARA item, this will be restored immediately.  

- command `Create new project` now checks whether a project with the same name (case insensitive) already exists in the projects or archive folder

- removed command `Archive current project`
- removed command `Restore open project from archive`
- removed command `Restore project from archive`   

- add support for project folder structure  
You can enable folder structure for projects under the plugin settings `Use folder structure for projects`.  
All corresponding commands can now handle both flat and folder structures for projects.  

> All projects created w/o a project folder (flat) will still be handled as flat projects (single file). This might be changed in the future.


To see all changes to the plugin, go to https://github.com/trucke/para-workflower/releases.

---

## What is the PARA Method?

A full article on the PARA method and its benefits can be found on this [blog post](https://fortelabs.co/blog/para/) by Tiago Forte.

## Installation

> [Dataview](https://github.com/blacksmithgu/obsidian-dataview) is required, please install it first.  

> Enable core plugin `Templates` and configure the templates folder to `Templates`

#### Recommended

`PARA Workflower` is available in the Obsidian community plugin browser!

1. Search for "PARA Workflower" in Obsidian's community plugins browser
2. Enable the plugin in your Obsidian settings (find "PARA Workflower" under "Community plugins").
3. Check the settings (You can customize the directory of your PARA notes and more)

#### Manual

Go to the [releases](https://github.com/trucke/para-workflower/releases) and download the latest `main.js` and `manifest.json` files.
Create a folder called `para-workflower` inside `.obsidian/plugins` and place both files in it.


## Commands
> Open command palette (default): `CTRL+p` or `CMD+p`

| Command                | Description                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Initialize vault`     | Initialize your vault by creating PARA folder structure and generate Templates for project, area, resource                                      |
| `Create new project`   | Opens a modal to speed up creating a new Project, puts the new project under your Projects folder and sets the status of the project to `draft` |
| `Create new area`      | Opens a modal to speed up creating a new Area, puts the new area under your Areas folder and also creates an companion folder for the new area  |
| `Create new resource`  | Opens a modal to speed up creating a new Resource, puts the new resource under your Resources folder                                            |
| `Move to archive`      | Moves the current PARA item (Project, Area, Resource) to your archive. If current item is a project the status will be changed to `aborted`     |
| `Restore from archive` | Restores the currently opened and archived PARA item or opens a search modal                                                                    |
| `Complete project`     | Set current open and active project as completed, set `completed` to `true`, set status to `done` and move to archive                           |

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
