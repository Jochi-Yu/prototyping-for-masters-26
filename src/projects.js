// Curated from rendered project pages, not homepage labels or URL keywords.
// Review notes and exclusions: docs/project-curation.md.
export const weeks = [
  { number: 3, title: "Typography" },
  { number: 4, title: "PixiJS & Doodle" },
];

export const projectTypes = [
  { id: "typography", title: "Typography", week: 3 },
  { id: "pixijs", title: "PixiJS", week: 4 },
  { id: "doodle", title: "Doodle", week: 4 },
];

// Each entry: [student name, project title, direct project path].
const typographyProjects = [
  ["Carnycia Royce","Typographic Experiment","/prototypes/typographic-experiment"],
  ["Ethan Wise","Typographic Animator","/prototypes/typographic-animator"],
  ["Heren Cui (Bruce)","Typography Experiments","/prototypes/typography-experiments"],
  ["Hoi Kin Chan (Matthew)","Typographic Experiments","/prototypes/typography-experiment"],
  ["Jiaqi Yuan","Typography Experiments","/prototypes/typography-experiments"],
  ["Jochi Yu","Shatter Type","/prototypes/shatter-type"],
  ["Letian Tian","Typography Lab","/prototypes/typography-lab"],
  ["Michelle Wong","Typography Experiments","/prototypes/typography-experiments"],
  ["Michelle Wong","Text Unravel","/prototypes/pretext-unravel"],
  ["Michelle Wong","Free Fall","/prototypes/free-fall"],
  ["Minju Jang","Typography Experiments","/prototypes/typography-experiments"],
  ["Qianyi Ma (Kate)","Typography Experiments","/prototypes/typography-experiments"],
  ["Ruyi Wang","Typography Generator","/prototypes/typography-generator"],
  ["Ruyi Wang","Typography Experiments","/prototypes/typography-experiments"],
  ["Ryan Page","Typography Experiments","/prototypes/typography-experiments"],
  ["Sasha Shafran","Type Mix","/prototypes/type-mix"],
  ["Sean Wiseman","Torch Typography","/prototypes/torch-typography"],
  ["Stephen Grant (Mac)","Ampersand Field","/prototypes/ampersand-field"],
  ["Stephen Grant (Mac)","TADA Tile Automaton","/prototypes/tada-tile-automaton"],
  ["Taiying Zhang (Sunshine)","MAYHEM","/prototypes/mayhem"],
  ["Vivan Nadkarni","Projected Type","/prototypes/projected-type"],
  ["Xuanyi Meng","Maybe Tomorrow","/prototypes/maybe-tomorrow"],
  ["Yiping Dong","Typography Experiments","/prototypes/typography-experiments"],
  ["Yurou Zhou (Reign)","Typography Experiments","/prototypes/typography-experiments"],
  ["Ziona Sober","Text Wave","/prototypes/wave-surfer"],
  ["Ziqing Huang (Lyra)","Kinetic Typography","/prototypes/kinetic-typography"],
  ["Yoonseo Yang (Eunice)","Typography Generator","/prototypes/typography-generator"],
];

const pixiProjects = [
  ["Carnycia Royce","Generative Blooms","/prototypes/generative-blooms"],
  ["Ethan Wise","Gradient Maker","/prototypes/gradient-maker"],
  ["Heren Cui (Bruce)","Liquid Distortion","/prototypes/liquid-distortion"],
  ["Jiaqi Yuan","Catnip Fireworks","/prototypes/catnip-fireworks"],
  ["Jiaqi Yuan","Dream Cat","/prototypes/dream-cat"],
  ["Jiaqi Yuan","Yarn Toy","/prototypes/yarn-toy"],
  ["Michelle Wong","Fluid Wave","/prototypes/fluid-wave"],
  ["Mingtai Sun","Chromatic Velocity & Ripples","/prototypes/card-deck"],
  ["Qianyi Ma (Kate)","Bubble Rush","/prototypes/bubble-chain"],
  ["Ryan Page","Vector Ribbon Drawing","/prototypes/vector-drawing"],
  ["Sean Wiseman","Whack-a-Mole","/prototypes/whack-a-mole"],
  ["Sasha Shafran","Liquid Image","/prototypes/liquid-image"],
  ["Stephen Grant (Mac)","Instagram Assignment Feed","/prototypes/instagram-feed"],
  ["Vivan Nadkarni","Butterfly Catch","/prototypes/butterfly-catch"],
  ["Xuanyi Meng","Stardew Mini Game","/prototypes/stardew-mini-game"],
  ["Xuanyi Meng","Pink Room Smash","/prototypes/pink-room-smash"],
  ["Yurou Zhou (Reign)","Holographic Card","/prototypes/holographic-card"],
  ["Yurou Zhou (Reign)","VST Video Wall & BEV Fusion","/prototypes/vst-video-wall"],
  ["Ziqing Huang (Lyra)","Pattern Playground","/prototypes/pattern-playground"],
  ["Yoonseo Yang (Eunice)","Outfit Match","/prototypes/outfit-match"],
];

const doodleProjects = [
  ["Carnycia Royce","The Little Creature Workshop","/prototypes/little-creature-workshop"],
  ["Heren Cui (Bruce)","Fashion Sketchbook","/prototypes/fashion-sketchbook"],
  ["Hoi Kin Chan (Matthew)","Doodle Creator","/prototypes/doodle-creator"],
  ["Jochi Yu","Doodle Generator","/prototypes/doodle-generator"],
  ["Michelle Wong","Combined Shape Generator","/prototypes/acf-shapes"],
  ["Mingtai Sun","Alien Toothpaste Doodle","/prototypes/alien-toothpaste-doodle"],
  ["Minju Jang","Emoji & ASCII Mosaic Doodler","/prototypes/emoji-mosaic"],
  ["Minju Jang","Excel Art Doodle Tool","/prototypes/excel-doodle"],
  ["Ryan Page","Doodle Creator","/prototypes/doodle-creator"],
  ["Sean Wiseman","Doodle","/prototypes/doodle"],
  ["Sasha Shafran","Fashion Doodle","/prototypes/fashion-doodle"],
  ["Taiying Zhang (Sunshine)","Needy Girl Oekaki","/prototypes/needy-girl-os"],
  ["Taiying Zhang (Sunshine)","Masterpiece Vandal Club","/prototypes/masterpiece-graffiti-lab"],
  ["Tinglan Huang (Alanis)","Point / Trace","https://point-trace-doodle.vercel.app/"],
  ["Vivan Nadkarni","Doodle Engine","/prototypes/doodle-engine"],
  ["Yi Pan (Ruby Pann)","Little Print Shop","/prototypes/little-print-shop"],
  ["Yiping Dong","Doodle Creator","/prototypes/doodle-creator"],
  ["Yurou Zhou (Reign)","3D Aurora Doodler","/prototypes/p5-doodle"],
  ["Ziona Sober","Dress the Doodle","/prototypes/dress-the-doodle"],
  ["Ziqing Huang (Lyra)","Doodle Playground","/prototypes/doodle-playground"],
  ["Yoonseo Yang (Eunice)","Drawing Machine","/prototypes/drawing-machine"],
];

const makeProjects = (entries, week, type) => entries.map(([student, title, path]) => ({
  student, title, path, week, type,
  preview: `/previews/${student.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}-${(path.split("/").pop() || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}.jpg`,
}));

export const projects = [
  ...makeProjects(typographyProjects, 3, "typography"),
  ...makeProjects(pixiProjects, 4, "pixijs"),
  ...makeProjects(doodleProjects, 4, "doodle"),
];
