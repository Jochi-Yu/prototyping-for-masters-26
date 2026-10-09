# Week 5 – API explorations review

Reviewed October 9, 2026. Opened all **29 published student sites** in the **31-student roster**; every homepage returned HTTP 200. Two students have no site URL. Inspected rendered navigation, project routes in loaded first-party scripts, nested project indexes, Matthew’s desktop windows, and Eunice’s seven archive spreads. Opened **37 additional project/case-study pages** and exercised the four qualifying projects.

## Scope

This category covers standalone experiments whose central experience uses an external data/service API, excluding weather. Browser APIs such as Canvas, Web Audio, and geolocation, graphics libraries, static media credits, and ordinary embedded playlists do not by themselves qualify. API prototypes that offer demo data are included when an actual integration path is present; observed limitations are recorded below. Each project keeps one primary category.

## Included projects

| Student | Project | API evidence and observed behavior |
| --- | --- | --- |
| Carnycia Royce | [Spotify Palette & Mood Explorer](https://carnycia-ruddy.vercel.app/prototypes/spotify-palette-explorer) | Uses a local Spotify API endpoint and has catalog/auth integration code. Status and Miles Davis search requests returned HTTP 200; search changed the selected track and extracted colors. The interface explicitly reported **Demo Mode**, so this does not verify live Spotify catalog data. No account connection was attempted. |
| Qianyi Ma (Kate) | [PokéAPI Data Lab](https://qianyima.vercel.app/prototypes/ditto-lab) | Direct requests to PokéAPI for Ditto and Pikachu returned HTTP 200. Selecting Pikachu updated the request URL, card, types, and stats. |
| Sasha Shafran | [My toddler could paint that.](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/my-toddler-could-paint-that) | All 12 object requests to The Met collection API returned HTTP 200 and populated the artwork browser. The project invites users to remix museum art. Placed here because the museum-data integration drives the experience. |
| Sean Wiseman | [Species Globe](https://prototyping-for-masters.vercel.app/prototypes/species-globe) | Selecting a point in Texas called the project’s species endpoint, returned HTTP 200, and displayed 36 species with iNaturalist attribution. Loaded implementation also contains an API Ninjas animal-facts integration; that secondary lookup was not exercised. |

All four direct project pages returned HTTP 200. Saved local gallery previews after loading representative data.

## Full roster coverage

“No additional project found” means none in the reviewed published navigation; it does not establish that a student has no unlinked or unpublished project.

| Student | Review result |
| --- | --- |
| Caoyun Xu (Zoe) | No site URL in the roster; could not inspect. |
| Carnycia Royce | Added Spotify Palette & Mood Explorer. Also checked the mixed class labs; their Web Audio synthesizer uses browser APIs rather than an external data service. |
| Ethan Wise | Checked Design Oracle; tarot content is local and no external data integration was found. |
| Heran Cui (Bruce) | Reviewed the complete project index; the only data API project found was Weather Station. |
| Hoi Kin Chan (Matthew) | Opened the desktop Prototypes Explorer and Spotify window. Three project entries; Spotify is a playlist iframe, not a separate API exploration. |
| Jiaqi Yuan | Checked five additional cat/tarot/game/type routes; no external data integration found. WANT still rendered blank. |
| Jochi Yu | Reviewed the project index and Body Morphing; no additional data API project found. |
| Letian Tian | Reviewed the project index and routes; Weather Station is the only data API project found. |
| Michelle Wong | Reviewed the project index and routes; Weather Station is the only data API project found. |
| Mingtai Sun | Reviewed all six indexed projects; Weather Station is the only data API project found. |
| Minju Jang | Reviewed all seven workshop entries and Graph Paper Minesweeper; no additional data API project found. |
| Qianyi Ma (Kate) | Added PokéAPI Data Lab. Also inspected the linked portfolio case studies. |
| Ruyi Wang | Reviewed the index and nested Y2K/Sims portfolio; no external data API project found. |
| Ryan Page | Reviewed the complete project index; only the weather dashboard showed a data API integration. |
| Sasha Shafran | Added My toddler could paint that., using The Met collection API. |
| Sean Wiseman | Added Species Globe. Also checked Imperium, Summit Signal, earlier games, and the Projects index; no other data API exploration found. |
| Shuotong Huang (Tiffany) | Reviewed the scrapbook project navigation and standalone HTML routes; no external data API project found. |
| Siyue Zhong | Reviewed the index and six additional journal/type/ribbon routes; only Weather Station showed a data API integration. |
| Stephen Grant (Mac) | Reviewed the homepage and nested Instagram-style feed; only Local Forecast showed a data API integration. |
| Taiying Zhang (Sunshine) | Checked Purr & Wag Cafe, GUMI Space, and maimai DX. Browser audio synthesis, curated outbound media links, and local games; no additional external data API project found. |
| Tinglan Huang (Alanis) | Reviewed the published site; its index links only Getting Started and Confetti. The previously supplied Point / Trace drawing tool has no new API project link in the reviewed index. |
| Vivan Nadkarni | Reviewed the project index and routes; only Weather showed a data API integration. |
| Wenying Zhu | No site URL in the roster; could not inspect. |
| Xuanyi Meng | Reviewed the complete project index; only Weather Near Me showed a data API integration. |
| Yi Pan (Ruby Pann) | Reviewed the project index; the Met artwork attribution is a background credit, not a separate API project. Only Find my weather qualified as a data API app. |
| Yiping Dong | Reviewed the complete project index; only Weather showed a data API integration. |
| Yoonseo Yang (Eunice) | Opened the archive and all seven spreads. Five project entries; only Weather showed a data API integration. |
| Yurou Zhou (Reign) | Reviewed all seven indexed projects; only Weather Dashboard showed a data API integration. |
| Zhongyunqi Meng (Aria) | Reviewed the four-entry project index; no external data API project found. |
| Ziona Sober | Reviewed the homepage and all three case studies with their prototype links; only Weather App showed a data API integration. |
| Ziqing Huang (Lyra) | Reviewed the project index and Aura Mesh Gradient; only Weather Postcard showed a data API integration. |

## Maintenance

The gallery contains **4 API explorations from 4 students**. Shared link: `/?week=5&type=api#student-sites`. Existing week-only links for Week 5 still open Weather apps. Diagnostic captures, route inventories, and request evidence are in ignored `output/api-review/`. The checked-in project entries, previews, and this report record the results.

Refresh these previews with:

```sh
npm run previews:capture -- 'Spotify Palette & Mood Explorer' 'PokéAPI Data Lab' 'My toddler could paint that.' 'Species Globe'
```
