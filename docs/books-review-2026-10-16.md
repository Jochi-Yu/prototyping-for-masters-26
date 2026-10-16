# Week 6 — Books review

Reviewed October 16, 2026. Checked all 30 roster URLs in the 31-person class, including project menus, Zoe’s six dialogs, Matthew’s desktop project window, Eunice’s nine archive states, and routes exposed by first-party scripts. Added **17 published bookshelf projects from 17 students** to **Week 6 — Books**, each with a local 1440 × 900 preview and a direct project link. All 17 included project documents returned HTTP 200.

The collection groups the Week 6 assignment by topic; it does not assert publication dates. Sample-data prototypes and published configuration-blocked projects are included, matching the existing gallery’s treatment of published work with integration limitations. A successful page response does not mean its Notion integration works. On the recheck, 13 projects displayed books; Mac, Eunice, Sasha, and Alanis displayed configuration or connection errors. No student data or external settings were changed.

## Same-day recheck

Revisited all 30 roster sites and checked the common bookshelf route on all 29 Vercel sites. All 30 homepages returned 200, including Aria’s recovered deployment. Found three new published projects: Kate, Sean, and Aria, each displaying 12 books. Ziona’s previously empty shelf now displays 13 books. Refreshed 15 project previews; retained Sasha’s and Alanis’s earlier sample-collection previews because their current pages show connection errors. Both errors persisted on a second visit. The recheck evidence is saved in `output/books-recheck-2026-10-16/`.

## Included projects

| Student | Project | Observed state |
| --- | --- | --- |
| Ethan Wise | [My Bookshelf](https://prototyping-for-masters-8v9j.vercel.app/prototypes/my-bookshelf) | Six sample books rendered. Now also linked from his homepage. |
| Heran Cui (Bruce) | [Bruce’s books](https://prototyping-for-masters-one.vercel.app/prototypes/my-bookshelf) | Twelve books rendered after the Notion books endpoint returned 200; the page changed from its loading state to “Notion Live.” |
| Hoi Kin Chan (Matthew) | [My bookshelf](https://matthews-site.vercel.app/prototypes/my-bookshelf) | One book, Vagabond, rendered with a rating and a detailed review; books endpoint returned 200. |
| Letian Tian | [My Bookshelf](https://prototyping-for-masters-nine.vercel.app/prototypes/my-bookshelf) | Twelve books with genres, ratings, and reviews rendered; Notion books endpoint returned 200. |
| Michelle Wong | [Michelle's Bookshelf](https://prototyping-for-masters-wine.vercel.app/prototypes/my-bookshelf) | Nine books with ratings and reviews rendered; bookshelf endpoint returned 200. Live Notion provenance was not independently established. |
| Mingtai Sun | [My Bookshelf](https://mingtai-prototypes.vercel.app/prototypes/my-bookshelf) | Eight books rendered in explicitly labeled Sample Library mode. |
| Minju Jang | [My Bookshelf](https://minjujang-prototyping-3rp6.vercel.app/prototypes/my-bookshelf) | Eight sample books rendered in the caterpillar/stack view; page explicitly labels Demo Mode. |
| Qianyi Ma (Kate) | [My bookshelf / 我的书架](https://qianyima.vercel.app/prototypes/my-bookshelf) | Twelve books rendered with a connected-to-Notion indicator; books endpoint returned 200. |
| Ryan Page | [My bookshelf](https://prototyping-for-masters-rho.vercel.app/prototypes/my-bookshelf) | Now connected to Ryan’s Notion books: 13 books rendered, and the books endpoint returned 200. |
| Sasha Shafran | [What I Read in NYC](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/my-bookshelf) | Now shows NOT CONNECTED with an invalid Notion database ID error, repeated on retry. Preview retains the earlier six-entry sample filmstrip. |
| Sean Wiseman | [My Bookshelf](https://prototyping-for-masters.vercel.app/prototypes/my-bookshelf) | Twelve books with genres, ratings, and reviews rendered; books endpoint returned 200. |
| Stephen Grant (Mac) | [My Bookshelf](https://masters-main.vercel.app/prototypes/my-bookshelf) | Published bookshelf interface renders a Notion setup screen. Books endpoint returned 503; no books loaded. |
| Tinglan Huang (Alanis) | [My Bookshelf](https://alanis1-omega.vercel.app/prototypes/my-bookshelf) | Now shows Connection unavailable: the bookshelf is not accessible to the Notion connection, repeated on retry. Preview retains the earlier six-book sample collection. |
| Vivan Nadkarni | [My Bookshelf](https://vivans-prototypes.vercel.app/prototypes/my-bookshelf) | Seven books with genres and reviews now render. |
| Yoonseo Yang (Eunice) | [My Fav Books/Shows/Movies](https://prototyping-for-master.vercel.app/prototypes/my-bookshelf) | Books/shows/movies collection linked from the last archive spread. Published page renders a missing-Notion-configuration message; no items loaded. |
| Zhongyunqi Meng (Aria) | [My bookshelf](https://zhongyunqimeng-prototyping-for-mast-two.vercel.app/prototypes/my-bookshelf) | Recovered deployment; twelve books with reviews rendered, and books endpoint returned 200. |
| Ziona Sober | [My Bookshelf](https://ziona-prototyping-for-masters.vercel.app/prototypes/my-bookshelf) | Notion connection is now configured: 13 books, four genres, and a weekly recommendation rendered. No books were added during review. |

## Remaining roster

“Not found” means no dedicated bookshelf project was identified on the reviewed published site, not that no unpublished or separately hosted work exists. The initial pass also checked the common assignment path on 17 Vercel sites without a discovered bookshelf route; this located Ethan’s project and Eunice’s project, which was subsequently found in her archive. The recheck covered all 29 Vercel sites again.

| Student | Result |
| --- | --- |
| Caoyun Xu (Zoe) | No bookshelf project found. |
| Carnycia Royce | No bookshelf project found. |
| Jiaqi Yuan | No bookshelf project found. |
| Jochi Yu | No bookshelf project found. |
| Ruyi Wang | No bookshelf project found. |
| Shuotong Huang (Tiffany) | No dedicated bookshelf project found. Existing portfolio “Learning & Bookshelf” reading list predates this assignment and is excluded. |
| Siyue Zhong | No bookshelf project found. |
| Taiying Zhang (Sunshine) | No bookshelf project found. |
| Wenying Zhu | No roster URL available. |
| Xuanyi Meng | No bookshelf project found. |
| Yi Pan (Ruby Pann) | No bookshelf project found. |
| Yiping Dong | No bookshelf project found. |
| Yurou Zhou (Reign) | No bookshelf project found. |
| Ziqing Huang (Lyra) | No bookshelf project found. |

## Evidence and gallery checks

Browser inventories, rendered text, response statuses, and screenshots are saved in the ignored directory `output/books-review-2026-10-16/`. `sites.json` contains the main roster pass; `eunice.json` contains the completed archive traversal; `books.json` contains 12 directly discovered bookshelf pages plus Ziona’s case study; `unlinked.json` contains the 17 common-route checks.

The collection is available at `/?week=6&type=books#student-sites` and the week-only shortcut `/?week=6#student-sites`. Preview images are stored in `public/previews/`; the capture script supports refreshing their rendered states.
