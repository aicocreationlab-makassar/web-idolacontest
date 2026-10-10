import { z } from "zod";
import {
  awards as classicAwards,
  categories as classicCategoryLabels,
  feeConsent as classicFeeConsent,
  nationalAwards,
} from "./business-rules";
import type { Season } from "./season";

/**
 * A season runs in one of two contest modes.
 * - classic: Season 1 rules (school categories, Rp20.000 registration, paid award claim).
 * - national: "Lomba Anak Nasional Online" (Baby & Kids, cash prizes, free claim).
 * Everything the public site shows for a mode is editable per season through `content`.
 */
export type ContestMode = "classic" | "national";

export const contestModes: ContestMode[] = ["classic", "national"];

export const contestModeInfo: Record<
  ContestMode,
  { label: string; short: string; description: string; emoji: string }
> = {
  classic: {
    label: "Mode 1 · Klasik",
    short: "Klasik",
    emoji: "🎒",
    description:
      "Kategori sekolah (Preschool–SD), registrasi Rp20.000, klaim paket penghargaan berbayar setelah pengumuman. Tampilan Season 1.",
  },
  national: {
    label: "Mode 2 · Nasional",
    short: "Nasional",
    emoji: "🏆",
    description:
      "Lomba Anak Nasional Online: kategori Baby & Kids, hadiah uang tunai + piala + sertifikat, semua gratis setelah menang. Tampilan poster ceria.",
  },
};

export const defaultFees: Record<ContestMode, { registration: number; claim: number }> = {
  classic: { registration: 20000, claim: 120000 },
  national: { registration: 35000, claim: 0 },
};

/** Category keys the database accepts. Labels and age ranges live in the season content. */
export const categoryKeys = [
  "preschool",
  "paud",
  "tk",
  "sd_1_2",
  "sd_3_4",
  "sd_5_6",
  "baby",
  "kids",
] as const;
export type CategoryKey = (typeof categoryKeys)[number];

export const prizeTones = ["pink", "blue", "green", "orange", "yellow", "purple"] as const;
export type PrizeTone = (typeof prizeTones)[number];

const short = (max: number) => z.string().trim().max(max);

export const categoryContentSchema = z.object({
  key: z.enum(categoryKeys),
  label: short(60),
  emoji: short(8),
  age_min: z.coerce.number().int().min(0).max(18),
  age_max: z.coerce.number().int().min(0).max(18),
  months_allowed: z.boolean(),
  note: short(120),
});
export type CategoryContent = z.infer<typeof categoryContentSchema>;

export const prizeContentSchema = z.object({
  title: short(60),
  cash: z.coerce.number().int().min(0).max(100_000_000),
  extras: short(80),
  tone: z.enum(prizeTones),
});
export type PrizeContent = z.infer<typeof prizeContentSchema>;

export const contestTypeContentSchema = z.object({
  key: z.enum(["photogenic", "coloring"]),
  label: short(60),
  tagline: short(140),
});
export type ContestTypeContent = z.infer<typeof contestTypeContentSchema>;

export const contentSchema = z
  .object({
    hero_title: short(80),
    hero_subtitle: short(120),
    season_ribbon: short(40),
    categories: z.array(categoryContentSchema).min(1).max(8),
    contest_types: z.array(contestTypeContentSchema).min(1).max(2),
    prizes: z.array(prizeContentSchema).max(8),
    prize_note: short(80),
    voucher_text: short(120),
    free_title: short(80),
    free_bullets: z.array(short(80)).max(6),
    finalist_note: short(80),
    bank_name: short(40),
    bank_account: short(40),
    bank_holder: short(80),
    instagram: short(40),
    show_poster: z.boolean(),
    poster_src: short(200),
    poster_caption: short(160),
    dm_alert: short(220),
  })
  .partial();

export type SeasonContent = Required<z.infer<typeof contentSchema>>;

const bank = {
  bank_name: "BSI",
  bank_account: "7341301558",
  bank_holder: "Riswan Ramadhan",
  instagram: "idola.contest",
};

