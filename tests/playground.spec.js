import { expect, test } from "@playwright/test";

const readView = (page) => page.locator(".canvas-world").evaluate((el) => {
  const matrix = new DOMMatrix(getComputedStyle(el).transform);
  return { x: matrix.e, y: matrix.f, scale: matrix.a };
});

test("playground canvas pans, zooms, and hosts widgets", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Playground" }).click();
  await expect(page).toHaveURL(/\/playground\/?$/);
  await expect(page.getByRole("link", { name: "Playground" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("region", { name: "Playground canvas" })).toBeVisible();
  await expect(page.getByText("Elizabeth Lin", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("New York time", { exact: true })).toBeVisible();
  const clock = page.getByRole("img", { name: /\d{1,2}:\d{2} [AP]M in New York/ });
  await expect(clock).toBeVisible();
  await expect(page.locator(".widget.is-unframed")).toHaveCount(1);
  await clock.click();
  await expect(page.locator(".widget-body").first().locator(".face")).toHaveClass(/is-spinning/);

  const fitted = await readView(page);
  const viewport = page.locator(".canvas-viewport");
  const box = await viewport.boundingBox();
  await page.mouse.move(box.x + 24, box.y + 24);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + 96, { steps: 8 });
  await page.mouse.up();
  const panned = await readView(page);
  expect(panned.x).toBeGreaterThan(fitted.x + 50);
  expect(panned.y).toBeGreaterThan(fitted.y + 20);

  await page.getByRole("button", { name: "Zoom in" }).click();
  const zoomed = await readView(page);
  expect(zoomed.scale).toBeGreaterThan(panned.scale);

  await page.mouse.move(box.x + 24, box.y + 24);
  await page.mouse.wheel(0, -200);
  const wheeled = await readView(page);
  expect(wheeled.scale).toBeGreaterThan(zoomed.scale);

  await page.getByRole("button", { name: "Reset view" }).click();
  const reset = await readView(page);
  expect(reset.scale).toBeCloseTo(fitted.scale, 4);
  expect(reset.x).toBeCloseTo(fitted.x, 1);
  expect(reset.y).toBeCloseTo(fitted.y, 1);

  await viewport.focus();
  await page.keyboard.press("ArrowLeft");
  const nudged = await readView(page);
  expect(nudged.x).toBeGreaterThan(reset.x + 20);
});

test("homepage and playground share the same header", async ({ page }) => {
  const readHeader = () => page.locator(".masthead").evaluate((header) => {
    const link = header.querySelector(".masthead-link").getBoundingClientRect();
    return {
      text: header.innerText,
      linkRight: Math.round(link.right),
      transform: getComputedStyle(header.querySelector(".masthead-link")).textTransform,
    };
  });
  await page.goto("/");
  const home = await readHeader();
  await page.goto("/playground/");
  const playground = await readHeader();
  expect(playground).toEqual(home);
  expect(home.linkRight).toBeGreaterThan(page.viewportSize().width / 2);
});

test("playground fits a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/playground/");
  await expect(page.getByText("New York time", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const name of ["Zoom out", "Zoom in", "Reset view", "Change color palette"]) {
    const control = await page.getByRole("button", { name }).boundingBox();
    expect(control.x).toBeGreaterThanOrEqual(0);
    expect(control.x + control.width).toBeLessThanOrEqual(390);
  }
  const canvas = await page.locator(".canvas-viewport").boundingBox();
  expect(canvas.width).toBeLessThanOrEqual(390);
  expect(canvas.height).toBeGreaterThan(200);
});
