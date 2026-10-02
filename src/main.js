import "./styles.css";
import { students } from "./students.js";

const palettes = [
  { name: "White on black", foreground: "#ffffff", background: "#000000" },
  { name: "Blue on butter", foreground: "#1735c7", background: "#f4ef8a" },
  { name: "Forest on peach", foreground: "#174331", background: "#ffb19e" },
  { name: "Aubergine on pink", foreground: "#38104d", background: "#ff8fc8" },
  { name: "Plum on acid", foreground: "#641045", background: "#d1ff6a" },
  { name: "Rust on sky", foreground: "#9e321b", background: "#bfe4ff" },
];

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
    <header class="masthead">
      <a class="wordmark" href="#top" aria-label="Prototyping for Masters home">Fall / 2026</a>
      <button class="palette-button" type="button" aria-label="Change color palette">
        <span class="palette-dot" aria-hidden="true"></span>
      </button>
    </header>

    <section class="hero" id="top" aria-labelledby="course-title">
      <p class="eyebrow">DSG-5465-A · Elizabeth Lin</p>
      <h1 id="course-title">
        <span>Prototyping</span>
        <span class="title-indent">for Masters</span>
      </h1>
      <div class="hero-notes">
        <p class="intro">Learn how to prototype and publish your ideas using modern and emerging development tools.</p>
      </div>
    </section>

    <section class="student-section" id="student-sites" aria-label="Student sites">
      <ol class="student-list">
        ${students.map(renderStudent).join("")}
      </ol>
    </section>

    <aside class="site-preview" aria-hidden="true">
      <div class="preview-bar">
        <span class="preview-label">Site preview</span>
        <span class="preview-status">Loading</span>
      </div>
      <div class="preview-viewport">
        <iframe class="preview-frame" title="" tabindex="-1"></iframe>
      </div>
    </aside>

    <footer>
      <p>Prototyping for Masters</p>
      <p>© 2026 SVA</p>
    </footer>
  </main>
`;

let paletteIndex = 0;
const root = document.documentElement;
const paletteButton = document.querySelector(".palette-button");
const favicon = document.querySelector("#favicon");

const applyPalette = (index) => {
  const palette = palettes[index];
  root.style.setProperty("--ink", palette.foreground);
  root.style.setProperty("--paper", palette.background);
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${palette.background}"/></svg>`;
  favicon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
  paletteButton.setAttribute("title", palette.name);
};

paletteButton.addEventListener("click", () => {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  applyPalette(paletteIndex);
});

applyPalette(paletteIndex);

const preview = document.querySelector(".site-preview");
const previewFrame = document.querySelector(".preview-frame");
const previewLabel = document.querySelector(".preview-label");
const previewStatus = document.querySelector(".preview-status");
const previewLinks = document.querySelectorAll(".student-row-link");
let activePreviewLink = null;
let previewTimer;

const showPreview = (link) => {
  window.clearTimeout(previewTimer);
  activePreviewLink = link;

  const studentName = link.dataset.studentName;
  const url = link.href;

  previewLabel.textContent = studentName;
  previewFrame.title = `${studentName}'s website preview`;
  preview.classList.add("is-visible");

  if (previewFrame.dataset.loadedUrl !== url) {
    preview.classList.add("is-loading");
    previewStatus.textContent = "Loading";
    if (previewFrame.dataset.url !== url) {
      previewFrame.dataset.url = url;
      previewFrame.src = url;
    }
  } else {
    preview.classList.remove("is-loading");
    previewStatus.textContent = "Live preview";
  }
};

const hidePreview = (link) => {
  previewTimer = window.setTimeout(() => {
    if (activePreviewLink === link) {
      activePreviewLink = null;
      preview.classList.remove("is-visible");
    }
  }, 80);
};

previewFrame.addEventListener("load", () => {
  previewFrame.dataset.loadedUrl = previewFrame.dataset.url;
  preview.classList.remove("is-loading");
  previewStatus.textContent = "Live preview";
});

previewLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => showPreview(link));
  link.addEventListener("mouseleave", () => hidePreview(link));
  link.addEventListener("focus", () => showPreview(link));
  link.addEventListener("blur", () => hidePreview(link));
});
