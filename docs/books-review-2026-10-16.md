# Week 6 — Books review

Reviewed October 16, 2026. Checked all 31 roster URLs in the 31-person class, including project menus, Zoe’s six dialogs, Matthew’s desktop project window, Eunice’s nine archive states, and routes exposed by first-party scripts. Added **24 published bookshelf projects from 24 students** to **Week 6 — Books**, each with a local 1440 × 900 preview and a direct project link. All 24 included project documents have returned HTTP 200 during their review.

The collection groups the Week 6 assignment by topic; it does not assert publication dates. Sample-data prototypes and published configuration-blocked projects are included, matching the existing gallery’s treatment of published work with integration limitations. A successful page response does not mean its Notion integration works. The previous full project recheck found 18 projects displaying books and four showing configuration or connection errors (Jochi, Mac, Eunice, and Xuanyi). The latest two additions also display books; existing project integrations were not retested in this additions-focused pass. No student data or external settings were changed.

## October 23 recheck

Rechecked every curated Books URL plus the common bookshelf route on the seven sites without a shelf, alongside a full `npm run audit:projects` pass of all 31 sites. Added **Ruyi** and **Yiping**, bringing the collection to **28 projects from 26 students** (Tiffany’s two shelves were added on October 21). All 28 project pages returned 200.

Jochi’s shelf, previously blocked by missing Notion configuration, now renders a scattered-cover collection. Bruce, Minju, Siyue, Vivan, and Reign redesigned their shelves; Ethan removed his sort control. Their previews, and the two new ones, were refreshed. Minju’s redesign is labeled Demo Mode. Mac (503), Xuanyi (502), and Eunice (500, missing configuration) are unchanged. No student data or external settings were changed.

Evidence: `output/books-recheck-2026-10-23/` contains rendered text, request statuses, and screenshots for every checked page.

## Latest additions check

Reviewed all 31 homepages, including Wenying’s newly available roster URL, and checked the common bookshelf route on the nine sites absent from the Books collection. Found **Sunshine** and **Reign**, bringing the collection to **24 projects from 24 students**. Both are linked from their homepages and returned 200. Sunshine displays eight books in Demo Mode; Reign displays 12 entries with a Live Notion Database indicator and a successful books API response. Both have captured previews. No bookshelf was found for the other seven students, including Wenying.

Evidence: `output/books-new-check-2026-10-16/` contains all 31 homepage inventories and the nine missing-student route checks.

## Previous full-project recheck

Revisited all 30 published roster sites, checked the common bookshelf route on all 29 Vercel sites, and opened Zoe’s newly linked separate deployment and Minju’s alternate perspective route. Added **Zoe, Jochi, Siyue, Xuanyi, and Ruby**, bringing the collection to **22 projects from 22 students**. All 30 homepages and all 22 included project pages returned 200. Refreshed all 22 previews.

Sasha and Alanis now each load 13 entries from Notion; their earlier connection errors are resolved. Bruce redesigned his reading archive, Minju now opens a six-book photo slider, and Eunice redesigned her collection header but still needs Notion configuration. Minju’s `/prototypes/perspective-bookshelf` is the same photo-slider experience already embedded in her main bookshelf, so no duplicate card was added.

The full-project recheck evidence, including child-frame text for Kate’s embedded app, is in `output/books-recheck2-2026-10-16/`. This is a check of published availability and rendered content, not exhaustive testing of every control.

## Earlier same-day recheck

Revisited all 30 roster sites and checked the common bookshelf route on all 29 Vercel sites. All 30 homepages returned 200, including Aria’s recovered deployment. Found three new published projects: Kate, Sean, and Aria, each displaying 12 books. Ziona’s previously empty shelf now displays 13 books. Refreshed 15 project previews; retained Sasha’s and Alanis’s earlier sample-collection previews because their current pages show connection errors. Both errors persisted on a second visit. The recheck evidence is saved in `output/books-recheck-2026-10-16/`.

