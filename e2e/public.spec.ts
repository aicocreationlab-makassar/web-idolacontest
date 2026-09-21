import { test, expect } from "@playwright/test";
test("Homepage, mobile fit, navigation and manifest", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Saatnya.*Si Kecil.*Bersinar!/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await expect(page.getByText("Rp120.000").first()).toBeVisible();
  await page.getByRole("link", { name: "Lihat Finalis" }).click();
  await expect(
    page.getByRole("heading", { name: "Mimpi mereka, inspirasi kita." }),
  ).toBeVisible();
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  const appManifest = await manifest.json();
  expect(appManifest.display).toBe('standalone');
  expect(appManifest.icons.map((icon:{sizes:string})=>icon.sizes)).toEqual(expect.arrayContaining(['192x192','512x512']));
  expect(appManifest.icons.some((icon:{purpose?:string})=>icon.purpose==='maskable')).toBeTruthy();
});
test('PWA offers a generic offline page without caching private data',async({page,context})=>{
  await page.goto('/');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  try{
    await page.goto('/faq');
    await expect(page.getByRole('heading',{name:'Koneksi sedang beristirahat.'})).toBeVisible();
    const cached=await page.evaluate(async()=>{const keys=await caches.keys();return (await Promise.all(keys.map(async key=>(await(await caches.open(key)).keys()).map(req=>new URL(req.url).pathname)))).flat();});
    for(const path of ['/cek-status','/admin/dashboard','/api/status']) expect(cached).not.toContain(path);
  }finally{await context.setOffline(false);}
});
test("Admin guard and safe unconfigured backend", async ({ page, request }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
  const r = await request.post("/api/status", {
    data: { code: "IDC-S1-AAAAAAAAAAAAAAAAAAAAAAAA" },
  });
  expect(r.status()).toBe(503);
  expect(await r.text()).not.toContain("SERVICE_ROLE");
});
test("Coloring never offers Preschool", async ({ page }) => {
  await page.goto("/daftar");
  await page.getByLabel("Jenis lomba").selectOption("coloring");
  await expect(
    page.getByLabel("Kategori").locator('option[value="preschool"]'),
  ).toHaveCount(0);
  await page.getByLabel("Jenis lomba").selectOption("photogenic");
  await expect(
    page.getByLabel("Kategori").locator('option[value="preschool"]'),
  ).toHaveCount(1);
});
test("All public routes render without application errors", async ({
  page,
}) => {
  for (const path of [
    "/lomba/fotogenik",
    "/lomba/mewarnai",
    "/timeline",
    "/faq",
    "/syarat-ketentuan",
    "/kebijakan-privasi",
    "/hasil",
    "/cek-status",
    "/daftar/sukses",
  ]) {
    const r = await page.goto(path);
    expect(r?.status(), path).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBeTruthy();
  }
});
