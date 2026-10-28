const SVG = "http://www.w3.org/2000/svg";

const scallopPath = (bumps = 12, radius = 90, depth = 6, steps = 240) => {
  const points = Array.from({ length: steps }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2;
    const r = radius + depth * Math.cos(angle * bumps);
    return `${(100 + r * Math.sin(angle)).toFixed(2)} ${(100 - r * Math.cos(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
};

const svgElement = (name, attributes) => {
  const element = document.createElementNS(SVG, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

export default {
  student: "Elizabeth Lin",
  title: "New York time",
  frame: false,
  rotate: -6,
  width: 240,
  height: 240,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        cursor: pointer;
      }
      .face {
        transform-box: view-box;
        transform-origin: 100px 100px;
      }
      .face.is-spinning {
        animation: spin 900ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .hand {
        transform-box: view-box;
        transform-origin: 100px 100px;
      }
      .second {
        transition: transform 320ms cubic-bezier(0.34, 1.9, 0.64, 1);
      }
      .number {
        font-family: "Faculty Glyphic", sans-serif;
        font-size: 22px;
        fill: #1d1a4a;
      }
      @keyframes spin {
        0% { transform: rotate(0) scale(1); }
        30% { transform: rotate(140deg) scale(0.9, 1.08); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .second { transition: none; }
        .face.is-spinning { animation: none; }
      }
    `;

    const svg = svgElement("svg", { viewBox: "0 0 200 200", role: "img" });
    const face = svgElement("g", { class: "face" });
    face.append(svgElement("path", { d: scallopPath(), fill: "#ff6b3d" }));
    face.append(svgElement("circle", { cx: 100, cy: 100, r: 74, fill: "#ffd6c4" }));

    for (let hour = 1; hour <= 12; hour += 1) {
      const angle = (hour / 12) * Math.PI * 2;
      if (hour % 3 === 0) {
        const label = svgElement("text", {
          class: "number",
          x: (100 + 58 * Math.sin(angle)).toFixed(2),
          y: (100 - 58 * Math.cos(angle)).toFixed(2),
          "text-anchor": "middle",
          "dominant-baseline": "central",
        });
        label.textContent = String(hour);
        face.append(label);
      } else {
        face.append(svgElement("circle", {
          cx: (100 + 62 * Math.sin(angle)).toFixed(2),
          cy: (100 - 62 * Math.cos(angle)).toFixed(2),
          r: 3,
          fill: "#1d1a4a",
        }));
      }
    }

    const hand = (className, length, width, color) => {
      const group = svgElement("g", { class: `hand ${className}` });
      group.append(svgElement("line", {
        x1: 100, y1: 108, x2: 100, y2: 100 - length,
        stroke: color, "stroke-width": width, "stroke-linecap": "round",
      }));
      face.append(group);
      return group;
    };
    const hourHand = hand("hour", 36, 10, "#1d1a4a");
    const minuteHand = hand("minute", 56, 6, "#1d1a4a");
    const secondHand = hand("second", 64, 3, "#1735c7");
    secondHand.append(svgElement("circle", { cx: 100, cy: 36, r: 6, fill: "#1735c7" }));
    face.append(svgElement("circle", { cx: 100, cy: 100, r: 7, fill: "#1d1a4a" }));

    svg.append(face);
    root.append(style, svg);

    svg.addEventListener("click", () => {
      face.classList.remove("is-spinning");
      void face.getBoundingClientRect();
      face.classList.add("is-spinning");
    });
    face.addEventListener("animationend", () => face.classList.remove("is-spinning"));

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", hour: "numeric", minute: "numeric", hour12: false,
    });
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", hour: "numeric", minute: "2-digit",
    });
    const startSecond = Math.floor(Date.now() / 1000);
    const startOffset = new Date().getSeconds();
    const tick = () => {
      const now = new Date();
      const values = Object.fromEntries(parts.formatToParts(now).map(({ type, value }) => [type, Number(value)]));
      const minutes = values.minute + now.getSeconds() / 60;
      hourHand.style.transform = `rotate(${((values.hour % 12) + minutes / 60) * 30}deg)`;
      minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
      // The angle keeps growing so the hand never sweeps backward at the top of the minute.
      const elapsed = Math.floor(now.getTime() / 1000) - startSecond;
      secondHand.style.transform = `rotate(${(startOffset + elapsed) * 6}deg)`;
      svg.setAttribute("aria-label", `${label.format(now)} in New York`);
    };
    tick();
    setInterval(tick, 1000);
  },
};
