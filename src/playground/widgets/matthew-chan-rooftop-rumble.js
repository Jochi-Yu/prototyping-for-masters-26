// A small original pixel fighting game. The canvas draws at 256×144 and is scaled up with crisp pixels.
const W = 256;
const H = 144;
const GROUND = 124;
const STEP = 1000 / 60;
const ROUND_SECONDS = 60;
const WINS_NEEDED = 2;
const NAME_LENGTH = 8;

const FONT = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", 0: "111101101101111", 1: "010110010010111",
  2: "110001010100111", 3: "110001010001110", 4: "101101111001001", 5: "111100110001110",
  6: "011100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001110",
  "!": "010010010000010", ".": "000000000000010", ":": "000010000010000", "-": "000000111000000",
  "/": "001001010100100", ";": "000010000010100", " ": "000000000000000",
};

const MOVES = {
  punch: { startup: 4, active: 3, recovery: 9, damage: 6, hitstun: 14, blockstun: 8, push: 2.5, meter: 9, box: [6, 21, -27, -19] },
  kick: { startup: 7, active: 4, recovery: 13, damage: 9, hitstun: 18, blockstun: 10, push: 3.5, meter: 11, box: [5, 22, -19, -11] },
  airKick: { startup: 3, active: 10, recovery: 0, damage: 8, hitstun: 16, blockstun: 9, push: 3, meter: 9, box: [2, 19, -14, -3], air: true },
  special: { startup: 8, active: 14, recovery: 18, damage: 18, hitstun: 34, blockstun: 14, push: 6, meter: 0, box: [0, 21, -31, -8], dash: 4.2 },
};

const FIGHTERS = [
  {
    name: "Nova",
    style: "ponytail",
    aura: "#5ff2e2",
    pal: {
      outline: "#120f1f", skin: "#f2c39b", hair: "#f4f1e8", top: "#2bb3a8", top2: "#1d7f78",
      bottom: "#2d2a4a", accent: "#ffcf3f", glove: "#ff5d73",
    },
  },
  {
    name: "Bruno",
    style: "beard",
    aura: "#ff9a3d",
    pal: {
      outline: "#120f1f", skin: "#c98a5e", hair: "#2a1a14", top: "#e2483d", top2: "#a8322b",
      bottom: "#3a3f58", accent: "#f2f2f2", glove: "#3b7bff",
    },
  },
];

const KEYMAP = {
  p1: { left: "KeyA", right: "KeyD", up: "KeyW", down: "KeyS", punch: "KeyF", kick: "KeyG", special: "KeyH" },
  p2: { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown", punch: "KeyK", kick: "KeyL", special: "Semicolon" },
};
const GAME_KEYS = new Set([
  ...Object.values(KEYMAP.p1), ...Object.values(KEYMAP.p2), "Space", "Enter", "Digit2", "KeyM",
]);

const blankInput = () => ({ left: false, right: false, up: false, down: false, punch: false, kick: false, special: false });

const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const drawText = (ctx, text, x, y, { scale = 1, color = "#fff", align = "left", outline = "#120f1f" } = {}) => {
  const chars = [...String(text).toUpperCase()];
  const advance = 4 * scale;
  const width = chars.length * advance - scale;
  const startX = Math.round(align === "center" ? x - width / 2 : align === "right" ? x - width : x);
  const pass = (ox, oy, fill) => {
    ctx.fillStyle = fill;
    chars.forEach((char, index) => {
      const glyph = FONT[char];
      if (!glyph) return;
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          if (glyph[row * 3 + col] === "1") {
            ctx.fillRect(startX + index * advance + col * scale + ox, y + row * scale + oy, scale, scale);
          }
        }
      }
    });
  };
  if (outline) {
    const s = Math.max(1, Math.ceil(scale / 2));
    [[-s, 0], [s, 0], [0, -s], [0, s], [s, s]].forEach(([ox, oy]) => pass(ox, oy, outline));
  }
  pass(0, 0, color);
};

