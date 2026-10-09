import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { students } from "../src/students.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "output", "student-sites-montage");
const RAW = path.join(OUTPUT, "raw");
const CLIPS = path.join(OUTPUT, "clips");
const STILLS = path.join(OUTPUT, "stills");
const MANIFEST_PATH = path.join(OUTPUT, "manifest.json");
const MONTAGE_PATH = path.join(OUTPUT, "prototyping-for-masters-student-sites.mp4");
const INDEX_PATH = path.join(OUTPUT, "source-index.md");
const CDP_PORT = 9223;
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 12;
const MIN_CLIP_SECONDS = 3;
const CLIP_SECONDS = 5;
const FULL_SCROLL_MS = 3200;
const HERAN_SCROLL_MS = 4000;
const HERAN_MAX_SECONDS = 5;
const CARNYCIA_MAX_SECONDS = 2;
const MIN_MEANINGFUL_SCROLL = 300;
const BLOCKED = /typograph|typeface|font|glyph|letterform|typespec|type\s*project/i;
const CLICK_BLOCKED = /typograph|typeface|font|glyph|letterform|typespec|type\s*project|confetti|get(?:ting)?[_\s-]*started|prototypes?\/example/i;
const DANGEROUS = /submit|send|buy|checkout|purchase|donate|subscribe|sign\s*(in|up)|log\s*in|contact|email|delete|remove/i;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const slugify = (value) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const sha = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const entry = this.pending.get(message.id);
        if (!entry) return;
        this.pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error.message));
        else entry.resolve(message.result ?? {});
        return;
      }
      for (const fn of this.listeners.get(message.method) ?? []) fn(message.params ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    const list = this.listeners.get(method) ?? [];
    list.push(fn);
    this.listeners.set(method, list);
    return () => this.listeners.set(method, (this.listeners.get(method) ?? []).filter((item) => item !== fn));
  }

  close() { this.ws.close(); }
}

