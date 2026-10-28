const SVG = "http://www.w3.org/2000/svg";

const svgElement = (name, attributes) => {
  const element = document.createElementNS(SVG, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

export default {
  student: "Sean Wiseman",
  title: "Teddy bear",
  width: 260,
  height: 280,
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
      .bear {
        transform-box: view-box;
        transform-origin: 100px 200px;
      }
      .bear.is-hugging {
        animation: squish 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .arm {
        transform-box: view-box;
        transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .arm.left { transform-origin: 62px 128px; }
      .arm.right { transform-origin: 138px 128px; }
      .bear.is-hugging .arm.left { transform: rotate(40deg); }
      .bear.is-hugging .arm.right { transform: rotate(-40deg); }
      .heart {
        transform-box: view-box;
        transform-origin: 100px 16px;
        opacity: 0;
      }
      .heart.is-rising {
        animation: rise 1100ms ease-out;
      }
      @keyframes squish {
        0% { transform: scale(1); }
        30% { transform: scale(1.08, 0.9); }
        60% { transform: scale(0.96, 1.05); }
        100% { transform: scale(1); }
      }
      @keyframes rise {
        0% { opacity: 0; transform: translateY(10px) scale(0.4); }
        25% { opacity: 1; transform: translateY(0) scale(1.1); }
        100% { opacity: 0; transform: translateY(-36px) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .bear.is-hugging, .heart.is-rising { animation: none; }
        .arm { transition: none; }
      }
    `;

    const fur = "#a8693b";
    const light = "#e8c39a";
    const dark = "#3b2314";

    const svg = svgElement("svg", { viewBox: "0 0 200 220", role: "img", "aria-label": "Teddy bear. Click for a hug." });
    const bear = svgElement("g", { class: "bear" });

    // Legs, then body and belly.
    bear.append(svgElement("ellipse", { cx: 70, cy: 192, rx: 24, ry: 18, fill: fur }));
    bear.append(svgElement("ellipse", { cx: 130, cy: 192, rx: 24, ry: 18, fill: fur }));
    bear.append(svgElement("ellipse", { cx: 70, cy: 196, rx: 13, ry: 10, fill: light }));
    bear.append(svgElement("ellipse", { cx: 130, cy: 196, rx: 13, ry: 10, fill: light }));
    bear.append(svgElement("ellipse", { cx: 100, cy: 150, rx: 46, ry: 50, fill: fur }));
    bear.append(svgElement("ellipse", { cx: 100, cy: 158, rx: 28, ry: 32, fill: light }));

    const arm = (side, cx) => {
      const group = svgElement("g", { class: `arm ${side}` });
      group.append(svgElement("ellipse", { cx, cy: 150, rx: 14, ry: 28, fill: fur }));
      bear.append(group);
    };
    arm("left", 54);
    arm("right", 146);

    // Ears, head, muzzle, and face.
    bear.append(svgElement("circle", { cx: 62, cy: 40, r: 20, fill: fur }));
    bear.append(svgElement("circle", { cx: 138, cy: 40, r: 20, fill: fur }));
    bear.append(svgElement("circle", { cx: 62, cy: 40, r: 10, fill: light }));
    bear.append(svgElement("circle", { cx: 138, cy: 40, r: 10, fill: light }));
    bear.append(svgElement("circle", { cx: 100, cy: 72, r: 46, fill: fur }));
    bear.append(svgElement("ellipse", { cx: 100, cy: 90, rx: 22, ry: 17, fill: light }));
    bear.append(svgElement("circle", { cx: 82, cy: 64, r: 5, fill: dark }));
    bear.append(svgElement("circle", { cx: 118, cy: 64, r: 5, fill: dark }));
    bear.append(svgElement("ellipse", { cx: 100, cy: 84, rx: 8, ry: 6, fill: dark }));
    bear.append(svgElement("path", {
      d: "M100 90 L100 96 M92 98 Q100 104 108 98",
      stroke: dark, "stroke-width": 2.5, "stroke-linecap": "round", fill: "none",
    }));

    const heart = svgElement("path", {
      class: "heart",
      d: "M100 30 C92 22 80 24 80 14 C80 6 90 2 100 10 C110 2 120 6 120 14 C120 24 108 22 100 30 Z",
      fill: "#e6395b",
    });

    svg.append(bear, heart);
    root.append(style, svg);

    svg.addEventListener("click", () => {
      [[bear, "is-hugging"], [heart, "is-rising"]].forEach(([element, className]) => {
        element.classList.remove(className);
        void element.getBoundingClientRect();
        element.classList.add(className);
      });
    });
    bear.addEventListener("animationend", () => bear.classList.remove("is-hugging"));
    heart.addEventListener("animationend", () => heart.classList.remove("is-rising"));
  },
};
