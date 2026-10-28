const PIXEL = 5;
const GRAVITY = 0.12;
const SLEEP_AFTER = 5000;
const GROUND = 6;
const MAX_CARROTS = 3;
const CARROT_EVERY = 20000;
const BITE_EVERY = 450;

const COLORS = {
  w: "#fbf7ef",
  s: "#d9d0c4",
  p: "#f4a7b9",
  e: "#2b1d2e",
  n: "#e86f8f",
};
const CARROT_COLORS = { g: "#4fae3a", o: "#f28a2e", d: "#d0661c" };
const HEART = "#ff6f9f";
const SNORE = "#fbf7ef";

// Each letter is a color from COLORS; "." is see-through. The bunny faces right.
const EARS = [
  ".....ww.ww..",
  ".....wp.wp..",
  ".....wp.wp..",
  ".....wp.wp..",
  "......ww.ww.",
];
const BODY = [
  "......wwwww.",
  ".....wwwwewn",
  ".wwwwwwwwwww",
  "wwwwwwwwwww.",
  ".wwwwwwwwws.",
  ".wwssssssss.",
];
const EARS_DOWN = [
  "............",
  "............",
  "............",
  "............",
  "...wppppww..",
];
const FEET = { ground: "..ss...sss..", air: ".ss.....ss.." };
const bunny = ({ eyesShut, airborne, asleep }) => {
  const body = BODY.map((row) => (eyesShut ? row.replace("e", "s") : row));
  return [...(asleep ? EARS_DOWN : EARS), ...body, airborne ? FEET.air : FEET.ground];
};
const BUNNY_WIDTH = EARS[0].length;
const BUNNY_HEIGHT = EARS.length + BODY.length + 1;
const HEART_PIXELS = [".#.#.", "#####", ".###.", "..#.."];
const SMALL_Z = ["###", "..#", ".#.", "###"];
const BIG_Z = ["####", "..#.", ".#..", "####"];
// The carrot lies on its side with its leaves on the left; bites come off the tip.
const CARROT = [
  "g.......",
  ".gooo...",
  "ggoodooo",
  ".gooo...",
  "g.......",
];
const CARROT_WIDTH = CARROT[0].length;
const CARROT_ICON = `
  <svg viewBox="0 0 5 8" shape-rendering="crispEdges" aria-hidden="true">
    <path fill="${CARROT_COLORS.g}" d="M0 0h1v1H0zM2 0h1v2H2zM4 0h1v1H4zM1 1h1v1H1zM3 1h1v1H3z" />
    <path fill="${CARROT_COLORS.o}" d="M1 2h3v3H1zM2 5h1v3H2z" />
  </svg>
`;

