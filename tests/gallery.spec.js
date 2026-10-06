import { test, expect } from "@playwright/test";
import { projects, weeks, projectTypes } from "../src/projects.js";
import { students } from "../src/students.js";
import { existsSync } from "node:fs";

test("weekly collection has valid student links and captured previews", async ({ page }) => {
  expect(new Set(projects.map((project) => `${project.student}:${project.path}`)).size).toBe(projects.length);
  for (const project of projects) {
    expect(students.find(({ name }) => name === project.student)?.url).toBeTruthy();
    expect(weeks.some(({ number }) => number === project.week)).toBe(true);
    expect(projectTypes.find(({ id }) => id === project.type)?.week).toBe(project.week);
    expect(existsSync(`public${project.preview}`)).toBe(true);
  }
  await page.goto("/?week=3");
  await expect(page.getByRole("heading", { name: "Week 3 - Typography" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ week }) => week === 3).length);
  const first = projects[0];
  await expect(page.locator(".project-link").first()).toHaveAttribute("href", new URL(first.path, students.find(({ name }) => name === first.student).url).href);
  await page.locator(".project-card").first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator(".project-image img").first().evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await page.locator("iframe[src^='http']").count()).toBe(0);
});

test("week filter survives reload, directory switching, and browser history", async ({ page }) => {
  await page.goto("/?source=class");
  await expect(page.locator(".student-list")).toBeVisible();
  await expect(page.locator(".project-gallery")).toBeHidden();
  await expect(page.getByRole("button", { name: "Student sites", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "All projects" })).toBeVisible();
  await page.getByLabel("Filter by week").selectOption("3");
  await expect(page).toHaveURL(/source=class&view=projects&week=3/);
  await page.reload();
  await expect(page.getByLabel("Filter by week")).toHaveValue("3");
  await page.getByRole("button", { name: "Student sites", exact: true }).click();
  await expect(page.locator(".project-gallery")).toBeHidden();
  await expect(page.locator(".student-list > li")).toHaveCount(students.length);
  await expect(page.getByLabel("Filter by week")).toBeHidden();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.getByLabel("Filter by week")).toHaveValue("3");
  await page.getByLabel("Filter by week").selectOption("all");
  await expect(page.getByRole("heading", { name: "All projects" })).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("Filter by week")).toHaveValue("3");
  await page.goForward();
  await expect(page.getByLabel("Filter by week")).toHaveValue("all");
});

test("invalid weeks recover and missing previews retain project links", async ({ page }) => {
  await page.route("**/previews/**", (route) => route.abort());
  await page.goto("/?week=999");
  await expect(page.getByRole("heading", { name: "All projects" })).toBeVisible();
  await page.locator(".project-card").first().scrollIntoViewIfNeeded();
  await expect(page.locator(".preview-fallback").first()).toBeVisible();
  await expect(page.locator(".project-link").first()).toHaveAttribute("target", "_blank");
});

test("mobile grid and filters fit the viewport; keyboard and palette still work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?week=3");
  await page.locator(".work-toolbar").scrollIntoViewIfNeeded();
  expect(await page.locator(".project-grid").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(1);
  for (const selector of [".work-toolbar", ".week-control", "#week-filter", ".project-card"]) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
  await page.getByLabel("Filter by week").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".project-link").first()).toBeFocused();
  await page.getByRole("button", { name: "Change color palette" }).click();
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--paper"))).toBe("#f4ef8a");
});

test("Week 4 shows PixiJS and Doodle together, including older type-filtered links", async ({ page }) => {
  await page.goto("/?week=4&type=pixijs");
  await expect(page.getByRole("heading", { name: "Week 4 - PixiJS & Doodle" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ week }) => week === 4).length);
  await expect(page.getByRole("combobox")).toHaveCount(1);
  await expect(page.locator('.project-link[href$="/prototypes/liquid-distortion"]')).toBeVisible();
  await expect(page.locator('.project-link[href$="/prototypes/fashion-sketchbook"]')).toHaveCount(1);
  await page.getByLabel("Filter by week").selectOption("3");
  await expect(page.getByRole("heading", { name: "Week 3 - Typography" })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("type")).toBe(false);
  await page.goBack();
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ week }) => week === 4).length);
});

test("the single Week 4 filter fits on mobile and supports keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?week=4&type=doodle");
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ week }) => week === 4).length);
  for (const selector of [".gallery-filters", "#week-filter"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
  await page.getByLabel("Filter by week").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".project-link").first()).toBeFocused();
});