async function createPage() {
  const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create Chrome target: ${response.status}`);
  const target = await response.json();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send("Emulation.setScrollbarsHidden", { hidden: true });
  await cdp.send("Page.setDownloadBehavior", { behavior: "deny" }).catch(() => {});
  return { cdp, targetId: target.id };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.exception?.value || result.exceptionDetails.text;
    throw new Error(detail || "Page evaluation failed");
  }
  return result.result?.value;
}

async function navigate(cdp, url) {
  let loaded = false;
  const off = cdp.on("Page.loadEventFired", () => { loaded = true; });
  await cdp.send("Page.navigate", { url });
  const started = Date.now();
  while (!loaded && Date.now() - started < 18000) await wait(200);
  off();
  await wait(1800);
  return evaluate(cdp, `({
    title: document.title,
    url: location.href,
    statusText: document.body?.innerText?.slice(0, 120) || "",
    height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
    width: document.documentElement.scrollWidth
  })`);
}

async function captureScreenshot(cdp) {
  const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true });
  return Buffer.from(shot.data, "base64");
}

async function findBestViewport(cdp) {
  const dimensions = await evaluate(cdp, `({
    height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
    viewport: innerHeight
  })`);
  const maxY = Math.max(0, dimensions.height - dimensions.viewport);
  const positions = [...new Set([0, .22, .44, .66, .86, 1].map((ratio) => Math.round(maxY * ratio)))];
  const samples = [];

  for (const y of positions) {
    await evaluate(cdp, `scrollTo({top:${y}, behavior:"instant"})`);
    await wait(220);
    const score = await evaluate(cdp, `(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 24 && r.height > 18 && r.bottom > 0 && r.top < innerHeight && s.visibility !== "hidden" && s.display !== "none";
      };
      const media = [...document.querySelectorAll("img,video,canvas,svg,picture")].filter(visible).length;
      const controls = [...document.querySelectorAll("button,summary,input,[role=button],[tabindex]")].filter(visible).length;
      const cards = [...document.querySelectorAll("article,[class*=card],[class*=project],[class*=work],[class*=gallery]")].filter(visible).length;
      const headings = [...document.querySelectorAll("h1,h2,h3")].filter(visible).length;
      return { media, controls, cards, headings, score: media * 12 + controls * 6 + cards * 4 + headings * 2 };
    })()`);
    samples.push({ y, ...score });
  }
  samples.sort((a, b) => b.score - a.score || a.y - b.y);
  const best = samples[0] ?? { y: 0, score: 0 };
  await evaluate(cdp, `scrollTo({top:${best.y}, behavior:"instant"})`);
  await wait(350);
  return { ...best, samples };
}

async function findSafeInteraction(cdp, includeAnchors = true, hoverOnly = false) {
  return evaluate(cdp, `(() => {
    const blocked = ${BLOCKED};
    const clickBlocked = ${CLICK_BLOCKED};
    const dangerous = ${DANGEROUS};
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 20 && r.height > 16 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && s.visibility !== "hidden" && s.display !== "none" && s.pointerEvents !== "none";
    };
    const context = (el) => {
      const parentText = [el, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement]
        .filter(Boolean).map((node) => node.innerText || node.textContent || "").join(" ").slice(0, 800);
      return [el.innerText, el.textContent, el.getAttribute("aria-label"), el.getAttribute("title"), el.getAttribute("href"), parentText].filter(Boolean).join(" ");
    };
    const candidates = [...document.querySelectorAll(${JSON.stringify("input[type=range], button, summary, [role=button], [tabindex]:not(a)" + (includeAnchors ? ", a[href]" : ""))})]
      .filter(visible)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const text = context(el);
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute("type") || "").toLowerCase();
        const insideLink = tag !== "a" && Boolean(el.closest("a"));
        const href = tag === "a" ? el.href : "";
        const crossOrigin = href && new URL(href, location.href).origin !== location.origin;
        const forbidden = clickBlocked.test(text) || dangerous.test(text) || insideLink || crossOrigin || type === "submit";
        let priority = tag === "input" && type === "range" ? 50 : tag === "button" ? 35 : tag === "summary" ? 30 : tag === "a" ? 24 : 20;
        if (/theme|dark|light|color|menu|play|shuffle|random|next|toggle|sound|mute|interactive|game|experiment/i.test(text)) priority += 20;
        if (/game|interactive/i.test(text)) priority += 80;
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), width: Math.round(r.width), height: Math.round(r.height), tag, type, text: text.trim().replace(/\s+/g, " ").slice(0, 140), forbidden, priority };
      })
      .filter((item) => !item.forbidden)
      .sort((a, b) => b.priority - a.priority || b.width * b.height - a.width * a.height);
    if (!${hoverOnly} && candidates[0]) {
      const kind = candidates[0].tag === "input" ? "range" : /drag|rotate|draw|scrub/i.test(candidates[0].text) ? "drag" : "click";
      return { kind, ...candidates[0] };
    }

    const hoverables = [...document.querySelectorAll("article,[class*=card],[class*=project],[class*=work],button,a[href],[role=button],img,video,canvas,svg")]
      .filter(visible)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const text = context(el);
        const priority = /confetti|get(?:ting)?[_\s-]*started|prototypes?\\/example/i.test(text) ? 100 : 0;
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), width: Math.round(r.width), height: Math.round(r.height), text: text.trim().replace(/\s+/g, " ").slice(0, 140), forbidden: blocked.test(text), priority };
      })
      .filter((item) => !item.forbidden)
      .sort((a, b) => b.priority - a.priority || b.width * b.height - a.width * a.height);
    if (hoverables[0]) return { kind: "hover", tag: "visual", ...hoverables[0] };
    return { kind: "hover", tag: "page", x: Math.round(innerWidth * .72), y: Math.round(innerHeight * .42), text: "page surface" };
  })()`);
}

async function addStudentLabel(cdp, name) {
  await evaluate(cdp, `(() => {
    document.getElementById("__pfm_montage_label")?.remove();
    const label = document.createElement("div");
    label.id = "__pfm_montage_label";
    label.textContent = ${JSON.stringify(name)};
    Object.assign(label.style, {
      position: "fixed", left: "24px", bottom: "24px", zIndex: "2147483647",
      padding: "9px 14px", color: "white", background: "rgba(0,0,0,.78)",
      font: "500 20px/1.1 ui-monospace, SFMono-Regular, Menlo, monospace",
      borderRadius: "2px", pointerEvents: "none", maxWidth: "70vw"
    });
    document.documentElement.appendChild(label);
  })()`);
  await wait(120);
}

async function findMatthewAppIcons(cdp) {
  return evaluate(cdp, `(() => {
    const labels = [/prototype/i, /the internet/i, /spotify/i, /photo/i];
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 18 && r.height > 18 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && s.visibility !== "hidden" && s.display !== "none";
    };
    const elements = [...document.querySelectorAll("button,[role=button],[tabindex],a,div")].filter(visible);
    const points = [];
    for (const label of labels) {
      const matches = elements
        .map((el) => {
          const text = [el.getAttribute("aria-label"), el.getAttribute("title"), el.innerText, el.textContent].filter(Boolean).join(" ").replace(/\\s+/g, " ").trim();
          const r = el.getBoundingClientRect();
          return { el, text, r, area: r.width * r.height };
        })
        .filter((item) => label.test(item.text) && item.area < innerWidth * innerHeight * .25)
        .sort((a, b) => a.area - b.area);
      const match = matches[0];
      if (match) points.push({ x: Math.round(match.r.left + match.r.width / 2), y: Math.round(match.r.top + match.r.height / 2), text: match.text.slice(0, 80) });
      if (points.length === 3) break;
    }
    return points.length ? { kind: "multiClick", tag: "desktop-icons", points, x: points[0].x, y: points[0].y, text: points.map((point) => point.text).join(" → ") } : null;
  })()`);
}

async function performInteraction(cdp, interaction) {
  const before = await captureScreenshot(cdp);
  if (interaction.kind === "multiClick") {
    for (const point of interaction.points) {
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
      await wait(180);
      await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
      await wait(420);
    }
    const after = await captureScreenshot(cdp);
    return { beforeHash: sha(before), afterHash: sha(after), changed: sha(before) !== sha(after), after };
  }
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: interaction.x, y: interaction.y });
  await wait(250);

  if (interaction.kind === "click") {
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: interaction.x, y: interaction.y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: interaction.x, y: interaction.y, button: "left", clickCount: 1 });
  } else if (interaction.kind === "range") {
    const endX = Math.min(WIDTH - 24, interaction.x + Math.max(36, Math.round(interaction.width * .28)));
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: interaction.x, y: interaction.y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: endX, y: interaction.y, button: "left", buttons: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: endX, y: interaction.y, button: "left", clickCount: 1 });
  } else if (interaction.kind === "drag") {
    const endX = Math.min(WIDTH - 40, interaction.x + 120);
    const endY = Math.max(40, interaction.y - 40);
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: interaction.x, y: interaction.y, button: "left", clickCount: 1 });
    for (let step = 1; step <= 6; step++) {
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: interaction.x + (endX - interaction.x) * step / 6, y: interaction.y + (endY - interaction.y) * step / 6, button: "left", buttons: 1 });
      await wait(70);
    }
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: endX, y: endY, button: "left", clickCount: 1 });
  }

  await wait(450);
  const after = await captureScreenshot(cdp);
  return { beforeHash: sha(before), afterHash: sha(after), changed: sha(before) !== sha(after), after };
}

async function recordFrames(cdp, frameDir, interaction, targetY = 0, scrollDurationMs = FULL_SCROLL_MS, maxSeconds = CLIP_SECONDS) {
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  let latest = await captureScreenshot(cdp);
  let frameIndex = 0;
  const frameHashes = [];
  const off = cdp.on("Page.screencastFrame", async ({ data, sessionId }) => {
    latest = Buffer.from(data, "base64");
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });

  const sampler = setInterval(() => {
    if (!latest) return;
    const file = path.join(frameDir, `${String(frameIndex++).padStart(5, "0")}.jpg`);
    fs.writeFileSync(file, latest);
    frameHashes.push(sha(latest));
  }, 1000 / FPS);

  await wait(150);
  if (targetY > 0) {
    await evaluate(cdp, `new Promise((resolve) => {
      const startY = scrollY;
      const endY = ${targetY};
      const startedAt = performance.now();
      const duration = ${scrollDurationMs};
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        scrollTo(0, startY + (endY - startY) * eased);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    })`);
  } else {
    await wait(100);
  }
  const result = await performInteraction(cdp, interaction);
  await wait(interaction.kind === "multiClick" ? 1200 : targetY > 0 ? 650 : 3900);
  clearInterval(sampler);
  await cdp.send("Page.stopScreencast").catch(() => {});
  off();

  const wanted = FPS * maxSeconds;
  while (frameIndex < wanted) {
    fs.writeFileSync(path.join(frameDir, `${String(frameIndex++).padStart(5, "0")}.jpg`), latest);
    frameHashes.push(sha(latest));
  }
  let lastMotionFrame = 0;
  const cappedHashes = frameHashes.slice(0, wanted);
  for (let index = 1; index < cappedHashes.length; index++) {
    if (cappedHashes[index] !== cappedHashes[index - 1]) lastMotionFrame = index;
  }
  const minFrames = FPS * MIN_CLIP_SECONDS;
  const keptFrameCount = Math.min(wanted, Math.max(minFrames, lastMotionFrame + 7));
  for (let index = keptFrameCount; index < frameIndex; index++) {
    fs.rmSync(path.join(frameDir, `${String(index).padStart(5, "0")}.jpg`), { force: true });
  }
  return {
    ...result,
    frameCount: keptFrameCount,
    capturedFrameCount: frameIndex,
    motionFrameCount: cappedHashes.filter((hash, index) => index > 0 && hash !== cappedHashes[index - 1]).length,
    lastMotionFrame,
    duration: keptFrameCount / FPS,
  };
}

function encodeClip(frameDir, clipPath, name, duration) {
  const args = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-framerate", String(FPS),
    "-i", path.join(frameDir, "%05d.jpg"),
    "-t", String(duration),
    "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:black`,
    "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-an", clipPath,
  ];
  const run = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (run.status !== 0) throw new Error(run.stderr || `ffmpeg failed for ${name}`);
}

