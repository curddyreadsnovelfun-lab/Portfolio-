# Portfolio: Curddy Jeric M. Estrada

A static portfolio built with HTML, CSS, vanilla JavaScript, and JSON. No frameworks and no backend, so it works on GitHub Pages.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Styles, light/dark themes, responsive layout |
| `script.js` | Theme toggle, mobile menu, project loading, search and filters, contact form |
| `projects.json` | All project data (the single source of truth) |
| `assets/images/` | Optional project screenshots (`.gitkeep` keeps the empty folder in Git) |

## Run locally

`fetch()` usually fails when the page is opened as a `file://` URL, so use a local server. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The VS Code "Live Server" extension also works.

## Add a project

1. Open `projects.json`.
2. Add a new project object inside the existing array.
3. Separate objects with commas.
4. Fill in the title, URL, description, technologies, status, and category.
5. Add an image path or URL if you want one, or leave `"image"` empty.
6. Save the file.
7. Refresh the website.

Example with a second project (sample values only):

```json
[
  {
    "title": "Video Trimmer",
    "url": "https://curddyreadsnovelfun-lab.github.io/Video-triming-and-compressing/",
    "description": "Cut a clip, lower its resolution, and save a smaller file. Everything runs in your browser.",
    "technologies": ["HTML", "CSS", "JavaScript"],
    "status": "Demo",
    "category": "Web Application",
    "image": ""
  },
  {
    "title": "Task List",
    "url": "https://example.com/task-list/",
    "description": "A simple to-do list that saves tasks in the browser.",
    "technologies": ["HTML", "CSS", "JavaScript"],
    "status": "In Development",
    "category": "Web Application",
    "image": "assets/images/task-list.png"
  }
]
```

JSON rules:

- Use double quotes `"` only, never single quotes.
- Put a comma between objects and between list items.
- No comma after the last object or the last list item (no trailing comma).
- No comments.

Fields: `title` (required), `url` (http or https; if missing or invalid, the card has no "Open project" button), `description`, `technologies` (list), `status` (for example Live, Demo, In Development), `category` (each new category gets a filter button automatically), `image` (optional).

To edit a project, change its values. To remove one, delete its whole `{ ... }` block and fix the commas. You never need to edit `index.html`, `style.css`, or `script.js` for ordinary projects.

## Project images

Save the file in `assets/images/` and set `"image": "assets/images/name.png"`. A full `https://` URL works too. Use compressed images (ideally under 200 KB, wide format). If an image is missing or fails to load, the card shows a plain placeholder.

## Theme colors

Edit the variables at the top of `style.css`: `:root` for light mode and `:root[data-theme="dark"]` for dark mode.

## Publish on GitHub Pages

1. Commit and push your changes: `git add .`, `git commit -m "Update projects"`, `git push`.
2. In the repository, open Settings, then Pages, and choose your branch and the root folder.
3. Wait a minute or two, then open your Pages URL.

Editing files on your computer does not change the live site. The updated `projects.json` must be committed and pushed.

## Contact form

The form checks the name, email address, and message, then opens a draft with a `mailto:` link addressed to `curddyjericestrada@gmail.com`. The site sends and stores nothing. The visitor's email app must be set up, and they must press send there. Messages are limited to 1000 characters because long `mailto:` links can fail. A direct email link sits beside the form.

## Troubleshooting

- "Projects could not be loaded": open the browser console (F12) to see the exact error.
- Opened the file by double-clicking? Use the local server above.
- Check the JSON for mistakes with `python3 -m json.tool projects.json` or an online JSON validator. Common problems: trailing comma, single quotes, a missing comma between objects.
- A project is missing: it needs a non-empty `title`.
- Live site shows old data: hard refresh (Ctrl/Cmd + Shift + R) and confirm the change was pushed.