## Included projects

| Student | Project | Observed state |
| --- | --- | --- |
| Caoyun Xu (Zoe) | [My bookshelf](https://my-bookshelf-sand.vercel.app/) | Twelve sample books with ratings and reading notes on a separately hosted deployment linked from her portfolio. |
| Ethan Wise | [My Bookshelf](https://prototyping-for-masters-8v9j.vercel.app/prototypes/my-bookshelf) | Six sample books rendered. Now also linked from his homepage. |
| Heran Cui (Bruce) | [Bruce’s books](https://prototyping-for-masters-one.vercel.app/prototypes/my-bookshelf) | Redesigned again (October 23): stacked spines above a “Bruce’s Book Collection” title list, with search and genre filters. |
| Hoi Kin Chan (Matthew) | [My bookshelf](https://matthews-site.vercel.app/prototypes/my-bookshelf) | One book, Vagabond, rendered with a rating and a detailed review; books endpoint returned 200. |
| Jochi Yu | [My bookshelf](https://jochiprototypes.vercel.app/prototypes/my-bookshelf) | Recovered: now renders a “Jochi’s Books” collection of scattered covers (October 23). Previously displayed missing Notion configuration. |
| Letian Tian | [My Bookshelf](https://prototyping-for-masters-nine.vercel.app/prototypes/my-bookshelf) | Twelve books with genres, ratings, and reviews rendered; Notion books endpoint returned 200. |
| Michelle Wong | [Michelle's Bookshelf](https://prototyping-for-masters-wine.vercel.app/prototypes/my-bookshelf) | Nine books with ratings and reviews rendered; bookshelf endpoint returned 200. Live Notion provenance was not independently established. |
| Mingtai Sun | [My Bookshelf](https://mingtai-prototypes.vercel.app/prototypes/my-bookshelf) | Eight books rendered in explicitly labeled Sample Library mode. |
| Minju Jang | [My Bookshelf](https://minjujang-prototyping-3rp6.vercel.app/prototypes/my-bookshelf) | Rebuilt (October 23) as “Minju’s Bookshelf” with Shelf, Stack, and Gallery views and genre/sort controls; eight books, labeled Demo Mode. |
| Qianyi Ma (Kate) | [My bookshelf / 我的书架](https://qianyima.vercel.app/prototypes/my-bookshelf) | Twelve books rendered with a connected-to-Notion indicator; books endpoint returned 200. |
| Ruyi Wang | [JZA / Bookshelf](https://ruyiwang.vercel.app/prototypes/my-bookshelf) | Added October 23: spine-style shelf of 13 books with genre and score filters and a Live Notion indicator; linked from her homepage. |
| Ryan Page | [My bookshelf](https://prototyping-for-masters-rho.vercel.app/prototypes/my-bookshelf) | Now connected to Ryan’s Notion books: 13 books rendered, and the books endpoint returned 200. |
| Sasha Shafran | [What I Read in NYC](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/my-bookshelf) | Connection fixed: now displays 13 books and a Live from Notion indicator. Preview refreshed from the live reading log. |
| Sean Wiseman | [My Bookshelf](https://prototyping-for-masters.vercel.app/prototypes/my-bookshelf) | Twelve books with genres, ratings, and reviews rendered; books endpoint returned 200. |
| Shuotong Huang (Tiffany) | [My Bookshelf](https://shuotong-portfolio.vercel.app/prototypes/my-bookshelf) | Added October 21: eight books in a Notion demo library with gallery, shelf, and table views. |
| Shuotong Huang (Tiffany) | [Minimalist Bookshelf](https://shuotong-portfolio.vercel.app/prototypes/minimalist-bookshelf) | Added October 21: curated archive of 24 books, music, films, and other objects. |
| Siyue Zhong | [My bookshelf](https://prototyping-for-masters-c12t.vercel.app/prototypes/my-bookshelf) | Redesigned (October 23) as a hand-drawn shelf synced with Notion; ten books with clickable spines. |
| Stephen Grant (Mac) | [My Bookshelf](https://masters-main.vercel.app/prototypes/my-bookshelf) | Published bookshelf interface renders a Notion setup screen. Books endpoint returned 503; no books loaded. |
| Taiyang Zhang (Sunshine) | [My Bookshelf](https://sunshine-prototypes.vercel.app/prototypes/my-bookshelf) | Eight demo books with ratings, reviews, and gallery/spine/list controls; explicitly labeled Demo Mode. |
| Tinglan Huang (Alanis) | [My Bookshelf](https://alanis1-omega.vercel.app/prototypes/my-bookshelf) | Connection fixed: now displays 13 entries, including one Untitled placeholder, and a Connected to Notion indicator. Preview refreshed. |
| Vivan Nadkarni | [My Bookshelf](https://vivans-prototypes.vercel.app/prototypes/my-bookshelf) | Restyled (October 23) as an “Ex libris” catalogue; twelve books across six genres with reviews. |
| Xuanyi Meng | [My bookshelf](https://xuanyi-prototyping-2026.vercel.app/prototypes/my-bookshelf) | Published reading tracker shows a database/data-source-not-found error; books endpoint returned 502 and no books loaded. |
| Yi Pan (Ruby Pann) | [My bookshelf](https://ruby-pann-course.vercel.app/prototypes/my-bookshelf) | Thirteen books rendered on two shelves with ratings and reviews; books endpoint returned 200. |
| Yiping Dong | [My books](https://prototyping-for-masters-tau.vercel.app/prototypes/my-bookshelf) | Added October 23: pile of 12 Notion books that can be tossed or tidied; linked from her homepage. |
| Yoonseo Yang (Eunice) | [My Fav Books/Shows/Movies](https://prototyping-for-master.vercel.app/prototypes/my-bookshelf) | Redesigned books/shows/movies page still displays missing Notion configuration; no items loaded. Preview refreshed. |
| Yurou Zhou (Reign) | [Reign's Reading Sharing](https://reign-zhou-prototype.vercel.app/prototypes/my-bookshelf) | Updated copy and collection (October 23); entries with genres, ratings, and reviews. |
| Zhongyunqi Meng (Aria) | [My bookshelf](https://zhongyunqimeng-prototyping-for-mast-two.vercel.app/prototypes/my-bookshelf) | Recovered deployment; twelve books with reviews rendered, and books endpoint returned 200. |
| Ziona Sober | [My Bookshelf](https://ziona-prototyping-for-masters.vercel.app/prototypes/my-bookshelf) | Notion connection is now configured: 13 books, four genres, and a weekly recommendation rendered. No books were added during review. |

## Remaining roster

“Not found” means no dedicated bookshelf project was identified on the reviewed published site, not that no unpublished or separately hosted work exists. The initial pass also checked the common assignment path on 17 Vercel sites without a discovered bookshelf route; this located Ethan’s project and Eunice’s project, which was subsequently found in her archive. The recheck covered all 29 Vercel sites again.

| Student | Result |
| --- | --- |
| Carnycia Royce | No bookshelf project found. |
| Jiaqi Yuan | No bookshelf project found. |
| Wenying Zhu | Newly available roster site reviewed; no bookshelf project found. |
| Ziqing Huang (Lyra) | No bookshelf project found. |

## Evidence and gallery checks

Browser inventories, rendered text, response statuses, and screenshots are saved in the ignored directory `output/books-review-2026-10-16/`. `sites.json` contains the main roster pass; `eunice.json` contains the completed archive traversal; `books.json` contains 12 directly discovered bookshelf pages plus Ziona’s case study; `unlinked.json` contains the 17 common-route checks.

The collection is available at `/?week=6&type=books#student-sites` and the week-only shortcut `/?week=6#student-sites`. Preview images are stored in `public/previews/`; the capture script supports refreshing their rendered states.
