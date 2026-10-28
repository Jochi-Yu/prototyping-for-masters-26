import "../styles.css";
import "./playground.css";
import { inject } from "@vercel/analytics";
import { applyPalette, nextPaletteIndex } from "../palette.js";
import { widgets } from "./widgets.js";
import { mountPlayground } from "./canvas.js";

document.documentElement.classList.add("is-playground");

const { paletteButton } = mountPlayground(document.querySelector("#app"), widgets);
const favicon = document.querySelector("#favicon");
let paletteIndex = 0;

const showPalette = (index) => {
  paletteIndex = index;
  applyPalette(index, { button: paletteButton, favicon });
};

paletteButton.addEventListener("click", () => {
  showPalette(nextPaletteIndex(paletteIndex));
});

showPalette(paletteIndex);
inject();
