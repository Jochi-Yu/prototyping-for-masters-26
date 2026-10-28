import { mastheadMarkup } from "../masthead.js";

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 220;
const GRID = 28;
const AUTO_GAP = 40;
const AUTO_ROW_WIDTH = 1600;
const CREDIT_SPACE = 32;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Widgets without both x and y are laid out in rows below the hand-placed ones.
const layoutWidgets = (widgets) => {
  const boxes = widgets.map((widget) => {
    const framed = widget.frame !== false;
    const height = Number.isFinite(widget.height) ? widget.height : DEFAULT_HEIGHT;
    return {
      x: Number.isFinite(widget.x) ? widget.x : null,
      y: Number.isFinite(widget.y) ? widget.y : null,
      width: Number.isFinite(widget.width) ? widget.width : DEFAULT_WIDTH,
      height,
      framed,
      rotate: Number.isFinite(widget.rotate) ? widget.rotate : 0,
      footprint: height + (framed ? 0 : CREDIT_SPACE),
    };
  });
  const fixed = boxes.filter((box) => box.x !== null && box.y !== null);
  let cursorX = 0;
  let cursorY = fixed.length ? Math.max(...fixed.map((box) => box.y + box.footprint)) + AUTO_GAP * 2 : 0;
  let rowHeight = 0;
  boxes.forEach((box) => {
    if (box.x !== null && box.y !== null) return;
    if (cursorX > 0 && cursorX + box.width > AUTO_ROW_WIDTH) {
      cursorX = 0;
      cursorY += rowHeight + AUTO_GAP;
      rowHeight = 0;
    }
    box.x = cursorX;
    box.y = cursorY;
    cursorX += box.width + AUTO_GAP;
    rowHeight = Math.max(rowHeight, box.footprint);
  });
  return boxes;
};

const baseShadowStyle = `
  :host {
    display: block;
    height: 100%;
  }
  :host * {
    box-sizing: border-box;
  }
  .widget-error {
    margin: 0;
    padding: 1rem;
  }
`;

const mountWidget = (widget, { x, y, width, height, framed, rotate }) => {
  const article = document.createElement("article");
  article.className = framed ? "widget" : "widget is-unframed";
  article.style.left = `${x}px`;
  article.style.top = `${y}px`;
  article.style.width = `${width}px`;
  article.style.height = `${height}px`;
  if (rotate) article.style.transform = `rotate(${rotate}deg)`;
  const credit = `
    <span class="widget-student">${escapeHtml(widget.student)}</span>
    <span class="widget-title">${escapeHtml(widget.title)}</span>
  `;
  article.innerHTML = framed
    ? `<header class="widget-caption">${credit}</header><div class="widget-body"></div>`
    : `<div class="widget-body"></div><p class="widget-credit">${credit}</p>`;
  const body = article.querySelector(".widget-body");
  const shadow = body.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = baseShadowStyle;
  try {
    if (typeof widget.mount !== "function") throw new Error("Widget is missing mount");
    widget.mount(shadow);
  } catch (error) {
    console.error(error);
    const message = document.createElement("p");
    message.className = "widget-error";
    message.textContent = "This widget failed to load";
    shadow.replaceChildren(message);
  }
  shadow.prepend(style);
  return article;
};

let topZIndex = 1;

