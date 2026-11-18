const { test, expect } = require("@playwright/test");
const t = require("./util");

test.describe("saved data that is old, odd or broken", () => {
  test("an old saved kit value from the first version is ignored", async ({ page }) => {
    await t.open(page);
    const d = await t.saved(page);
    d.kit = "RQ-214";
    await t.put(page, d);
    await expect(page.locator("[data-kit]")).toHaveCount(0);
    await expect(t.rows(page)).toHaveCount(1);
  });

  test("an open return survives a reload but a closed slip never reopens", async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    await t.next(page);
    await t.split(page);
    const d = await t.saved(page);
    d.kit = 404;
    await t.put(page, d);
    await expect(page.locator(".kitrow")).toHaveCount(1);
    d.kit = 402;
    await t.put(page, d);
    await expect(page.locator("[data-kit]")).toHaveCount(0);
  });

  test("broken json starts a fresh shift", async ({ page }) => {
    await t.open(page);
    await t.put(page, "{oops");
    await expect(t.clock(page)).toHaveText("Friday · 3:45 pm");
    await expect(page.locator("[data-page]")).toContainText("Approved requests");
  });

  test("a slip for a unit that doesn't exist starts a fresh shift", async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    const d = await t.saved(page);
    d.loans[1].asset = "ZZ-99";
    await t.put(page, d);
    await t.tab(page, "Loan register");
    await expect(t.rows(page)).toHaveCount(1);
  });

  test("a saved missing list with a made up unit just drops it", async ({ page }) => {
    await t.open(page);
    const d = await t.saved(page);
    d.gone = ["AD-12", "ZZ-99"];
    await t.put(page, d);
    await t.tab(page, "Inventory");
    await expect(t.rows(page).filter({ hasText: "AD-12" })).toContainText("Missing");
    await expect(t.rows(page)).toHaveCount(8);
  });

  test("everything still works with browser storage blocked", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("blocked");
        },
      });
    });
    await t.open(page);
    await t.kit(page);
    await t.next(page);
    await t.split(page);
    await expect(t.status(page)).toContainText(
      "Still out: USB-C → HDMI adapter with Leela Das till Sat 9 am.",
    );
    await expect(t.status(page)).toContainText(
      "Browser storage is unavailable. Progress lasts for this visit.",
    );
    await page.getByRole("button", { name: "Undo return" }).click();
    await expect(t.rows(page)).toHaveCount(4);
  });
});

test("html typed into a note shows up as plain text", async ({ page }) => {
  const bad = '<img src=x onerror="window.hit=1"> <b>bold</b>';
  await t.open(page);
  await t.tab(page, "Desk book");
  await page.fill("textarea[name=note]", bad);
  await page.getByRole("button", { name: "Add handover note" }).click();
  await expect(t.notes(page).first()).toContainText(bad);
  await expect(page.locator("[data-page] article img, [data-page] article b")).toHaveCount(0);
  expect(await page.evaluate(() => window.hit)).toBeUndefined();
});

test("phone width has no sideways scroll with the kit open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await t.open(page);
  await t.kit(page);
  await t.next(page);
  await t.ret(page, 402);
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(w).toBeLessThanOrEqual(390);
});

test("the 7:30 return can be done with the keyboard alone", async ({ page }) => {
  await t.open(page);
  await t.kit(page);
  await t.next(page);
  await t.ret(page, 402);
  await page.keyboard.press("Space");
  await expect(t.box(page, 403)).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(t.got(page, 403)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(t.box(page, 404)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(t.who(page, 404)).toBeFocused();
  await page.keyboard.type("L");
  await page.keyboard.press("Tab");
  await expect(t.when(page, 404)).toBeFocused();
  await page.keyboard.type("Sat");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Save return" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(t.status(page)).toContainText(
    "Still out: USB-C → HDMI adapter with Leela Das till Sat 9 am.",
  );
});
