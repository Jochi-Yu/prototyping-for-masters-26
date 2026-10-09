# Prototyping for Masters

A Vite course homepage with a weekly student-project gallery and a student-site directory. Headings use Faculty Glyphic and body copy uses IBM Plex Mono.

## Browse student work

The homepage opens in **Student sites**, showing the full roster. Choose **Projects**, then select **Week 3 — Typography**, **Week 4 — PixiJS**, **Week 4 — Doodle**, **Week 5 — Weather apps**, or **Week 5 — API explorations**. Every view is sorted alphabetically by student name, then project title. Filters are shareable and work with browser Back/Forward:

- `/?week=3#student-sites` — Week 3 typography gallery
- `/?week=4&type=pixijs#student-sites` — Week 4 PixiJS gallery
- `/?week=4&type=doodle#student-sites` — Week 4 Doodle gallery
- `/?week=5&type=weather#student-sites` — Week 5 weather apps gallery
- `/?week=5&type=api#student-sites` — Week 5 API explorations gallery
- Older week-only links open the first collection for that week (PixiJS for Week 4).
- `/#student-sites` — student directory (default)
- `/?view=projects#student-sites` — all projects

The collection contains **31 Typography**, **21 projects in the PixiJS group**, **26 Doodle**, **24 Weather apps**, and **4 API explorations** projects. Classification is based on the rendered project and its main interaction; portfolio titles and route names can be stale. PixiJS projects are checked for actual renderer usage, not just a library name in a prefetched homepage, with instructor-directed additions noted in [the curation review](docs/project-curation.md).

The [Week 5 review](docs/weather-review-2026-10-09.md) records all 29 published sites, the 24 weather apps included, and API/demo limitations.

The [API explorations review](docs/api-review-2026-10-09.md) records the full-roster review, four non-weather API projects, and their live/demo behavior.

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

Use `typographyProjects` for Week 3 typography, `pixiProjects` for Week 4 PixiJS, `doodleProjects` for Week 4 Doodle work, `weatherProjects` for Week 5 weather apps, or `apiProjects` for Week 5 API explorations. Names must match `src/students.js`. URLs can be relative to the student's site or absolute. Each list assigns its week, project type, and preview filename explicitly. Adding a future collection also requires entries in `weeks`, `projectTypes`, and `makeProjects`.

Inspect the actual page before classifying it. Games that happen to contain letters do not belong in Typography; hand-drawn styling alone does not make a game a Doodle tool. The filter options and counts update from the curated data.

## Preview images

The student directory also uses local screenshots for immediate hover and keyboard-focus previews, with a thin border and no shadow. Screenshots are captured at a consistent 1440 × 900 desktop viewport. Press Escape to dismiss a preview; selecting a student's name still opens their live site. On touch devices, names open sites directly.

Refresh directory screenshots with `npm run previews:sites` (or append a quoted student name to refresh just that site). Images live in `public/previews/sites/`; the capture report is saved to ignored `output/site-previews/captures.json`. Refresh them after students update their homepages.

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