const enableWidgetDrag = (article, box, { getScale }) => {
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let moved = false;

  article.addEventListener("dragstart", (event) => event.preventDefault());

  article.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const path = event.composedPath();
    const isCaption = path.some((el) => el instanceof Element && el.classList?.contains("widget-caption"));
    const isCredit = path.some((el) => el instanceof Element && el.classList?.contains("widget-credit"));

    if (!isCaption && !isCredit) {
      const isInteractive = path.some((el) => {
        if (!(el instanceof Element)) return false;
        const tag = el.tagName?.toLowerCase();
        return (
          tag === "button" ||
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          tag === "option" ||
          tag === "a" ||
          tag === "canvas" ||
          tag === "audio" ||
          tag === "video" ||
          el.isContentEditable ||
          el.getAttribute("draggable") === "true" ||
          el.hasAttribute("data-no-drag")
        );
      });
      if (isInteractive) return;
    }

    article.style.zIndex = `${++topZIndex}`;
    isDragging = true;
    moved = false;
    startPointerX = event.clientX;
    startPointerY = event.clientY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    const onPointerMove = (moveEvent) => {
      if (!isDragging) return;

      if (!moved) {
        if (Math.hypot(moveEvent.clientX - startPointerX, moveEvent.clientY - startPointerY) < 4) return;
        moved = true;
        article.classList.add("is-dragging");
        document.body.classList.add("is-dragging-widget");
      }

      const currentScale = getScale();
      const dx = (moveEvent.clientX - lastPointerX) / currentScale;
      const dy = (moveEvent.clientY - lastPointerY) / currentScale;
      lastPointerX = moveEvent.clientX;
      lastPointerY = moveEvent.clientY;

      box.x += dx;
      box.y += dy;
      article.style.left = `${box.x}px`;
      article.style.top = `${box.y}px`;
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      if (!isDragging) return;
      isDragging = false;

      if (moved) {
        article.classList.remove("is-dragging");
        document.body.classList.remove("is-dragging-widget");
        const suppressClick = (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        window.addEventListener("click", suppressClick, { capture: true, once: true });
        setTimeout(() => {
          window.removeEventListener("click", suppressClick, { capture: true });
        }, 50);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  });
};

export function mountPlayground(app, widgets) {
  app.innerHTML = `
    <div class="playground">
      ${mastheadMarkup({ home: "/", current: "playground" })}
      <div class="canvas-area">
        <div class="canvas-viewport" role="region" aria-label="Playground canvas" tabindex="0">
          <div class="canvas-world"></div>
        </div>
        <div class="canvas-tools" role="group" aria-label="Canvas view">
          <button type="button" aria-label="Zoom out"><span aria-hidden="true">−</span></button>
          <button type="button" aria-label="Zoom in"><span aria-hidden="true">+</span></button>
          <button class="reset-view" type="button">Reset view</button>
        </div>
      </div>
    </div>
  `;

  const viewport = app.querySelector(".canvas-viewport");
  const world = app.querySelector(".canvas-world");
  const zoomOutButton = app.querySelector("[aria-label='Zoom out']");
  const zoomInButton = app.querySelector("[aria-label='Zoom in']");
  const resetButton = app.querySelector(".reset-view");
  const paletteButton = app.querySelector(".palette-button");
  const placed = layoutWidgets(widgets);

  let x = 0;
  let y = 0;
  let scale = 1;
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  widgets.forEach((widget, index) => {
    const article = mountWidget(widget, placed[index]);
    enableWidgetDrag(article, placed[index], { getScale: () => scale });
    world.append(article);
  });

  const render = () => {
    world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    let gridSize = GRID * scale;
    while (gridSize < 18) gridSize *= 2;
    viewport.style.backgroundSize = `${gridSize}px ${gridSize}px`;
    viewport.style.backgroundPosition = `${x}px ${y}px`;
    zoomOutButton.disabled = scale <= MIN_SCALE + 0.0001;
    zoomInButton.disabled = scale >= MAX_SCALE - 0.0001;
  };

  const zoomAt = (clientX, clientY, nextScale) => {
    const next = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    if (next === scale) return;
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const ratio = next / scale;
    x = px - (px - x) * ratio;
    y = py - (py - y) * ratio;
    scale = next;
    render();
  };

  const zoomBy = (factor) => {
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale * factor);
  };

  const fitView = () => {
    if (placed.length === 0) {
      x = 0;
      y = 0;
      scale = 1;
      render();
      return;
    }
    const minX = Math.min(...placed.map((widget) => widget.x));
    const minY = Math.min(...placed.map((widget) => widget.y));
    const maxX = Math.max(...placed.map((widget) => widget.x + widget.width));
    const maxY = Math.max(...placed.map((widget) => widget.y + widget.footprint));
    const boundsW = Math.max(maxX - minX, 1);
    const boundsH = Math.max(maxY - minY, 1);
    const pad = Math.min(80, viewport.clientWidth * 0.08, viewport.clientHeight * 0.08);
    const viewW = Math.max(viewport.clientWidth - pad * 2, 1);
    const viewH = Math.max(viewport.clientHeight - pad * 2, 1);
    scale = clamp(Math.min(viewW / boundsW, viewH / boundsH, 1), MIN_SCALE, MAX_SCALE);
    x = (viewport.clientWidth - boundsW * scale) / 2 - minX * scale;
    y = (viewport.clientHeight - boundsH * scale) / 2 - minY * scale;
    render();
  };

  const widgetCanScroll = (target) => {
    const body = target.closest?.(".widget-body");
    return Boolean(body && body.scrollHeight > body.clientHeight + 1);
  };

  viewport.addEventListener("wheel", (event) => {
    if (widgetCanScroll(event.target)) return;
    event.preventDefault();
    const line = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    const delta = event.deltaY * line;
    if (delta === 0) return;
    zoomAt(event.clientX, event.clientY, scale * Math.exp(-delta * 0.0015));
  }, { passive: false });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".widget")) return;
    dragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    viewport.classList.add("is-panning");
    viewport.setPointerCapture(event.pointerId);
    viewport.focus({ preventScroll: true });
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    x += event.clientX - lastPointerX;
    y += event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    render();
  });

  const endPan = () => {
    dragging = false;
    viewport.classList.remove("is-panning");
  };
  viewport.addEventListener("pointerup", endPan);
  viewport.addEventListener("pointercancel", endPan);

  zoomOutButton.addEventListener("click", () => zoomBy(1 / 1.2));
  zoomInButton.addEventListener("click", () => zoomBy(1.2));
  resetButton.addEventListener("click", fitView);

  window.addEventListener("keydown", (event) => {
    if (event.target.closest?.(".widget")) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const step = 48;
    if (event.key === "ArrowLeft") x += step;
    else if (event.key === "ArrowRight") x -= step;
    else if (event.key === "ArrowUp") y += step;
    else if (event.key === "ArrowDown") y -= step;
    else if (event.key === "+" || event.key === "=") zoomBy(1.2);
    else if (event.key === "-" || event.key === "_") zoomBy(1 / 1.2);
    else return;
    event.preventDefault();
    if (event.key.startsWith("Arrow")) render();
  });

  fitView();

  return { paletteButton, fitView };
}
