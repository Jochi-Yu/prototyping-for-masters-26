# Student-site review — October 17, 2026

Crawled all 31 student sites with the new audit script (`npm run audit:projects`, see [the README](../README.md#audit-student-sites)). The first run reported 43 candidate links not in the gallery and 8 gallery links that no longer resolved cleanly. Each one was opened and classified by hand. The final audit run reports no new, broken, or moved projects.

## Added projects

| Student | Project | Collection | Evidence |
| --- | --- | --- | --- |
| Wenying Zhu | [NYC Weather Desk](https://prototyping-for-masters-delta.vercel.app/prototypes/weather) | Week 5 — Weather apps | Linked from her homepage. Renders current New York conditions and an hourly forecast. |
| Michelle Wong | [AIC Audio Guide & Walkthrough](https://prototyping-for-masters-wine.vercel.app/prototypes/aic-audio-guide) | Week 5 — API explorations | Loads artworks from the Art Institute of Chicago collection API with IIIF images. |
| Minju Jang | [Dad Jokes #1/2026](https://minjujang-prototyping-3rp6.vercel.app/prototypes/dad-jokes) | Week 5 — API explorations | The embedded `/dad-jokes.html` calls the site’s `/api/dadjoke`, which returns random jokes from an external joke API. |
| Yi Pan (Ruby Pann) | [A room of your own](https://ruby-pann-course.vercel.app/prototypes/pocket-gallery) | Week 5 — API explorations | Its `/api/pocket-gallery` route returns artworks from the Art Institute of Chicago, Met, and Cleveland Museum of Art APIs. |
| Yurou Zhou (Reign) | [Festival Lineup Generator](https://reign-zhou-prototype.vercel.app/prototypes/festival-lineup) | Week 5 — API explorations | Builds a lineup poster from the Spotify Web API (PKCE sign-in), with a demo mode for visitors without an account. |

## Moved and removed

- **Jiaqi Yuan — Weather Cat** now points at `/prototypes/weather-cat` on her roster site, which her homepage links. The alternate `-guiq` deployment is no longer used.
- **Stephen Grant (Mac) — Ampersand Field** and **TADA Tile Automaton** were removed from Typography. Both return HTTP 404 and are no longer linked from his homepage. Mac now has no typography project on his live site. His Instagram Assignment Feed includes Art Nouveau, Editorial, Collage, and Swiss Grid type-study posts, but it stays in PixiJS.

## False positives

These were reported as broken on the first run but render correctly in a browser. They hydrate slowly or draw only to a canvas, so the audit’s text check saw an empty page:

- Matthew’s [STREEETCH typography page](https://matthews-site.vercel.app/prototypes/typography-experiment)
- Kate’s [bookshelf](https://qianyima.vercel.app/prototypes/my-bookshelf)
- Eunice’s [Typography Generator](https://prototyping-for-master.vercel.app/prototypes/typography-generator)
- Mac’s [Instagram Assignment Feed](https://masters-main.vercel.app/prototypes/instagram-feed)
- Minju’s [Typography Experiments](https://minjujang-prototyping-3rp6.vercel.app/prototypes/typography-experiments)
- Vivan’s [Projected Type](https://vivans-prototypes.vercel.app/prototypes/projected-type)

## Excluded pages

Reviewed links that are not gallery projects are listed with reasons in `scripts/project-audit-exclusions.js`, so later audits skip them. New today: Sean’s Imperium and Summit Signal games, Wenying’s blog, Ziona’s `/work` case-study wrappers around projects already in the gallery, Kate’s portfolio case studies, personal portfolio sites, and Alanis’s embed of Point / Trace, which the gallery links on its standalone host.

## Pending instructor decision

- **Yi Pan (Ruby Pann) — [A collection of time](https://ruby-pann-course.vercel.app/prototypes/tate-sunburst).** A D3 sunburst of a static 2014 Tate collection dataset. It doesn’t call a live API, so it was not added to API explorations. It is excluded for now with a pending note; remove that exclusion to add it.

## Thumbnail refresh

Recaptured all 31 homepage previews and all 145 project previews at 1440 × 900, then reviewed them in contact sheets. Sunshine’s previews were renamed to match the corrected roster spelling, Taiyang Zhang.

- Matthew’s homepage no longer opens with a simulated boot screen, so its capture hook now waits for his desktop to render.
- Next.js font fallbacks use `local("Arial")`, which makes `document.fonts.load()` reject on capture machines without Arial. That left Jiaqi’s Purr Type with no rendered letters. The project capture now tolerates failed font faces, and Purr Type and Jiaqi’s Typography Experiments render fully.
- Eunice’s weather app briefly returned OpenWeatherMap 503 errors. A retry captured a live New York forecast.
- Mac’s Local Forecast still reports that its weather key is not configured, so its preview shows the entry screen. Ruby’s Find my weather now returns a match and no longer falls back.
- Notion-backed bookshelves show their current states. Mac’s shows its “ready for Notion” setup screen.

The collection now contains **34 Typography**, **22 PixiJS**, **27 Doodle**, **29 Weather apps**, **9 API explorations**, and **24 Books** projects: **145 projects** total.
