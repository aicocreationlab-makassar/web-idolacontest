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
  expect(appManifest.display).toBe("standalone");
  expect(
    appManifest.icons.map((icon: { sizes: string }) => icon.sizes),
  ).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(
    appManifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose === "maskable",
    ),
  ).toBeTruthy();
});
test("PWA offers a generic offline page without caching private data", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys.map(async (key) =>
          (await (await caches.open(key)).keys()).map(
            (req) => new URL(req.url).pathname,
          ),
        ),
      )
    ).flat();
  });
  expect(cached).toContain("/offline.html");
  for (const path of ["/cek-status", "/admin/dashboard", "/api/status"])
    expect(cached).not.toContain(path);
  await page.goto("/offline.html");
  await expect(
    page.getByRole("heading", { name: "Koneksi sedang beristirahat." }),
  ).toBeVisible();
  const worker = await page.request.get("/sw.js");
  expect(await worker.text()).toContain("event.request.mode==='navigate'");
});
test("Admin guard and status endpoint fail safely", async ({ page, request }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
  const r = await request.post("/api/status", {
    data: { code: "IDC-S1-AAAAAAAAAAAAAAAAAAAAAAAA" },
  });
  expect(r.status()).toBe(400);
  expect(await r.text()).not.toContain("SERVICE_ROLE");
});

test("Admin can login, open mobile navigation, and view incoming registrations", async ({
  page,
  request,
}) => {
  test.skip(!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD);

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByText("Realtime aktif")).toBeVisible();

  if ((page.viewportSize()?.width ?? 0) <= 980) {
    await page.getByRole("button", { name: "Buka menu admin" }).click();
  }
  await page.getByRole("link", { name: "Pendaftaran Masuk" }).click();
  await expect(
    page.getByRole("heading", { name: "Pendaftaran masuk" }),
  ).toBeVisible();
  await expect(page.getByText(/Kosong|Periksa detail peserta/).first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();

  const manifest = await request.get("/admin/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).start_url).toBe("/admin/dashboard");
});
test("Coloring never offers Preschool", async ({ page }) => {
  await page.goto("/daftar");
  await expect(page.locator('select[name="province_code"]')).toBeEnabled();
  await page
    .getByLabel("Jenis lomba")
    .selectOption("coloring", { force: true });
  await expect(
    page.getByLabel("Kategori").locator('option[value="preschool"]'),
  ).toHaveCount(0);
  await page
    .getByLabel("Jenis lomba")
    .selectOption("photogenic", { force: true });
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

test("Five-step registration confirms payment before sending", async ({
  page,
}) => {
  await page.route("**/api/regions/**", async (route) => {
    await route.fulfill({ json: [{ id: "11", name: "Wilayah Uji" }] });
  });
  await page.route("**/api/postcode**", async (route) => {
    await route.fulfill({ json: { postal_code: "80111" } });
  });
  let submissions = 0;
  await page.route("**/api/registrations", async (route) => {
    submissions++;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      status: 503,
      json: { error: "Supabase belum dikonfigurasi." },
    });
  });
  await page.goto("/daftar");
  await page.getByLabel("Nama lengkap anak").fill("Anak Uji");
  await page.getByLabel("Nama publik / nama panggilan").fill("Bintang Uji");
  await page.getByLabel("Usia (tahun)").fill("7");
  await page.getByLabel("Nama sekolah / belum sekolah").fill("SD Uji");
  await page.getByLabel("Cita-cita anak").fill("Dokter");
  await page.getByRole("button", { name: /Lanjutkan/ }).click();
  await expect(
    page.getByRole("heading", { name: "Data orang tua / wali" }),
  ).toBeVisible();
  await page.getByLabel("Nama orang tua / wali").fill("Orang Tua Uji");
  await page.getByLabel("WhatsApp aktif").fill("081234567890");
  await page.getByLabel("Username Instagram").fill("orangtuauji");
  await page.getByRole("button", { name: /Lanjutkan/ }).click();
  await page.getByLabel("Jalan / nomor rumah").fill("Jalan Uji Nomor 1");
  for (const name of [
    "province_code",
    "regency_code",
    "district_code",
    "village_code",
  ]) {
    const field = page.locator(`select[name="${name}"]`);
    await expect(field).toBeEnabled();
    await field.selectOption("11");
  }
  await page.getByLabel(/Kode pos/).fill("80111");
  await page.getByRole("button", { name: /Lanjutkan/ }).click();
  await page.getByLabel("Jenis lomba").selectOption("coloring");
  await page.locator('input[type="file"]').setInputFiles({
    name: "foto.png",
    mimeType: "image/png",
    buffer: Buffer.from("foto-uji"),
  });
  await page.getByRole("button", { name: /Lanjutkan/ }).click();
  for (const checkbox of await page.locator('input[type="checkbox"]').all())
    await checkbox.check();
  await page.getByRole("button", { name: "Kirim pendaftaran →" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Belum, kembali bayar" }).click();
  expect(submissions).toBe(0);
  await page.getByRole("button", { name: "Kirim pendaftaran →" }).click();
  await page.getByRole("button", { name: "Sudah, kirim data" }).click();
  await expect(
    page.getByText("Sedang menyiapkan panggung si kecil…"),
  ).toBeVisible();
  await expect(page.getByText("Supabase belum dikonfigurasi.")).toBeVisible();
  expect(submissions).toBe(1);
});
