const SVG = "http://www.w3.org/2000/svg";

const PALETTES = [
  {
    name: "Sakura Pink",
    petalOuter: "#ff85a2",
    petalInner: "#ffb3c6",
    center: "#ffe066",
    seeds: "#d48b04",
    stem: "#489e63",
    pot: "#d97736",
  },
  {
    name: "Sunflower",
    petalOuter: "#fbb02d",
    petalInner: "#ffcf48",
    center: "#5c3317",
    seeds: "#8b4513",
    stem: "#3f8a54",
    pot: "#b45309",
  },
  {
    name: "Morning Glory",
    petalOuter: "#4361ee",
    petalInner: "#7209b7",
    center: "#f72585",
    seeds: "#fee440",
    stem: "#2d6a4f",
    pot: "#3f37c9",
  },
  {
    name: "Poppy Scarlet",
    petalOuter: "#e63946",
    petalInner: "#ff6b6b",
    center: "#1d3557",
    seeds: "#457b9d",
    stem: "#2a9d8f",
    pot: "#8d5b4c",
  },
  {
    name: "Lavender Mist",
    petalOuter: "#9d4edd",
    petalInner: "#c77dff",
    center: "#e0aaff",
    seeds: "#5a189a",
    stem: "#52b788",
    pot: "#7b2cbf",
  },
];

const PETAL_COUNTS = [6, 8, 12, 16];

