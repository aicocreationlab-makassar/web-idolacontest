import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("test-results/visual", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: name === "mobile",
    });
    page.setDefaultTimeout(120000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `test-results/visual/home-${name}.png`,
      fullPage: true,
      timeout: 120000,
    });
    await page.screenshot({
      path: `test-results/visual/home-${name}-fold.png`,
      timeout: 120000,
    });
    console.log(
      JSON.stringify({
        name,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        errors,
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
