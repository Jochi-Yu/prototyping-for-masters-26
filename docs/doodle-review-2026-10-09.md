# Missing Doodle projects — October 9, 2026

The live course Doodle gallery matched the repository: 18 projects by 16 of the 31 students. Reviewed the remaining 15 students. Thirteen had published site URLs; all thirteen homepages returned HTTP 200. Opened 32 linked project pages beyond the standard Getting Started and Confetti examples, and inspected their rendered content. Exercised both new drawing tools and captured local previews.

This review covers discoverable work linked from the listed sites. It does not establish that a student has no unpublished or unlinked assignment.

## Verified additions

| Student | Project | Rendered behavior |
| --- | --- | --- |
| Yi Pan (Ruby Pann) | [Little Print Shop](https://ruby-pann-course.vercel.app/prototypes/little-print-shop) | Freehand drawing in cobalt and burgundy, undo, a new sheet, and printing-plate offsets. Drew overlapping loops in both inks and verified the recorded stroke count changed. |
| Ziqing Huang (Lyra) | [Doodle Playground](https://prototyping-for-masters-beta.vercel.app/prototypes/doodle-playground) | Doodle Studio with Ribbon, Living Pet, and Stickers tools alongside a dress-up assembly kit. Dismissed the introductory notice, opened the studio, drew ribbon loops, and verified the drawing canvas changed. |

Both project pages returned HTTP 200. Added both to Week 4 — Doodle, bringing the collection to **20 projects from 18 students**. Previews show sample interactions performed during review.

## Instructor-supplied follow-up

Elizabeth supplied Alanis’s separately hosted [Point / Trace](https://point-trace-doodle.vercel.app/), which was not linked from the portfolio index during the initial review. The page returned HTTP 200 and rendered an image-to-doodle tool with numbered tracing points, a sample bird, undo, outline controls, and a Connect all action. Added it under Tinglan Huang (Alanis) with a captured preview. The collection now has **21 projects from 19 students**, leaving **12 students** without a Doodle entry.

## Subsequent instructor corrections

Letian’s City Walk was added after checking its drawing controls. Elizabeth then identified Ethan’s Gradient Maker as Doodle and supplied Jiaqi’s Cat Spellbook. Both direct pages returned HTTP 200. Moved Gradient Maker out of PixiJS into Doodle; it renders a vector mesh editor with raster liquify tools. Cat Spellbook provides Magic Quill, Paw Stamp, Yarn Brush, Stardust, and Cat Tail drawing tools, with ink, size, undo/redo, and save controls. Captured updated previews for both pages.

Shuotong follow-up: Elizabeth supplied [3D Doodle Studio](https://shuotong-huang-portfolio.vercel.app/doodle-playground/index.html), a standalone page outside the portfolio prototype routes. It returned HTTP 200 and rendered neon ribbon artwork with drawing/inspect modes, brush controls, geometry choices, and preset sculptures. Added it with a captured preview.

Zhongyunqi follow-up: Elizabeth supplied [Draw to Feed a Creature](https://zhongyunqimeng-prototyping-for-mast-two.vercel.app/prototypes/doodle-creator). The page returned HTTP 200 and rendered a drawing canvas with brush widths, palette changes, and stroke-based creature growth. Added it with a captured preview showing sample strokes.

Caoyun follow-up: added her supplied portfolio and verified [Melody Maker](https://cxu25-debug.github.io/melody-maker/), a p5.js/Tone.js drawing tool. Drawing changed the canvas; a preview shows sample strokes. Her other five project dialogs currently contain placeholder content and no working project links.

The collection now contains **27 projects from 25 students**, leaving **6 students** without a Doodle entry.

## Remaining students

| Student | Site | Finding |
| --- | --- | --- |
| Qianyi Ma (Kate) | [Site](https://qianyima.vercel.app/) | Typography experiments and Bubble Rush; no new doodle project linked in the experiments list. |
| Ruyi Wang | [Site](https://ruyiwang.vercel.app/) | Y2K/Sims interaction and two typography tools. No separate drawing tool found. |
| Siyue Zhong | [Site](https://prototyping-for-masters-c12t.vercel.app/) | Getting Started, Confetti, and Personal Weblog. No linked doodle tool found. |
| Stephen Grant (Mac) | [Site](https://masters-main.vercel.app/) | Instagram feed with an engagement game and magazine-cover layering interaction, plus two typography experiments. No separate doodle creator found. |
| Wenying Zhu | No URL in roster | Could not check a site. |
| Xuanyi Meng | [Site](https://xuanyi-prototyping-2026.vercel.app/) | Two room games and Maybe Tomorrow typography. Maybe Tomorrow now includes wiping/carving a foam surface, but remains a typography tool already in Week 3; no separate doodle project found. |

## Evidence and maintenance

Local inspection output is in ignored `output/doodle-review/`: homepage and project-page JSON, screenshots, and the inspection scripts. These are diagnostic artifacts; the committed project data, previews, and this report record the decisions.

Refresh the two previews with:

```sh
npm run previews:capture -- 'Little Print Shop' 'Doodle Playground'
```

The capture script repeats the local drawing interactions before saving each preview. Revisit the actual pages when checking future submissions; homepage labels alone are not enough.
