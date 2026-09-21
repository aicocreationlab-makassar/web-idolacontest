export const categories = {
  preschool: "Preschool",
  paud: "PAUD",
  tk: "TK",
  sd_1_2: "SD Kelas 1–2",
  sd_3_4: "SD Kelas 3–4",
  sd_5_6: "SD Kelas 5–6",
} as const;
export const competitions = {
  photogenic: "Fotogenik",
  coloring: "Mewarnai",
} as const;
export const weights = [30, 25, 20, 15, 10];
export const criteria = {
  photogenic: [
    "Ekspresi & Rasa Percaya Diri",
    "Kreativitas Interpretasi Tema",
    "Pose & Komposisi Foto",
    "Kualitas Teknis Foto",
    "Originalitas & Overall Impression",
  ],
  coloring: [
    "Kerapian & Teknik",
    "Harmoni dan Keseimbangan Warna",
    "Kreativitas Pemilihan Warna",
    "Kesesuaian Tema",
    "Detail & Komposisi",
  ],
};
export const awards = [
  "Juara Utama 1",
  "Juara Utama 2",
  "Juara Utama 3",
  "Juara Harapan 1",
  "Juara Harapan 2",
  "Juara Harapan 3",
  "Juara Favorit 1",
  "Juara Favorit 2",
  "Juara Favorit 3",
  "Juara Umum",
  "Best Social Media",
];
export const feeConsent =
  "Saya memahami bahwa biaya registrasi lomba adalah Rp20.000 dan terdapat biaya klaim paket penghargaan Rp120.000 setelah pengumuman, termasuk ongkir ke seluruh Indonesia.";
export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
export const calculateSubmissionDeadline = (created: string, close: string) =>
  new Date(
    Math.min(
      new Date(created).getTime() + 7 * 86400000,
      new Date(close).getTime(),
    ),
  );
export const validateCompetitionCategory = (
  competition: string,
  category: string,
) =>
  competition in competitions &&
  category in categories &&
  !(competition === "coloring" && category === "preschool");
export const canAcceptRegistration = (
  open: string,
  close: string,
  now = new Date(),
) => now >= new Date(open) && now <= new Date(close);
export const canAcceptSubmission = (
  created: string,
  close: string,
  paid: boolean,
  now = new Date(),
) => paid && now <= calculateSubmissionDeadline(created, close);
export const canPublishSubmission = (
  status: string,
  paid: boolean,
  consent: boolean,
) => status === "approved" && paid && consent;
export function weightedScore(values: number[]) {
  if (
    values.length !== 5 ||
    values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)
  )
    throw new Error("Lima skor harus antara 0–100");
  return (
    Math.round(
      values.reduce((sum, v, i) => sum + (v * weights[i]) / 100, 0) * 100,
    ) / 100
  );
}
export function generateRegistrationCode(season = "S1") {
  return `IDC-${season}-${Array.from(
    crypto.getRandomValues(new Uint8Array(12)),
    (v) => v.toString(16).padStart(2, "0"),
  )
    .join("")
    .toUpperCase()}`;
}
