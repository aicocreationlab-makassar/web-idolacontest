import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
test("Homepage, mobile fit, navigation and manifest", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Saatnya.*Si Kecil.*Menjadi.*Idola!/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  if ((page.viewportSize()?.width ?? 0) <= 760) {
    await expect(page.locator(".recent-ticker")).toHaveCSS("position", "fixed");
    await expect(page.locator(".recent-ticker")).toHaveCSS("top", "0px");
    await page.getByRole("button", { name: "Buka menu" }).click();
    await page.getByRole("link", { name: "Hadiah" }).click();
  } else {
    await page.getByRole("link", { name: "Hadiah" }).click();
  }
  await expect(page).toHaveURL(/#hadiah$/);
  await expect(page.locator("#hadiah")).toBeInViewport();
  await expect(
    page.getByRole("button", { name: /Matikan musik|Nyalakan musik/ }),
  ).toBeVisible();
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
  const workerSource = await worker.text();
  expect(workerSource).toContain('event.request.mode === "navigate"');
  expect(workerSource).toContain('self.addEventListener("push"');
  expect(workerSource).toContain('self.addEventListener("notificationclick"');
});

test("SEO exposes indexable robots and an official sitemap", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain("Allow: /");
  expect(robotsText).toContain("Disallow: /admin/");
  expect(robotsText).toContain("https://idolacontest.my.id/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://idolacontest.my.id/lomba/fotogenik");
  expect(sitemapText).toContain("https://idolacontest.my.id/lomba/mewarnai");
  expect(sitemapText).not.toContain("/admin/");
});
test("Admin guard and status endpoint fail safely", async ({
  page,
  request,
}) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
  const r = await request.post("/api/status", {
    data: { code: "IDC-S1-AAAAAAAAAAAAAAAAAAAAAAAA" },
  });
  expect([400, 503]).toContain(r.status());
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
  await expect(page.getByText("Selamat datang kembali!")).toBeVisible();
  await page.getByRole("button", { name: "Tutup pemberitahuan" }).click();
  await expect(page.getByText("Pembaruan otomatis aktif")).toBeVisible();
  await expect(page.getByText("Notifikasi PWA di HP")).toBeVisible();

  if ((page.viewportSize()?.width ?? 0) <= 980) {
    await page.getByRole("button", { name: "Buka menu admin" }).click();
  } else {
    await page.getByRole("button", { name: "Kecilkan sidebar" }).click();
    await expect(page.locator("#admin-sidebar")).toHaveClass(/collapsed/);
    await page.getByRole("button", { name: "Perbesar sidebar" }).click();
  }
  await page.getByRole("link", { name: "Pendaftaran Masuk" }).click();
  await expect(
    page.getByRole("heading", { name: "Pendaftaran masuk" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Kosong|Periksa detail peserta/).first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();

  const manifest = await request.get("/admin/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).start_url).toBe("/admin/dashboard");
});

test("Page navigation returns mobile and desktop views to the top", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page
    .locator("footer")
    .getByRole("link", { name: "Pertanyaan Umum" })
    .click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(80);
});

test("Gallery opens with quiet collapsed filters", async ({ page }) => {
  await page.goto("/galeri");
  const competitionTabs = page.getByRole("navigation", {
    name: "Pilih jenis lomba",
  });
  await expect(
    competitionTabs.getByRole("link", { name: "Lomba Fotogenik" }),
  ).toBeVisible();
  await expect(
    competitionTabs.getByRole("link", { name: "Lomba Mewarnai" }),
  ).toBeVisible();
  const filters = page.locator(".gallery-filter");
  await expect(filters).not.toHaveAttribute("open", "");
  await expect(
    page.getByText("Buka jika ingin mencari peserta tertentu"),
  ).toBeVisible();
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

test("Large photo compresses and becomes the active upload preview", async ({
  page,
}) => {
  const pixels = randomBytes(1024 * 1024 * 3);
  const largePng = await sharp(pixels, {
    raw: { width: 1024, height: 1024, channels: 3 },
  })
    .png()
    .toBuffer();
  expect(largePng.length).toBeGreaterThan(2 * 1024 * 1024);

  await page.goto("/daftar");
  await page
    .locator('input[type="file"]')
    .evaluate((input) =>
      input.closest("div[hidden]")?.removeAttribute("hidden"),
    );
  await page.locator('input[type="file"]').setInputFiles({
    name: "foto-besar.png",
    mimeType: "image/png",
    buffer: largePng,
  });
  await expect(page.getByText("Ups! Fotonya Terlalu Besar")).toBeVisible();
  await page.getByRole("button", { name: "Kompres Foto Otomatis" }).click();
  await expect(page.getByText(/Siap dikirim/)).toBeVisible();
  await expect(page.getByText("Foto berhasil dibaca")).toBeVisible();
  await expect(page.getByText("Foto siap dikirim")).toBeVisible();
  const selectedFile = await page
    .locator('input[type="file"]')
    .evaluate((input) => {
      const file = (input as HTMLInputElement).files?.[0];
      return file
        ? { name: file.name, size: file.size, type: file.type }
        : null;
    });
  expect(selectedFile?.size).toBeLessThanOrEqual(2 * 1024 * 1024);
  expect(selectedFile?.name).toMatch(/^foto-terkompres\.(webp|png|jpg)$/);
  expect(["image/webp", "image/png", "image/jpeg"]).toContain(
    selectedFile?.type,
  );
});

test("Paid coloring participant sees worksheet immediately with A4 instructions", async ({
  page,
}) => {
  await page.route("**/api/status", async (route) => {
    await route.fulfill({
      json: {
        public_name: "Bintang Uji",
        competition_type: "coloring",
        category: "tk",
        payment_status: "paid",
        registration_status: "verified",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        worksheet_ready: true,
        submission: null,
        claim: null,
        shipment: null,
      },
    });
  });
  await page.route("**/api/worksheet", async (route) => {
    await route.fulfill({
      json: {
        url: "/icon-512.png",
        download_url: "/icon-512.png?download=worksheet",
        version: 1,
      },
    });
  });
  await page.goto("/cek-status");
  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  });
  await page.reload();
  await page.getByLabel("Kode registrasi").fill("IDC-BINTANG-1234");
  await page.getByRole("button", { name: /Cek status/ }).click();
  await expect(
    page.getByRole("heading", { name: "Worksheet Cita-Cita Si Kecil" }),
  ).toBeVisible();
  await expect(
    page.getByAltText("Worksheet cita-cita Bintang Uji"),
  ).toBeVisible();
  await expect(
    page.getByText("Cetak pada kertas A4 dengan ukuran penuh."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download worksheet A4" }),
  ).toBeVisible();
  await expect(page.getByText(/60 detik/)).toHaveCount(0);
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
    await route.fulfill({ json: { postal_code: "" } });
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