const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const drawForest = (context, width, height) => {
  const random = seeded(7);
  const groundTop = height - GROUND;

  ["#cdeefc", "#b6e3f7", "#9fd6ef"].forEach((color, index, bands) => {
    context.fillStyle = color;
    const top = Math.floor((groundTop * index) / bands.length);
    context.fillRect(0, top, width, groundTop - top);
  });

  const pine = (centerX, baseY, treeHeight, leaves, trunk) => {
    context.fillStyle = trunk;
    context.fillRect(centerX - 1, baseY - 3, 2, 3);
    context.fillStyle = leaves;
    const tiers = 3;
    const tierHeight = Math.floor((treeHeight - 3) / tiers) + 2;
    for (let tier = 0; tier < tiers; tier += 1) {
      const tierTop = baseY - 3 - (tiers - tier) * (tierHeight - 2);
      for (let row = 0; row < tierHeight; row += 1) {
        const half = Math.floor((row + tier * 2) / 1.6) + 1;
        context.fillRect(centerX - half, tierTop + row, half * 2, 1);
      }
    }
  };

  for (let x = -4; x < width + 8; x += 6 + Math.floor(random() * 4)) {
    pine(x, groundTop, 18 + Math.floor(random() * 10), "#7fb894", "#6e8f7a");
  }
  for (let x = 2; x < width + 8; x += 12 + Math.floor(random() * 8)) {
    pine(x, groundTop + 1, 24 + Math.floor(random() * 10), "#2f6b4f", "#5a3a26");
  }

  context.fillStyle = "#4f9a3a";
  context.fillRect(0, groundTop, width, GROUND);
  context.fillStyle = "#74c04f";
  context.fillRect(0, groundTop, width, 1);
  for (let x = 0; x < width; x += 1) {
    const roll = random();
    if (roll < 0.25) {
      context.fillStyle = "#74c04f";
      context.fillRect(x, groundTop - 1, 1, 1);
    } else if (roll < 0.3) {
      context.fillStyle = random() < 0.5 ? "#ffd84d" : "#ff9ec4";
      context.fillRect(x, groundTop + 2 + Math.floor(random() * (GROUND - 3)), 1, 1);
    }
  }

  const mushroomX = Math.floor(width * 0.18);
  context.fillStyle = "#fbf7ef";
  context.fillRect(mushroomX, groundTop - 2, 1, 2);
  context.fillStyle = "#d6453d";
  context.fillRect(mushroomX - 1, groundTop - 3, 3, 1);
  context.fillRect(mushroomX - 2, groundTop - 2, 1, 1);
  context.fillRect(mushroomX + 2, groundTop - 2, 1, 1);
};

