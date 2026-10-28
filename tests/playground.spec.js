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
  await expect(page.locator(".widget.is-unframed", { hasText: "Elizabeth Lin" })).toHaveCount(1);
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

test("playground widgets can be dragged around without panning canvas or triggering click", async ({ page }) => {
  await page.goto("/playground/");
  const widget = page.locator(".widget").first();
  await expect(widget).toBeVisible();

  const readWidgetPos = () => widget.evaluate((el) => ({
    left: parseFloat(el.style.left),
    top: parseFloat(el.style.top),
  }));

  const initialPos = await readWidgetPos();
  const initialView = await readView(page);

  const widgetBox = await widget.boundingBox();
  const startX = widgetBox.x + widgetBox.width / 2;
  const startY = widgetBox.y + widgetBox.height / 2;

  // Drag the widget by +120px X and +80px Y
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 60, startY + 40, { steps: 4 });
  await expect(widget).toHaveClass(/is-dragging/);
  await expect(page.locator("body")).toHaveClass(/is-dragging-widget/);

  await page.mouse.move(startX + 120, startY + 80, { steps: 4 });
  await page.mouse.up();

  await expect(widget).not.toHaveClass(/is-dragging/);
  await expect(page.locator("body")).not.toHaveClass(/is-dragging-widget/);

  const draggedPos = await readWidgetPos();
  const expectedDx = 120 / initialView.scale;
  const expectedDy = 80 / initialView.scale;
  expect(draggedPos.left).toBeCloseTo(initialPos.left + expectedDx, 1);
  expect(draggedPos.top).toBeCloseTo(initialPos.top + expectedDy, 1);

  // Canvas world should NOT have panned
  const afterDragView = await readView(page);
  expect(afterDragView.x).toBeCloseTo(initialView.x, 1);
  expect(afterDragView.y).toBeCloseTo(initialView.y, 1);

  // Dragging should not have triggered the click animation
  await expect(widget.locator(".face")).not.toHaveClass(/is-spinning/);

  // But a click without drag still triggers the interaction
  const clock = page.getByRole("img", { name: /\d{1,2}:\d{2} [AP]M in New York/ });
  await clock.click();
  await expect(widget.locator(".face")).toHaveClass(/is-spinning/);
});

test("framed widget caption dragging moves widget while button remains clickable", async ({ page }) => {
  await page.goto("/playground/");
  await page.evaluate(async () => {
    const { mountPlayground } = await import("/src/playground/canvas.js");
    const app = document.querySelector("#app");
    app.innerHTML = "";
    mountPlayground(app, [
      {
        student: "Jane Doe",
        title: "Calculator",
        frame: true,
        x: 100,
        y: 100,
        width: 250,
        height: 200,
        mount(root) {
          const btn = document.createElement("button");
          btn.textContent = "Count: 0";
          let count = 0;
          btn.addEventListener("click", () => {
            count += 1;
            btn.textContent = `Count: ${count}`;
          });
          root.appendChild(btn);
        },
      },
    ]);
  });

  const caption = page.locator(".widget-caption").first();
  await expect(caption).toBeVisible();

  const widget = page.locator(".widget").first();
  const initLeft = await widget.evaluate((el) => parseFloat(el.style.left));

  const box = await caption.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50, { steps: 5 });
  await page.mouse.up();

  const newLeft = await widget.evaluate((el) => parseFloat(el.style.left));
  expect(newLeft).toBeGreaterThan(initLeft + 50);

  // Button inside widget body is still clickable without dragging
  const btn = widget.locator("button");
  await btn.click();
  await expect(btn).toHaveText("Count: 1");
});
