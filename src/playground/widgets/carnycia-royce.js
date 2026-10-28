const SVG_NS = "http://www.w3.org/2000/svg";

const createSvg = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

export default {
  student: "Carnycia Royce",
  title: "Stick Figure",
  width: 240,
  height: 280,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        user-select: none;
        background: var(--paper, #ffffff);
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        cursor: pointer;
      }
      .stick {
        stroke: var(--ink, #111111);
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }
      .head-fill {
        fill: var(--paper, #ffffff);
        stroke: var(--ink, #111111);
        stroke-width: 4;
      }
      .face-feature {
        fill: var(--ink, #111111);
        stroke: var(--ink, #111111);
        stroke-linecap: round;
      }
      .ground-shadow {
        fill: color-mix(in srgb, var(--ink, #111111) 15%, transparent);
      }
      .particle {
        pointer-events: none;
        font-size: 16px;
        text-anchor: middle;
        dominant-baseline: central;
        animation: floatUp 750ms ease-out forwards;
      }
      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateY(0) scale(0.6);
        }
        50% {
          opacity: 1;
          transform: translateY(-20px) scale(1.1);
        }
        100% {
          opacity: 0;
          transform: translateY(-40px) scale(0.8);
        }
      }
    `;

    const svg = createSvg("svg", {
      viewBox: "0 0 200 240",
      role: "img",
      "aria-label": "Stick figure",
      "data-no-drag": "true",
    });

    const shadow = createSvg("ellipse", {
      cx: 100,
      cy: 218,
      rx: 28,
      ry: 5,
      class: "ground-shadow",
    });

    const leftLeg = createSvg("polyline", { class: "stick" });
    const rightLeg = createSvg("polyline", { class: "stick" });
    const spine = createSvg("line", { class: "stick" });
    const leftArm = createSvg("polyline", { class: "stick" });
    const rightArm = createSvg("polyline", { class: "stick" });
    const neck = createSvg("line", { class: "stick" });

    const headGroup = createSvg("g");
    const headCircle = createSvg("circle", { cx: 100, cy: 62, r: 20, class: "head-fill" });
    const leftEye = createSvg("circle", { cx: 93, cy: 59, r: 2.2, class: "face-feature" });
    const rightEye = createSvg("circle", { cx: 107, cy: 59, r: 2.2, class: "face-feature" });
    const mouth = createSvg("path", { class: "face-feature", fill: "none", "stroke-width": 2 });
    headGroup.append(headCircle, leftEye, rightEye, mouth);

    const particleLayer = createSvg("g");

    svg.append(shadow, leftLeg, rightLeg, spine, leftArm, rightArm, neck, headGroup, particleLayer);
    root.append(style, svg);

    let pointerX = 100;
    let pointerY = 70;
    let isJumping = false;
    let jumpStartTime = 0;
    let lastClickTime = 0;

    function spawnParticle(symbol, x, y) {
      const text = createSvg("text", { x, y, class: "particle" });
      text.textContent = symbol;
      particleLayer.appendChild(text);
      setTimeout(() => text.remove(), 750);
    }

    svg.addEventListener("pointermove", (e) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = ((e.clientX - rect.left) / rect.width) * 200;
      pointerY = ((e.clientY - rect.top) / rect.height) * 240;
    });

    svg.addEventListener("pointerleave", () => {
      pointerX = 100;
      pointerY = 70;
    });

    svg.addEventListener("click", () => {
      isJumping = true;
      jumpStartTime = performance.now();
      lastClickTime = jumpStartTime;
      const symbols = ["✨", "★", "💖", "😄", "🎶", "✦"];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      spawnParticle(sym, 100 + (Math.random() * 30 - 15), 50);
    });

    function render(now) {
      const time = now / 1000;
      const isClickedRecently = (now - lastClickTime) < 300;

      let hipX = 100;
      let hipY = 150;
      let chestX = 100;
      let chestY = 102;
      let headX = 100;
      let headY = 62;

      let lFootX = 78;
      let lFootY = 216;
      let lKneeX = 86;
      let lKneeY = 183;

      let rFootX = 122;
      let rFootY = 216;
      let rKneeX = 114;
      let rKneeY = 183;

      let lHandX = 66;
      let lHandY = 126;
      let lElbowX = 80;
      let lElbowY = 114;

      let rHandX = 134;
      let rHandY = 126;
      let rElbowX = 120;
      let rElbowY = 114;

      let shadowRx = 28;
      let mouthD = "M 94 68 Q 100 73 106 68"; // Gentle smile

      if (isJumping) {
        const jumpDuration = 0.7;
        const elapsed = (now - jumpStartTime) / 1000;

        if (elapsed >= jumpDuration) {
          isJumping = false;
        } else {
          const p = elapsed / jumpDuration;
          if (p < 0.2) {
            // Crouch before jump
            const crouch = (p / 0.2) * 16;
            hipY += crouch;
            chestY += crouch;
            headY += crouch;
            lKneeX = 78;
            rKneeX = 122;
            mouthD = "M 95 68 Q 100 68 105 68";
          } else if (p < 0.8) {
            // In the air
            const airP = (p - 0.2) / 0.6;
            const lift = Math.sin(airP * Math.PI) * 38;
            hipY -= lift;
            chestY -= lift;
            headY -= lift;

            // Tucked legs
            lFootX = 86;
            lFootY = 216 - lift + 14;
            lKneeX = 78;
            lKneeY = (hipY + lFootY) / 2;

            rFootX = 114;
            rFootY = 216 - lift + 14;
            rKneeX = 122;
            rKneeY = (hipY + rFootY) / 2;

            // Hands up happily!
            lHandX = 64;
            lHandY = chestY - 24;
            lElbowX = 74;
            lElbowY = chestY - 10;

            rHandX = 136;
            rHandY = chestY - 24;
            rElbowX = 126;
            rElbowY = chestY - 10;

            shadowRx = Math.max(12, 28 - lift * 0.25);
            mouthD = "M 95 66 Q 100 75 105 66"; // Excited open smile
          } else {
            // Landing compression
            const landP = (p - 0.8) / 0.2;
            const compression = (1 - landP) * 10;
            hipY += compression;
            chestY += compression;
            headY += compression;
          }
        }
      } else {
        // Idle gentle breathing sway
        const breathe = Math.sin(time * 3);
        hipY += breathe * 1.6;
        chestY += breathe * 2.2;
        headY += breathe * 2.6;
        lHandY += breathe * 1.5;
        rHandY += breathe * 1.5;
      }

      // Pointer tracking for eyes
      const dx = pointerX - headX;
      const dy = pointerY - headY;
      const angle = Math.atan2(dy, dx);
      const eyeOffset = 2.0;
      const eyeDx = Math.cos(angle) * eyeOffset;
      const eyeDy = Math.sin(angle) * eyeOffset;

      if (isClickedRecently) {
        // Happy blink
        leftEye.setAttribute("r", "1");
        rightEye.setAttribute("r", "1");
      } else {
        leftEye.setAttribute("r", "2.2");
        rightEye.setAttribute("r", "2.2");
      }

      leftEye.setAttribute("cx", (93 + eyeDx).toFixed(1));
      leftEye.setAttribute("cy", (59 + eyeDy).toFixed(1));
      rightEye.setAttribute("cx", (107 + eyeDx).toFixed(1));
      rightEye.setAttribute("cy", (59 + eyeDy).toFixed(1));
      mouth.setAttribute("d", mouthD);

      // Whole head moves together seamlessly
      headGroup.setAttribute("transform", `translate(${(headX - 100).toFixed(1)}, ${(headY - 62).toFixed(1)})`);

      neck.setAttribute("x1", headX.toFixed(1));
      neck.setAttribute("y1", (headY + 20).toFixed(1));
      neck.setAttribute("x2", chestX.toFixed(1));
      neck.setAttribute("y2", chestY.toFixed(1));

      spine.setAttribute("x1", chestX.toFixed(1));
      spine.setAttribute("y1", chestY.toFixed(1));
      spine.setAttribute("x2", hipX.toFixed(1));
      spine.setAttribute("y2", hipY.toFixed(1));

      leftLeg.setAttribute("points", `${hipX.toFixed(1)},${hipY.toFixed(1)} ${lKneeX.toFixed(1)},${lKneeY.toFixed(1)} ${lFootX.toFixed(1)},${lFootY.toFixed(1)}`);
      rightLeg.setAttribute("points", `${hipX.toFixed(1)},${hipY.toFixed(1)} ${rKneeX.toFixed(1)},${rKneeY.toFixed(1)} ${rFootX.toFixed(1)},${rFootY.toFixed(1)}`);

      leftArm.setAttribute("points", `${chestX.toFixed(1)},${chestY.toFixed(1)} ${lElbowX.toFixed(1)},${lElbowY.toFixed(1)} ${lHandX.toFixed(1)},${lHandY.toFixed(1)}`);
      rightArm.setAttribute("points", `${chestX.toFixed(1)},${chestY.toFixed(1)} ${rElbowX.toFixed(1)},${rElbowY.toFixed(1)} ${rHandX.toFixed(1)},${rHandY.toFixed(1)}`);

      shadow.setAttribute("cx", hipX.toFixed(1));
      shadow.setAttribute("rx", shadowRx.toFixed(1));

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  },
};
