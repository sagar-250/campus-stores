const path = require("path");
const { pathToFileURL } = require("url");

const url = pathToFileURL(path.join(__dirname, "..", "index.html")).href;
const key = "campus-stores.shift.v1";

const tab = (page, name) => page.locator("[data-nav] button", { hasText: name }).click();

const open = async (page) => {
  await page.goto(url);
  await tab(page, "Loan register");
};

const issue = async (page, unit, req = "RQ-214", who = "Kabir Sen", due = "Fri 8 pm") => {
  if (!(await page.locator("[data-issue]").count()))
    await page.getByRole("button", { name: "New issue slip" }).click();
  await page.selectOption("select[name=req]", req);
  await page.selectOption("select[name=asset]", unit);
  await page.selectOption("select[name=who]", who);
  await page.selectOption("select[name=due]", due);
  await page.getByRole("button", { name: "Save issue slip" }).click();
};

const kit = async (page) => {
  for (const u of ["PR-04", "SP-02", "AD-12"]) await issue(page, u);
};

const next = (page) => page.locator('[data-action="advance"]').click();
const ret = (page, num) => page.locator(`[data-action="return"][data-val="${num}"]`).click();
const box = (page, num) => page.locator(`input[name=in][value="${num}"]`);
const who = (page, num) => page.locator(`select[name=who${num}]`);
const when = (page, num) => page.locator(`select[name=due${num}]`);
const got = (page, num) => page.locator(`select[name=got${num}]`);
const save = (page) => page.getByRole("button", { name: "Save return" }).click();
const status = (page) => page.locator("[data-status]");
const rows = (page) => page.locator("[data-page] .row");
const undo = (page) => page.locator('[data-action="undo"]');
const clock = (page) => page.locator("[data-clock]");
const notes = (page) => page.locator("[data-page] article", { hasText: "Counter handover" });

const give = async (page, num, name, due) => {
  await who(page, num).selectOption(name);
  await when(page, num).selectOption(due);
};

const split = async (page) => {
  await ret(page, 402);
  await box(page, 403).check();
  await give(page, 404, "Leela Das", "Sat 9 am");
  await save(page);
};

const saved = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);

const put = async (page, d) => {
  const v = typeof d === "string" ? d : JSON.stringify(d);
  await page.evaluate(([k, x]) => localStorage.setItem(k, x), [key, v]);
  await page.reload();
};

module.exports = {
  url, key, tab, open, issue, kit, next, ret, box, who, when, got, save,
  status, rows, undo, clock, notes, give, split, saved, put,
};
