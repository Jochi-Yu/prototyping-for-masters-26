const SVG = "http://www.w3.org/2000/svg";
const CENTER_X = 100;
const CENTER_Y = 104;
const OUTER_RADIUS = 84;
const INNER_RADIUS = 54;

const svgElement = (name, attributes) => {
  const element = document.createElementNS(SVG, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

export default {
  student: "Eunice Yang",
  title: "Star clock",
  width: 260,
  height: 240,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      text {
        font-family: "Faculty Glyphic", sans-serif;
        fill: #1d1a4a;
        text-anchor: middle;
      }
      .time { font-size: 19px; font-variant-numeric: tabular-nums; }
      .seconds { font-size: 12px; fill: #b3261e; }
      .date { font-size: 9px; }
    `;

    const svg = svgElement("svg", { viewBox: "0 0 200 190", role: "timer" });
    const points = Array.from({ length: 10 }, (_, index) => {
      const angle = (index * Math.PI) / 5;
      const radius = index % 2 === 0 ? OUTER_RADIUS : INNER_RADIUS;
      return `${(CENTER_X + radius * Math.sin(angle)).toFixed(1)},${(CENTER_Y - radius * Math.cos(angle)).toFixed(1)}`;
    }).join(" ");

    svg.append(svgElement("polygon", {
      points, fill: "#ffc933", stroke: "#ffc933", "stroke-width": 14, "stroke-linejoin": "round",
    }));

    const time = svgElement("text", { class: "time", x: 100, y: 106 });
    const seconds = svgElement("tspan", { class: "seconds" });
    const date = svgElement("text", { class: "date", x: 100, y: 121 });
    svg.append(time, date);
    root.append(style, svg);

    const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
    const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
    const tick = () => {
      const now = new Date();
      seconds.textContent = `:${String(now.getSeconds()).padStart(2, "0")}`;
      time.replaceChildren(`${timeFormat.format(now)} `, seconds);
      date.textContent = dateFormat.format(now);
      svg.setAttribute("aria-label", `${timeFormat.format(now)}, ${dateFormat.format(now)}`);
    };
    tick();
    setInterval(tick, 1000);
  },
};
