const { test, expect } = require("@playwright/test");
const t = require("./util");

test.describe("friday 7:30, the kit comes back in pieces", () => {
  test.beforeEach(async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    await t.next(page);
  });

  test("nothing is marked late before its due time", async ({ page }) => {
    await expect(page.locator(".tag.late")).toHaveCount(0);
  });

  test("the clicked unit opens ticked and focus goes to the next one", async ({ page }) => {
    await t.ret(page, 402);
    await expect(t.box(page, 402)).toBeChecked();
    await expect(t.box(page, 403)).not.toBeChecked();
    await expect(t.box(page, 404)).not.toBeChecked();
    await expect(t.box(page, 403)).toBeFocused();
  });

  test("only that club's kit opens", async ({ page }) => {
    await t.ret(page, 402);
    await expect(page.locator(".kitrow")).toHaveCount(3);
    await expect(page.locator("[data-kit]")).not.toContainText("MI-09");
  });

  test("who has it only shows on rows that still need it", async ({ page }) => {
    await t.ret(page, 402);
    await expect(t.who(page, 402)).toBeHidden();
    await expect(t.who(page, 403)).toBeVisible();
    await expect(t.who(page, 404)).toBeVisible();
    await t.box(page, 403).check();
    await expect(t.who(page, 403)).toBeHidden();
    await t.box(page, 402).uncheck();
    await t.box(page, 403).uncheck();
    await expect(page.locator("[data-kit] select:visible")).toHaveCount(0);
  });

  test("saving with nothing ticked is blocked kindly and changes nothing", async ({ page }) => {
    await t.ret(page, 402);
    await t.box(page, 402).uncheck();
    await t.save(page);
    await expect(t.status(page)).toHaveText("Nothing ticked yet. Tick what’s on the counter.");
    await expect(t.box(page, 402)).toBeFocused();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(t.rows(page)).toHaveCount(4);
  });

  test("forgetting who has it points at that box", async ({ page }) => {
    await t.ret(page, 402);
    await t.box(page, 403).check();
    await t.save(page);
    await expect(t.who(page, 404)).toBeFocused();
    await expect(t.who(page, 404)).toHaveAttribute("aria-invalid", "true");
    await expect(t.status(page)).toHaveText(
      "Who has the USB-C → HDMI adapter, and when is it coming back? The next shift will need this.",
    );
    await t.who(page, 404).selectOption("Leela Das");
    await expect(t.who(page, 404)).not.toHaveAttribute("aria-invalid");
  });

  test("a name without a time points at the time box", async ({ page }) => {
    await t.ret(page, 402);
    await t.box(page, 403).check();
    await t.who(page, 404).selectOption("Leela Das");
    await t.save(page);
    await expect(t.when(page, 404)).toBeFocused();
    await expect(t.when(page, 404)).toHaveAttribute("aria-invalid", "true");
  });

  test("a partial return closes what came back and keeps what didn't", async ({ page }) => {
    await t.split(page);
    await expect(t.status(page)).toHaveText(
      "Back: HDMI projector, Portable speaker. Still out: USB-C → HDMI adapter with Leela Das till Sat 9 am. Note left for the next shift.",
    );
    await expect(t.rows(page)).toHaveCount(2);
    await expect(t.rows(page).first()).toContainText(
      "Film Society · Leela Das has it, back Sat 9 am · issued to Kabir Sen, due Fri 8 pm",
    );
    await t.tab(page, "Desk book");
    await expect(t.notes(page)).toHaveCount(1);
    await expect(t.notes(page)).toContainText(
      "Film Society’s USB-C → HDMI adapter (AD-12) is still out. Leela Das has it, back Sat 9 am. Slip L-404 stays open.",
    );
    await t.tab(page, "Inventory");
    await expect(t.rows(page).filter({ hasText: "PR-04" })).toContainText("On shelf");
    await expect(t.rows(page).filter({ hasText: "AD-12" })).toContainText("On loan");
  });

  test("two things left out get two notes and both are read back", async ({ page }) => {
    await t.ret(page, 402);
    await t.give(page, 403, "Kabir Sen", "Sat 10 am");
    await t.give(page, 404, "Leela Das", "Sat 9 am");
    await t.save(page);
    await expect(t.status(page)).toHaveText(
      "Back: HDMI projector. Still out: Portable speaker with Kabir Sen till Sat 10 am, USB-C → HDMI adapter with Leela Das till Sat 9 am. Note left for the next shift.",
    );
    await t.tab(page, "Desk book");
    await expect(t.notes(page)).toHaveCount(2);
  });

  test("the whole kit back writes no note", async ({ page }) => {
    await t.ret(page, 402);
    await t.box(page, 403).check();
    await t.box(page, 404).check();
    await t.save(page);
    await expect(t.status(page)).toHaveText(
      "Back: HDMI projector, Portable speaker, USB-C → HDMI adapter. Nothing left out.",
    );
    await expect(t.rows(page)).toHaveCount(1);
    await t.tab(page, "Desk book");
    await expect(t.notes(page)).toHaveCount(0);
  });

  test("cancel, switching tabs or starting an issue slip change nothing", async ({ page }) => {
    await t.ret(page, 402);
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator("[data-kit]")).toHaveCount(0);
    await t.ret(page, 402);
    await t.tab(page, "Desk book");
    await t.tab(page, "Loan register");
    await expect(page.locator("[data-kit]")).toHaveCount(0);
    await t.ret(page, 402);
    await page.getByRole("button", { name: "New issue slip" }).click();
    await expect(page.locator("[data-kit]")).toHaveCount(0);
    await expect(page.locator("[data-issue]")).toHaveCount(1);
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(t.rows(page)).toHaveCount(4);
  });
});

