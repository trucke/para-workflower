import type { ParaType, PluginSettings } from './types';

/**
 * Built-in templates. "Initialize vault" writes them to the configured template
 * files, and they are used directly when a configured template file is missing.
 */
export function builtinTemplate(type: ParaType, settings: PluginSettings): string {
	switch (type) {
		case 'project': return PROJECT_TEMPLATE;
		case 'area': return areaTemplate(settings);
		case 'resource': return RESOURCE_TEMPLATE;
	}
}

const PROJECT_TEMPLATE = `---
tags:
 - project
completed: false
deadline: 
priority: 
---
Area:: [[]]
Status:: #draft 
___

## Description
> Project description: What is this project about? Goals? Features? Learnings? ...


---

## Tasks
> List of tasks \`- [ ] <task>\`


---

## Notes
> Notes and documentation on project


---

## Resources
> List of internal resource notes or external resources.


`;

// A project belongs to an area through its area tag or its `Area::` field.
const PROJECTS_OF_THIS_AREA = `where econtains(file.etags, "#project")
  and (contains(file.etags, lower(this.file.name)) or contains(lower(string(area)), lower(this.file.name)))`;

// The Dataview queries point at the folders configured when the template is generated.
function areaTemplate({ projectsPath, areasPath, resourcesPath, archivePath }: PluginSettings): string {
	return `---
tags:
  - area
---

---

What is about this area?

---

## Files 

\`\`\`dataview
table 
from "${areasPath}"
where contains(file.path, join(list("_", lower(this.file.name)), ""))
\`\`\`


## Active Projects

\`\`\`dataview
table status as Status, priority as Priority, deadline as Deadline
from "${projectsPath}"
${PROJECTS_OF_THIS_AREA}
sort default(priority, 1000) asc, file.name asc
\`\`\`

## Archived Projects

\`\`\`dataview
table status as Status
from "${archivePath}"
${PROJECTS_OF_THIS_AREA}
sort status desc, file.name
\`\`\`

## Resources

\`\`\`dataview
table
from "${resourcesPath}"
where contains(file.etags, lower(this.file.name))
sort file.name
\`\`\`

`;
}

/** All active projects in one table, for the "Create projects overview" command. */
export function projectsOverview({ projectsPath }: PluginSettings): string {
	return `# Projects overview

\`\`\`dataview
table status as Status, area as Area, priority as Priority, deadline as Deadline, file.mtime as Updated
from "${projectsPath}"
where econtains(file.etags, "#project")
sort status asc, default(priority, 1000) asc, file.name asc
\`\`\`
`;
}

const RESOURCE_TEMPLATE = `---
tags:
 - resource
---
`;