export const defaultContent: Record<ContestMode, SeasonContent> = {
  classic: {
    hero_title: "Saatnya Si Kecil Menjadi Idola!",
    hero_subtitle:
      "Lomba online anak Indonesia untuk menunjukkan senyum, keberanian, dan karya terbaik melalui lomba fotogenik serta mewarnai.",
    season_ribbon: "Season 1",
    categories: (
      Object.entries(classicCategoryLabels) as Array<[CategoryKey, string]>
    ).map(([key, label], i) => ({
      key,
      label,
      emoji: ["⭐", "🧩", "🎨", "📘", "✏️", "🏆"][i] ?? "⭐",
      age_min: 1,
      age_max: 18,
      months_allowed: true,
      note: key === "preschool" ? "Khusus lomba fotogenik" : "",
    })),
    contest_types: [
      {
        key: "photogenic",
        label: "Lomba Fotogenik",
        tagline: "Senyum, ekspresi, dan percaya dirinya bercerita tentang cita-cita.",
      },
      {
        key: "coloring",
        label: "Lomba Mewarnai",
        tagline: "Lebih istimewa dengan worksheet personal dari foto dan profesi impiannya.",
      },
    ],
    prizes: [],
    prize_note: "",
    voucher_text: "",
    free_title: "",
    free_bullets: [],
    finalist_note: "",
    ...bank,
    show_poster: false,
    poster_src: "",
    poster_caption: "",
    dm_alert:
      "Simpan bukti pendaftaran dan kirim bukti pembayaran melalui DM Instagram.",
  },
  national: {
    hero_title: "Lomba Anak Nasional Online",
    hero_subtitle: "Saatnya Si Kecil Menjadi Idola!",
    season_ribbon: "Season 2",
    categories: [
      {
        key: "baby",
        label: "Baby",
        emoji: "👶",
        age_min: 0,
        age_max: 4,
        months_allowed: true,
        note: "Bayi di bawah 1 tahun isi usia dalam bulan",
      },
      {
        key: "kids",
        label: "Kids",
        emoji: "🧒",
        age_min: 5,
        age_max: 13,
        months_allowed: false,
        note: "",
      },
    ],
    contest_types: [
      {
        key: "photogenic",
        label: "Lomba Fotogenik",
        tagline: "Senyum, gaya, dan percaya diri si kecil di depan kamera.",
      },
      {
        key: "coloring",
        label: "Lomba Mewarnai",
        tagline: "Tema bebas, semua alat warna boleh. Warnai sesuka hati!",
      },
    ],
    prizes: [
      { title: "Best of the Best", cash: 300000, extras: "+ Piala + Sertifikat", tone: "pink" },
      { title: "Juara Umum", cash: 200000, extras: "+ Piala + Sertifikat", tone: "blue" },
      { title: "Juara Harapan", cash: 100000, extras: "+ Piala + Sertifikat", tone: "green" },
      { title: "Juara Favorit", cash: 50000, extras: "+ Piala + Sertifikat", tone: "orange" },
    ],
    prize_note: "Berlaku tiap kategori",
    voucher_text: "20 Voucher Spesial untuk peserta terpilih",
    free_title: "Semua FREE setelah menang!",
    free_bullets: [
      "Tidak ada sistem penebusan",
      "Hanya registrasi saja",
      "Penilaian murni dewan juri",
    ],
    finalist_note: "Finalis terbatas! Hanya 1 pekan pendaftaran",
    ...bank,
    show_poster: true,
    poster_src: "/poster-season-2.jpg",
    poster_caption: "Poster resmi Idola Contest Season 2 · Lomba Anak Nasional Online",
    dm_alert:
      "Transfer biaya registrasi, lalu kirim bukti transfer dan nama peserta melalui DM Instagram. Pendaftaran baru diproses setelah bukti diterima.",
  },
};

export type ResolvedContent = SeasonContent & {
  mode: ContestMode;
  registration_fee: number;
  claim_fee: number;
  quota: number | null;
};

type SeasonLike = Partial<
  Pick<Season, "contest_mode" | "registration_fee" | "claim_fee" | "content" | "quota">
> | null | undefined;

export function modeOf(season: SeasonLike): ContestMode {
  return season?.contest_mode === "national" ? "national" : "classic";
}

