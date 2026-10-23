# Week 7 Inspiration library review — October 23, 2026

All 31 student sites were scanned for an inspiration-library project. The scan read homepage links and script bundles, and requested common routes such as `/prototypes/inspiration-library`. Eleven students have a published page, and all are listed in the gallery for visibility, working or not.

Each database was tested by sending a sign-in with a fake email to the site’s `/api/auth/sign-in/email` endpoint. No accounts were created, and no student work was changed. A normal 401 “Invalid email or password” rejection means the database is answering. Pages can show “Invalid email or password” even when the server failed, so the server’s actual response was checked.

## Working (database connected)

| Student | Evidence |
| --- | --- |
| Sasha Shafran | Returns 401 “Invalid email or password”. |
| Tinglan Huang (Alanis) | Returns 401. Sign-in reported “temporarily unavailable” earlier in the day. |
| Yoonseo Yang (Eunice) | Returns 401. The page isn’t yet linked from her homepage. |

## Listed, not working yet (latest check)

| Student | Observed |
| --- | --- |
| Carnycia Royce | The live sign-in form sends logins to `http://localhost:3000`, which browsers block (“Failed to fetch”). The server endpoint itself returns 500. The page isn’t linked from her homepage. |
| Heran Cui (Bruce) | The sign-in endpoint returns 404; the page shows that as “Invalid email or password”. |
| Hoi Kin Chan (Matthew) | Returns 503 `database_not_configured`; a database notice is on the page. |
| Jochi Yu | Returns 503 “The database isn't connected yet”. |
| Vivan Nadkarni | Database notice on the page; sign-in returns 500. |
| Yiping Dong | Sign-in returns 500, shown on the page as “Invalid email or password”. |
| Yurou Zhou (Reign) | Sign-in returns 500 (“Failed to sign in”). |
| Ziona Sober | Database notice on the page; sign-in returns 500. A `/work/inspiration-library` case-study page also exists. |

Most of these need DATABASE_URL, and Carnycia also needs her auth URL, set in the Vercel project’s environment variables, followed by a redeploy. Taiyang Zhang’s homepage “Inspirations” section is part of her portfolio, not this project. No inspiration-library page was found for the other 19 students.
