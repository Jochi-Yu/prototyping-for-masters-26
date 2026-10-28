const SVG_NS = "http://www.w3.org/2000/svg";

const createSvgElement = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
  return el;
};

const MOODS = [
  {
    id: "happy",
    name: "Happy",
    icon: "😊",
    status: "Feeling cheerful!",
    mouthD: "M 86 122 Q 120 152 154 122",
    mouthFill: "none",
    mouthStroke: "#2c2830",
    mouthWidth: 5,
    showTongue: false,
    leftEye: "normal",
    rightEye: "normal",
    blush: 0.45,
    browOffset: 0,
  },
  {
    id: "wink",
    name: "Wink",
    icon: "😉",
    status: "Caught your eye!",
    mouthD: "M 88 126 Q 116 148 152 120",
    mouthFill: "none",
    mouthStroke: "#2c2830",
    mouthWidth: 5,
    showTongue: false,
    leftEye: "normal",
    rightEye: "wink",
    blush: 0.65,
    browOffset: -2,
  },
  {
    id: "grin",
    name: "Grin",
    icon: "😄",
    status: "Big sunny grin!",
    mouthD: "M 82 118 Q 120 120 158 118 Q 120 162 82 118 Z",
    mouthFill: "#2c2830",
    mouthStroke: "#2c2830",
    mouthWidth: 2,
    showTongue: true,
    leftEye: "arc",
    rightEye: "arc",
    blush: 0.55,
    browOffset: -1,
  },
  {
    id: "love",
    name: "Love",
    icon: "😍",
    status: "Full of affection!",
    mouthD: "M 88 122 Q 120 150 152 122",
    mouthFill: "none",
    mouthStroke: "#2c2830",
    mouthWidth: 5,
    showTongue: false,
    leftEye: "heart",
    rightEye: "heart",
    blush: 0.8,
    browOffset: -2,
  },
  {
    id: "wow",
    name: "Wow",
    icon: "😮",
    status: "Ooh, fascinating!",
    mouthD: "M 108 128 A 12 15 0 1 0 132 128 A 12 15 0 1 0 108 128 Z",
    mouthFill: "#2c2830",
    mouthStroke: "#2c2830",
    mouthWidth: 2,
    showTongue: false,
    leftEye: "wide",
    rightEye: "wide",
    blush: 0.35,
    browOffset: -4,
  },
];