export default {
  student: "Vivan Nadkarni",
  title: "Forest bunny",
  width: 480,
  height: 320,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      .scene {
        position: relative;
        height: 100%;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        cursor: pointer;
        touch-action: none;
      }
      .feed {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border: 2px solid #1f3b2c;
        border-radius: 0;
        background: #fbf7ef;
        color: #1f3b2c;
        font: 500 12px "IBM Plex Mono", monospace;
        cursor: pointer;
        box-shadow: 3px 3px 0 #1f3b2c;
      }
      .feed:active:not(:disabled) {
        transform: translate(2px, 2px);
        box-shadow: 1px 1px 0 #1f3b2c;
      }
      .feed:disabled {
        cursor: default;
        opacity: 0.75;
      }
      .feed:focus-visible {
        outline: 2px solid #f28a2e;
        outline-offset: 2px;
      }
      .carrots {
        display: flex;
        gap: 3px;
      }
      .carrots svg {
        width: 10px;
        height: 16px;
      }
      .carrots svg.is-empty {
        opacity: 0.25;
        filter: grayscale(1);
      }
    `;
    const scene = document.createElement("div");
    scene.className = "scene";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "A pixel bunny in a forest that hops after your cursor. Click to make it jump.");
    const feedButton = document.createElement("button");
    feedButton.type = "button";
    feedButton.className = "feed";
    scene.append(canvas, feedButton);
    root.append(style, scene);

    const context = canvas.getContext("2d");
    const forest = document.createElement("canvas");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pet = { x: 0, y: 0, vy: 0, facing: 1 };
    let targetX = null;
    let hearts = [];
    let crumbs = [];
    let carrot = null;
    let carrots = 1;
    let nextCarrotAt = performance.now() + CARROT_EVERY;
    let lastActive = performance.now();
    let blinkUntil = 0;
    let nextBlink = performance.now() + 2000;

    const groundTop = () => canvas.height - GROUND;
    const floor = () => groundTop() - BUNNY_HEIGHT + 1;
    const resize = () => {
      const width = Math.max(Math.floor(canvas.clientWidth / PIXEL), 24);
      const height = Math.max(Math.floor(canvas.clientHeight / PIXEL), 24);
      if (width === canvas.width && height === canvas.height) return;
      canvas.width = forest.width = width;
      canvas.height = forest.height = height;
      drawForest(forest.getContext("2d"), width, height);
      pet.x = pet.x || Math.round(width / 2 - BUNNY_WIDTH / 2);
      pet.y = floor();
    };
    new ResizeObserver(resize).observe(canvas);

    const renderFeedButton = () => {
      const icons = Array.from({ length: MAX_CARROTS }, (_, index) =>
        CARROT_ICON.replace("<svg", `<svg class="${index < carrots ? "" : "is-empty"}"`)).join("");
      const label = carrot ? "Munching…" : carrots ? "Feed" : "Growing…";
      feedButton.innerHTML = `<span>${label}</span><span class="carrots">${icons}</span>`;
      feedButton.disabled = Boolean(carrot) || carrots === 0;
      feedButton.setAttribute("aria-label", `Feed the bunny a carrot. ${carrots} of ${MAX_CARROTS} carrots left.`);
    };

    const addHearts = (x, y, count) => {
      for (let index = 0; index < count; index += 1) {
        hearts.push({ x: x + Math.random() * 6, y, vx: (Math.random() - 0.5) * 0.4, life: 1 });
      }
    };

    feedButton.addEventListener("click", () => {
      if (carrot || carrots === 0) return;
      carrots -= 1;
      if (carrots === MAX_CARROTS - 1) nextCarrotAt = performance.now() + CARROT_EVERY;
      const margin = BUNNY_WIDTH + 2;
      carrot = {
        x: Math.round(margin + Math.random() * (canvas.width - CARROT_WIDTH - margin * 2)),
        y: reduceMotion.matches ? groundTop() - CARROT.length + 1 : -CARROT.length,
        vy: 0,
        bites: 0,
        nextBite: 0,
      };
      lastActive = performance.now();
      renderFeedButton();
    });

    const toCanvasX = (event) => {
      const rect = canvas.getBoundingClientRect();
      return ((event.clientX - rect.left) / rect.width) * canvas.width - BUNNY_WIDTH / 2;
    };

    canvas.addEventListener("pointermove", (event) => {
      targetX = toCanvasX(event);
      lastActive = performance.now();
    });
    canvas.addEventListener("pointerleave", () => {
      targetX = null;
    });
    canvas.addEventListener("pointerdown", (event) => {
      targetX = toCanvasX(event);
      lastActive = performance.now();
      if (pet.y >= floor()) pet.vy = reduceMotion.matches ? 0 : -2.2;
      addHearts(pet.x + 3, pet.y - 4, 3);
    });

    const drawPixels = (rows, left, top, colors, flip = false) => {
      rows.forEach((row, rowIndex) => {
        [...row].forEach((cell, columnIndex) => {
          const color = colors[cell];
          if (!color) return;
          const column = flip ? row.length - 1 - columnIndex : columnIndex;
          context.fillStyle = color;
          context.fillRect(Math.round(left) + column, Math.round(top) + rowIndex, 1, 1);
        });
      });
    };

    // The carrot's tip points at the bunny, and the bunny stops nose to tip.
    const carrotLayout = () => {
      const remaining = CARROT_WIDTH - carrot.bites * 2;
      const tipLeft = pet.x + BUNNY_WIDTH / 2 < carrot.x + CARROT_WIDTH / 2;
      const left = tipLeft ? carrot.x + carrot.bites * 2 : carrot.x;
      const eatAt = tipLeft ? left - BUNNY_WIDTH + 1 : left + remaining - 1;
      return { remaining, tipLeft, left, eatAt };
    };

    let lastTime = performance.now();
    const tick = (now) => {
      const delta = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      if (carrots < MAX_CARROTS && now >= nextCarrotAt) {
        carrots += 1;
        nextCarrotAt = now + CARROT_EVERY;
        renderFeedButton();
      }

      const landed = carrot && carrot.y >= groundTop() - CARROT.length + 1;
      if (carrot && !landed) {
        carrot.vy += GRAVITY * delta;
        carrot.y = Math.min(carrot.y + carrot.vy * delta, groundTop() - CARROT.length + 1);
      }
      const layout = carrot && carrotLayout();

      const asleep = !carrot && now - lastActive > SLEEP_AFTER;
      const grounded = pet.y >= floor();
      const goal = landed ? layout.eatAt : asleep ? null : targetX;

      if (goal !== null) {
        const distance = goal - pet.x;
        if (Math.abs(distance) > 1) {
          pet.facing = Math.sign(distance);
          // Bunnies hop: they only move forward while in the air.
          if (grounded) pet.vy = reduceMotion.matches ? 0 : -1.1;
          if (!grounded || reduceMotion.matches) {
            pet.x += Math.sign(distance) * Math.min(Math.abs(distance), 0.7 * delta);
          }
        } else if (landed && grounded) {
          pet.facing = layout.tipLeft ? 1 : -1;
          if (now >= carrot.nextBite) {
            carrot.bites += carrot.nextBite ? 1 : 0;
            carrot.nextBite = now + BITE_EVERY;
            const tipX = layout.tipLeft ? layout.left : layout.left + layout.remaining - 1;
            for (let index = 0; index < 3; index += 1) {
              crumbs.push({ x: tipX, y: carrot.y + 2, vx: (Math.random() - 0.5) * 0.8, vy: -0.8 - Math.random() * 0.6 });
            }
            if (CARROT_WIDTH - carrot.bites * 2 <= 0) {
              addHearts(pet.x + 3, pet.y + 2, 5);
              carrot = null;
              lastActive = now;
              renderFeedButton();
            }
          }
        }
      }
      pet.x = Math.min(Math.max(pet.x, 1), canvas.width - BUNNY_WIDTH - 1);
      pet.vy += GRAVITY * delta;
      pet.y = Math.min(pet.y + pet.vy * delta, floor());
      if (pet.y >= floor()) pet.vy = 0;

      if (now > nextBlink) {
        blinkUntil = now + 140;
        nextBlink = now + 2000 + Math.random() * 3000;
      }
      const sprite = bunny({
        eyesShut: asleep || now < blinkUntil,
        airborne: pet.y < floor() - 0.5,
        asleep,
      });

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(forest, 0, 0);

      if (carrot) {
        const { remaining, tipLeft, left } = carrotLayout();
        const rows = CARROT.map((row) => row.slice(0, remaining));
        drawPixels(rows, left, carrot.y, CARROT_COLORS, tipLeft);
      }

      // Hearts sit behind the bunny so they float out from it instead of covering it.
      hearts = hearts.filter((heart) => heart.life > 0);
      hearts.forEach((heart) => {
        heart.x += heart.vx * delta;
        heart.y -= 0.35 * delta;
        heart.life -= 0.015 * delta;
        context.globalAlpha = Math.max(heart.life, 0);
        drawPixels(HEART_PIXELS, heart.x, heart.y, { "#": HEART });
        context.globalAlpha = 1;
      });

      drawPixels(sprite, pet.x, pet.y, COLORS, pet.facing < 0);

      crumbs = crumbs.filter((crumb) => crumb.y < groundTop());
      crumbs.forEach((crumb) => {
        crumb.x += crumb.vx * delta;
        crumb.vy += GRAVITY * delta;
        crumb.y += crumb.vy * delta;
        context.fillStyle = CARROT_COLORS.o;
        context.fillRect(Math.round(crumb.x), Math.round(crumb.y), 1, 1);
      });

      if (asleep) {
        const drift = reduceMotion.matches ? 0 : Math.floor(now / 400) % 3;
        const snoreX = pet.facing < 0 ? pet.x - 7 : pet.x + BUNNY_WIDTH;
        drawPixels(SMALL_Z, snoreX, pet.y + 2 - drift, { "#": SNORE });
        drawPixels(BIG_Z, snoreX + 3, pet.y - 3 - drift, { "#": SNORE });
      }

      requestAnimationFrame(tick);
    };
    resize();
    renderFeedButton();
    requestAnimationFrame(tick);
  },
};
