const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], viewport: { width: 1200, height: 900 } },
});