async function captureStudent(student, index) {
  const slug = `${String(index + 1).padStart(2, "0")}-${slugify(student.name)}`;
  const frameDir = path.join(RAW, slug);
  const clipPath = path.join(CLIPS, `${slug}.mp4`);
  const stillPath = path.join(STILLS, `${slug}.jpg`);
  const record = { index: index + 1, name: student.name, sourceUrl: student.url, slug, status: "pending", duration: CLIP_SECONDS, audio: "not requested; intentionally silent" };
  const { cdp, targetId } = await createPage();
  try {
    const page = await navigate(cdp, student.url);
    record.page = page;
    const body = `${page.title} ${page.statusText}`;
    if (!page.url.startsWith("http") || /404|not found|deployment.*not found|site not found/i.test(body)) throw new Error(`Page appears unavailable: ${body.slice(0, 100)}`);
    const dimensions = await evaluate(cdp, `({
      height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
      viewport: innerHeight
    })`);
    const targetY = Math.max(0, dimensions.height - dimensions.viewport);
    const shouldScroll = targetY >= MIN_MEANINGFUL_SCROLL;
    await evaluate(cdp, `scrollTo({top:${shouldScroll ? targetY : 0}, behavior:"instant"})`);
    await wait(300);
    const scrollDurationMs = student.name === "Heran Cui" ? HERAN_SCROLL_MS : FULL_SCROLL_MS;
    const maxSeconds = student.name === "Heran Cui" ? HERAN_MAX_SECONDS : student.name === "Carnycia Royce" ? CARNYCIA_MAX_SECONDS : CLIP_SECONDS;
    record.highlight = { y: shouldScroll ? targetY : 0, scrollShown: shouldScroll, fullPageScroll: shouldScroll, pageHeight: dimensions.height, viewportHeight: dimensions.viewport, scrollDurationMs };
    await evaluate(cdp, `document.querySelectorAll("a[target]").forEach((link) => link.removeAttribute("target"))`);
    let interaction = student.name === "Hoi Kin Chan (Matthew)" ? await findMatthewAppIcons(cdp) : null;
    interaction ||= await findSafeInteraction(cdp, true, !shouldScroll);
    record.interaction = interaction;
    await evaluate(cdp, `scrollTo({top:0, behavior:"instant"})`);
    await wait(250);
    await addStudentLabel(cdp, student.name);
    const capture = await recordFrames(cdp, frameDir, interaction, shouldScroll ? targetY : 0, scrollDurationMs, maxSeconds);
    record.verification = capture;
    record.duration = capture.duration;
    encodeClip(frameDir, clipPath, student.name, capture.duration);
    fs.writeFileSync(stillPath, capture.after);
    record.captureFile = path.relative(ROOT, clipPath);
    record.stillFile = path.relative(ROOT, stillPath);
    record.status = "captured";
  } catch (error) {
    record.status = "skipped";
    record.error = error.message;
  } finally {
    cdp.close();
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${targetId}`).catch(() => {});
  }
  return record;
}

function writeManifest(records) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify({ generatedAt: new Date().toISOString(), dimensions: [WIDTH, HEIGHT], fps: 30, clipSeconds: { min: Math.min(MIN_CLIP_SECONDS, CARNYCIA_MAX_SECONDS), standardMax: CLIP_SECONDS, extendedMax: HERAN_MAX_SECONDS }, blockedClickPattern: CLICK_BLOCKED.source, records }, null, 2)}\n`);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = Number.isInteger(seconds) ? String(seconds).padStart(2, "0") : seconds.toFixed(1).padStart(4, "0");
  return `${String(minutes).padStart(2, "0")}:${formatted}`;
}

