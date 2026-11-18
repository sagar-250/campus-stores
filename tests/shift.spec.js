const { test, expect } = require("@playwright/test");
const t = require("./util");

test("the whole film society job, pickup to saturday", async ({ page }) => {
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await t.open(page);
  await t.kit(page);
  await expect(t.rows(page)).toHaveCount(4);
  await t.next(page);
  await expect(t.clock(page)).toHaveText("Friday · 7:30 pm");
  await t.split(page);
  await expect(t.rows(page)).toHaveCount(2);
  await t.next(page);
  await expect(t.clock(page)).toHaveText("Saturday · 9:00 am");
  await t.ret(page, 404);
  await t.save(page);
  await expect(t.status(page)).toHaveText("Back: USB-C → HDMI adapter. Nothing left out.");
  await expect(t.rows(page)).toHaveCount(1);
  await expect(t.rows(page)).toContainText("MI-09");
  expect(errs).toEqual([]);
});

test("the progress steps follow the shift", async ({ page }) => {
  const now = page.locator('[data-steps] [aria-current="step"]');
  await t.open(page);
  await expect(now).toHaveText("1Pickup");
  await t.next(page);
  await expect(now).toHaveText("2Return");
  await expect(page.locator("[data-steps] .past")).toHaveText("✓Pickup");
  await t.next(page);
  await expect(now).toHaveText("3Morning");
});

test("pickup guardrails still hold", async ({ page }) => {
  await t.open(page);
  await page.getByRole("button", { name: "New issue slip" }).click();
  const units = (await page.locator("select[name=asset] option").allInnerTexts()).join();
  expect(units).not.toContain("PR-06");
  expect(units).not.toContain("MI-09");
  await t.issue(page, "CA-03");
  await expect(t.status(page)).toHaveText(
    "This equipment type is outside the approved request. Choose an approved unit.",
  );
  await t.issue(page, "AD-12");
  await t.issue(page, "AD-15");
  await expect(t.status(page)).toHaveText(
    "The approved quantity of this equipment type is already on loan.",
  );
});

test("restart wipes the shift and the undo", async ({ page }) => {
  await t.open(page);
  await t.kit(page);
  await t.next(page);
  await t.split(page);
  await expect(t.undo(page)).toBeVisible();
  await page.getByRole("button", { name: "Restart sample shift" }).click();
  await expect(t.undo(page)).toBeHidden();
  await expect(t.clock(page)).toHaveText("Friday · 3:45 pm");
  await t.tab(page, "Loan register");
  await expect(t.rows(page)).toHaveCount(1);
});