/** Defaults for a mode merged with whatever the admin saved for the season. */
export function resolveContent(season: SeasonLike): ResolvedContent {
  const mode = modeOf(season);
  const base = defaultContent[mode];
  const raw = season?.content && typeof season.content === "object" ? season.content : {};
  const parsed = contentSchema.safeParse(raw);
  const merged: SeasonContent = { ...base };
  if (parsed.success)
    for (const [key, value] of Object.entries(parsed.data))
      if (value !== undefined)
        (merged as unknown as Record<string, unknown>)[key] = value;
  return {
    ...merged,
    mode,
    registration_fee:
      typeof season?.registration_fee === "number" && season.registration_fee >= 0
        ? season.registration_fee
        : defaultFees[mode].registration,
    claim_fee:
      typeof season?.claim_fee === "number" && season.claim_fee >= 0
        ? season.claim_fee
        : defaultFees[mode].claim,
    quota: season?.quota ?? null,
  };
}

/** Rp20.000 style, matching the strings the site has always used. */
export function rupiah(amount: number) {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

export function instagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function bankLine(content: Pick<SeasonContent, "bank_name" | "bank_account" | "bank_holder">) {
  return `${content.bank_name} ${content.bank_account} a.n. ${content.bank_holder}`;
}

export function awardsFor(mode: ContestMode) {
  return mode === "national" ? nationalAwards : classicAwards;
}

export function feeConsentText(content: ResolvedContent) {
  if (content.mode === "classic" && content.registration_fee === 20000 && content.claim_fee === 120000)
    return classicFeeConsent;
  if (content.claim_fee === 0)
    return `Saya memahami bahwa biaya registrasi lomba adalah ${rupiah(content.registration_fee)} dan tidak ada biaya penebusan hadiah; seluruh hadiah gratis setelah menang.`;
  return `Saya memahami bahwa biaya registrasi lomba adalah ${rupiah(content.registration_fee)} dan terdapat biaya klaim paket penghargaan ${rupiah(content.claim_fee)} setelah pengumuman, termasuk ongkir ke seluruh Indonesia.`;
}

export function categoryAgeText(category: CategoryContent) {
  return `${category.age_min} – ${category.age_max} tahun`;
}

/** Categories a participant may pick for one contest type in this mode. */
export function categoryOptions(content: ResolvedContent, competition: string) {
  return content.categories.filter(
    (category) =>
      content.mode === "national" ||
      competition !== "coloring" ||
      category.key !== "preschool",
  );
}

export type AgeRule =
  | { allowed: true; min: number; max: number; message: string }
  | { allowed: false; message: string };

/** Age limits for the chosen category and unit. Classic keeps the original 18-year rule. */
export function ageRuleFor(
  content: ResolvedContent,
  categoryKey: string,
  unit: "years" | "months",
): AgeRule {
  if (content.mode !== "national")
    return unit === "months"
      ? { allowed: true, min: 1, max: 216, message: "Usia maksimal 216 bulan" }
      : { allowed: true, min: 1, max: 18, message: "Usia maksimal 18 tahun" };
  const category = content.categories.find((item) => item.key === categoryKey);
  if (!category)
    return { allowed: false, message: "Pilih kategori yang tersedia." };
  if (unit === "months") {
    if (!category.months_allowed)
      return {
        allowed: false,
        message: `Kategori ${category.label} menggunakan satuan tahun (${categoryAgeText(category)}).`,
      };
    const max = (category.age_max + 1) * 12 - 1;
    return {
      allowed: true,
      min: 1,
      max,
      message: `Kategori ${category.label}: maksimal ${max} bulan (${categoryAgeText(category)}).`,
    };
  }
  return {
    allowed: true,
    min: Math.max(1, category.age_min),
    max: category.age_max,
    message: `Kategori ${category.label}: usia ${categoryAgeText(category)}.`,
  };
}

/** First category whose age range contains the given age, or null. */
export function categoryForAge(
  content: ResolvedContent,
  age: number,
  unit: "years" | "months",
) {
  if (content.mode !== "national" || !Number.isFinite(age)) return null;
  const years = unit === "months" ? Math.floor(age / 12) : age;
  return (
    content.categories.find(
      (category) =>
        years >= category.age_min &&
        years <= category.age_max &&
        (unit !== "months" || category.months_allowed),
    ) ?? null
  );
}

export function contestTypeSlug(key: string) {
  return key === "coloring" ? "mewarnai" : "fotogenik";
}