test.describe("undo", () => {
  test.beforeEach(async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    await t.next(page);
  });

  test("undo puts the slips and notes back exactly", async ({ page }) => {
    const before = await t.saved(page);
    await t.split(page);
    await page.getByRole("button", { name: "Undo return" }).click();
    await expect(t.status(page)).toHaveText("Return undone. Those slips are open again.");
    await expect(t.undo(page)).toBeHidden();
    const after = await t.saved(page);
    expect(after.loans).toEqual(before.loans);
    expect(after.notes).toEqual(before.notes);
  });

  test("undo only takes back the latest return", async ({ page }) => {
    await t.ret(page, 402);
    await t.give(page, 403, "Kabir Sen", "Sat 10 am");
    await t.give(page, 404, "Leela Das", "Sat 9 am");
    await t.save(page);
    await t.ret(page, 403);
    await t.save(page);
    await expect(t.rows(page)).toHaveCount(2);
    await page.getByRole("button", { name: "Undo return" }).click();
    await expect(t.rows(page)).toHaveCount(3);
    await expect(t.rows(page).filter({ hasText: "PR-04" })).toHaveCount(0);
  });

  test("undo goes away once the shift moves on", async ({ page }) => {
    await t.split(page);
    await expect(t.undo(page)).toBeVisible();
    await t.next(page);
    await expect(t.undo(page)).toBeHidden();
  });

  test("undo goes away after a note or a new issue slip", async ({ page }) => {
    await t.split(page);
    await t.tab(page, "Desk book");
    await page.fill("textarea[name=note]", "Speaker came back with a flat battery.");
    await page.getByRole("button", { name: "Add handover note" }).click();
    await expect(t.undo(page)).toBeHidden();
    await t.tab(page, "Loan register");
    await t.ret(page, 404);
    await t.save(page);
    await expect(t.undo(page)).toBeVisible();
    await t.issue(page, "CA-03", "RQ-217", "Dev Menon", "Sat noon");
    await expect(t.undo(page)).toBeHidden();
  });

  test("a reload does not bring undo back", async ({ page }) => {
    await t.split(page);
    await page.reload();
    await expect(t.undo(page)).toBeHidden();
    await expect(t.rows(page)).toHaveCount(2);
  });
});

test.describe("saturday 9 am, the morning shift", () => {
  test.beforeEach(async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    await t.next(page);
    await t.split(page);
    await t.next(page);
  });

  test("the row says who has it and only that one is late", async ({ page }) => {
    const ad = t.rows(page).filter({ hasText: "AD-12" });
    const mic = t.rows(page).filter({ hasText: "MI-09" });
    await expect(ad).toContainText("Leela Das has it, back Sat 9 am");
    await expect(ad.locator(".tag.late")).toHaveText("Late");
    await expect(mic.locator(".tag.late")).toHaveCount(0);
  });

  test("closing leela's adapter is two clicks", async ({ page }) => {
    await t.ret(page, 404);
    await expect(page.locator(".kitrow")).toHaveCount(1);
    await expect(t.box(page, 404)).toBeChecked();
    await expect(page.getByRole("button", { name: "Save return" })).toBeFocused();
    await t.save(page);
    await expect(t.status(page)).toHaveText("Back: USB-C → HDMI adapter. Nothing left out.");
    await expect(t.rows(page)).toHaveCount(1);
  });

  test("times that already passed are not offered", async ({ page }) => {
    await t.ret(page, 401);
    const opts = await t.when(page, 401).locator("option").allInnerTexts();
    expect(opts).toEqual(["Select…", "Sat 9 am", "Sat 10 am", "Sat noon"]);
  });
});

