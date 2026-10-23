# Week 7 Inspiration library review — October 23, 2026

All 31 student sites were scanned for an inspiration-library project. The scan read homepage links and script bundles, and requested common routes such as `/prototypes/inspiration-library`. Twenty-two students have published a page, and all are listed in the gallery for visibility, working or not.

Each database was tested by sending a sign-in with a fake email to the site’s `/api/auth/sign-in/email` endpoint, and through the sign-in form in a browser. No accounts were created, and no student work was changed. A normal 401 “Invalid email or password” rejection means sign-in reaches the database. Pages can show “Invalid email or password” even when the server failed, so the server’s actual response was checked. Account creation, saving to boards, and public links weren’t tested.

The tables reflect the latest check, the eighth of the day. Sean’s library was fixed and added on the seventh; Sunshine’s was added on the eighth.

## Working (sign-in reaches the database)

| Student | Notes |
| --- | --- |
| Carnycia Royce | Not linked from her homepage. |
| Ethan Wise | Fixed since the previous check. |
| Heran Cui (Bruce) | |
| Letian Tian | Added on request; returns 401 from the server and through the browser form. |
| Ryan Page | Fixed since the previous check. |
| Sasha Shafran | |
| Sean Wiseman | Fixed and added this check. His page previously crashed with HTTP 500; it now loads, and sign-in returns 401 from the server and through the browser form. |
| Taiyang Zhang (Sunshine) | New this check, found by the full project audit. Returns 401 from the server and through the browser form. |
| Tinglan Huang (Alanis) | |
| Vivan Nadkarni | |
| Yiping Dong | |
| Yoonseo Yang (Eunice) | Not linked from her homepage. |
| Ziona Sober | A `/work/inspiration-library` case-study page also exists. |

## Listed, not working yet

| Student | Observed |
| --- | --- |
| Hoi Kin Chan (Matthew) | Returns 503 `database_not_configured`. The live deployment is current (uncached), and his homepage links only to `matthews-site.vercel.app`. |
| Jochi Yu | Returns 503 “The database isn't connected yet”. |
| Michelle Wong | New. Her own sign-in form gets 403 “Invalid origin”: the auth base URL or trusted origins don’t match her live site, likely still set to localhost. |
| Minju Jang | New. Landing page says “Supabase Postgres Connection Pending”; sign-in returns 500. |
| Qianyi Ma (Kate) | Returns 503 “Database setup is pending”. |
| Shuotong Huang (Tiffany) | Landing page says “Supabase Database Not Connected Yet”; sign-in returns 500. |
| Siyue Zhong | Landing page says “Supabase Database Setup Required”; sign-in returns 500. |
| Stephen Grant (Mac) | New. The page renders; sign-in returns 500 (“We could not sign you in”). |
| Yurou Zhou (Reign) | Sign-in returns 500. |

Most of the not-working sites need DATABASE_URL set in the Vercel project’s environment variables, followed by a redeploy; Michelle needs her auth URL set to her live address. No inspiration-library page was found for the other 9 students.
