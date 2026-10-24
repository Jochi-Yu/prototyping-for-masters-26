import { test, expect } from "@playwright/test";
import { projects, weeks, projectTypes } from "../src/projects.js";
import { students } from "../src/students.js";
import { existsSync } from "node:fs";

test("weekly collection has valid student links and captured previews", async ({ page }) => {
  expect(new Set(projects.map((project) => `${project.student}:${project.path}`)).size).toBe(projects.length);
  expect(new Set(projects.map((project) => project.preview)).size).toBe(projects.length);
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
  await page.getByLabel("Filter by week and project").selectOption("typography");
  await expect(page).toHaveURL(/source=class&view=projects&week=3/);
  await page.reload();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("typography");
  await page.getByRole("button", { name: "Student sites", exact: true }).click();
  await expect(page.locator(".project-gallery")).toBeHidden();
  await expect(page.locator(".student-list > li")).toHaveCount(students.length);
  await expect(page.getByLabel("Filter by week and project")).toBeHidden();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("typography");
  await page.getByLabel("Filter by week and project").selectOption("all");
  await expect(page.getByRole("heading", { name: "All projects" })).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("typography");
  await page.goForward();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("all");
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
  await page.getByLabel("Filter by week and project").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".project-link").first()).toBeFocused();
  await page.getByRole("button", { name: "Change color palette" }).click();
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--paper"))).toBe("#f4ef8a");
});

test("Week 4 collections stay separate across selection, reload, and browser history", async ({ page }) => {
  await page.goto("/?week=4&type=pixijs");
  await expect(page.getByRole("heading", { name: "Week 4 - PixiJS" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ type }) => type === "pixijs").length);
  await expect(page.getByRole("combobox")).toHaveCount(1);
  await expect(page.locator('.project-link[href$="/prototypes/liquid-distortion"]')).toBeVisible();
  await expect(page.locator('.project-link[href$="/prototypes/fashion-sketchbook"]')).toHaveCount(0);
  await page.getByLabel("Filter by week and project").selectOption("doodle");
  await expect(page.getByRole("heading", { name: "Week 4 - Doodle" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ type }) => type === "doodle").length);
  await expect(page.locator('.project-link[href$="/prototypes/liquid-distortion"]')).toHaveCount(0);
  await expect(page.locator('.project-link[href$="/prototypes/fashion-sketchbook"]')).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("doodle");
  await page.getByRole("button", { name: "Student sites", exact: true }).click();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("doodle");
  await page.getByLabel("Filter by week and project").selectOption("typography");
  await expect(page.getByRole("heading", { name: "Week 3 - Typography" })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("type")).toBe("typography");
  await page.goBack();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("doodle");
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ type }) => type === "doodle").length);
});

test("the single Week 4 filter fits on mobile and supports keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?week=4&type=doodle");
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ type }) => type === "doodle").length);
  for (const selector of [".gallery-filters", "#week-filter"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
  await page.getByLabel("Filter by week and project").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".project-link").first()).toBeFocused();
});


test("every project view is alphabetical by student, then most recent week first", async ({ page }) => {
  await page.goto("/?view=projects");
  const typeOrder = new Map(projectTypes.map(({ title }, index) => [title, index]));
  for (const type of ["all", ...projectTypes.map(({ id }) => id)]) {
    await page.getByLabel("Filter by week and project").selectOption(type);
    const collection = projectTypes.find(({ id }) => id === type);
    const cards = await page.locator(".project-card").evaluateAll((cards) => cards.map((card) => {
      const [, week, type] = card.querySelector(".project-week").textContent.match(/^Week (\d+)(?:: (.+))?$/);
      return {
        student: (card.querySelector(".project-student") ?? card.closest(".student-project-row").querySelector(".project-student")).textContent,
        week: Number(week),
        type,
        title: card.querySelector("h3").textContent,
      };
    }));
    const names = cards.map(({ student }) => student);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    for (const name of new Set(names)) {
      const studentCards = cards.filter(({ student }) => student === name);
      const expected = [...studentCards].sort((a, b) => b.week - a.week
        || typeOrder.get(b.type ?? collection.title) - typeOrder.get(a.type ?? collection.title)
        || a.title.localeCompare(b.title, "en"));
      expect(studentCards.map(({ title }) => title)).toEqual(expected.map(({ title }) => title));
    }
  }
  await page.getByLabel("Filter by week and project").selectOption("all");
  const firstRowWeeks = (await page.locator(".student-project-row").first().locator(".project-week").allTextContents())
    .map((label) => Number(label.match(/^Week (\d+)/)[1]));
  expect(new Set(firstRowWeeks).size).toBeGreaterThan(1);
  expect(firstRowWeeks).toEqual([...firstRowWeeks].sort((a, b) => b - a));
});

test("Week 5 API explorations stay separate from weather across shared links and history", async ({ page }) => {
  await page.goto("/?week=5&type=api");
  await expect(page.getByRole("heading", { name: "Week 5 - API explorations" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(projects.filter(({ type }) => type === "api").length);
  await expect(page.locator('.project-link[href$="/prototypes/ditto-lab"]')).toBeVisible();
  await expect(page.locator('.project-link[href$="/prototypes/local-weather"]')).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("api");
  await page.getByLabel("Filter by week and project").selectOption("weather");
  await expect(page.getByRole("heading", { name: "Week 5 - Weather apps" })).toBeVisible();
  await expect(page.locator('.project-link[href$="/prototypes/ditto-lab"]')).toHaveCount(0);
  await page.goBack();
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("api");
  await page.goto("/?week=5");
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("weather");
});

test("week-only and invalid type links recover to a valid collection", async ({ page }) => {
  for (const query of ["?week=4", "?week=4&type=unknown", "?type=pixijs"]) {
    await page.goto(`/${query}`);
    await expect(page.getByLabel("Filter by week and project")).toHaveValue("pixijs");
    await expect(page.getByRole("heading", { name: "Week 4 - PixiJS" })).toBeVisible();
  }
  await page.goto("/?week=999&type=unknown");
  await expect(page.getByLabel("Filter by week and project")).toHaveValue("all");
  await expect(page.locator(".project-card")).toHaveCount(projects.length);
});

test("all projects groups each student into a carousel row", async ({ page }) => {
  await page.goto("/?view=projects");
  const studentNames = [...new Set(projects.map(({ student }) => student))].sort((a, b) => a.localeCompare(b, "en"));
  await expect(page.locator(".student-project-row")).toHaveCount(studentNames.length);
  await expect(page.locator(".student-project-row .project-student")).toHaveText(studentNames);
  const row = page.locator(".student-project-row").filter({ has: page.locator(".student-project-track > li:nth-child(4)") }).first();
  const track = row.locator(".student-project-track");
  await expect(row.getByRole("button", { name: /^Previous projects/ })).toBeDisabled();
  await row.getByRole("button", { name: /^Next projects/ }).click();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(row.getByRole("button", { name: /^Previous projects/ })).toBeEnabled();
  await page.getByLabel("Filter by week and project").selectOption("typography");
  await expect(page.locator(".student-project-row")).toHaveCount(0);
});