export default {
  student: "Michelle Wong",
  title: "Blooming flower",
  width: 320,
  height: 280,
  mount(root) {
    let currentPaletteIndex = 0;
    let currentPetalCountIndex = 1; // 8 petals
    let bloomCount = 0;
    let stemBend = 0;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        user-select: none;
        overflow: hidden;
        background: transparent;
        font-family: "IBM Plex Mono", monospace;
      }
      .garden {
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .flower-head {
        transform-box: fill-box;
        transform-origin: center;
        transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .flower-head.is-blooming {
        animation: bloom-burst 650ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .leaf {
        transform-box: fill-box;
        transform-origin: bottom center;
        animation: leaf-breeze 4s ease-in-out infinite alternate;
      }
      .leaf-left {
        animation-delay: -1.5s;
      }
      .sparkle {
        position: absolute;
        pointer-events: none;
        animation: float-up 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        font-size: 11px;
        border-top: 1px dashed currentColor;
        opacity: 0.85;
      }
      .btn {
        background: none;
        border: 1px solid currentColor;
        color: inherit;
        font: inherit;
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: transform 120ms ease, background-color 160ms ease;
      }
      .btn:hover {
        background: rgba(127, 127, 127, 0.15);
      }
      .btn:active {
        transform: scale(0.95);
      }
      .counter {
        font-weight: 500;
      }

      @keyframes bloom-burst {
        0% { transform: scale(1) rotate(0deg); }
        35% { transform: scale(0.85) rotate(-20deg); }
        70% { transform: scale(1.18) rotate(25deg); }
        100% { transform: scale(1) rotate(0deg); }
      }

      @keyframes leaf-breeze {
        0% { transform: rotate(-4deg); }
        100% { transform: rotate(5deg); }
      }

      @keyframes float-up {
        0% {
          opacity: 1;
          transform: translate(0, 0) scale(0.6) rotate(0deg);
        }
        100% {
          opacity: 0;
          transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(var(--dr));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .flower-head.is-blooming { animation: none; }
        .leaf { animation: none; }
        .flower-head { transition: none; }
      }
    `;

    const container = document.createElement("div");
    container.className = "garden";

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 240 200");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Interactive blooming flower");

    // Pot at bottom
    const potGroup = document.createElementNS(SVG, "g");
    potGroup.innerHTML = `
      <polygon points="90,188 150,188 158,154 82,154" class="pot-body" fill="#d97736" />
      <rect x="78" y="148" width="84" height="7" rx="3.5" class="pot-rim" fill="#b45309" />
      <ellipse cx="120" cy="154" rx="34" ry="4" fill="#3f2314" />
    `;

    // Stem path
    const stem = document.createElementNS(SVG, "path");
    stem.setAttribute("stroke-width", "5");
    stem.setAttribute("stroke-linecap", "round");
    stem.setAttribute("fill", "none");

    // Leaves
    const leafLeft = document.createElementNS(SVG, "path");
    leafLeft.setAttribute("class", "leaf leaf-left");
    leafLeft.setAttribute("d", "M 118 135 C 95 130 80 115 82 98 C 98 100 112 115 118 130 Z");

    const leafRight = document.createElementNS(SVG, "path");
    leafRight.setAttribute("class", "leaf leaf-right");
    leafRight.setAttribute("d", "M 122 120 C 145 115 160 100 158 83 C 142 85 128 100 122 115 Z");

    // Flower head group centered at (120, 68)
    const flowerHead = document.createElementNS(SVG, "g");
    flowerHead.setAttribute("class", "flower-head");
    flowerHead.setAttribute("transform-origin", "120 68");

    const petalsGroup = document.createElementNS(SVG, "g");
    const centerGroup = document.createElementNS(SVG, "g");

    flowerHead.append(petalsGroup, centerGroup);
    svg.append(stem, leafLeft, leafRight, potGroup, flowerHead);
    container.append(svg);

    // Toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    const bloomBtn = document.createElement("button");
    bloomBtn.className = "btn";
    bloomBtn.type = "button";
    bloomBtn.innerHTML = `<span>🌸</span><span>Bloom</span>`;

    const colorBtn = document.createElement("button");
    colorBtn.className = "btn";
    colorBtn.type = "button";
    colorBtn.innerHTML = `<span>🎨</span><span class="color-name">Sakura</span>`;

    const countBtn = document.createElement("button");
    countBtn.className = "btn";
    countBtn.type = "button";
    countBtn.innerHTML = `<span>✨</span><span class="petal-count">8p</span>`;

    const counter = document.createElement("span");
    counter.className = "counter";
    counter.textContent = `0 blooms`;

    toolbar.append(bloomBtn, colorBtn, countBtn, counter);

    root.append(style, container, toolbar);

    const updateStem = (bend = 0) => {
      const headX = 120 + bend;
      const headY = 68;
      stem.setAttribute("d", `M 120 152 Q ${120 + bend * 0.4} 115, ${headX} ${headY}`);
      flowerHead.setAttribute("transform", `translate(${bend}, 0) rotate(${bend * 0.6} 120 68)`);
    };

    const renderPetals = () => {
      petalsGroup.innerHTML = "";
      centerGroup.innerHTML = "";
      const palette = PALETTES[currentPaletteIndex];
      const count = PETAL_COUNTS[currentPetalCountIndex];

      // Update palette colors on stem and pot
      stem.setAttribute("stroke", palette.stem);
      leafLeft.setAttribute("fill", palette.stem);
      leafRight.setAttribute("fill", palette.stem);
      const potBody = potGroup.querySelector(".pot-body");
      if (potBody) potBody.setAttribute("fill", palette.pot);

      // Outer petals
      for (let i = 0; i < count; i += 1) {
        const angle = (360 / count) * i;
        const petal = document.createElementNS(SVG, "path");
        petal.setAttribute("d", "M 120 68 C 108 42, 110 18, 120 8 C 130 18, 132 42, 120 68 Z");
        petal.setAttribute("fill", palette.petalOuter);
        petal.setAttribute("transform", `rotate(${angle} 120 68)`);
        petal.setAttribute("opacity", "0.95");
        petalsGroup.append(petal);
      }

      // Inner petals (offset angle, slightly smaller)
      for (let i = 0; i < count; i += 1) {
        const angle = (360 / count) * i + 180 / count;
        const petal = document.createElementNS(SVG, "path");
        petal.setAttribute("d", "M 120 68 C 111 48, 113 28, 120 20 C 127 28, 129 48, 120 68 Z");
        petal.setAttribute("fill", palette.petalInner);
        petal.setAttribute("transform", `rotate(${angle} 120 68)`);
        petal.setAttribute("opacity", "0.9");
        petalsGroup.append(petal);
      }

      // Center disc
      const center = document.createElementNS(SVG, "circle");
      center.setAttribute("cx", "120");
      center.setAttribute("cy", "68");
      center.setAttribute("r", "16");
      center.setAttribute("fill", palette.center);
      centerGroup.append(center);

      // Spiral seeds
      const goldenAngle = 137.5 * (Math.PI / 180);
      for (let i = 1; i <= 14; i += 1) {
        const r = 3.2 * Math.sqrt(i);
        const theta = i * goldenAngle;
        const dot = document.createElementNS(SVG, "circle");
        dot.setAttribute("cx", (120 + r * Math.cos(theta)).toFixed(1));
        dot.setAttribute("cy", (68 + r * Math.sin(theta)).toFixed(1));
        dot.setAttribute("r", "1.6");
        dot.setAttribute("fill", palette.seeds);
        centerGroup.append(dot);
      }
    };

    const spawnSparkles = () => {
      const palette = PALETTES[currentPaletteIndex];
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2 + stemBend * (rect.width / 240);
      const centerY = rect.height * 0.35;

      for (let i = 0; i < 7; i += 1) {
        const sparkle = document.createElement("span");
        sparkle.className = "sparkle";
        const symbols = ["🌸", "✨", " petal ", "🌼", "•"];
        const symbol = symbols[i % symbols.length];
        if (symbol === " petal ") {
          sparkle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1 C3 4 3 8 6 11 C9 8 9 4 6 1 Z" fill="${palette.petalOuter}" /></svg>`;
        } else {
          sparkle.textContent = symbol;
          sparkle.style.fontSize = `${10 + Math.random() * 8}px`;
        }

        const dx = (Math.random() - 0.5) * 90;
        const dy = -30 - Math.random() * 60;
        const dr = (Math.random() - 0.5) * 360;

        sparkle.style.left = `${centerX + (Math.random() - 0.5) * 30}px`;
        sparkle.style.top = `${centerY + (Math.random() - 0.5) * 20}px`;
        sparkle.style.setProperty("--dx", `${dx}px`);
        sparkle.style.setProperty("--dy", `${dy}px`);
        sparkle.style.setProperty("--dr", `${dr}deg`);

        container.append(sparkle);
        sparkle.addEventListener("animationend", () => sparkle.remove());
      }
    };

    const triggerBloom = () => {
      bloomCount += 1;
      counter.textContent = `${bloomCount} ${bloomCount === 1 ? "bloom" : "blooms"}`;

      flowerHead.classList.remove("is-blooming");
      void flowerHead.getBoundingClientRect();
      flowerHead.classList.add("is-blooming");

      spawnSparkles();
    };

    flowerHead.addEventListener("animationend", () => {
      flowerHead.classList.remove("is-blooming");
    });

    container.addEventListener("click", triggerBloom);
    bloomBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerBloom();
    });

    colorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
      colorBtn.querySelector(".color-name").textContent = PALETTES[currentPaletteIndex].name.split(" ")[0];
      renderPetals();
      triggerBloom();
    });

    countBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPetalCountIndex = (currentPetalCountIndex + 1) % PETAL_COUNTS.length;
      countBtn.querySelector(".petal-count").textContent = `${PETAL_COUNTS[currentPetalCountIndex]}p`;
      renderPetals();
      triggerBloom();
    });

    // Pointer tracking for organic stem sway
    container.addEventListener("pointermove", (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const relX = (e.clientX - rect.left) / rect.width; // 0 to 1
      const targetBend = (relX - 0.5) * 44; // -22 to +22 px
      stemBend += (targetBend - stemBend) * 0.2;
      updateStem(stemBend);
    });

    container.addEventListener("pointerleave", () => {
      stemBend = 0;
      updateStem(0);
    });

    // Initialize
    updateStem(0);
    renderPetals();
  },
};