const buildBackground = () => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(26);

  const sky = ["#160f36", "#1f1547", "#2a1b58", "#3a2268", "#522a76", "#70347c", "#8f3f78", "#a8487a"];
  const band = Math.ceil(GROUND / sky.length);
  sky.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, index * band, W, band);
  });

  for (let i = 0; i < 46; i += 1) {
    ctx.fillStyle = rand() > 0.7 ? "#ffffff" : "#b9a8ff";
    ctx.fillRect(Math.floor(rand() * W), Math.floor(rand() * 64), 1, 1);
  }

  for (let y = -12; y <= 12; y += 1) {
    for (let x = -12; x <= 12; x += 1) {
      const d = x * x + y * y;
      if (d > 144) continue;
      ctx.fillStyle = d > 110 ? "#f2d3a6" : (x - 3) ** 2 + (y + 2) ** 2 < 8 || (x + 4) ** 2 + (y - 4) ** 2 < 5 ? "#f2d3a6" : "#ffe9c2";
      ctx.fillRect(204 + x, 30 + y, 1, 1);
    }
  }

  const skyline = (color, minH, maxH, lit, windowColor) => {
    let x = -4;
    while (x < W) {
      const w = 14 + Math.floor(rand() * 18);
      const h = minH + Math.floor(rand() * (maxH - minH));
      ctx.fillStyle = color;
      ctx.fillRect(x, GROUND - h, w, h);
      if (rand() > 0.6) ctx.fillRect(x + Math.floor(w / 2), GROUND - h - 6, 1, 6);
      for (let wy = GROUND - h + 3; wy < GROUND - 4; wy += 4) {
        for (let wx = x + 2; wx < x + w - 2; wx += 3) {
          if (rand() < lit) {
            ctx.fillStyle = windowColor;
            ctx.fillRect(wx, wy, 1, 2);
          }
        }
      }
      x += w + 1;
    }
  };
  skyline("#2a1c52", 40, 78, 0.18, "#5b46a0");
  skyline("#120c2b", 24, 56, 0.12, "#ffcf6b");

  // Water tower on the near roof.
  ctx.fillStyle = "#0b0720";
  ctx.fillRect(22, GROUND - 40, 22, 18);
  ctx.fillRect(20, GROUND - 42, 26, 3);
  ctx.fillRect(26, GROUND - 46, 14, 4);
  ctx.fillRect(24, GROUND - 22, 2, 22);
  ctx.fillRect(40, GROUND - 22, 2, 22);
  ctx.fillRect(24, GROUND - 12, 18, 1);

  ctx.fillStyle = "#2b2346";
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = "#5a4c86";
  ctx.fillRect(0, GROUND, W, 1);
  ctx.fillStyle = "#221b3a";
  for (let x = 8; x < W; x += 16) ctx.fillRect(x, GROUND + 1, 1, H - GROUND);
  ctx.fillRect(0, GROUND + 10, W, 1);
  return canvas;
};

const upperBody = (fighter, dx, dy) => {
  const parts = [];
  if (fighter.style === "ponytail") parts.push([dx - 7, dy - 33, 3, 6, "hair"]);
  parts.push(
    [dx - 5, dy - 25, 10, 12, "top"],
    [dx - 5, dy - 25, 3, 12, "top2"],
    [dx - 5, dy - 14, 10, 2, "accent"],
    [dx - 4, dy - 33, 8, 8, "skin"],
    [dx - 4, dy - 34, 8, 3, "hair"],
    [dx - 4, dy - 34, 3, 6, "hair"],
    [dx + 2, dy - 30, 1, 2, "outline"],
  );
  if (fighter.style === "beard") parts.push([dx - 1, dy - 27, 5, 2, "hair"], [dx - 4, dy - 32, 8, 1, "accent"]);
  return parts;
};

const legs = (back, front) => [
  [back, -12, 4, 12, "bottom"],
  [front, -12, 4, 12, "bottom"],
  [back - 1, -2, 5, 2, "accent"],
  [front, -2, 5, 2, "accent"],
];

const ARMS = {
  guard: (dx, dy) => [[dx + 2, dy - 22, 5, 3, "skin"], [dx + 6, dy - 24, 4, 4, "glove"], [dx + 3, dy - 27, 4, 4, "glove"]],
  punch: (dx, dy) => [[dx + 1, dy - 26, 4, 4, "glove"], [dx + 3, dy - 23, 12, 3, "skin"], [dx + 14, dy - 25, 5, 5, "glove"]],
  windup: (dx, dy) => [[dx - 1, dy - 23, 4, 3, "skin"], [dx - 3, dy - 25, 4, 4, "glove"], [dx + 4, dy - 27, 4, 4, "glove"]],
  block: (dx, dy) => [[dx + 3, dy - 24, 4, 4, "glove"], [dx + 5, dy - 28, 3, 8, "skin"], [dx + 4, dy - 31, 5, 4, "glove"]],
  hurt: (dx, dy) => [[dx - 4, dy - 27, 3, 4, "skin"], [dx - 6, dy - 30, 4, 4, "glove"], [dx - 2, dy - 34, 4, 4, "glove"]],
  cheer: (dx, dy) => [[dx - 2, dy - 24, 4, 4, "glove"], [dx + 4, dy - 40, 3, 12, "skin"], [dx + 3, dy - 44, 5, 5, "glove"]],
};

const LYING = [
  [-22, -7, 3, 7, "hair"], [-20, -7, 8, 7, "skin"], [-12, -8, 12, 8, "top"], [-12, -8, 12, 2, "top2"],
  [0, -8, 2, 8, "accent"], [2, -6, 13, 6, "bottom"], [15, -7, 3, 7, "accent"], [-6, -3, 6, 3, "glove"],
];

const movePhase = (fighter) => {
  const { startup, active } = fighter.move;
  if (fighter.moveT < startup) return "startup";
  if (fighter.moveT < startup + active) return "active";
  return "recovery";
};

