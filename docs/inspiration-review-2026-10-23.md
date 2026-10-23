# Week 7 Inspiration library review — October 23, 2026

All 31 student sites were scanned for an inspiration-library project. The scan read homepage links and script bundles, and requested common routes such as `/prototypes/inspiration-library`. Seven students have a published page. A library is included only when its live database responds. This was tested with a sign-in using a fake email: no accounts were created, and no student work was changed.

## Included (database connected)

| Student | Project | Evidence |
| --- | --- | --- |
| Sasha Shafran | [Bibliothèque d'Inspiration](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/inspiration-library) | The fake sign-in returned “Invalid email or password”. Earlier today the page showed a database-not-connected notice; on recheck it worked. |
| Yoonseo Yang (Eunice) | [Inspiration library](https://prototyping-for-master.vercel.app/prototypes/inspiration-library) | The fake sign-in returned “Invalid email or password”. The page works but isn’t yet linked from her homepage. |

## Published but not working yet

| Student | Observed |
| --- | --- |
| Hoi Kin Chan (Matthew) | “Connect the database” notice (DATABASE_URL missing). |
| Jochi Yu | “The database isn't connected yet” notice. |
| Tinglan Huang (Alanis) | Landing, sign-in, and sign-up pages render, but sign-in reports “temporarily unavailable”. |
| Vivan Nadkarni | “The database isn’t connected yet” notice. |
| Ziona Sober | “The library needs its database” notice; a `/work/inspiration-library` case-study page exists. |

The five pages above most likely need DATABASE_URL set in the Vercel project’s environment variables, not just in `.env.local`. Taiyang Zhang’s homepage “Inspirations” section is part of her portfolio, not this project. No inspiration-library page was found for the other 23 students.