function assembleMontage() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const captured = manifest.records.filter((record) => record.status === "captured");
  if (!captured.length) throw new Error("No captured clips found in manifest.");
  const inputs = captured.flatMap((record) => ["-i", path.join(ROOT, record.captureFile)]);
  const streams = captured.map((_, index) => `[${index}:v]`).join("");
  const run = spawnSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", ...inputs,
    "-filter_complex", `${streams}concat=n=${captured.length}:v=1:a=0[outv]`,
    "-map", "[outv]", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", MONTAGE_PATH,
  ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(run.stderr || "Could not assemble montage");

  let timelineCursor = 0;
  const rows = captured.map((record) => {
    const start = timelineCursor;
    const end = start + record.duration;
    timelineCursor = end;
    const action = record.interaction?.kind === "multiClick" ? "app icon clicks" : record.interaction?.kind === "click" ? "click" : record.interaction?.kind === "range" ? "slider drag" : record.interaction?.kind === "drag" ? "drag" : record.interaction?.kind === "hover" ? "hover" : "passive hold";
    const detail = record.highlight?.scrollShown ? `scroll + ${action}` : action;
    return `| ${formatTime(start)}–${formatTime(end)} | ${record.name} | ${detail} | ${record.sourceUrl} |`;
  });
  const missing = students.filter((student) => !student.url).map((student) => student.name).join(", ");
  const skipped = manifest.records.filter((record) => record.status !== "captured");
  const minimumDuration = Math.min(...captured.map((record) => record.duration));
  const maximumDuration = Math.max(...captured.map((record) => record.duration));
  const indexText = `# Prototyping for Masters — student site montage\n\n` +
    `- ${captured.length} active sites captured at ${minimumDuration}–${maximumDuration.toFixed(1)} seconds each, with immediate hard cuts\n` +
    `- Output: ${WIDTH}×${HEIGHT}, 30 fps, H.264, intentionally silent\n` +
    `- Typography, Confetti button, and Getting Started projects were excluded from click selection; their cards may be hovered\n` +
    `- Students without a published site were not included: ${missing}\n` +
    (skipped.length ? `- Unavailable sites skipped: ${skipped.map((record) => record.name).join(", ")}\n` : "") +
    `\n| Time | Student | Interaction | Source |\n|---|---|---|---|\n${rows.join("\n")}\n`;
  fs.writeFileSync(INDEX_PATH, indexText);
  return { captured: captured.length, duration: timelineCursor, montagePath: MONTAGE_PATH };
}