const poseParts = (fighter) => {
  const bob = fighter.state === "idle" ? Math.floor(fighter.t / 18) % 2 : 0;
  const standing = (dx, arms, dy = bob) => [...legs(-6, 2), ...upperBody(fighter, dx, dy), ...ARMS[arms](dx, dy)];
  switch (fighter.state) {
    case "ko":
      return fighter.h > 0 ? standing(-2, "hurt", 0) : LYING;
    case "win":
      return standing(0, "cheer", 0);
    case "hit":
      return standing(-2, "hurt", 0);
    case "crouch":
    case "block":
      return [
        [-8, -6, 5, 6, "bottom"], [3, -6, 5, 6, "bottom"], [-9, -2, 6, 2, "accent"], [3, -2, 6, 2, "accent"],
        ...upperBody(fighter, 0, 7), ...ARMS.block(0, 7),
      ];
    case "jump":
      return [
        [-5, -14, 4, 8, "bottom"], [2, -15, 4, 8, "bottom"], [-6, -8, 5, 2, "accent"], [2, -9, 5, 2, "accent"],
        ...upperBody(fighter, 0, 0), ...ARMS.guard(0, 0),
      ];
    case "walk": {
      const wide = Math.floor(fighter.t / 7) % 2 === 0;
      return [...(wide ? legs(-8, 4) : legs(-4, 0)), ...upperBody(fighter, 0, 0), ...ARMS.guard(0, 0)];
    }
    case "attack": {
      const phase = movePhase(fighter);
      const { name } = fighter.move;
      if (name === "airKick") {
        const out = phase === "active";
        return [
          [-5, -14, 4, 8, "bottom"], [-6, -8, 5, 2, "accent"],
          ...(out ? [[3, -12, 12, 4, "bottom"], [14, -12, 4, 4, "accent"]] : [[2, -15, 4, 8, "bottom"], [2, -9, 5, 2, "accent"]]),
          ...upperBody(fighter, 0, 0), ...ARMS.guard(0, 0),
        ];
      }
      if (name === "kick") {
        if (phase === "startup") {
          return [[-6, -12, 4, 12, "bottom"], [-7, -2, 5, 2, "accent"], [2, -16, 5, 5, "bottom"], [4, -11, 3, 5, "bottom"], [4, -7, 4, 2, "accent"],
            ...upperBody(fighter, -1, 0), ...ARMS.guard(-1, 0)];
        }
        if (phase === "active" || fighter.moveT < fighter.move.startup + fighter.move.active + 4) {
          return [[-5, -12, 4, 12, "bottom"], [-6, -2, 5, 2, "accent"], [3, -17, 14, 4, "bottom"], [16, -18, 4, 5, "accent"],
            ...upperBody(fighter, -2, 0), ...ARMS.guard(-2, 0)];
        }
        return standing(0, "guard", 0);
      }
      // Punch and the dash special share the extended-arm pose.
      if (phase === "startup") return standing(-1, "windup", 0);
      if (phase === "active" || fighter.moveT < fighter.move.startup + fighter.move.active + 3) return standing(1, "punch", 0);
      return standing(0, "guard", 0);
    }
    default:
      return standing(0, "guard");
  }
};

const drawFighter = (ctx, fighter, { x = fighter.x, h = fighter.h, facing = fighter.facing, color = null, alpha = 1 } = {}) => {
  const parts = poseParts(fighter);
  const ox = Math.round(x);
  const oy = GROUND - Math.round(h);
  const place = ([dx, dy, w, hh]) => [facing > 0 ? ox + dx : ox - dx - w, oy + dy, w, hh];
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color ?? fighter.pal.outline;
  parts.forEach((part) => {
    const [px, py, pw, ph] = place(part);
    ctx.fillRect(px - 1, py - 1, pw + 2, ph + 2);
  });
  if (!color) {
    parts.forEach((part) => {
      const [px, py, pw, ph] = place(part);
      ctx.fillStyle = fighter.flash > 0 ? "#ffffff" : fighter.pal[part[4]];
      ctx.fillRect(px, py, pw, ph);
    });
  }
  ctx.globalAlpha = 1;
};

const makeFighter = (def) => ({
  ...def, defaultName: def.name, x: 0, h: 0, vx: 0, vh: 0, facing: 1, hp: 100, shownHp: 100, meter: 0, wins: 0,
  state: "idle", t: 0, move: null, moveT: 0, hasHit: false, stun: 0, flash: 0, airUsed: false,
  trail: [], input: blankInput(), prev: blankInput(),
});

