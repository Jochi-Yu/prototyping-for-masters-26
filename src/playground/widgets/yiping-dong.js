const SVG_NS = "http://www.w3.org/2000/svg";

const MOODS = {
  spark: {
    name: "Sparkling",
    emoji: "✨",
    particles: ["✨", "⭐", "🌟", "💛"],
    glowStart: "#fef08a",
    glowEnd: "#f59e0b",
    mouthD: "M 60 96 Q 80 120 100 96",
    browLeftD: "M 46 52 Q 56 46 66 52",
    browRightD: "M 94 52 Q 104 46 114 52",
    cheeks: "#f59e0b",
  },
  love: {
    name: "In Love",
    emoji: "💖",
    particles: ["💖", "🥰", "💕", "🌸", "✨"],
    glowStart: "#fecdd3",
    glowEnd: "#f43f5e",
    mouthD: "M 66 100 Q 80 116 94 100",
    browLeftD: "M 46 50 Q 56 48 66 54",
    browRightD: "M 94 54 Q 104 48 114 50",
    cheeks: "#fb7185",
  },
  hype: {
    name: "On Fire",
    emoji: "🔥",
    particles: ["🔥", "⚡", "💥", "🚀", "🌶️"],
    glowStart: "#fed7aa",
    glowEnd: "#ea580c",
    mouthD: "M 60 92 Q 80 126 100 92",
    browLeftD: "M 46 48 Q 56 52 66 56",
    browRightD: "M 94 56 Q 104 52 114 48",
    cheeks: "#ea580c",
  },
  party: {
    name: "Party Time",
    emoji: "🎉",
    particles: ["🎉", "🥳", "🪩", "🎊", "✨"],
    glowStart: "#e9d5ff",
    glowEnd: "#a855f7",
    mouthD: "M 64 96 Q 80 124 96 96",
    browLeftD: "M 46 50 Q 56 44 66 50",
    browRightD: "M 94 50 Q 104 44 114 50",
    cheeks: "#c084fc",
  },
  chill: {
    name: "Super Chill",
    emoji: "😎",
    particles: ["😎", "🧊", "🌊", "🤙", "🕶️"],
    glowStart: "#bae6fd",
    glowEnd: "#0284c7",
    mouthD: "M 64 102 Q 78 102 96 96",
    browLeftD: "M 46 50 Q 56 50 66 50",
    browRightD: "M 94 46 Q 104 44 114 48",
    cheeks: "#38bdf8",
  },
  cozy: {
    name: "Cozy & Sleepy",
    emoji: "🌙",
    particles: ["💤", "🌙", "⭐", "☁️", "😴"],
    glowStart: "#c7d2fe",
    glowEnd: "#6366f1",
    mouthD: "M 72 102 Q 80 106 88 102",
    browLeftD: "M 46 54 Q 56 52 66 50",
    browRightD: "M 94 50 Q 104 52 114 54",
    cheeks: "#818cf8",
  },
};

