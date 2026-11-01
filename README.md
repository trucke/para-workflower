# PARA Workflower

`PARA Workflower` is an Obsidian plugin to make managing your Vault using the PARA Method, by Tiago Forte, a lot easier.  
This plugin offers you a handful of very useful commands to  
- Initialize your Vault and prepare it to use PARA method with this plugin
- Create a new Project, Area or Resource
- Easily archive your PARA items (Project, Area, Resource) using the plugin commands
- Restore projects, areas and resources directly or via the plugin's handy fuzzy search function

To see all changes to the plugin, go to https://github.com/trucke/para-workflower/releases.

---

## What is the PARA Method?

A full article on the PARA method and its benefits can be found on this [blog post](https://fortelabs.co/blog/para/) by Tiago Forte.

## Installation

Requires Obsidian 1.14.4 or later.

> [!tip]
> Install [Dataview](https://github.com/blacksmithgu/obsidian-dataview) as well. Area notes use it to list their projects, archived projects and resources. All commands work without it.

#### Recommended

`PARA Workflower` is available in the Obsidian community plugin browser!

1. Search for "PARA Workflower" in Obsidian's community plugins browser
2. Enable the plugin in your Obsidian settings (find "PARA Workflower" under "Community plugins").
3. Check the settings (You can customize the directory of your PARA notes and more)
4. Run the command `Initialize vault` to create the folders and templates

#### Manual

Go to the [releases](https://github.com/trucke/para-workflower/releases) and download the latest `main.js`, `manifest.json` and `styles.css` files.
Create a folder called `para-workflower` inside `.obsidian/plugins` and place the files in it.


## Commands
> Open command palette (default): `CTRL+p` or `CMD+p`

| Command                | Description |
| ---------------------- | ----------- |
| `Initialize vault`     | Creates the inbox, projects, areas, resources and archive folders and the three templates. Existing folders and notes are left untouched, so you can run it again at any time. |
| `Create new project`   | Opens a dialog to create a new project in your projects folder with the status `draft`. If you enter an area, the project is tagged with it and linked to it. |
| `Create new area`      | Opens a dialog to create a new area in your areas folder, plus a companion folder `_<area>` if enabled. |
| `Create new resource`  | Opens a dialog to create a new resource in your resources folder. |
| `Move to archive`      | Moves the open project, area or resource to your archive. Projects get the status `aborted`. |
| `Restore from archive` | Restores the open archived item, or opens a search dialog to pick one. Projects get the status `pending`. |
| `Complete project`     | Marks the open project as completed (`completed: true`, status `done`) and moves it to your archive. |

### How items are handled

- A note counts as a project, area or resource when its `tags` property contains `project`, `area` or `resource` and it is inside the matching folder.
- If you create a project, area or resource whose name already exists (active or archived, ignoring upper and lower case), the existing note opens instead of a new one being created.
- A project with its own folder (`1-Projects/<Name>/<Name>.md`) moves together with that folder. Any other project note moves alone, so other notes next to it stay where they are.
- An area moves together with its companion folder `_<area>`. In the archive, both are placed in a folder named after the area. When the area is restored and that folder is empty, the folder is moved to the trash.
- Before moving anything, the plugin checks that nothing with the same name exists at the destination. If something does, nothing is changed.

## Settings

| Setting | Default | Description |
| ------- | ------- | ----------- |
| Inbox folder | `0-Inbox` | Created by `Initialize vault`. Leave empty for no inbox. To collect new notes there, set it as the default location for new notes under **Settings → Files and links**. |
| Projects folder | `1-Projects` | Where new projects are created. |
| Use folder structure for projects | off | Creates a folder for each new project (`1-Projects/<Name>/<Name>.md`). |
| Areas folder | `2-Areas` | Where new areas are created. |
| Create area companion folders | on | Creates a folder `_<area>` next to each new area. |
| Resources folder | `3-Resources` | Where new resources are created. |
| Archive folder | `4-Archive` | Where archived items are moved. |
| Project template, Area template, Resource template | `Templates/<Type> Template.md` | The notes used as templates. If a template note is missing, the built-in template is used. |

The area template contains Dataview queries with your folder names at the time the template was created. If you rename folders later, update the queries in your area template and in existing area notes.

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

Contributors are very welcome and I appreciate every input.

You can create an issue to report a bug, suggest an improvement for this plugin, ask a question, etc.

To set up a development environment and open a pull request, see [CONTRIBUTING.md](CONTRIBUTING.md).
