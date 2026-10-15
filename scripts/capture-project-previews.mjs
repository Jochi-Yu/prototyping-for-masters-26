import { chromium } from "@playwright/test";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { students } from "../src/students.js";
import { projects } from "../src/projects.js";

// Screenshots keep the gallery light even when projects run WebGL or audio.
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--mute-audio"] });
await mkdir(new URL("../public/previews/", import.meta.url), { recursive: true });
const requestedTitles = process.argv.slice(2);
const queue = projects.filter((project) => !requestedTitles.length || requestedTitles.includes(project.title));
const results = [];
try {
  await Promise.all(Array.from({ length: 3 }, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    for (let project; (project = queue.shift());) {
      const page = await context.newPage();
      const student = students.find(({ name }) => name === project.student);
      const url = new URL(project.path, student.url).href;
      try {
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 25000 }).catch(async (error) => {
          if (error.name !== "TimeoutError") throw error;
          // Animated projects may keep networking; still require a rendered page.
          if (!(await page.locator("body").innerText()).trim()) throw error;
          return null;
        });
        if (response && !response.ok()) throw new Error(`HTTP ${response.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(2000);
        // Reveal representative local interaction states for these prototypes.
        if (project.path === "https://cxu25-debug.github.io/melody-maker/") {
          const canvas = page.locator("canvas").first();
          const before = await canvas.evaluate((element) => element.toDataURL());
          const bounds = await canvas.boundingBox();
          for (let stroke = 0; stroke < 3; stroke++) {
            for (let point = 0; point <= 60; point++) {
              const angle = point / 60 * Math.PI * 2;
              await page.mouse.move(
                bounds.x + bounds.width * (0.3 + stroke * 0.2 + Math.cos(angle) * 0.14),
                bounds.y + bounds.height * (0.5 + Math.sin(angle) * 0.25),
              );
              if (point === 0) await page.mouse.down();
            }
            await page.mouse.up();
          }
          await page.waitForTimeout(300);
          if (before === await canvas.evaluate((element) => element.toDataURL())) {
            throw new Error("Melody Maker drawing did not change the canvas");
          }
        }
        if (project.type === "api") {
          if (project.path === "/prototypes/spotify-palette-explorer") {
            await page.locator("input").first().fill("Miles Davis");
            await page.getByRole("button", { name: "Explore Album", exact: true }).click();
            await page.waitForTimeout(3000);
          }
          if (project.path === "/prototypes/ditto-lab") {
            await page.getByRole("button", { name: "EN", exact: true }).click();
            await page.getByRole("button", { name: /Pikachu/ }).click();
            await page.waitForTimeout(2000);
          }
          if (project.path === "/prototypes/my-toddler-could-paint-that") {
            await page.waitForFunction(() => !document.body.innerText.includes("Loading…"), {}, { timeout: 25000 });
          }
          if (project.path === "/prototypes/species-globe") {
            await page.locator("canvas").first().click({ position: { x: 720, y: 290 } });
            await page.getByText("Sightings and photos from iNaturalist", { exact: true }).waitFor({ timeout: 25000 });
            await page.waitForTimeout(2000);
          }
        }
        if (project.student === "Zhongyunqi Meng (Aria)" && project.type === "doodle") {
          const canvas = page.locator("canvas").first();
          const bounds = await canvas.boundingBox();
          for (let stroke = 0; stroke < 3; stroke++) {
            for (let point = 0; point <= 60; point++) {
              const angle = point / 60 * Math.PI * 2;
              await page.mouse.move(
                bounds.x + bounds.width * (0.3 + stroke * 0.2 + Math.cos(angle) * 0.16),
                bounds.y + bounds.height * (0.5 + Math.sin(angle) * 0.23),
              );
              if (point === 0) await page.mouse.down();
            }
            await page.mouse.up();
          }
          if (!/[1-9]\d*\/20 STROKES/.test(await page.locator("body").innerText())) {
            throw new Error("Doodle strokes did not update creature growth");
          }
        }
        if (project.path === "/prototypes/jelly-creatures") {
          await page.getByRole("button", { name: /Party Fling/ }).click();
          await page.waitForTimeout(350);
        }
        if (project.student === "Tinglan Huang (Alanis)" && project.type === "weather") {
          // The weather app lives inside an iframe and currently offers sample data.
          const weather = page.frameLocator('iframe[title="Local weather"]');
          await weather.getByRole("button", { name: "Explore demo", exact: true }).click();
          await weather.getByText("DEMO · Sample weather", { exact: true }).waitFor();
          await page.waitForTimeout(500);
        }
        if (project.type === "weather" && ["Ethan Wise", "Qianyi Ma (Kate)", "Sean Wiseman", "Yoonseo Yang (Eunice)", "Ziona Sober"].includes(project.student)) {
          await page.locator("input").first().fill("New York");
          await page.locator("input").first().press("Enter");
          await page.waitForTimeout(5000);
          const city = page.getByRole("button", { name: /^New York, New York, US/ });
          if (await city.count()) {
            await city.first().click();
            await page.waitForTimeout(3000);
          }
        }
        if (project.path === "https://point-trace-doodle.vercel.app/") {
          await page.getByRole("button", { name: "Connect all", exact: true }).click();
          await page.locator("canvas").evaluate((canvas) => {
            const bounds = canvas.getBoundingClientRect();
            window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
          });
          await page.waitForTimeout(500);
        }
        if (["/prototypes/little-print-shop", "/prototypes/doodle-playground"].includes(project.path)) {
          const isPrintShop = project.path === "/prototypes/little-print-shop";
          if (!isPrintShop) {
            await page.getByRole("button", { name: "OK", exact: true }).click();
            await page.getByRole("button", { name: "🎨 Doodle Studio", exact: true }).click();
          }
          const canvas = page.locator("canvas").last();
          const readDrawing = () => canvas.evaluate((element, printShop) => printShop
            ? element.parentElement.dataset.strokes
            : element.toDataURL(), isPrintShop);
          const before = await readDrawing();
          const bounds = await canvas.boundingBox();
          for (let stroke = 0; stroke < 2; stroke++) {
            if (isPrintShop && stroke === 1) await page.getByRole("button", { name: "Burgundy", exact: true }).click();
            for (let point = 0; point <= 60; point++) {
              const angle = point / 60 * Math.PI * 2;
              await page.mouse.move(
                bounds.x + bounds.width * (0.4 + stroke * 0.2 + Math.cos(angle) * 0.16),
                bounds.y + Math.min(bounds.height, 480) * (0.5 + Math.sin(angle) * 0.25),
              );
              if (point === 0) await page.mouse.down();
            }
            await page.mouse.up();
          }
          await page.waitForTimeout(300);
          if (before === await readDrawing()) throw new Error("Drawing interaction did not change the canvas");
        }
        if (project.path === "/prototypes/generative-blooms") {
          await page.locator("canvas").first().evaluate((canvas) => {
            const bounds = canvas.getBoundingClientRect();
            window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
          });
          await page.waitForTimeout(500);
        }
        if (project.path === "/prototypes/torch-typography") {
          await page.mouse.move(720, 420);
          await page.waitForTimeout(700);
        }
        if (project.path === "/prototypes/mayhem") {
          await page.locator("canvas").scrollIntoViewIfNeeded();
          await page.mouse.move(720, 450);
          await page.waitForTimeout(700);
        }
        if (project.path === "/prototypes/free-fall") {
          await page.getByRole("button", { name: /Type Sentences/ }).click();
          await page.getByRole("button", { name: "RADICAL KINETIC TYPOGRAPHY IN MOTION", exact: true }).click();
          await page.getByRole("button", { name: /confirm.*drop words/i }).click();
          await page.waitForTimeout(1500);
        }
        if (project.path === "/prototypes/umbrella-rain") {
          await page.getByRole("button", { name: "Start", exact: true }).click();
          await page.mouse.move(720, 550);
          await page.waitForTimeout(1200);
        }
        const target = new URL(`../public${project.preview}`, import.meta.url);
        const temp = new URL(`${target.href}.tmp`);
        await page.screenshot({ path: temp.pathname, type: "jpeg", quality: 75 });
        await rename(temp, target);
        results.push({ student: student.name, title: project.title, url, status: "captured" });
        console.log(`Captured ${student.name}: ${project.title}`);
      } catch (error) {
        results.push({ student: student.name, title: project.title, url, status: "failed", error: error.message });
        console.error(`Failed ${url}: ${error.message}`);
        process.exitCode = 1;
      } finally {
        await page.close();
      }
    }
    await context.close();
  }));
} finally {
  await browser.close();
  await mkdir(new URL("../output/week-gallery/", import.meta.url), { recursive: true });
  await writeFile(new URL("../output/week-gallery/captures.json", import.meta.url), JSON.stringify(results, null, 2));
}