test.describe("the wrong unit comes back", () => {
  test.beforeEach(async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    await t.next(page);
    await t.split(page);
    await t.next(page);
    await t.ret(page, 404);
  });

  const swap = async (page) => {
    await t.got(page, 404).selectOption("AD-15");
    await t.save(page);
  };

  test("the label check starts on the slip's unit and only shows once ticked", async ({ page }) => {
    await expect(t.got(page, 404)).toBeVisible();
    await expect(t.got(page, 404)).toHaveValue("AD-12");
    const opts = await t.got(page, 404).locator("option").allInnerTexts();
    expect(opts).toEqual(["Select…", "AD-12", "AD-15"]);
    await t.box(page, 404).uncheck();
    await expect(t.got(page, 404)).toBeHidden();
  });

  test("units with no lookalike get no label check", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel" }).click();
    await t.ret(page, 401);
    await expect(t.got(page, 401)).toHaveCount(0);
  });

  test("the right unit coming back flags nothing", async ({ page }) => {
    await t.save(page);
    await expect(t.status(page)).toHaveText("Back: USB-C → HDMI adapter. Nothing left out.");
    await t.tab(page, "Inventory");
    await expect(page.locator(".tag.late", { hasText: "Missing" })).toHaveCount(0);
  });

  test("a different adapter is flagged, noted and kept on record", async ({ page }) => {
    await swap(page);
    await expect(t.status(page)).toHaveText(
      "Back: USB-C → HDMI adapter. Slip L-404 said AD-12 but AD-15 came back, AD-12 marked missing. Nothing left out. Note left for the next shift.",
    );
    await page.getByRole("button", { name: "All slips" }).click();
    await expect(t.rows(page).filter({ hasText: "L-404" })).toContainText("came back as AD-15");
    await t.tab(page, "Desk book");
    await expect(t.notes(page).first()).toContainText(
      "AD-15 came back on slip L-404 instead of AD-12. AD-12 is marked missing, find out where it is.",
    );
    await t.tab(page, "Inventory");
    await expect(t.rows(page).filter({ hasText: "AD-12" })).toContainText("Missing");
    await expect(t.rows(page).filter({ hasText: "AD-15" })).toContainText("On shelf");
  });

  test("a missing unit can't be handed out", async ({ page }) => {
    await swap(page);
    await page.getByRole("button", { name: "New issue slip" }).click();
    const units = (await page.locator("select[name=asset] option").allInnerTexts()).join();
    expect(units).not.toContain("AD-12");
    expect(units).toContain("AD-15");
  });

  test("undo takes the missing flag back too", async ({ page }) => {
    await swap(page);
    await page.getByRole("button", { name: "Undo return" }).click();
    await expect(t.rows(page).filter({ hasText: "L-404" })).toContainText("Record return");
    await t.tab(page, "Inventory");
    await expect(t.rows(page).filter({ hasText: "AD-12" })).toContainText("On loan");
    await t.tab(page, "Desk book");
    await expect(page.locator("[data-page]")).not.toContainText("marked missing");
  });

  test("if the missing one turns up on a later return it stops being missing", async ({ page }) => {
    await swap(page);
    await t.issue(page, "AD-15", "RQ-214", "Kabir Sen", "Sat noon");
    await t.ret(page, 405);
    await t.got(page, 405).selectOption("AD-12");
    await t.save(page);
    await t.tab(page, "Inventory");
    await expect(t.rows(page).filter({ hasText: "AD-12" })).toContainText("On shelf");
    await expect(t.rows(page).filter({ hasText: "AD-15" })).toContainText("Missing");
  });
});

test.describe("saturday with two things still out", () => {
  test.beforeEach(async ({ page }) => {
    await t.open(page);
    await t.kit(page);
    await t.next(page);
    await t.ret(page, 402);
  });

  test("a promised time that already passed has to be picked again", async ({ page }) => {
    await t.give(page, 403, "Kabir Sen", "Fri 8 pm");
    await t.give(page, 404, "Leela Das", "Sat 9 am");
    await t.save(page);
    await t.next(page);
    await t.ret(page, 404);
    await expect(t.who(page, 403)).toHaveValue("Kabir Sen");
    await expect(t.when(page, 403)).toHaveValue("");
    await t.save(page);
    await expect(t.when(page, 403)).toBeFocused();
    await t.when(page, 403).selectOption("Sat 10 am");
    await t.save(page);
    await expect(t.status(page)).toHaveText(
      "Back: USB-C → HDMI adapter. Still out: Portable speaker with Kabir Sen till Sat 10 am. Note left for the next shift.",
    );
  });

  test("the same name and time again does not write a duplicate note", async ({ page }) => {
    await t.give(page, 403, "Kabir Sen", "Sat 10 am");
    await t.give(page, 404, "Leela Das", "Sat 9 am");
    await t.save(page);
    await t.next(page);
    await t.ret(page, 404);
    await expect(t.who(page, 403)).toHaveValue("Kabir Sen");
    await expect(t.when(page, 403)).toHaveValue("Sat 10 am");
    await t.save(page);
    await expect(t.status(page)).toHaveText(
      "Back: USB-C → HDMI adapter. Still out: Portable speaker with Kabir Sen till Sat 10 am.",
    );
    await t.tab(page, "Desk book");
    await expect(t.notes(page)).toHaveCount(2);
  });
});
