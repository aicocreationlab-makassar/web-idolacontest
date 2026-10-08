export type ThemeKey =
  | "sky"
  | "sunset"
  | "jungle"
  | "candy"
  | "ocean"
  | "galaxy";

export type Season = {
  id: string;
  name: string;
  slug: string;
  theme_key: ThemeKey | string;
  theme_title: string;
  tagline: string | null;
  description: string | null;
  registration_open_at: string;
  registration_close_at: string;
  submission_global_close_at: string;
  judging_at: string;
  announcement_at: string;
  shipping_at: string;
  prize_preparation_start: string | null;
  prize_preparation_end: string | null;
  quota: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ThemePreset = {
  key: ThemeKey;
  name: string;
  mood: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentTwo: string;
  soft: string;
  motifs: string[];
  sticker: string;
};

/**
 * Every season must look different. Each preset changes the header, hero,
 * buttons, scene sections, decorations and the floating 3D stickers.
 */
export const themes: Record<ThemeKey, ThemePreset> = {
  sky: {
    key: "sky",
    name: "Langit Ceria",
    mood: "Biru langit, awan putih, bintang kuning",
    primary: "#1299e4",
    primaryDark: "#126bca",
    primaryLight: "#62cfff",
    accent: "#f55ca9",
    accentTwo: "#ffcf36",
    soft: "#e9f7ff",
    motifs: ["☁️", "⭐", "🌈", "🎈"],
    sticker: "Mimpi kecil, potensi besar!",
  },
  sunset: {
    key: "sunset",
    name: "Senja Hangat",
    mood: "Oranye matahari, koral, krem lembut",
    primary: "#ff7a3d",
    primaryDark: "#d9481f",
    primaryLight: "#ffb75e",
    accent: "#e5438f",
    accentTwo: "#ffd166",
    soft: "#fff1e6",
    motifs: ["🌅", "🌻", "🦋", "🪁"],
    sticker: "Bersinar seperti senja!",
  },
  jungle: {
    key: "jungle",
    name: "Petualangan Hutan",
    mood: "Hijau daun, kuning lemon, cokelat kayu",
    primary: "#22a06b",
    primaryDark: "#15764d",
    primaryLight: "#7ddb9b",
    accent: "#ff8a3d",
    accentTwo: "#ffe34d",
    soft: "#e9f9ef",
    motifs: ["🌿", "🦁", "🐒", "🌺"],
    sticker: "Berani jelajahi mimpi!",
  },
  candy: {
    key: "candy",
    name: "Dunia Permen",
    mood: "Ungu lavender, pink permen, mint",
    primary: "#9a5bf0",
    primaryDark: "#6b32c4",
    primaryLight: "#d3a7ff",
    accent: "#ff5fa8",
    accentTwo: "#8af0c8",
    soft: "#f4ecff",
    motifs: ["🍭", "🍬", "🧁", "🦄"],
    sticker: "Semanis senyum si kecil!",
  },
  ocean: {
    key: "ocean",
    name: "Samudra Biru",
    mood: "Teal laut, biru tua, pasir keemasan",
    primary: "#0ea5b7",
    primaryDark: "#0b6f8a",
    primaryLight: "#6fe3ef",
    accent: "#ff7b54",
    accentTwo: "#ffd66b",
    soft: "#e6fafb",
    motifs: ["🐠", "🌊", "🐚", "⛵"],
    sticker: "Selami lautan kreativitas!",
  },
  galaxy: {
    key: "galaxy",
    name: "Galaksi Impian",
    mood: "Ungu malam, biru bintang, kuning komet",
    primary: "#4b3fd6",
    primaryDark: "#2a1f8f",
    primaryLight: "#8c7cff",
    accent: "#ff6ad5",
    accentTwo: "#ffe066",
    soft: "#eeedff",
    motifs: ["🚀", "🪐", "🌟", "👩‍🚀"],
    sticker: "Terbang setinggi bintang!",
  },
};

export const themeKeys = Object.keys(themes) as ThemeKey[];

export function themeFor(key: string | null | undefined): ThemePreset {
  return themes[(key as ThemeKey) in themes ? (key as ThemeKey) : "sky"];
}

export const WIB = "Asia/Jakarta";

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    timeZone: WIB,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  const day = date.toLocaleDateString("id-ID", {
    timeZone: WIB,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("id-ID", {
    timeZone: WIB,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${time.replace(":", ".")} WIB`;
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value)
    .toLocaleDateString("id-ID", { timeZone: WIB, day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(".", "");
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  if (!start && !end) return "—";
  if (!end || start === end) return formatDate(start || end);
  const a = new Date(start!);
  const b = new Date(end);
  const sameMonth =
    a.toLocaleDateString("id-ID", { timeZone: WIB, month: "long", year: "numeric" }) ===
    b.toLocaleDateString("id-ID", { timeZone: WIB, month: "long", year: "numeric" });
  if (sameMonth)
    return `${a.toLocaleDateString("id-ID", { timeZone: WIB, day: "numeric" })}–${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Converts a timestamp into the value expected by <input type="datetime-local"> in WIB. */
export function toWibInput(value: string | null | undefined) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`;
}

/** Converts a WIB datetime-local value into an ISO string with the +07:00 offset. */
export function fromWibInput(value: string) {
  if (!value) return "";
  const normalized = value.length === 16 ? `${value}:00` : value;
  return `${normalized}+07:00`;
}

export type TimelineStop = {
  key: string;
  short: string;
  date: string;
  label: string;
  detail: string;
};

export function seasonTimeline(season: Season | null): TimelineStop[] {
  if (!season)
    return [
      { key: "open", short: "—", date: "Segera", label: "Pendaftaran dibuka", detail: "Jadwal season baru akan diumumkan." },
    ];
  const prize =
    season.prize_preparation_start || season.prize_preparation_end
      ? formatDateRange(season.prize_preparation_start, season.prize_preparation_end)
      : `Setelah ${formatDate(season.announcement_at)}`;
  return [
    {
      key: "open",
      short: formatShortDate(season.registration_open_at),
      date: formatDate(season.registration_open_at),
      label: "Pendaftaran dibuka",
      detail: `Pendaftaran ${formatDate(season.registration_open_at)} – ${formatDate(season.registration_close_at)}.`,
    },
    {
      key: "close",
      short: formatShortDate(season.submission_global_close_at),
      date: formatDateTime(season.submission_global_close_at),
      label: "Batas daftar & karya",
      detail:
        "Batas kirim individu: 7 hari setelah registrasi atau penutupan global, mana yang lebih awal.",
    },
    {
      key: "judging",
      short: formatShortDate(season.judging_at),
      date: formatDate(season.judging_at),
      label: "Penilaian juri",
      detail: "Karya dinilai dengan lima kriteria berbobot dan diranking otomatis per kategori.",
    },
    {
      key: "announcement",
      short: formatShortDate(season.announcement_at),
      date: formatDate(season.announcement_at),
      label: "Pengumuman",
      detail: "Hasil tampil di website dan @idola.contest setelah dipublikasikan admin.",
    },
    {
      key: "prize",
      short: season.prize_preparation_start
        ? `${formatShortDate(season.prize_preparation_start).split(" ")[0]}–${formatShortDate(season.prize_preparation_end || season.prize_preparation_start)}`
        : "—",
      date: prize,
      label: "Persiapan hadiah",
      detail: "Konfirmasi klaim, pembayaran, dan alamat melalui Cek Status.",
    },
    {
      key: "shipping",
      short: formatShortDate(season.shipping_at),
      date: `Mulai ${formatDate(season.shipping_at)}`,
      label: "Mulai pengiriman",
      detail: "Nomor resi dapat dilihat melalui Cek Status.",
    },
  ];
}

export function seasonPhase(season: Season | null, now = new Date()) {
  if (!season) return "idle";
  const t = now.getTime();
  if (t < new Date(season.registration_open_at).getTime()) return "upcoming";
  if (t <= new Date(season.registration_close_at).getTime()) return "registration";
  if (t <= new Date(season.submission_global_close_at).getTime()) return "submission";
  if (t < new Date(season.announcement_at).getTime()) return "judging";
  if (t < new Date(season.shipping_at).getTime()) return "announcement";
  return "shipping";
}