function retrimClips() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const minFrames = FPS * MIN_CLIP_SECONDS;
  for (const record of manifest.records.filter((item) => item.status === "captured")) {
    const frameDir = path.join(RAW, record.slug);
    const oldFrameCount = record.verification.frameCount;
    const maximumFrames = FPS * (record.name === "Carnycia Royce" ? CARNYCIA_MAX_SECONDS : record.name === "Heran Cui" ? HERAN_MAX_SECONDS : CLIP_SECONDS);
    const keptFrameCount = Math.min(oldFrameCount, maximumFrames, Math.max(Math.min(minFrames, maximumFrames), record.verification.lastMotionFrame + 7));
    for (let index = keptFrameCount; index < oldFrameCount; index++) {
      fs.rmSync(path.join(frameDir, `${String(index).padStart(5, "0")}.jpg`), { force: true });
    }
    record.verification.frameCount = keptFrameCount;
    record.duration = keptFrameCount / FPS;
    encodeClip(frameDir, path.join(ROOT, record.captureFile), record.name, record.duration);
  }
  writeManifest(manifest.records);
  return manifest.records.map((record) => ({ name: record.name, duration: record.duration }));
}

async function main() {
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(CLIPS, { recursive: true });
  fs.mkdirSync(STILLS, { recursive: true });
  if (process.argv.includes("--assemble-only")) {
    console.log(assembleMontage());
    return;
  }
  if (process.argv.includes("--retrim-only")) {
    console.log(retrimClips());
    return;
  }
  const active = students.filter((student) => student.url);
  const pilot = process.argv.includes("--pilot");
  const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
  const onlyNames = onlyArg ? onlyArg.slice("--only=".length).split(",").map((name) => name.trim()) : [];
  const selected = pilot ? active.slice(0, 1) : onlyNames.length ? active.filter((student) => onlyNames.includes(student.name)) : active;
  const records = [];
  for (let selectedIndex = 0; selectedIndex < selected.length; selectedIndex++) {
    const student = selected[selectedIndex];
    const index = active.findIndex((candidate) => candidate.name === student.name);
    process.stdout.write(`[${selectedIndex + 1}/${selected.length}] ${student.name} — ${student.url}\n`);
    const record = await captureStudent(student, index);
    records.push(record);
    if (onlyNames.length && fs.existsSync(MANIFEST_PATH)) {
      const prior = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")).records;
      const merged = prior.some((old) => old.name === record.name)
        ? prior.map((old) => old.name === record.name ? record : old)
        : [...prior, record].sort((a, b) => a.index - b.index);
      writeManifest(merged);
    } else {
      writeManifest(records);
    }
    process.stdout.write(`  ${record.status}${record.error ? `: ${record.error}` : ` (${record.interaction.kind}: ${record.interaction.text || record.interaction.tag})`}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
