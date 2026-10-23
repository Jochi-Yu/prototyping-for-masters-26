# Site recheck — October 23, 2026

All 31 student sites were rechecked with `npm run audit:projects`. Every curated project link still loads; none are broken. Each candidate page the audit found was opened in a browser and classified using the rules in [project-curation.md](project-curation.md). Every thumbnail was then recaptured and compared with the previous set.

## Added

| Student | Project | Collection | Evidence |
| --- | --- | --- | --- |
| Ruyi Wang | [Shatter Type](https://ruyiwang.vercel.app/prototypes/shatter-type) | Week 3 Typography | Her own PixiJS v8 version: letters shatter on touch and spring back, with type-input, preset, and filter controls. Found by a route probe, not linked from her homepage. |
| Shuotong Huang (Tiffany) | [Custom Font Canvas](https://shuotong-portfolio.vercel.app/prototypes/custom-font-canvas) | Week 3 Typography | Generative font studio: entered text rendered in pixel, wireframe, Bauhaus, glitch, and parametric styles, with letterform and spacing controls. |
| Ruyi Wang | [Doodle Garden](https://ruyiwang.vercel.app/prototypes/doodle-garden) | Week 4 Doodle | Mouse movement sprouts hand-drawn plant doodles; click to plant, with regenerate, clear, and PNG export. |
| Ruyi Wang | [Atmosphere](https://weather-prototype-nine.vercel.app/) | Week 5 Weather apps | Current conditions and an hourly forecast. Her OpenWeatherMap key was rejected, so the app showed its simulated-data mode. |
| Carnycia Royce | [Bookshelf](https://carnycia-ruddy.vercel.app/prototypes/my-bookshelf) | Week 6 Books | Live Notion sync of 12 titles, with sort, genre filters, and a draggable floating canvas. |
| Ziqing Huang (Lyra) | [The Reading Archive](https://prototyping-for-masters-beta.vercel.app/prototypes/my-bookshelf) | Week 6 Books | Exhibition-style bookshelf, currently showing four sample books (“Demo folio”). |
| Taiyang Zhang (Sunshine) | [Inspiration library](https://sunshine-prototypes.vercel.app/prototypes/inspiration-library) | Week 7 Inspiration library | Working; see the [Week 7 review](inspiration-review-2026-10-23.md). |

Carnycia, Ruyi, and Lyra were all missing these collections in the [October 17 coverage report](missing-projects-2026-10-17.md). Ruyi now has Doodle and Weather apps, and Carnycia and Lyra now have Books.

## Not added

| Student | Page | Reason |
| --- | --- | --- |
| Ethan Wise | [Brand Portal](https://prototyping-for-masters-8v9j.vercel.app/prototypes/brand-portal) | Studio icon/brand workspace; doesn’t match any assignment collection. |
| Ziqing Huang (Lyra) | [Blind Date With a Book](https://prototyping-for-masters-beta.vercel.app/prototypes/blind-date-with-a-book) | Mood-based book recommender (Open Library), not a bookshelf. Could fit the optional API explorations collection if wanted. |
| Ziona Sober | `/work/inspiration-library` | Case-study wrapper for her Inspiration library. |
| Yi Pan (Ruby Pann) | Met Museum link | Background-image credit. |

## Kept as is

- **Stephen Grant (Mac), My Bookshelf:** his homepage now links to `masters-main.vercel.app/prototypes/my-bookshelf`, which shows a “ready for Notion” setup screen. The gallery keeps the `masters-main-7s64` deployment, which still shows all 12 books.
- **Yoonseo Yang (Eunice):** the audit reported her projects as unlinked because her homepage now opens behind a “Tap to open” cover. Her project pages all still load.

## Thumbnail refresh

All thumbnails were recaptured. About 40 changed noticeably. Most were animation timing, but several were real redesigns: Matthew’s whole site; Zoe’s, Michelle’s, Ryan’s, Sean’s, Alanis’s, and Sunshine’s bookshelves; Ryan’s weather dashboard; and Mac’s, Reign’s, and Eunice’s Inspiration library pages. No refreshed thumbnail showed an error page.

Carnycia’s Spotify Palette & Mood Explorer gained a search box, which sent the capture script down an old interaction path. The script now clicks “Explore Album” only when that button exists.
