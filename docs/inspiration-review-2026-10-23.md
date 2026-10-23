# Week 7 Inspiration library review — October 23, 2026

All 31 student sites were scanned for an inspiration-library project. The scan read homepage links and script bundles, and requested common routes such as `/prototypes/inspiration-library`. Seventeen students have published a page. Sixteen are listed in the gallery for visibility, working or not. Sean’s isn’t, because his page crashes for every visitor.

Each database was tested by sending a sign-in with a fake email to the site’s `/api/auth/sign-in/email` endpoint, and the newly working sites were also checked through the sign-in form in a browser. No accounts were created, and no student work was changed. A normal 401 “Invalid email or password” rejection means the database is answering. Pages can show “Invalid email or password” even when the server failed, so the server’s actual response was checked.

The tables reflect the latest check, the fifth of the day.

## Working (database connected)

| Student | Notes |
| --- | --- |
| Carnycia Royce | Returns 401. Fixed since the previous check: her form no longer sends logins to `localhost`. Not linked from her homepage. |
| Heran Cui (Bruce) | Returns 401. Fixed since the previous check: his endpoint previously returned 404. |
| Sasha Shafran | Returns 401. |
| Tinglan Huang (Alanis) | Returns 401. |
| Vivan Nadkarni | Returns 401. Fixed since the previous check. |
| Yiping Dong | Returns 401. Fixed since the previous check. |
| Yoonseo Yang (Eunice) | Returns 401. Not linked from her homepage. |
| Ziona Sober | Returns 401. Fixed since the previous check. A `/work/inspiration-library` case-study page also exists. |

## Listed, not working yet

| Student | Observed |
| --- | --- |
| Ethan Wise | New. The page renders; sign-in returns 503 “The library database has not been connected yet.” |
| Hoi Kin Chan (Matthew) | Returns 503 `database_not_configured`. |
| Jochi Yu | Returns 503 “The database isn't connected yet”. |
| Qianyi Ma (Kate) | New. The page renders; sign-in returns 503 “Database setup is pending.” |
| Ryan Page | New. Landing page says “Supabase Postgres setup pending”; sign-in returns 500. |
| Shuotong Huang (Tiffany) | New. Landing page says “Supabase Database Not Connected Yet”; sign-in returns 500. |
| Siyue Zhong | New. Landing page says “Supabase Database Setup Required”; sign-in returns 500. |
| Yurou Zhou (Reign) | Sign-in returns 500. |

## Published but not listed

| Student | Observed |
| --- | --- |
| Sean Wiseman | Linked from his homepage (“No. 13 Inspiration Library”), but the page returns HTTP 500 with a Next.js “Application error”. Add it once it loads. |

The not-working sites most likely need DATABASE_URL set in the Vercel project’s environment variables, followed by a redeploy. Taiyang Zhang’s homepage “Inspirations” section is part of her portfolio, not this project. No inspiration-library page was found for the other 13 students.
