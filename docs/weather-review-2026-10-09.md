# Week 5 – Weather apps review

Reviewed October 9, 2026. Opened all **29 published student sites** in the 31-person roster. Initially found **16 weather apps from 16 students**, opened their direct project pages, and captured local gallery previews. Homepages alone were not used to classify projects.

Carnycia’s binder, Matthew’s desktop, Minju’s project selector, and Eunice’s seven-spread archive required navigation to expose their project routes.

## Recheck on October 9

Revisited all 29 roster URLs and their project navigation, inspected route links exposed by loaded first-party scripts, and checked the nested Mac and Ruyi portfolio pages. Added Sunshine’s **Weather Horizon** and Ziona’s **Weather App**, bringing the collection to **18 projects from 18 students**. Ziona’s homepage links to a case study; the gallery uses the actual `/prototypes/weather-now` app linked from that page.

Heran’s former deployment returned HTTP 404 with Vercel `DEPLOYMENT_NOT_FOUND`. His roster and project links now use the replacement deployment at `prototyping-for-masters-one.vercel.app`; the homepage and all four curated project routes return HTTP 200. His previously verified entries and previews are retained. The other 15 existing weather links returned HTTP 200. Both new project pages were separately rendered and captured. Ziona’s city search currently displays `OPENWEATHER_API_KEY is not set`; its forecast interaction is described by the linked case study but could not be exercised on the deployed app.

## Included projects

October 9 instructor follow-up: Elizabeth supplied Letian’s direct Weather Station link. It returned HTTP 200 and rendered a multi-city weather display; a gallery preview was captured. The collection now has **19 projects from 19 students**. Displayed weather values were not independently verified as live data.

| Student | Project | Observed content |
| --- | --- | --- |
| Carnycia Royce | [Atmospheric Weather Station](https://carnycia-ruddy.vercel.app/prototypes/weather-station) | Weather layers, wind map, advisories, and hourly/five-day forecasts. Rendered in demo mode with an invalid API key notice. |
| Ethan Wise | [Local Weather](https://prototyping-for-masters-8v9j.vercel.app/prototypes/local-weather) | City/ZIP search, location selection, units, and weather/forecast interface. |
| Heran Cui (Bruce) | [Weather Station](https://prototyping-for-masters-one.vercel.app/prototypes/weather-station) | Atmospheric simulation, clothing/commute advice, telemetry, and hourly forecast. Rendered in demo mode with a missing API key notice. |
| Hoi Kin Chan (Matthew) | [NYC Weather](https://matthews-site.vercel.app/prototypes/weather) | NYC weather and five-day forecast; discovered in the desktop’s Prototypes Explorer. |
| Jochi Yu | [weather weather](https://jochiprototypes.vercel.app/prototypes/weather-weather) | Current city conditions, hourly forecast, and five-day forecast. |
| Letian Tian | [Weather Station](https://prototyping-for-masters-nine.vercel.app/prototypes/weather-station) | Multi-city conditions with temperature, humidity, wind, pressure, unit controls, GPS, and a key control. |
| Michelle Wong | [Weather Station](https://prototyping-for-masters-wine.vercel.app/prototypes/weather-display) | City conditions, atmospheric time-of-day controls, and five-day forecast. |
| Minju Jang | [Globe Weather](https://minjujang-prototyping-3rp6.vercel.app/prototypes/weather-dashboard) | Globe Weather; discovered by selecting its workshop entry and following Launch Prototype Route. |
| Qianyi Ma (Kate) | [Weather, now / 天气此刻](https://qianyima.vercel.app/prototypes/local-weather) | Chinese/English city weather, conditions, and five-day forecast. |
| Ryan Page | [Weather Dashboard](https://prototyping-for-masters-rho.vercel.app/prototypes/weather-dashboard) | Current city conditions, 24-hour forecast, and five-day outlook. |
| Sasha Shafran | [Weather Archive](https://prototyping-for-masters-sashki-lw62.vercel.app/prototypes/weather-archive) | Five-day Kyiv forecast in a filmstrip, with weather-based outfit suggestions. |
| Sean Wiseman | [Weather, anywhere.](https://prototyping-for-masters.vercel.app/prototypes/weather) | Interactive globe and city search for local weather. |
| Taiying Zhang (Sunshine) | [Weather Horizon](https://sunshine-prototypes.vercel.app/prototypes/weather-horizon) | City search, atmospheric scene, temperature, wind, pressure, visibility, and solar cycle. |
| Vivan Nadkarni | [Weather](https://vivans-prototypes.vercel.app/prototypes/weather) | Current weather, hourly/five-day forecast, practical activity advice, and air quality. |
| Yi Pan (Ruby Pann) | [Find my weather](https://ruby-pann-course.vercel.app/prototypes/ideal-weather) | Matches preferred temperature and conditions against weather in 24 places. |
| Yiping Dong | [Weather](https://prototyping-for-masters-tau.vercel.app/prototypes/weather) | City weather, hourly/daily forecasts, and a climate-based dressing room. |
| Yoonseo Yang (Eunice) | [Weather](https://prototyping-for-master.vercel.app/prototypes/weather) | Weather project reached through all seven archive spreads; city conditions and five-day forecast. |
| Yurou Zhou (Reign) | [Weather Dashboard](https://reign-zhou-prototype.vercel.app/prototypes/weather-dashboard) | City conditions, weather presets, hourly/upcoming forecast, and wind display. |
| Ziona Sober | [Weather App](https://ziona-prototyping-for-masters.vercel.app/prototypes/weather-now) | Rendered sky and city search; searching displays a missing API key error. The linked case study describes forecast time travel. |

## No weather app found on the published site

These 10 homepages were inspected, including their published prototype lists. No weather app was linked in the reviewed navigation. This does not establish that the student has not made one elsewhere. Letian was removed from this list after the instructor supplied his direct project link.

- [Jiaqi Yuan](https://prototyping-for-masters-1-eyt7.vercel.app/)
- [Mingtai Sun](https://mingtai-prototypes.vercel.app/)
- [Ruyi Wang](https://ruyiwang.vercel.app/)
- [Shuotong Huang (Tiffany)](https://shuotong-huang-portfolio.vercel.app/)
- [Siyue Zhong](https://prototyping-for-masters-c12t.vercel.app/)
- [Stephen Grant (Mac)](https://masters-main.vercel.app/)
- [Tinglan Huang (Alanis)](https://alanis1-omega.vercel.app/)
- [Xuanyi Meng](https://xuanyi-prototyping-2026.vercel.app/)
- [Zhongyunqi Meng (Aria)](https://zhongyunqimeng-prototyping-for-mast-two.vercel.app/)
- [Ziqing Huang (Lyra)](https://prototyping-for-masters-beta.vercel.app/)

## No site URL in the roster

- Caoyun Xu (Zoe)
- Wenying Zhu

## Review scope

This collection records weather-app prototypes, including apps with demo data or API setup requirements. It does not certify their weather accuracy or production readiness. Carnycia and Heran displayed explicit API-key notices and usable demo interfaces; other apps’ displayed values were not independently audited. No credentials were supplied or changed.

The captures use the students’ default interfaces, with New York entered in Ethan, Kate, Sean, Eunice, and Ziona’s city search to expose a useful weather state. Existing course-week assignments remain unchanged.
