const { test, expect } = require("@playwright/test");
const t = require("./util");

const fresh = async (page, unit, nm, roll) => {
  await page.getByRole("button", { name: "New issue slip" }).click();
  await page.selectOption("select[name=req]", "RQ-214");
  await page.selectOption("select[name=asset]", unit);
  await page.selectOption("select[name=who]", "+");
  await page.selectOption("select[name=due]", "Fri 8 pm");
  await page.fill("input[name=nm]", nm);
  await page.fill("input[name=roll]", roll);
  await page.getByRole("button", { name: "Save issue slip" }).click();
};

test.describe("someone not on the list collects", () => {
  test.beforeEach(async ({ page }) => {
    await t.open(page);
  });

  test("name and roll fields only show for someone else", async ({ page }) => {
    await page.getByRole("button", { name: "New issue slip" }).click();
    await expect(page.locator("input[name=nm]")).toBeHidden();
    await page.selectOption("select[name=who]", "+");
    await expect(page.locator("input[name=nm]")).toBeVisible();
    await expect(page.locator("input[name=roll]")).toBeVisible();
    await page.selectOption("select[name=who]", "Kabir Sen");
    await expect(page.locator("input[name=nm]")).toBeHidden();
  });

  test("a new person is issued the unit with their roll number", async ({ page }) => {
    await fresh(page, "PR-04", "  Arjun   Nair ", "ce24b015");
    await expect(t.status(page)).toHaveText("Issued PR-04 to Arjun Nair (CE24B015) on slip L-402.");
    await expect(t.rows(page).filter({ hasText: "PR-04" })).toContainText("Arjun Nair (CE24B015) · Due Fri 8 pm");
  });

  test("the new person shows up in later lists and after a reload", async ({ page }) => {
    await fresh(page, "PR-04", "Arjun Nair", "CE24B015");
    await page.reload();
    await page.getByRole("button", { name: "New issue slip" }).click();
    const opts = await page.locator("select[name=who] option").allInnerTexts();
    expect(opts).toContain("Arjun Nair");
    await page.getByRole("button", { name: "Cancel" }).click();
    await t.next(page);
    await t.ret(page, 402);
    await t.box(page, 402).uncheck();
    await t.issue(page, "SP-02");
    await t.ret(page, 403);
    const who = await t.who(page, 402).locator("option").allInnerTexts();
    expect(who).toContain("Arjun Nair");
  });

  test("a missing name is pointed out and nothing is issued", async ({ page }) => {
    await fresh(page, "PR-04", "   ", "CE24B015");
    await expect(t.status(page)).toHaveText("Type the name of the person collecting.");
    await expect(page.locator("input[name=nm]")).toBeFocused();
    await expect(page.locator("input[name=nm]")).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(t.rows(page)).toHaveCount(1);
  });

  test("a missing or odd roll number is pointed out", async ({ page }) => {
    await fresh(page, "PR-04", "Arjun Nair", "");
    await expect(t.status(page)).toHaveText("Add their roll number, like CE23B108.");
    await expect(page.locator("input[name=roll]")).toBeFocused();
    await page.fill("input[name=roll]", "ce 24!");
    await page.getByRole("button", { name: "Save issue slip" }).click();
    await expect(t.status(page)).toHaveText("Add their roll number, like CE23B108.");
    await page.fill("input[name=roll]", "CE24B015");
    await page.getByRole("button", { name: "Save issue slip" }).click();
    await expect(t.status(page)).toHaveText("Issued PR-04 to Arjun Nair (CE24B015) on slip L-402.");
  });

  test("typing a name already on the list uses that person, no duplicate", async ({ page }) => {
    await fresh(page, "PR-04", "kabir sen", "CE99X001");
    await expect(t.status(page)).toHaveText("Issued PR-04 to Kabir Sen on slip L-402.");
    await page.getByRole("button", { name: "New issue slip" }).click();
    const opts = await page.locator("select[name=who] option").allInnerTexts();
    expect(opts.filter((x) => x === "Kabir Sen")).toHaveLength(1);
  });

  test("odd saved people data is dropped safely", async ({ page }) => {
    const d = await t.saved(page);
    d.extra = [{ name: "Arjun Nair", roll: "CE24B015" }, { name: 5 }, null, { name: " ", roll: "X" }];
    await t.put(page, d);
    await t.tab(page, "Loan register");
    await page.getByRole("button", { name: "New issue slip" }).click();
    const opts = await page.locator("select[name=who] option").allInnerTexts();
    expect(opts).toEqual(["Select…", "Isha Rao", "Kabir Sen", "Leela Das", "Tara Shah", "Dev Menon", "Arjun Nair", "Someone else…"]);
  });
});
