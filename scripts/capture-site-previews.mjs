import { chromium } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { students } from '../src/students.js';
import { studentPreviewPath } from '../src/site-previews.js';

const browser = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const directory = new URL('../public/previews/sites/', import.meta.url);
await mkdir(directory, { recursive: true });
const names = process.argv.slice(2);
const queue = students.filter(({ name, url }) => url && (!names.length || names.includes(name)));
const results = [];
try {
  await Promise.all(Array.from({ length: 3 }, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    for (let student; (student = queue.shift());) {
      const page = await context.newPage();
      try {
        const response = await page.goto(student.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(2500);
        // This portfolio paints its name mosaic into a canvas client-side.
        if (student.name === 'Hoi Kin Chan (Matthew)') {
          await page.locator('canvas').first().waitFor({ timeout: 15000 });
          await page.waitForTimeout(1500);
        }
        const target = new URL(`../public${studentPreviewPath(student.name)}`, import.meta.url);
        const temp = new URL(`${target.href}.tmp`);
        await page.screenshot({ path: temp.pathname, type: 'jpeg', quality: 85, timeout: 15000 });
        await rename(temp, target);
        results.push({ ...student, status: 'captured' });
        console.log(`Captured ${student.name}`);
      } catch (error) {
        results.push({ ...student, status: 'failed', error: error.message });
        console.error(`Failed ${student.name}: ${error.message}`);
        process.exitCode = 1;
      } finally {
        await page.close();
      }
    }
    await context.close();
  }));
} finally {
  await browser.close();
  await mkdir(new URL('../output/site-previews/', import.meta.url), { recursive: true });
  await writeFile(new URL('../output/site-previews/captures.json', import.meta.url), JSON.stringify(results, null, 2));
}