export default {
  student: "Matthew Chan",
  title: "Rooftop Rumble",
  width: 640,
  height: 400,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      canvas {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #0b0720;
        image-rendering: pixelated;
        cursor: pointer;
        outline: none;
      }
      canvas:focus-visible {
        box-shadow: inset 0 0 0 2px #5ff2e2;
      }
    `;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Rooftop Rumble, a pixel fighting game. Click, then press Enter for one player or 2 for two players.");
    root.append(style, canvas);

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const background = buildBackground();

    const keys = new Set();
    const p1 = makeFighter(FIGHTERS[0]);
    const p2 = makeFighter(FIGHTERS[1]);
    const game = {
      phase: "title", phaseT: 0, players: 1, round: 1, timer: ROUND_SECONDS * 60,
      hitstop: 0, shake: 0, focused: false, muted: false, winner: null, banner: "",
    };
    const ai = { cool: 30, block: 0, retreat: 0, reacted: false };
    let particles = [];
    let impacts = [];
    const rand = Math.random;

    // Sound ------------------------------------------------------------
    let audio = null;
    const tone = (from, to, duration, type = "square", volume = 0.06) => {
      if (game.muted) return;
      try {
        audio ??= new AudioContext();
        const now = audio.currentTime;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(from, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + duration);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain).connect(audio.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch {
        // Audio is optional.
      }
    };
    const noise = (duration, volume = 0.12, cutoff = 1800) => {
      if (game.muted) return;
      try {
        audio ??= new AudioContext();
        const now = audio.currentTime;
        const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const source = audio.createBufferSource();
        const filter = audio.createBiquadFilter();
        const gain = audio.createGain();
        source.buffer = buffer;
        filter.type = "lowpass";
        filter.frequency.value = cutoff;
        gain.gain.value = volume;
        source.connect(filter).connect(gain).connect(audio.destination);
        source.start(now);
      } catch {
        // Audio is optional.
      }
    };
    const sfx = {
      swing: () => noise(0.07, 0.05, 4000),
      hit: () => { noise(0.12, 0.16, 1400); tone(180, 60, 0.12, "square", 0.05); },
      heavy: () => { noise(0.25, 0.2, 900); tone(140, 40, 0.25, "sawtooth", 0.06); },
      block: () => tone(700, 500, 0.06, "square", 0.04),
      jump: () => tone(300, 520, 0.08, "triangle", 0.05),
      special: () => tone(220, 880, 0.2, "sawtooth", 0.05),
      ko: () => tone(440, 55, 0.7, "sawtooth", 0.07),
      bell: () => { tone(880, 860, 0.25, "triangle", 0.07); tone(1320, 1300, 0.25, "triangle", 0.04); },
    };

    // Game flow --------------------------------------------------------
    const startRound = () => {
      [[p1, 92, 1], [p2, 164, -1]].forEach(([f, x, facing]) => {
        Object.assign(f, {
          x, facing, h: 0, vx: 0, vh: 0, hp: 100, shownHp: 100, state: "idle", t: 0, move: null,
          moveT: 0, stun: 0, flash: 0, airUsed: false, trail: [],
        });
      });
      particles = [];
      impacts = [];
      game.timer = ROUND_SECONDS * 60;
      game.phase = "intro";
      game.phaseT = 0;
      game.winner = null;
      Object.assign(ai, { cool: 30, block: 0, retreat: 0, reacted: false });
    };

    // Before each match, each human player types a name. The last names used are filled in.
    const startNameEntry = (players) => {
      game.players = players;
      game.phase = "names";
      game.phaseT = 0;
      game.entryIndex = 0;
      game.entryText = p1.name;
    };

    const confirmName = () => {
      const fighter = game.entryIndex === 0 ? p1 : p2;
      fighter.name = game.entryText.trim() || fighter.defaultName;
      if (game.players === 2 && game.entryIndex === 0) {
        game.entryIndex = 1;
        game.entryText = p2.name;
        game.phaseT = 0;
        return;
      }
      if (game.players === 1) p2.name = p2.defaultName;
      startMatch();
    };

    const startMatch = () => {
      game.round = 1;
      p1.wins = 0;
      p2.wins = 0;
      p1.meter = 0;
      p2.meter = 0;
      startRound();
    };

    const endRound = (winner, reason) => {
      game.phase = "ko";
      game.phaseT = 0;
      game.winner = winner;
      game.banner = reason;
      if (winner) winner.wins += 1;
      sfx.ko();
    };

    const readInput = (fighter, map, alsoMap) => {
      const input = blankInput();
      Object.keys(input).forEach((action) => {
        input[action] = keys.has(map[action]) || Boolean(alsoMap && keys.has(alsoMap[action]));
      });
      fighter.input = input;
    };

    const updateAI = (f, o) => {
      const input = blankInput();
      f.input = input;
      if (f.state === "hit" || f.state === "ko" || f.state === "attack") return;
      const dist = Math.abs(o.x - f.x);
      const toward = o.x >= f.x ? "right" : "left";
      const away = toward === "right" ? "left" : "right";
      if (ai.block > 0) {
        ai.block -= 1;
        input.down = true;
        return;
      }
      const threat = o.state === "attack" && movePhase(o) !== "recovery" && dist < 36;
      if (threat && !ai.reacted) {
        ai.reacted = true;
        if (rand() < 0.45) {
          ai.block = 16;
          input.down = true;
          return;
        }
      }
      if (o.state !== "attack") ai.reacted = false;
      ai.cool -= 1;
      if (ai.retreat > 0) {
        ai.retreat -= 1;
        input[away] = true;
        return;
      }
      if (f.meter >= 100 && dist > 20 && dist < 70 && rand() < 0.04) {
        input.special = true;
        return;
      }
      if (dist <= 25) {
        if (ai.cool <= 0) {
          input[rand() < 0.55 ? "punch" : "kick"] = true;
          ai.cool = 18 + rand() * 34;
        } else if (rand() < 0.015) {
          ai.retreat = 18;
        }
        return;
      }
      input[toward] = true;
      if (dist > 45 && dist < 75 && rand() < 0.01) input.up = true;
    };

    const startMove = (f, name) => {
      f.state = "attack";
      f.move = { name, ...MOVES[name] };
      f.moveT = 0;
      f.hasHit = false;
      if (f.h <= 0) f.vx = 0;
      if (name === "special") {
        f.meter = 0;
        sfx.special();
      } else {
        sfx.swing();
      }
    };

    const dust = (x, count = 5) => {
      for (let i = 0; i < count; i += 1) {
        particles.push({ x: x + (rand() - 0.5) * 10, y: GROUND - 1, vx: (rand() - 0.5) * 1.2, vy: -rand() * 0.6, life: 14 + rand() * 8, color: "#7a6aa8", size: 1 });
      }
    };

    const updateFighter = (f, o) => {
      f.t += 1;
      if (f.flash > 0) f.flash -= 1;
      const input = f.input;
      const pressed = (action) => input[action] && !f.prev[action];
      const grounded = f.h <= 0 && f.vh <= 0;

      if (f.state === "hit" || f.state === "block") {
        f.stun -= 1;
        if (f.stun <= 0 && grounded) f.state = input.down ? "crouch" : "idle";
      } else if (f.state === "attack") {
        f.moveT += 1;
        const m = f.move;
        if (m.dash) {
          const phase = movePhase(f);
          f.vx = phase === "active" ? m.dash * f.facing : 0;
          if (phase === "active" && f.t % 2 === 0) f.trail.push({ x: f.x, h: f.h, life: 10 });
        }
        if (m.air) {
          if (f.h <= 0 && f.vh <= 0) f.state = "idle";
        } else if (f.moveT >= m.startup + m.active + m.recovery) {
          f.state = "idle";
        }
      } else if (f.state === "jump") {
        if ((pressed("punch") || pressed("kick")) && !f.airUsed) {
          f.airUsed = true;
          startMove(f, "airKick");
        }
      } else if (f.state === "idle" || f.state === "walk" || f.state === "crouch") {
        f.facing = o.x >= f.x ? 1 : -1;
        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        if (pressed("special") && f.meter >= 100) startMove(f, "special");
        else if (pressed("punch")) startMove(f, "punch");
        else if (pressed("kick")) startMove(f, "kick");
        else if (input.up) {
          f.state = "jump";
          f.vh = 4.3;
          f.vx = dir * 1.5;
          dust(f.x, 4);
          sfx.jump();
        } else if (input.down) {
          f.state = "crouch";
          f.vx = 0;
        } else if (dir) {
          f.state = "walk";
          f.vx = dir * 1.3;
        } else {
          f.state = "idle";
          f.vx = 0;
        }
      }

      f.x += f.vx;
      if (f.h > 0 || f.vh > 0) {
        f.h += f.vh;
        f.vh -= 0.24;
        if (f.h <= 0) {
          f.h = 0;
          f.vh = 0;
          f.airUsed = false;
          if (f.state === "jump" || (f.state === "attack" && f.move.air)) f.state = "idle";
          dust(f.x, f.state === "ko" ? 10 : 4);
          if (f.state === "ko") game.shake = 4;
        }
      }
      if (f.h <= 0 && ["hit", "block", "ko", "win"].includes(f.state)) f.vx *= 0.82;
      f.x = Math.max(14, Math.min(W - 14, f.x));
      f.trail = f.trail.filter((ghost) => (ghost.life -= 1) > 0);
      f.prev = { ...input };
    };

    const separate = () => {
      if (Math.abs(p1.h - p2.h) > 24) return;
      const gap = p2.x - p1.x;
      if (Math.abs(gap) >= 16) return;
      const side = Math.sign(gap) || 1;
      const push = (16 - Math.abs(gap)) / 2;
      p1.x -= side * push;
      p2.x += side * push;
      // If a wall stopped one of them, move the other the rest of the way.
      const clampX = (f) => { f.x = Math.max(14, Math.min(W - 14, f.x)); };
      clampX(p1);
      clampX(p2);
      const left = Math.abs(p2.x - p1.x);
      if (left < 16) {
        if (p1.x <= 14 || p1.x >= W - 14) p2.x = p1.x + side * 16;
        else p1.x = p2.x - side * 16;
        clampX(p1);
        clampX(p2);
      }
    };

    const tryHit = (a, b) => {
      if (a.state !== "attack" || a.hasHit || movePhase(a) !== "active" || b.state === "ko") return;
      const m = a.move;
      const [x0, x1, y0, y1] = m.box;
      const foot = GROUND - a.h;
      const ax0 = a.facing > 0 ? a.x + x0 : a.x - x1;
      const ax1 = a.facing > 0 ? a.x + x1 : a.x - x0;
      const ay0 = foot + y0;
      const ay1 = foot + y1;
      const low = b.state === "crouch" || b.state === "block";
      const bFoot = GROUND - b.h;
      const bx0 = b.x - 7;
      const bx1 = b.x + 7;
      const by0 = bFoot - (low ? 27 : 36);
      const by1 = bFoot;
      if (ax1 < bx0 || ax0 > bx1 || ay1 < by0 || ay0 > by1) return;

      a.hasHit = true;
      const cx = (Math.max(ax0, bx0) + Math.min(ax1, bx1)) / 2;
      const cy = (Math.max(ay0, by0) + Math.min(ay1, by1)) / 2;
      const facingAttacker = b.facing === (a.x >= b.x ? 1 : -1);
      const blocked = low && b.h <= 0 && facingAttacker;
      const heavy = Boolean(m.dash);

      if (blocked) {
        b.hp = Math.max(1, b.hp - m.damage * 0.15);
        b.state = "block";
        b.stun = m.blockstun;
        b.vx = a.facing * m.push * 0.8;
        a.meter = Math.min(100, a.meter + 3);
        b.meter = Math.min(100, b.meter + 5);
        game.hitstop = 3;
        spark(cx, cy, ["#d6ecff", "#6fb6ff"], 6);
        sfx.block();
      } else {
        b.hp = Math.max(0, b.hp - m.damage);
        b.state = "hit";
        b.move = null;
        b.stun = m.hitstun;
        b.flash = 4;
        b.vx = a.facing * m.push;
        if (b.h > 0 || heavy) b.vh = 2.4;
        a.meter = Math.min(100, a.meter + m.meter);
        b.meter = Math.min(100, b.meter + 6);
        game.hitstop = heavy ? 10 : 5;
        game.shake = heavy ? 6 : 3;
        spark(cx, cy, ["#ffffff", "#ffe066", "#ff8a3d"], heavy ? 16 : 9);
        (heavy ? sfx.heavy : sfx.hit)();
        if (b.hp <= 0) {
          b.state = "ko";
          b.vh = 3.4;
          b.vx = a.facing * 2.6;
          game.hitstop = 18;
          game.shake = 8;
          endRound(a, "K.O.");
        }
      }
      if (heavy) a.moveT = m.startup + m.active;
    };

    const spark = (x, y, colors, count) => {
      impacts.push({ x, y, life: 7, color: colors[0] });
      for (let i = 0; i < count; i += 1) {
        const angle = rand() * Math.PI * 2;
        const speed = 0.8 + rand() * 2;
        particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.4,
          life: 10 + rand() * 10, color: colors[Math.floor(rand() * colors.length)], size: rand() > 0.7 ? 2 : 1,
        });
      }
    };

    const step = () => {
      game.phaseT += 1;
      if (game.shake > 0) game.shake -= 0.5;
      [p1, p2].forEach((f) => { f.shownHp = Math.max(f.hp, f.shownHp - 0.6); });

      if (game.phase === "title" || game.phase === "names" || game.phase === "over") return;
      if (!game.focused) return;
      if (game.hitstop > 0) {
        game.hitstop -= 1;
        return;
      }

      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= 1;
        return p.life > 0;
      });
      impacts = impacts.filter((impact) => (impact.life -= 1) > 0);

      if (game.phase === "intro") {
        [p1, p2].forEach((f) => { f.t += 1; });
        if (game.phaseT === 1) sfx.bell();
        if (game.phaseT > 110) {
          game.phase = "fight";
          game.phaseT = 0;
        }
        return;
      }

      if (game.phase === "fight") {
        readInput(p1, KEYMAP.p1, game.players === 1 ? KEYMAP.p2 : null);
        if (game.players === 2) readInput(p2, KEYMAP.p2);
        else updateAI(p2, p1);
        updateFighter(p1, p2);
        updateFighter(p2, p1);
        separate();
        tryHit(p1, p2);
        if (game.phase === "fight") tryHit(p2, p1);
        if (game.phase === "fight") {
          game.timer -= 1;
          if (game.timer <= 0) {
            game.timer = 0;
            const winner = p1.hp === p2.hp ? null : p1.hp > p2.hp ? p1 : p2;
            endRound(winner, "Time");
          }
        }
        return;
      }

      if (game.phase === "ko") {
        // Slow motion for the first second after the knockout.
        const slow = game.phaseT < 60 && game.phaseT % 2 === 1;
        if (!slow) {
          [p1, p2].forEach((f) => {
            f.input = blankInput();
            if (f.state !== "ko") {
              if (f.state === "attack" || f.state === "hit" || f.state === "block" || f.state === "jump") {
                // Let the current action finish before the winner celebrates.
              } else if (f === game.winner) {
                f.state = "win";
              } else {
                f.state = "idle";
              }
            }
            updateFighter(f, f === p1 ? p2 : p1);
            if (f === game.winner && f.state === "idle") f.state = "win";
          });
        }
        if (game.phaseT > 190) {
          if (p1.wins >= WINS_NEEDED || p2.wins >= WINS_NEEDED) {
            game.phase = "over";
            game.phaseT = 0;
          } else {
            game.round += 1;
            startRound();
          }
        }
      }
    };

    // Drawing ----------------------------------------------------------
    const drawBar = (x, y, w, value, shown, alignRight) => {
      ctx.fillStyle = "#120f1f";
      ctx.fillRect(x - 1, y - 1, w + 2, 8);
      ctx.fillStyle = "#3a1630";
      ctx.fillRect(x, y, w, 6);
      const draw = (amount, color) => {
        const width = Math.round((w * amount) / 100);
        ctx.fillStyle = color;
        ctx.fillRect(alignRight ? x + w - width : x, y, width, 6);
      };
      draw(shown, "#ff5d5d");
      draw(value, value > 30 ? "#ffd84a" : "#ff8a3d");
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(x, y, w, 1);
    };

    const drawMeter = (x, f, alignRight) => {
      const y = H - 7;
      const w = 48;
      ctx.fillStyle = "#120f1f";
      ctx.fillRect(x - 1, y - 1, w + 2, 5);
      const width = Math.round((w * f.meter) / 100);
      const full = f.meter >= 100;
      ctx.fillStyle = full ? (Math.floor(game.phaseT / 6) % 2 ? "#ffffff" : f.aura) : f.aura;
      ctx.fillRect(alignRight ? x + w - width : x, y, width, 3);
      if (full) drawText(ctx, "SP", alignRight ? x - 4 : x + w + 4, y - 1, { align: alignRight ? "right" : "left", color: f.aura });
    };

    const drawHud = () => {
      drawBar(8, 7, 100, p1.hp, p1.shownHp, true);
      drawBar(148, 7, 100, p2.hp, p2.shownHp, false);
      ctx.fillStyle = "#120f1f";
      ctx.fillRect(117, 4, 22, 14);
      drawText(ctx, String(Math.ceil(game.timer / 60)).padStart(2, "0"), 128, 6, { scale: 2, align: "center", color: "#ffffff", outline: null });
      drawText(ctx, p1.name, 8, 17, { color: "#ffffff" });
      drawText(ctx, game.players === 1 ? `${p2.name} CPU` : p2.name, 248, 17, { align: "right", color: "#ffffff" });
      for (let i = 0; i < WINS_NEEDED; i += 1) {
        ctx.fillStyle = "#120f1f";
        ctx.fillRect(104 - i * 6, 16, 5, 5);
        ctx.fillRect(147 + i * 6, 16, 5, 5);
        ctx.fillStyle = p1.wins > i ? "#ffd84a" : "#3a3158";
        ctx.fillRect(105 - i * 6, 17, 3, 3);
        ctx.fillStyle = p2.wins > i ? "#ffd84a" : "#3a3158";
        ctx.fillRect(148 + i * 6, 17, 3, 3);
      }
      drawMeter(8, p1, false);
      drawMeter(W - 56, p2, true);
    };

    const drawShadow = (f) => {
      const w = Math.max(6, 18 - f.h / 4);
      ctx.fillStyle = "rgba(10, 6, 24, 0.55)";
      ctx.fillRect(Math.round(f.x - w / 2), GROUND, Math.round(w), 2);
    };

    const banner = (text, y = 50, color = "#ffd84a", scale = 4) => drawText(ctx, text, W / 2, y, { scale, align: "center", color });

    const dim = (alpha) => {
      ctx.fillStyle = `rgba(8, 5, 20, ${alpha})`;
      ctx.fillRect(0, 0, W, H);
    };

    const render = () => {
      const shake = game.shake > 0 ? Math.round((rand() - 0.5) * game.shake) : 0;
      ctx.save();
      ctx.translate(shake, 0);
      ctx.drawImage(background, 0, 0);

      // Blinking antenna light.
      ctx.fillStyle = Math.floor(game.phaseT / 30) % 2 ? "#ff3d5a" : "#5a1a2e";
      ctx.fillRect(33, GROUND - 48, 1, 1);

      const fighters = p1.state === "attack" ? [p2, p1] : [p1, p2];
      fighters.forEach(drawShadow);
      fighters.forEach((f) => {
        f.trail.forEach((ghost) => drawFighter(ctx, f, { x: ghost.x, h: ghost.h, color: f.aura, alpha: ghost.life / 22 }));
        drawFighter(ctx, f);
      });

      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      });
      impacts.forEach((impact) => {
        const r = 8 - impact.life;
        ctx.fillStyle = impact.color;
        const x = Math.round(impact.x);
        const y = Math.round(impact.y);
        ctx.fillRect(x - r, y, r * 2 + 1, 1);
        ctx.fillRect(x, y - r, 1, r * 2 + 1);
        ctx.fillRect(x - 1, y - 1, 3, 3);
      });
      ctx.restore();

      if (game.phase === "title") {
        dim(0.6);
        drawText(ctx, "Rooftop", W / 2, 22, { scale: 5, align: "center", color: "#5ff2e2" });
        drawText(ctx, "Rumble", W / 2, 50, { scale: 5, align: "center", color: "#ff5d73" });
        if (Math.floor(game.phaseT / 30) % 2 === 0 || !game.focused) {
          drawText(ctx, game.focused ? "Enter - 1 player   2 - 2 players" : "Click to play", W / 2, 86, { align: "center", color: "#ffffff" });
        }
        drawText(ctx, "P1  A D move  W jump  S block", W / 2, 102, { align: "center", color: "#b9a8ff" });
        drawText(ctx, "F punch  G kick  H special", W / 2, 110, { align: "center", color: "#b9a8ff" });
        drawText(ctx, "P2  arrows  K L ; ", W / 2, 122, { align: "center", color: "#8f7fd0" });
        drawText(ctx, "M mute", W / 2, 132, { align: "center", color: "#8f7fd0" });
        return;
      }

      if (game.phase === "names") {
        const fighter = game.entryIndex === 0 ? p1 : p2;
        dim(0.65);
        drawText(ctx, `Player ${game.entryIndex + 1}`, W / 2, 26, { scale: 2, align: "center", color: fighter.aura });
        drawText(ctx, "Enter your name", W / 2, 42, { align: "center", color: "#ffffff" });
        const boxW = NAME_LENGTH * 12 + 12;
        ctx.fillStyle = "#120f1f";
        ctx.fillRect(W / 2 - boxW / 2, 54, boxW, 22);
        ctx.fillStyle = fighter.aura;
        ctx.fillRect(W / 2 - boxW / 2, 75, boxW, 1);
        const cursor = game.focused && Math.floor(game.phaseT / 20) % 2 === 0 && game.entryText.length < NAME_LENGTH ? "-" : "";
        drawText(ctx, game.entryText + cursor, W / 2 - boxW / 2 + 6, 58, { scale: 3, color: "#ffffff", outline: null });
        drawText(ctx, "Enter to confirm   Esc back", W / 2, 88, { align: "center", color: "#b9a8ff" });
        if (!game.focused) {
          dim(0.55);
          drawText(ctx, "Click to type", W / 2, 66, { scale: 2, align: "center", color: "#ffffff" });
        }
        return;
      }

      drawHud();

      if (game.phase === "intro") {
        if (game.phaseT < 70) banner(`Round ${game.round}`);
        else banner("Fight!", 50, "#ff5d73");
      } else if (game.phase === "ko" && game.phaseT > 10) {
        banner(game.banner, 40, game.banner === "Time" ? "#ffffff" : "#ff5d73");
        if (game.phaseT > 80) {
          drawText(ctx, game.winner ? `${game.winner.name} wins` : "Draw", W / 2, 68, { scale: 2, align: "center", color: "#ffffff" });
        }
      } else if (game.phase === "over") {
        dim(0.5);
        const champ = p1.wins > p2.wins ? p1 : p2;
        drawText(ctx, `${champ.name}`, W / 2, 34, { scale: 5, align: "center", color: champ.aura });
        drawText(ctx, "wins the rooftop!", W / 2, 64, { scale: 2, align: "center", color: "#ffffff" });
        if (Math.floor(game.phaseT / 30) % 2 === 0) drawText(ctx, "Press Enter", W / 2, 90, { align: "center", color: "#ffd84a" });
      }

      if (!game.focused && game.phase !== "over") {
        dim(0.55);
        drawText(ctx, "Paused", W / 2, 54, { scale: 3, align: "center", color: "#ffffff" });
        drawText(ctx, "Click to keep playing", W / 2, 76, { align: "center", color: "#b9a8ff" });
      }
      if (game.muted) drawText(ctx, "Muted", W / 2, H - 8, { align: "center", color: "#8f7fd0" });
    };

    // Input ------------------------------------------------------------
    canvas.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (game.phase === "names") {
        event.preventDefault();
        const char = event.key.length === 1 ? event.key.toUpperCase() : "";
        if (event.key === "Enter") {
          if (!event.repeat) confirmName();
        } else if (event.key === "Escape") {
          game.phase = "title";
          game.phaseT = 0;
        } else if (event.key === "Backspace") {
          game.entryText = game.entryText.slice(0, -1);
        } else if (char && FONT[char] && game.entryText.length < NAME_LENGTH && !(char === " " && !game.entryText)) {
          game.entryText += char;
        }
        game.phaseT = 0;
        return;
      }
      if (GAME_KEYS.has(event.code)) event.preventDefault();
      keys.add(event.code);
      if (event.repeat) return;
      if (event.code === "KeyM") game.muted = !game.muted;
      if (game.phase === "title") {
        if (event.code === "Enter" || event.code === "Space") startNameEntry(1);
        else if (event.code === "Digit2") startNameEntry(2);
      } else if (game.phase === "over" && (event.code === "Enter" || event.code === "Space")) {
        game.phase = "title";
        game.phaseT = 0;
      }
    });
    canvas.addEventListener("keyup", (event) => keys.delete(event.code));
    canvas.addEventListener("focus", () => { game.focused = true; });
    canvas.addEventListener("blur", () => {
      game.focused = false;
      keys.clear();
    });

    // Title screen shows the two fighters squaring off.
    p1.x = 92;
    p2.x = 164;
    p2.facing = -1;

    let last = performance.now();
    let pending = 0;
    const frame = (now) => {
      if (!canvas.isConnected) return;
      pending = Math.min(pending + now - last, STEP * 5);
      last = now;
      while (pending >= STEP) {
        step();
        pending -= STEP;
      }
      render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  },
};
