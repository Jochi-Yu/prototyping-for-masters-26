# Weather and API project recheck — October 16, 2026

Revisited all 30 published student sites in the 31-person roster and opened 148 distinct project/case-study URLs. All homepages ultimately returned HTTP 200; Aria's homepage initially returned DEPLOYMENT_NOT_FOUND, then recovered on retry with a new Weather Flag link. Wenying still has no roster URL.

Reviewed rendered project menus, first-party script routes, Zoe's six dialogs, Matthew's desktop project window, Eunice's seven archive spreads, nested indexes, and the existing gallery's project URLs. Opened all 26 currently listed weather pages and all four currently listed API pages; all 30 returned HTTP 200. This checks published availability and classification, not every feature or the accuracy of every displayed value.

## Added to the gallery

| Student | Project | Category | Verification |
| --- | --- | --- | --- |
| Caoyun Xu (Zoe) | [Atmos](https://atmos-weather-prototype.vercel.app/) | Weather | Portfolio now links the app. Page and weather endpoint returned 200. Searching London updated conditions and the forecast timeline from New York to London. |
| Zhongyunqi Meng (Aria) | [Weather Flag](https://zhongyunqimeng-prototyping-for-mast-two.vercel.app/prototypes/weather-flag) | Weather — needs repair | Newly linked from the recovered homepage. Project page returned 200; About describes a weather-driven cloth simulation. The weather endpoint returned 500 with an explicit missing OPENWEATHER_API_KEY error. The browser showed the header and blue background, without a visible flag. Counted as a published weather project, not a working live-weather experience. |
| Ethan Wise | [The Herbal Atlas](https://prototyping-for-masters-8v9j.vercel.app/prototypes/herbal-atlas) | API explorations | Opened Agrimony, expanded Research & botanical identity, and clicked Consult live references. The references endpoint returned 200 and the UI displayed three PubMed records, a GBIF species identity, and a resolved Wikimedia Commons image. The base botanical index is local; the optional research lookup is the verified external-data integration. |

## Updated coverage

- Weather: 28 students have a published project identified, including Aria's currently broken app. No weather project found for Ruyi Wang or Shuotong Huang (Tiffany); Wenying Zhu cannot be checked without a URL.
- Non-weather API explorations: five students identified — Carnycia Royce, Ethan Wise, Qianyi Ma (Kate), Sasha Shafran, and Sean Wiseman. No additional qualifying project found for 25 other published students; Wenying remains uncheckable (26 without an identified API project total).
- The gallery now contains 28 weather entries and five API entries. All three additions have captured previews; Aria’s preview shows its About panel because the flag did not render.

## Existing API checks

- Carnycia: Miles Davis search returned 200 and updated the selected track/palette; the app still labels itself Demo Mode. Live Spotify catalog access was not established.
- Kate: selecting Pikachu returned 200 from PokéAPI and updated the card and JSON values.
- Sasha: all 12 Met artwork requests returned 200 and populated the artwork browser.
- Sean: selecting a point in Texas returned 200 from the species endpoint and displayed 36 species with iNaturalist attribution.

Weather apps with demo data or key requirements remain classified as weather projects. Browser audio/canvas APIs, static media credits, and embedded playlists do not count as separate non-weather API explorations. Existing weather apps with other integrations retain their primary weather category. Minju's initial weather load produced both successful Open-Meteo responses and rate-limit responses (429); no claim is made that every weather app currently works end to end.

## Full roster

“Not found” means no qualifying project in the reviewed published pages, not proof that no unlinked or unpublished work exists.

| Student | Weather | Non-weather API |
| --- | --- | --- |
| Caoyun Xu (Zoe) | [Atmos](https://atmos-weather-prototype.vercel.app/) — added October 16 | Not found |
| Carnycia Royce | [Atmospheric Weather Station](https://carnycia-ruddy.vercel.app/prototypes/weather-station) | [Spotify Palette & Mood Explorer](https://carnycia-ruddy.vercel.app/prototypes/spotify-palette-explorer) |
| Ethan Wise | [Local Weather](https://prototyping-for-masters-8v9j.vercel.app/prototypes/local-weather) | [The Herbal Atlas](https://prototyping-for-masters-8v9j.vercel.app/prototypes/herbal-atlas) — added October 16 |
| Heran Cui (Bruce) | [Weather Station](https://prototyping-for-masters-one.vercel.app/prototypes/weather-station) | Not found |
| Hoi Kin Chan (Matthew) | [NYC Weather](https://matthews-site.vercel.app/prototypes/weather) | Not found |
| Jiaqi Yuan | [Weather Cat](https://prototyping-for-masters-1-guiq.vercel.app/prototypes/weather-cat) | Not found |
| Jochi Yu | [weather weather](https://jochiprototypes.vercel.app/prototypes/weather-weather) | Not found |
| Letian Tian | [Weather Station](https://prototyping-for-masters-nine.vercel.app/prototypes/weather-station) | Not found |
| Michelle Wong | [Weather Station](https://prototyping-for-masters-wine.vercel.app/prototypes/weather-display) | Not found |
| Mingtai Sun | [The Weather Daily](https://mingtai-prototypes.vercel.app/prototypes/weather-station) | Not found |
| Minju Jang | [Globe Weather](https://minjujang-prototyping-3rp6.vercel.app/prototypes/weather-dashboard) | Not found |
| Qianyi Ma (Kate) | [Weather, now / 天气此刻](https://qianyima.vercel.app/prototypes/local-weather) | [PokéAPI Data Lab](https://qianyima.vercel.app/prototypes/ditto-lab) |
| Ruyi Wang | Not found | Not found |
| Ryan Page | [Weather Dashboard](https://prototyping-for-masters-rho.vercel.app/prototypes/weather-dashboard) | Not found |
| Sasha Shafran | [Weather Archive](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/weather-archive) | [My toddler could paint that.](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/my-toddler-could-paint-that) |
| Sean Wiseman | [Weather, anywhere.](https://prototyping-for-masters.vercel.app/prototypes/weather) | [Species Globe](https://prototyping-for-masters.vercel.app/prototypes/species-globe) |
| Shuotong Huang (Tiffany) | Not found | Not found |
| Siyue Zhong | [Weather Station](https://prototyping-for-masters-c12t.vercel.app/prototypes/weather-station) | Not found |
| Stephen Grant (Mac) | [Local Forecast](https://masters-main.vercel.app/prototypes/local-weather) | Not found |
| Taiying Zhang (Sunshine) | [Weather Horizon](https://sunshine-prototypes.vercel.app/prototypes/weather-horizon) | Not found |
| Tinglan Huang (Alanis) | [Local Weather](https://alanis1-omega.vercel.app/prototypes/local-weather) | Not found |
| Vivan Nadkarni | [Weather](https://vivans-prototypes.vercel.app/prototypes/weather) | Not found |
| Wenying Zhu | No site URL | No site URL |
| Xuanyi Meng | [Weather Near Me](https://xuanyi-prototyping-2026.vercel.app/prototypes/weather-dashboard) | Not found |
| Yi Pan (Ruby Pann) | [Find my weather](https://ruby-pann-course.vercel.app/prototypes/ideal-weather) | Not found |
| Yiping Dong | [Weather](https://prototyping-for-masters-tau.vercel.app/prototypes/weather) | Not found |
| Yoonseo Yang (Eunice) | [Weather](https://prototyping-for-master.vercel.app/prototypes/weather) | Not found |
| Yurou Zhou (Reign) | [Weather Dashboard](https://reign-zhou-prototype.vercel.app/prototypes/weather-dashboard) | Not found |
| Zhongyunqi Meng (Aria) | [Weather Flag](https://zhongyunqimeng-prototyping-for-mast-two.vercel.app/prototypes/weather-flag) — added October 16; missing API key | Not found |
| Ziona Sober | [Weather App](https://ziona-prototyping-for-masters.vercel.app/prototypes/weather-now) | Not found |
| Ziqing Huang (Lyra) | [Weather Postcard](https://prototyping-for-masters-beta.vercel.app/prototypes/weather-postcard) | Not found |

## Evidence

Browser inventories, request statuses, screenshots, and verification results are saved in the ignored directory `output/week5-review-2026-10-16/`. The main pass opened 145 URLs; supplementary checks opened Zoe's separate Atmos deployment, Eunice's Tamagotchi, and Aria's new Weather Flag (148 unique project/case-study URLs total).

An unrelated broken gallery link surfaced during the broad pass: Mac's [TADA Tile Automaton](https://masters-main.vercel.app/prototypes/tada-tile-automaton) returned 404. The unrelated broken link was left unchanged.
