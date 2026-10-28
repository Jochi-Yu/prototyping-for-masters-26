import "./styles.css";
import { inject } from "@vercel/analytics";
import { students } from "./students.js";
import { initSitePreviews } from "./site-previews.js";
import { galleryMarkup, initGallery } from "./gallery.js";
import { applyPalette, nextPaletteIndex } from "./palette.js";
import { mastheadMarkup } from "./masthead.js";

const renderStudent = ({ name, url }, index) => {
  const number = String(index + 1).padStart(2, "0");

  if (url) {
    return `
      <li>
        <a class="student-row student-row-link" href="${url}" target="_blank" rel="noreferrer" data-student-name="${name}" aria-label="Visit ${name}'s website">
          <span class="student-number">${number}</span>
          <span class="student-name">${name}</span>
          <span class="row-action">Visit site <span aria-hidden="true">↗</span></span>
        </a>
      </li>
    `;
  }

  return `
    <li class="student-row">
      <span class="student-number">${number}</span>
      <span class="student-name">${name}</span>
      <span class="forthcoming">Site forthcoming</span>
    </li>
  `;
};

document.querySelector("#app").innerHTML = `
  <main class="site-shell">
    ${mastheadMarkup()}

    <section class="hero" id="top" aria-labelledby="course-title">
      <h1 id="course-title">
        <span>Prototyping</span>
        <span class="title-indent">for Masters</span>
      </h1>
      <div class="hero-notes">
        <p class="intro">Learn how to prototype and publish your ideas using modern and emerging development tools.</p>      </div>
    </section>

    <section class="student-section" id="student-sites" aria-label="Student work">
      ${galleryMarkup}
      <ol class="student-list" aria-label="Student sites">
        ${students.map(renderStudent).join("")}
      </ol>
    </section>

    <aside class="site-preview" aria-hidden="true">
      <div class="preview-viewport">
        <img class="preview-image" alt="" width="1440" height="900" hidden />
        <p class="preview-message">Loading preview…</p>
      </div>
    </aside>

    <footer>
      <p>Prototyping for Masters</p>
      <p>© 2026 SVA</p>
    </footer>
  </main>
`;

let paletteIndex = 0;
const paletteButton = document.querySelector(".palette-button");
const favicon = document.querySelector("#favicon");

const showPalette = (index) => {
  paletteIndex = index;
  applyPalette(index, { button: paletteButton, favicon });
};

paletteButton.addEventListener("click", () => {
  showPalette(nextPaletteIndex(paletteIndex));
});

showPalette(paletteIndex);

initSitePreviews();
initGallery(students);
inject();
