import griffonUrl from "./oleksandra-shafran-griffon.webp";

export default {
  student: "Oleksandra Shafran",
  title: "Griffon",
  frame: false,
  rotate: 4,
  width: 220,
  height: 324,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      button {
        display: block;
        width: 100%;
        height: 100%;
        padding: 0;
        border: 0;
        background: none;
        cursor: pointer;
        position: relative;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        transform-origin: 50% 90%;
        user-select: none;
      }
      .jaw,
      .mouth {
        transform-box: view-box;
        transition: transform 160ms ease-in;
      }
      .mouth {
        transform-origin: 400px 652px;
        transform: scaleY(0);
      }
      .is-barking .jaw {
        transform: translateY(46px);
        transition: transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-barking .mouth {
        transform: scaleY(1);
        transition: transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-wiggling svg {
        animation: wiggle 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .bark {
        position: absolute;
        top: 4%;
        right: -8%;
        padding: 4px 10px;
        border-radius: 999px;
        background: #1d1a4a;
        color: #fff;
        font: 600 16px/1.2 "Faculty Glyphic", sans-serif;
        opacity: 0;
        transform: translateY(6px) rotate(8deg);
        pointer-events: none;
      }
      .is-barking .bark {
        animation: bark 900ms ease-out;
      }
      @keyframes wiggle {
        0% { transform: rotate(0) scale(1); }
        20% { transform: rotate(-7deg) scale(1.04, 0.96); }
        45% { transform: rotate(6deg) scale(0.98, 1.03); }
        70% { transform: rotate(-3deg); }
        100% { transform: rotate(0) scale(1); }
      }
      @keyframes bark {
        0% { opacity: 0; transform: translateY(6px) rotate(8deg); }
        20% { opacity: 1; transform: translateY(0) rotate(8deg); }
        75% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-8px) rotate(8deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .is-wiggling svg { animation: none; }
      }
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Griffon dog in a sweater. Click to say hi.");
    // The lower jaw is cut out of the photo along the line above the teeth and dropped to open the mouth.
    button.innerHTML = `
      <svg viewBox="0 0 827 1219" aria-hidden="true">
        <defs>
          <clipPath id="jaw-shape">
            <path d="M290 668 L320 650 L400 644 L470 650 L500 668 L560 720 L610 800 L600 900 L500 975 L400 985 L300 960 L230 880 L220 780 L250 710 Z" />
          </clipPath>
          <radialGradient id="mouth-inside" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#1a0407" />
            <stop offset="100%" stop-color="#5c1c24" />
          </radialGradient>
          <filter id="mouth-soften">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <image href="${griffonUrl}" width="827" height="1219" />
        <g class="mouth" filter="url(#mouth-soften)">
          <path d="M318 662 Q400 636 484 662 Q480 712 400 716 Q320 712 318 662 Z" fill="url(#mouth-inside)" />
          <ellipse cx="408" cy="702" rx="44" ry="14" fill="#c95a68" />
        </g>
        <g class="jaw">
          <image href="${griffonUrl}" width="827" height="1219" clip-path="url(#jaw-shape)" />
        </g>
      </svg>
      <span class="bark">woof!</span>
    `;
    root.append(style, button);

    let closeTimer;
    button.addEventListener("click", () => {
      button.classList.remove("is-wiggling");
      void button.getBoundingClientRect();
      button.classList.add("is-wiggling", "is-barking");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => button.classList.remove("is-barking"), 900);
    });
    button.querySelector("svg").addEventListener("animationend", () => button.classList.remove("is-wiggling"));
  },
};
