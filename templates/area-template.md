---
tags:
  - area
---

---

What is about this area?

---

## Files 

```dataview
table 
from "2-Areas"
where contains(file.path, join(list("_", lower(this.file.name)), ""))
```


## Active Projects

```dataview
table status as Status, deadline as Deadline
from "1-Projects"
where contains(file.etags, lower(this.file.name))
```

## Archived Projects

```dataview
table status as Status
from "4-Archive"
where contains(file.etags, lower(this.file.name))
sort status desc, file.name
```

## Resources

```dataview
table
from "3-Resources"
where contains(file.etags, lower(this.file.name))
sort file.name
```

