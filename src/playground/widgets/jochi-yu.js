const FONT_FAMILY = "LH Noggle Sans Variable";
// Twice the longest hand ("2026:18:14:34" at 72pt) plus the pivot gap.
const SIZE = 1300;
// Space between the pivot and the start of each hand's text.
const PIVOT_GAP = 24;

const loadFont = () => {
  if ([...document.fonts].some((face) => face.family === FONT_FAMILY)) return;
  const face = new FontFace(FONT_FAMILY, "url(/fonts/LH-Noggle-Sans-Variable-trial.ttf)", {
    weight: "100 900",
  });
  document.fonts.add(face);
  face.load().catch(() => {});
};

const pad = (value) => String(value).padStart(2, "0");

export default {
  student: "Jochi Yu",
  title: "Time hands",
  frame: false,
  width: SIZE,
  height: SIZE,
  mount(root) {
    loadFont();

    const style = document.createElement("style");
    style.textContent = `
      .clock {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .hand {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
      }
      .hand span {
        position: absolute;
        top: 0;
        white-space: nowrap;
        font-family: "${FONT_FAMILY}", sans-serif;
        font-size: 72pt;
        font-weight: 700;
        font-variation-settings: "wght" 700, "slnt" 24;
        line-height: 1;
        transform: translateY(-50%);
      }
      /* Hands pointing right read outward from the pivot; hands pointing left
         are flipped so the text stays upright and reads in toward the pivot. */
      .hand:not(.is-flipped) span { left: ${PIVOT_GAP}px; }
      .hand.is-flipped span { right: ${PIVOT_GAP}px; }
      .hour { color: #00f3ff; }
      .minute { color: #ff8dff; }
      .second { color: #ff4160; }
    `;

    const clock = document.createElement("div");
    clock.className = "clock";
    clock.setAttribute("role", "img");
    const hand = (className) => {
      const element = document.createElement("div");
      element.className = `hand ${className}`;
      element.append(document.createElement("span"));
      clock.append(element);
      return element;
    };
    const hourHand = hand("hour");
    const minuteHand = hand("minute");
    const secondHand = hand("second");
    root.append(style, clock);

    // angle is clockwise from 12 o'clock, in degrees.
    const point = (element, angle, text) => {
      const normalized = ((angle % 360) + 360) % 360;
      const flipped = normalized > 180;
      element.classList.toggle("is-flipped", flipped);
      element.style.transform = `rotate(${normalized - 90 + (flipped ? 180 : 0)}deg)`;
      element.firstChild.textContent = text;
    };

    const tick = () => {
      const now = new Date();
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      const minuteValue = now.getMinutes() + now.getSeconds() / 60;
      point(hourHand, ((now.getHours() % 12) + minuteValue / 60) * 30, `${hours}:${minutes}`);
      point(minuteHand, minuteValue * 6, `${year}:${hours}:${minutes}`);
      point(secondHand, now.getSeconds() * 6, `${year}:${hours}:${minutes}:${seconds}`);
      clock.setAttribute("aria-label", `${hours}:${minutes}:${seconds}`);
    };
    tick();
    setInterval(tick, 1000);
  },
};