export default {
  student: "Yurou Zhou (Reign)",
  title: "Smile Widget",
  frame: true,
  width: 290,
  height: 310,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: inherit;
        background: radial-gradient(circle at 50% 30%, #fffdf5 0%, #fff9e6 100%);
        color: #2c2830;
        user-select: none;
      }

      .smile-app {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        padding: 0.6rem 0.75rem;
        box-sizing: border-box;
      }

      .smile-stage {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        flex: 1;
        min-height: 0;
      }

      .smile-face-svg {
        width: 100%;
        max-width: 210px;
        height: auto;
        max-height: 190px;
        overflow: visible;
        cursor: pointer;
        outline: none;
        transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .smile-face-svg:focus-visible {
        filter: drop-shadow(0 0 6px #ffb300);
      }

      .face-group {
        transform-origin: 120px 105px;
        transform-box: view-box;
      }

      .face-group.is-popping {
        animation: faceBounce 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes faceBounce {
        0% { transform: scale(1, 1); }
        30% { transform: scale(1.12, 0.88); }
        60% { transform: scale(0.94, 1.06); }
        80% { transform: scale(1.03, 0.98); }
        100% { transform: scale(1, 1); }
      }

      .pupil-group {
        transition: transform 60ms ease-out;
      }

      .sparkle-wink {
        transform-origin: 170px 76px;
        animation: winkTwinkle 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes winkTwinkle {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.3) rotate(90deg); opacity: 1; }
        100% { transform: scale(1) rotate(180deg); opacity: 1; }
      }

      .particles-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
      }

      .particle {
        position: absolute;
        font-size: 1.1rem;
        pointer-events: none;
        animation: floatBurst 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      @keyframes floatBurst {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.4) rotate(0deg);
        }
        100% {
          opacity: 0;
          transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, -45px))) scale(1.2) rotate(var(--rot, 20deg));
        }
      }

      .smile-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        width: 100%;
        flex-shrink: 0;
      }

      .smile-status {
        font-size: 0.72rem;
        font-family: inherit;
        letter-spacing: 0.02em;
        color: #6c6674;
        text-align: center;
        min-height: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .smile-pills {
        display: flex;
        gap: 0.3rem;
        justify-content: center;
        width: 100%;
      }

      .smile-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        padding: 0.2rem 0.45rem;
        border-radius: 999px;
        border: 1px solid #e5dfd2;
        background: #ffffff;
        color: #4b4652;
        font-size: 0.68rem;
        font-family: inherit;
        cursor: pointer;
        transition: all 150ms ease;
        line-height: 1;
      }

      .smile-pill:hover {
        background: #fff4cc;
        border-color: #ffd159;
        transform: translateY(-1px);
      }

      .smile-pill.is-active {
        background: #ffc93c;
        border-color: #e09e00;
        color: #2c2830;
        font-weight: 600;
        box-shadow: 0 2px 5px rgba(224, 158, 0, 0.25);
      }

      .smile-pill:focus-visible {
        outline: 2px solid #ffb300;
        outline-offset: 1px;
      }

      @media (prefers-reduced-motion: reduce) {
        .face-group.is-popping { animation: none; }
        .sparkle-wink { animation: none; }
        .particle { animation: none; opacity: 0; }
        .pupil-group { transition: none; }
        .smile-pill { transition: none; }
      }
    `;

    const app = document.createElement("div");
    app.className = "smile-app";

    const stage = document.createElement("div");
    stage.className = "smile-stage";

    const particlesLayer = document.createElement("div");
    particlesLayer.className = "particles-layer";

    const svg = createSvgElement("svg", {
      class: "smile-face-svg",
      viewBox: "0 0 240 210",
      role: "img",
      tabindex: "0",
      "aria-label": "Interactive smile widget by Yurou Zhou (Reign)",
    });

    const defs = createSvgElement("defs");
    defs.innerHTML = `
      <radialGradient id="faceGrad" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stop-color="#fff885"/>
        <stop offset="60%" stop-color="#ffce34"/>
        <stop offset="100%" stop-color="#ffa000"/>
      </radialGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#ffa000" flood-opacity="0.28"/>
      </filter>
      <clipPath id="mouthClip">
        <path id="clipMouthPath" d="M 82 118 Q 120 120 158 118 Q 120 162 82 118 Z"/>
      </clipPath>
    `;
    svg.append(defs);

    const faceGroup = createSvgElement("g", { class: "face-group" });

    // Main yellow face
    const baseHead = createSvgElement("circle", {
      cx: "120",
      cy: "105",
      r: "74",
      fill: "url(#faceGrad)",
      stroke: "#e09100",
      "stroke-width": "3",
      filter: "url(#softShadow)",
    });
    faceGroup.append(baseHead);

    // Cheeks
    const leftCheek = createSvgElement("ellipse", {
      cx: "70",
      cy: "118",
      rx: "13",
      ry: "9",
      fill: "#ff5277",
      opacity: "0.45",
      filter: "blur(1px)",
    });
    const rightCheek = createSvgElement("ellipse", {
      cx: "170",
      cy: "118",
      rx: "13",
      ry: "9",
      fill: "#ff5277",
      opacity: "0.45",
      filter: "blur(1px)",
    });
    faceGroup.append(leftCheek, rightCheek);

    // Eyebrows
    const leftBrow = createSvgElement("path", {
      d: "M 74 65 Q 88 58 102 65",
      fill: "none",
      stroke: "#2c2830",
      "stroke-width": "3.5",
      "stroke-linecap": "round",
    });
    const rightBrow = createSvgElement("path", {
      d: "M 138 65 Q 152 58 166 65",
      fill: "none",
      stroke: "#2c2830",
      "stroke-width": "3.5",
      "stroke-linecap": "round",
    });
    faceGroup.append(leftBrow, rightBrow);

    // Left Eye container
    const leftEyeGroup = createSvgElement("g", { id: "left-eye" });
    const leftSocket = createSvgElement("ellipse", {
      cx: "88",
      cy: "86",
      rx: "14",
      ry: "17",
      fill: "#ffffff",
      stroke: "#2c2830",
      "stroke-width": "3",
    });
    const leftPupil = createSvgElement("g", { class: "pupil-group" });
    leftPupil.append(
      createSvgElement("circle", { cx: "88", cy: "86", r: "8", fill: "#2c2830" }),
      createSvgElement("circle", { cx: "85", cy: "83", r: "3", fill: "#ffffff" }),
      createSvgElement("circle", { cx: "91", cy: "89", r: "1.5", fill: "#ffffff" }),
    );
    const leftArc = createSvgElement("path", {
      d: "M 74 88 Q 88 74 102 88",
      fill: "none",
      stroke: "#2c2830",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
      display: "none",
    });
    const leftHeart = createSvgElement("path", {
      d: "M 88 97 C 76 87 72 76 80 72 C 86 69 88 75 88 75 C 88 75 90 69 96 72 C 104 76 100 87 88 97 Z",
      fill: "#ff2e63",
      display: "none",
    });
    leftEyeGroup.append(leftSocket, leftPupil, leftArc, leftHeart);

    // Right Eye container
    const rightEyeGroup = createSvgElement("g", { id: "right-eye" });
    const rightSocket = createSvgElement("ellipse", {
      cx: "152",
      cy: "86",
      rx: "14",
      ry: "17",
      fill: "#ffffff",
      stroke: "#2c2830",
      "stroke-width": "3",
    });
    const rightPupil = createSvgElement("g", { class: "pupil-group" });
    rightPupil.append(
      createSvgElement("circle", { cx: "152", cy: "86", r: "8", fill: "#2c2830" }),
      createSvgElement("circle", { cx: "149", cy: "83", r: "3", fill: "#ffffff" }),
      createSvgElement("circle", { cx: "155", cy: "89", r: "1.5", fill: "#ffffff" }),
    );
    const rightArc = createSvgElement("path", {
      d: "M 138 88 Q 152 74 166 88",
      fill: "none",
      stroke: "#2c2830",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
      display: "none",
    });
    const rightWink = createSvgElement("path", {
      d: "M 138 88 Q 152 75 166 88",
      fill: "none",
      stroke: "#2c2830",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
      display: "none",
    });
    const rightWinkSparkle = createSvgElement("path", {
      class: "sparkle-wink",
      d: "M 170 76 Q 170 71 174 71 Q 170 71 170 66 Q 170 71 166 71 Q 170 71 170 76 Z",
      fill: "#ffb300",
      display: "none",
    });
    const rightHeart = createSvgElement("path", {
      d: "M 152 97 C 140 87 136 76 144 72 C 150 69 152 75 152 75 C 152 75 154 69 160 72 C 168 76 164 87 152 97 Z",
      fill: "#ff2e63",
      display: "none",
    });
    rightEyeGroup.append(rightSocket, rightPupil, rightArc, rightWink, rightWinkSparkle, rightHeart);

    faceGroup.append(leftEyeGroup, rightEyeGroup);

    // Mouth group
    const mouthGroup = createSvgElement("g", { id: "mouth-group" });
    const mouthPath = createSvgElement("path", {
      id: "mouth",
      d: MOODS[0].mouthD,
      fill: MOODS[0].mouthFill,
      stroke: MOODS[0].mouthStroke,
      "stroke-width": String(MOODS[0].mouthWidth),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const tongue = createSvgElement("ellipse", {
      cx: "120",
      cy: "152",
      rx: "19",
      ry: "14",
      fill: "#ff6b8b",
      "clip-path": "url(#mouthClip)",
      display: "none",
    });
    mouthGroup.append(mouthPath, tongue);
    faceGroup.append(mouthGroup);

    svg.append(faceGroup);
    stage.append(svg, particlesLayer);

    // Footer with status and pills
    const footer = document.createElement("footer");
    footer.className = "smile-footer";

    const statusText = document.createElement("div");
    statusText.className = "smile-status";

    const pillsContainer = document.createElement("div");
    pillsContainer.className = "smile-pills";

    let currentMoodIndex = 0;

    const pillButtons = MOODS.map((mood, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "smile-pill" + (index === 0 ? " is-active" : "");
      btn.innerHTML = `<span>${mood.icon}</span> <span>${mood.name}</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        setMood(index, true);
      });
      pillsContainer.append(btn);
      return btn;
    });

    footer.append(statusText, pillsContainer);
    app.append(stage, footer);
    root.append(style, app);

    // Eye tracking logic
    let targetEyeX = 0;
    let targetEyeY = 0;

    const updatePupils = (x, y) => {
      leftPupil.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      rightPupil.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    };

    const handlePointerMove = (event) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height * 0.45;
      const dx = event.clientX - faceCenterX;
      const dy = event.clientY - faceCenterY;
      const distance = Math.hypot(dx, dy);

      const maxRadius = 6.5;
      const factor = Math.min(distance / 120, 1);
      const angle = Math.atan2(dy, dx);

      targetEyeX = Math.cos(angle) * maxRadius * factor;
      targetEyeY = Math.sin(angle) * maxRadius * factor;
      updatePupils(targetEyeX, targetEyeY);
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Particle burst on click
    const burstParticles = () => {
      const symbols = ["✨", "💖", "⭐", "🌸", "💫"];
      const rect = stage.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      for (let i = 0; i < 6; i += 1) {
        const particle = document.createElement("span");
        particle.className = "particle";
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;

        const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 35 + Math.random() * 45;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 25;
        const rot = (Math.random() - 0.5) * 60;

        particle.style.setProperty("--dx", `${dx.toFixed(1)}px`);
        particle.style.setProperty("--dy", `${dy.toFixed(1)}px`);
        particle.style.setProperty("--rot", `${rot.toFixed(1)}deg`);

        particlesLayer.appendChild(particle);
        particle.addEventListener("animationend", () => particle.remove());
      }
    };

    const setMood = (index, triggerPop = true) => {
      currentMoodIndex = index;
      const mood = MOODS[index];

      // Update pills
      pillButtons.forEach((btn, idx) => {
        btn.classList.toggle("is-active", idx === index);
      });

      // Update status text
      statusText.textContent = `${mood.status} (Click to interact)`;

      // Cheeks blush
      leftCheek.setAttribute("opacity", String(mood.blush));
      rightCheek.setAttribute("opacity", String(mood.blush));

      // Eyebrows
      leftBrow.setAttribute("d", `M 74 ${65 + mood.browOffset} Q 88 ${58 + mood.browOffset} 102 ${65 + mood.browOffset}`);
      rightBrow.setAttribute("d", `M 138 ${65 + mood.browOffset} Q 152 ${58 + mood.browOffset} 166 ${65 + mood.browOffset}`);

      // Left eye display
      leftSocket.setAttribute("display", mood.leftEye === "arc" || mood.leftEye === "heart" ? "none" : "block");
      leftPupil.setAttribute("display", mood.leftEye === "normal" || mood.leftEye === "wide" ? "block" : "none");
      leftArc.setAttribute("display", mood.leftEye === "arc" ? "block" : "none");
      leftHeart.setAttribute("display", mood.leftEye === "heart" ? "block" : "none");

      // Right eye display
      rightSocket.setAttribute("display", mood.rightEye === "arc" || mood.rightEye === "heart" || mood.rightEye === "wink" ? "none" : "block");
      rightPupil.setAttribute("display", mood.rightEye === "normal" || mood.rightEye === "wide" ? "block" : "none");
      rightArc.setAttribute("display", mood.rightEye === "arc" ? "block" : "none");
      rightWink.setAttribute("display", mood.rightEye === "wink" ? "block" : "none");
      rightWinkSparkle.setAttribute("display", mood.rightEye === "wink" ? "block" : "none");
      rightHeart.setAttribute("display", mood.rightEye === "heart" ? "block" : "none");

      // Mouth & tongue
      mouthPath.setAttribute("d", mood.mouthD);
      mouthPath.setAttribute("fill", mood.mouthFill);
      mouthPath.setAttribute("stroke", mood.mouthStroke);
      mouthPath.setAttribute("stroke-width", String(mood.mouthWidth));
      tongue.setAttribute("display", mood.showTongue ? "block" : "none");

      if (triggerPop) {
        faceGroup.classList.remove("is-popping");
        void faceGroup.getBoundingClientRect();
        faceGroup.classList.add("is-popping");
        burstParticles();
      }
    };

    // Cycle on face click
    const handleFaceTrigger = () => {
      const nextIndex = (currentMoodIndex + 1) % MOODS.length;
      setMood(nextIndex, true);
    };

    svg.addEventListener("click", handleFaceTrigger);
    svg.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleFaceTrigger();
      }
    });

    faceGroup.addEventListener("animationend", () => {
      faceGroup.classList.remove("is-popping");
    });

    // Initialize with first mood
    setMood(0, false);
  },
};
