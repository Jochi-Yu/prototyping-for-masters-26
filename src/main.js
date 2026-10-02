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
        <div class="preview-frames">
          <iframe class="preview-frame" title="" tabindex="-1"></iframe>
          <iframe class="preview-frame" title="" tabindex="-1"></iframe>
        </div>
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
const previewLabel = document.querySelector(".preview-label");
const previewStatus = document.querySelector(".preview-status");
const previewLinks = document.querySelectorAll(".student-row-link");
const frameRecords = [...document.querySelectorAll(".preview-frame")].map((frame) => ({
  frame,
  url: null,
  loadedUrl: null,
}));
const previewPreloader = document.createElement("iframe");
const preloadQueue = [];
const queuedUrls = new Set();
const warmedUrls = new Set();
let activePreviewLink = null;
let activePreviewUrl = null;
let activeFrameRecord = null;
let isPreloading = false;
let preloadingUrl = null;
let previewTimer;

const activateFrame = (record) => {
  frameRecords.forEach(({ frame }) => frame.classList.remove("is-active"));
  record.frame.classList.add("is-active");
  activeFrameRecord = record;
};

frameRecords.forEach((record) => {
  record.frame.addEventListener("load", () => {
    if (!record.url) return;

    record.loadedUrl = record.url;
    warmedUrls.add(record.url);

    if (activePreviewUrl === record.loadedUrl) {
      activateFrame(record);
      preview.classList.remove("is-loading");
      previewStatus.textContent = "Live preview";
    }
  });
});

previewPreloader.className = "preview-preloader";
previewPreloader.title = "";
previewPreloader.tabIndex = -1;
previewPreloader.setAttribute("aria-hidden", "true");
document.body.append(previewPreloader);

const loadPreviewFrame = (link) => {
  const url = link.href;
  const readyRecord = frameRecords.find((record) => record.loadedUrl === url);

  if (readyRecord) return readyRecord;

  const loadingRecord = frameRecords.find((record) => record.url === url);
  if (loadingRecord) return loadingRecord;

  const targetRecord = frameRecords.find((record) => record !== activeFrameRecord) ?? frameRecords[0];
  targetRecord.url = url;
  targetRecord.loadedUrl = null;
  targetRecord.frame.title = `${link.dataset.studentName}'s website preview`;
  targetRecord.frame.src = url;

  return targetRecord;
};

const showPreview = (link) => {
  window.clearTimeout(previewTimer);
  activePreviewLink = link;

  const studentName = link.dataset.studentName;
  const url = link.href;
  const record = loadPreviewFrame(link);

  activePreviewUrl = url;
  previewLabel.textContent = studentName;
  preview.classList.add("is-visible");

  if (record.loadedUrl === url) {
    activateFrame(record);
    preview.classList.remove("is-loading");
    previewStatus.textContent = "Live preview";
  } else {
    preview.classList.add("is-loading");
    previewStatus.textContent = "Loading";
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

const runPreloadQueue = () => {
  if (isPreloading) return;

  if (preloadQueue.length === 0) {
    previewPreloader.src = "about:blank";
    return;
  }

  const link = preloadQueue.shift();
  const url = link.href;
  queuedUrls.delete(url);

  if (warmedUrls.has(url) || frameRecords.some((record) => record.url === url)) {
    runPreloadQueue();
    return;
  }

  isPreloading = true;
  preloadingUrl = url;
  const finishPreload = () => {
    if (preloadingUrl !== url) return;

    warmedUrls.add(url);
    preloadingUrl = null;
    isPreloading = false;
    schedulePreload();
  };
  const preloadTimeout = window.setTimeout(finishPreload, 6000);

  previewPreloader.addEventListener("load", () => {
    window.clearTimeout(preloadTimeout);
    finishPreload();
  }, { once: true });
  previewPreloader.src = url;
};

const schedulePreload = () => {
  if (isPreloading || preloadQueue.length === 0) return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runPreloadQueue, { timeout: 1600 });
  } else {
    window.setTimeout(runPreloadQueue, 300);
  }
};

const queuePreviewPreload = (link) => {
  const url = link.href;
  if (warmedUrls.has(url) || queuedUrls.has(url) || frameRecords.some((record) => record.url === url)) return;

  queuedUrls.add(url);
  preloadQueue.push(link);
  schedulePreload();
};

previewLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => showPreview(link));
  link.addEventListener("mouseleave", () => hidePreview(link));
  link.addEventListener("focus", () => showPreview(link));
  link.addEventListener("blur", () => hidePreview(link));
});

if (window.matchMedia("(hover: hover) and (min-width: 48.01rem)").matches) {
  const previewObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        queuePreviewPreload(entry.target);
        previewObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: "240px 0px" });

  previewLinks.forEach((link) => previewObserver.observe(link));
}
