# Prototyping for Masters

A Vite course homepage with a weekly student-project gallery and a student-site directory. Headings use Faculty Glyphic and body copy uses IBM Plex Mono.

## Browse student work

The homepage opens in **Student sites**, showing the full roster. Choose **Projects**, then select **Week 3 — Typography** or **Week 4 — PixiJS & Doodle**. Week 4 shows PixiJS and Doodle work together. Filters are shareable and work with browser Back/Forward:

- `/?week=3#student-sites` — Week 3 typography gallery
- `/?week=4#student-sites` — all Week 4 projects
- `/#student-sites` — student directory (default)
- `/?view=projects#student-sites` — all projects

The collection contains **27 Typography**, **20 projects in the PixiJS group**, and **18 Doodle** projects. Classification is based on the rendered project and its main interaction; portfolio titles and route names can be stale. PixiJS projects are checked for actual renderer usage, not just a library name in a prefetched homepage, with instructor-directed additions noted in [the curation review](docs/project-curation.md).

Students without a verified project in a collection remain in the directory. Week numbers follow the course assignments, not the numbering on individual portfolios.

## Add student sites

Edit `src/students.js`:

```js
{ name: "Student Name", url: "https://student-site.com" }
```

Rows without a URL display “Site forthcoming.”

## Add a week or project

Add a reviewed project to the appropriate list in `src/projects.js`:

```js
["Student Name", "Project title", "/prototypes/project-name"]
```

Use `typographyProjects` for Week 3 typography, `pixiProjects` for Week 4 PixiJS, or `doodleProjects` for Week 4 Doodle work. Names must match `src/students.js`. URLs can be relative to the student's site or absolute. Each list assigns its week, project type, and preview filename explicitly. Adding a future collection also requires entries in `weeks`, `projectTypes`, and `makeProjects`.

Inspect the actual page before classifying it. Games that happen to contain letters do not belong in Typography; hand-drawn styling alone does not make a game a Doodle tool. The filter options and counts update from the curated data.

## Preview images

Previews are local JPEG screenshots, not live embeds. This keeps the grid fast and avoids loading every project's animations, WebGL, or audio. Clicking a preview opens the live project in a new tab. Missing images show a fallback with a working project link.

With Google Chrome installed, generate or refresh previews:

```sh
npm run previews:capture
```

The capture script visits the curated project URLs, writes images to `public/previews/`, and saves its success/failure report to ignored `output/week-gallery/captures.json`. Commit the images alongside project data. Captures are refreshed manually; they do not update automatically when students change their sites.

## Run and check

```sh
npm install
npm run dev
npm run build
npm test
```

Browser checks use Playwright with locally installed Google Chrome. They cover filtering, shared URLs, browser history, the student directory, missing images, mobile layout, keyboard access, and palette switching.
