import { defineConfig } from "@playwright/test";
export default defineConfig({
  workers: 1,
  timeout: 120000,
  expect: { timeout: 20000 },
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000", headless: true },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