export default {
  student: "Yiping Dong",
  title: "Emote Reactor",
  frame: true,
  width: 300,
  height: 310,
  rotate: 1.5,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--paper, #fff);
        color: var(--ink, #111);
        font-family: "IBM Plex Mono", monospace;
        user-select: none;
        overflow: hidden;
      }

      .station {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0.65rem;
        gap: 0.55rem;
        box-sizing: border-box;
      }

      .stage-wrapper {
        position: relative;
        flex: 1;
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        touch-action: manipulation;
        border-radius: 8px;
        background: color-mix(in srgb, var(--ink) 3%, transparent);
        border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
        overflow: hidden;
      }

      .stage-wrapper:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: -2px;
      }

      .combo-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.68rem;
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--paper) 80%, var(--ink));
        border: 1px solid var(--line, rgba(0, 0, 0, 0.15));
        color: var(--ink);
        pointer-events: none;
        opacity: 0;
        transform: scale(0.85);
        transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease;
        z-index: 2;
      }

      .combo-badge.is-active {
        opacity: 1;
        transform: scale(1);
      }

      .particles-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .particle {
        position: absolute;
        font-size: 1.35rem;
        pointer-events: none;
        will-change: transform, opacity;
        animation: floatUp 850ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
      }

      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translate(var(--dx-start, 0), var(--dy-start, 0)) scale(0.6) rotate(0deg);
        }
        70% {
          opacity: 0.95;
        }
        100% {
          opacity: 0;
          transform: translate(var(--dx-end, 0), var(--dy-end, -70px)) scale(1.3) rotate(var(--rot, 15deg));
        }
      }

      .avatar-svg {
        width: 140px;
        height: 140px;
        overflow: visible;
        pointer-events: none;
      }

      .face-group {
        transform-origin: 80px 80px;
        will-change: transform;
      }

      .face-group.squish {
        animation: squish 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes squish {
        0% { transform: scale(1, 1); }
        30% { transform: scale(1.18, 0.82); }
        60% { transform: scale(0.88, 1.12); }
        100% { transform: scale(1, 1); }
      }

      .head-base {
        stroke: var(--ink, #111);
        stroke-width: 3;
        transition: fill 400ms ease;
      }

      .cheek {
        transition: fill 300ms ease;
      }

      .eye-white {
        fill: #ffffff;
        stroke: var(--ink, #111);
        stroke-width: 2.5;
      }

      .pupil-track {
        transition: transform 90ms ease-out;
      }

      .pupil {
        fill: var(--ink, #111);
      }

      .pupil-glint {
        fill: #ffffff;
      }

      .mouth, .brow {
        fill: none;
        stroke: var(--ink, #111);
        stroke-width: 3.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: d 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .brow {
        stroke-width: 3;
      }

      .poke-hint {
        position: absolute;
        bottom: 6px;
        font-size: 0.65rem;
        opacity: 0.45;
        letter-spacing: 0.04em;
        pointer-events: none;
      }

      .dock {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.35rem;
      }

      .emote-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.45rem 0.25rem;
        border: 1px solid var(--line, rgba(0, 0, 0, 0.15));
        background: color-mix(in srgb, var(--paper) 90%, var(--ink));
        color: var(--ink);
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 500;
        cursor: pointer;
        transition: transform 120ms ease, background-color 150ms ease, border-color 150ms ease;
        touch-action: manipulation;
      }

      .emote-btn:hover {
        background: color-mix(in srgb, var(--paper) 70%, var(--ink));
        transform: translateY(-1px);
      }

      .emote-btn:active {
        transform: scale(0.94);
      }

      .emote-btn.is-selected {
        border-color: var(--ink);
        background: color-mix(in srgb, var(--ink) 12%, var(--paper));
        font-weight: 600;
      }

      .emote-btn:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 1px;
      }

      .emote-btn-emoji {
        font-size: 1rem;
        line-height: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .face-group.squish { animation: none; }
        .particle { animation-duration: 400ms; }
        .mouth, .brow, .pupil-track { transition: none; }
      }
    `;

    const container = document.createElement("div");
    container.className = "station";
    container.innerHTML = `
      <div class="stage-wrapper" id="stageWrapper" role="button" tabindex="0" aria-label="Poke the emote avatar" data-no-drag="true">
        <div class="combo-badge" id="comboBadge" aria-hidden="true">1x COMBO 🔥</div>
        <div class="particles-layer" id="particlesLayer"></div>
        <svg class="avatar-svg" viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <radialGradient id="faceGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" id="gradStart" stop-color="${MOODS.spark.glowStart}" />
              <stop offset="100%" id="gradEnd" stop-color="${MOODS.spark.glowEnd}" />
            </radialGradient>
          </defs>
          <g class="face-group" id="faceGroup">
            <circle class="head-base" cx="80" cy="80" r="56" fill="url(#faceGrad)" />
            <ellipse class="cheek cheek-left" id="cheekLeft" cx="48" cy="92" rx="7" ry="4" fill="${MOODS.spark.cheeks}" />
            <ellipse class="cheek cheek-right" id="cheekRight" cx="112" cy="92" rx="7" ry="4" fill="${MOODS.spark.cheeks}" />
            
            <g class="eye-left">
              <ellipse class="eye-white" cx="58" cy="72" rx="11" ry="14" />
              <g class="pupil-track" id="pupilLeft">
                <circle class="pupil" cx="58" cy="72" r="6" />
                <circle class="pupil-glint" cx="56" cy="69" r="2" />
              </g>
            </g>

            <g class="eye-right">
              <ellipse class="eye-white" cx="102" cy="72" rx="11" ry="14" />
              <g class="pupil-track" id="pupilRight">
                <circle class="pupil" cx="102" cy="72" r="6" />
                <circle class="pupil-glint" cx="100" cy="69" r="2" />
              </g>
            </g>

            <path class="mouth" id="mouth" d="${MOODS.spark.mouthD}" />
            <path class="brow brow-left" id="browLeft" d="${MOODS.spark.browLeftD}" />
            <path class="brow brow-right" id="browRight" d="${MOODS.spark.browRightD}" />
          </g>
        </svg>
        <span class="poke-hint">click to poke</span>
      </div>

      <div class="dock" role="toolbar" aria-label="Select mood">
        <button type="button" class="emote-btn is-selected" data-mood="spark" aria-label="Sparkling mood">
          <span class="emote-btn-emoji">✨</span><span>Spark</span>
        </button>
        <button type="button" class="emote-btn" data-mood="love" aria-label="In love mood">
          <span class="emote-btn-emoji">💖</span><span>Love</span>
        </button>
        <button type="button" class="emote-btn" data-mood="hype" aria-label="On fire mood">
          <span class="emote-btn-emoji">🔥</span><span>Hype</span>
        </button>
        <button type="button" class="emote-btn" data-mood="party" aria-label="Party mood">
          <span class="emote-btn-emoji">🎉</span><span>Party</span>
        </button>
        <button type="button" class="emote-btn" data-mood="chill" aria-label="Chill mood">
          <span class="emote-btn-emoji">😎</span><span>Chill</span>
        </button>
        <button type="button" class="emote-btn" data-mood="cozy" aria-label="Cozy mood">
          <span class="emote-btn-emoji">🌙</span><span>Cozy</span>
        </button>
      </div>
    `;

    root.append(style, container);

    // Elements
    const faceGroup = container.querySelector("#faceGroup");
    const mouth = container.querySelector("#mouth");
    const browLeft = container.querySelector("#browLeft");
    const browRight = container.querySelector("#browRight");
    const cheekLeft = container.querySelector("#cheekLeft");
    const cheekRight = container.querySelector("#cheekRight");
    const gradStart = container.querySelector("#gradStart");
    const gradEnd = container.querySelector("#gradEnd");
    const comboBadge = container.querySelector("#comboBadge");
    const stageWrapper = container.querySelector("#stageWrapper");
    const particlesLayer = container.querySelector("#particlesLayer");
    const pupilLeft = container.querySelector("#pupilLeft");
    const pupilRight = container.querySelector("#pupilRight");
    const buttons = container.querySelectorAll(".emote-btn");

    let currentMoodKey = "spark";
    let comboCount = 0;
    let comboTimer = null;

    const spawnParticles = (originX, originY, count = 8, emojiList = null) => {
      const rect = stageWrapper.getBoundingClientRect();
      const list = emojiList || MOODS[currentMoodKey].particles;
      const startX = originX !== undefined ? originX - rect.left : rect.width / 2;
      const startY = originY !== undefined ? originY - rect.top : rect.height / 2;

      for (let i = 0; i < count; i += 1) {
        const span = document.createElement("span");
        span.className = "particle";
        span.textContent = list[Math.floor(Math.random() * list.length)];
        
        const dxEnd = (Math.random() - 0.5) * 130;
        const dyEnd = -50 - Math.random() * 80;
        const rot = (Math.random() - 0.5) * 50;

        span.style.left = `${startX}px`;
        span.style.top = `${startY}px`;
        span.style.setProperty("--dx-start", `${(Math.random() - 0.5) * 16}px`);
        span.style.setProperty("--dy-start", `${(Math.random() - 0.5) * 16}px`);
        span.style.setProperty("--dx-end", `${dxEnd}px`);
        span.style.setProperty("--dy-end", `${dyEnd}px`);
        span.style.setProperty("--rot", `${rot}deg`);

        particlesLayer.appendChild(span);
        span.addEventListener("animationend", () => span.remove(), { once: true });
      }
    };

    const triggerReaction = (event) => {
      comboCount += 1;

      // Squish animation
      faceGroup.classList.remove("squish");
      void faceGroup.getBoundingClientRect();
      faceGroup.classList.add("squish");

      // Combo badge
      comboBadge.textContent = `${comboCount}x COMBO ${comboCount > 5 ? "⚡" : "🔥"}`;
      comboBadge.classList.add("is-active");

      clearTimeout(comboTimer);
      comboTimer = setTimeout(() => {
        comboCount = 0;
        comboBadge.classList.remove("is-active");
      }, 2500);

      const clientX = event?.clientX;
      const clientY = event?.clientY;
      spawnParticles(clientX, clientY, 6);
    };

    const setMood = (moodKey) => {
      const mood = MOODS[moodKey];
      if (!mood) return;
      currentMoodKey = moodKey;

      // Update active button
      buttons.forEach((btn) => {
        btn.classList.toggle("is-selected", btn.dataset.mood === moodKey);
      });

      // Update expressions
      mouth.setAttribute("d", mood.mouthD);
      browLeft.setAttribute("d", mood.browLeftD);
      browRight.setAttribute("d", mood.browRightD);
      cheekLeft.setAttribute("fill", mood.cheeks);
      cheekRight.setAttribute("fill", mood.cheeks);

      // Update gradient
      gradStart.setAttribute("stop-color", mood.glowStart);
      gradEnd.setAttribute("stop-color", mood.glowEnd);
    };

    // Button clicks
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        setMood(btn.dataset.mood);
        triggerReaction(e);
      });
    });

    // Stage poke
    stageWrapper.addEventListener("click", (e) => {
      triggerReaction(e);
    });

    stageWrapper.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerReaction();
      }
    });

    // Pupil eye tracking
    stageWrapper.addEventListener("pointermove", (e) => {
      const rect = stageWrapper.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      const maxOffset = 5.5;
      const offsetX = Math.max(-maxOffset, Math.min(maxOffset, relX * maxOffset * 2.5));
      const offsetY = Math.max(-maxOffset, Math.min(maxOffset, relY * maxOffset * 2.5));

      pupilLeft.style.transform = `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
      pupilRight.style.transform = `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
    });

    stageWrapper.addEventListener("pointerleave", () => {
      pupilLeft.style.transform = "translate(0, 0)";
      pupilRight.style.transform = "translate(0, 0)";
    });
  },
};