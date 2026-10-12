import { test, expect } from '@playwright/test';
import { students } from '../src/students.js';
import { studentPreviewPath } from '../src/site-previews.js';
import { existsSync } from 'node:fs';

const [firstStudent, secondStudent] = students.filter(({ url }) => url);

test('directory previews match the selected student and dismiss with Escape', async ({ page }) => {
  for (const student of students.filter(({ url }) => url)) {
    expect(existsSync(`public${studentPreviewPath(student.name)}`)).toBe(true);
  }
  await page.goto('/');
  const links = page.locator('.student-row-link');
  const preview = page.locator('.site-preview');
  await links.first().hover();
  await expect(preview).toHaveClass(/is-visible/);
  await expect(preview.locator('img')).toBeVisible();
  await expect(preview.locator('img')).toHaveAttribute('src', studentPreviewPath(firstStudent.name));
  expect(await preview.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');
  await links.nth(1).focus();
  await expect(preview.locator('.preview-label')).toHaveText(secondStudent.name);
  await expect(preview.locator('img')).toHaveAttribute('src', studentPreviewPath(secondStudent.name));
  await page.keyboard.press('Escape');
  await expect(preview).not.toHaveClass(/is-visible/);
  await expect(links.nth(1)).toBeFocused();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('failed screenshots retain a useful message and working site link', async ({ page }) => {
  await page.route('**/previews/sites/**', (route) => route.abort());
  await page.goto('/');
  const link = page.locator('.student-row-link').first();
  await link.focus();
  await expect(page.locator('.preview-message')).toHaveText(/Preview unavailable/);
  await expect(page.locator('.preview-image')).toBeHidden();
  await expect(link).toHaveAttribute('href', firstStudent.url);
  await expect(link).toHaveAttribute('target', '_blank');
});

test('late screenshots never replace the current student preview', async ({ page }) => {
  let releaseFirst;
  const blocked = new Promise((resolve) => { releaseFirst = resolve; });
  await page.route(`**${studentPreviewPath(firstStudent.name)}`, async (route) => {
    await blocked;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const links = page.locator('.student-row-link');
  await links.first().focus();
  await links.nth(1).focus();
  await expect(page.locator('.preview-image')).toHaveAttribute('src', studentPreviewPath(secondStudent.name));
  const response = page.waitForResponse(`**${studentPreviewPath(firstStudent.name)}`);
  releaseFirst();
  await response;
  await expect(page.locator('.preview-label')).toHaveText(secondStudent.name);
  await expect(page.locator('.preview-image')).toHaveAttribute('src', studentPreviewPath(secondStudent.name));
});

test('mobile directory does not load hidden previews', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/previews/sites/')) requests.push(request.url());
  });
  await page.goto('/');
  await page.locator('.student-row-link').first().focus();
  await expect(page.locator('.site-preview')).toBeHidden();
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
