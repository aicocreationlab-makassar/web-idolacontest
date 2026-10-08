import { categories, competitions } from "./business-rules";
import { formatDate, formatDateTime } from "./season";

/** Everything a personal DM needs. Private fields (address, WhatsApp) are never included. */
export type MessageContext = {
  public_name: string;
  registration_code: string;
  competition_type: string;
  category: string;
  season_name?: string | null;
  theme_title?: string | null;
  deadline?: string | null;
  payment_status?: string | null;
  review_status?: string | null;
  worksheet_ready?: boolean | null;
  submission_status?: string | null;
  publication_status?: string | null;
  award_code?: string | null;
  rank_position?: number | null;
  result_published?: boolean | null;
  invoice_number?: string | null;
  claim_status?: string | null;
  courier?: string | null;
  tracking_number?: string | null;
  shipping_status?: string | null;
  announcement_at?: string | null;
  shipping_at?: string | null;
};

export type MessageStage =
  | "registered"
  | "payment_reminder"
  | "payment_verified"
  | "worksheet_ready"
  | "work_reminder"
  | "work_received"
  | "work_revision"
  | "work_rejected"
  | "work_published"
  | "winner_announced"
  | "claim_invoice"
  | "claim_paid"
  | "shipped"
  | "delivered"
  | "thank_you";

export const stageLabels: Record<MessageStage, string> = {
  registered: "Kode registrasi terbit",
  payment_reminder: "Pengingat pembayaran registrasi",
  payment_verified: "Pembayaran terverifikasi",
  worksheet_ready: "Worksheet personal siap",
  work_reminder: "Pengingat kirim karya",
  work_received: "Karya diterima",
  work_revision: "Karya perlu revisi",
  work_rejected: "Karya ditolak",
  work_published: "Karya tampil di galeri",
  winner_announced: "Pengumuman juara",
  claim_invoice: "Invoice klaim hadiah",
  claim_paid: "Klaim hadiah lunas",
  shipped: "Hadiah dikirim (resi)",
  delivered: "Hadiah diterima",
  thank_you: "Terima kasih (belum juara)",
};

const SITE = "https://idolacontest.my.id";
const STATUS_URL = `${SITE}/cek-status`;
const BANK = "BSI 7341301558 a.n. Riswan Ramadhan";

/** Picks the most advanced stage that applies to the participant right now. */
export function currentStage(c: MessageContext): MessageStage {
  if (c.shipping_status === "delivered") return "delivered";
  if (c.shipping_status === "shipped") return "shipped";
  if (c.claim_status === "paid") return "claim_paid";
  if (c.result_published && c.invoice_number) return "claim_invoice";
  if (c.result_published && c.award_code) return "winner_announced";
  if (c.publication_status === "approved") return "work_published";
  if (c.submission_status === "rejected") return "work_rejected";
  if (c.submission_status === "revision_required") return "work_revision";
  if (c.submission_status === "pending_review" || c.submission_status === "approved")
    return "work_received";
  if (c.payment_status === "paid" && c.worksheet_ready) return "worksheet_ready";
  if (c.payment_status === "paid") return "payment_verified";
  return "registered";
}

/** Stages worth offering for this participant, current one first. */
export function availableStages(c: MessageContext): MessageStage[] {
  const all: MessageStage[] = [
    "registered",
    "payment_reminder",
    "payment_verified",
    "worksheet_ready",
    "work_reminder",
    "work_received",
    "work_revision",
    "work_rejected",
    "work_published",
    "winner_announced",
    "claim_invoice",
    "claim_paid",
    "shipped",
    "delivered",
    "thank_you",
  ];
  const current = currentStage(c);
  return [current, ...all.filter((stage) => stage !== current)];
}

function greeting(c: MessageContext) {
  return `Halo Mommy ${c.public_name} 🌟`;
}

function competition(c: MessageContext) {
  const type =
    competitions[c.competition_type as keyof typeof competitions] || c.competition_type;
  const level = categories[c.category as keyof typeof categories] || c.category;
  return `Lomba ${type} · kategori ${level}`;
}

function codeBlock(c: MessageContext) {
  return `Kode registrasi ${c.public_name}:\n${c.registration_code}\n\nCara cek status: buka ${STATUS_URL}, masukkan kode di atas. Mommy bisa melihat pembayaran, worksheet, karya, pengumuman juara, klaim hadiah, sampai nomor resi di sana.`;
}

const closing = "Terima kasih sudah mempercayakan momen istimewa si kecil kepada Idola Contest 💛\n\nSalam hangat,\nTim Idola Contest\n@idola.contest";

/** Builds a warm, professional Instagram DM for one stage. */
export function composeMessage(stage: MessageStage, c: MessageContext): string {
  const season = c.season_name ? ` ${c.season_name}` : "";
  const theme = c.theme_title ? ` bertema "${c.theme_title}"` : "";
  const deadline = c.deadline ? formatDateTime(c.deadline) : "sesuai jadwal season";
  switch (stage) {
    case "registered":
      return `${greeting(c)}\n\nTerima kasih, pendaftaran ${c.public_name} di Idola Contest${season}${theme} sudah kami terima untuk ${competition(c)}. Selamat datang di panggung si kecil!\n\n${codeBlock(c)}\n\nLangkah selanjutnya:\n1. Transfer biaya registrasi Rp20.000 ke ${BANK}.\n2. Kirim bukti transfer ke DM ini.\n3. Setelah kami verifikasi, status di Cek Status berubah menjadi "Sudah dibayar" dan ${c.public_name} resmi menjadi peserta.\n\nSimpan kode ini baik-baik ya, Mommy, dan jangan dibagikan ke orang lain.\n\n${closing}`;
    case "payment_reminder":
      return `${greeting(c)}\n\nKami ingin mengingatkan dengan lembut bahwa pendaftaran ${c.public_name} untuk ${competition(c)} masih menunggu pembayaran registrasi Rp20.000.\n\nTransfer ke ${BANK}, lalu kirim bukti transfernya ke DM ini agar kami bisa segera memverifikasi.\n\nKode registrasi: ${c.registration_code}\nCek status: ${STATUS_URL}\n\nKami tidak sabar melihat karya si kecil bersinar 💛\n\n${closing}`;
    case "payment_verified":
      return `${greeting(c)}\n\nKabar baik! Pembayaran registrasi ${c.public_name} sudah kami verifikasi. ${c.public_name} kini resmi menjadi peserta ${competition(c)} di Idola Contest${season} 🎉\n\nKode registrasi: ${c.registration_code}\nCek status: ${STATUS_URL}\n\nLangkah selanjutnya: ${c.competition_type === "coloring" ? `tim kami sedang menyiapkan worksheet personal ${c.public_name} dari foto dan cita-citanya. Begitu siap, Mommy bisa mengunduhnya lewat Cek Status, cetak di kertas A4, lalu si kecil mewarnai.` : `siapkan foto terbaik ${c.public_name}${theme}, lalu unggah lewat halaman Cek Status.`}\n\nBatas kirim karya: ${deadline}.\n\n${closing}`;
    case "worksheet_ready":
      return `${greeting(c)}\n\nWorksheet personal ${c.public_name} sudah siap! Lembar mewarnai eksklusif ini dibuat dari foto dan cita-cita si kecil${theme}.\n\nCaranya:\n1. Buka ${STATUS_URL} dan masukkan kode ${c.registration_code}.\n2. Ketuk "Download worksheet A4" lalu cetak ukuran penuh di kertas A4.\n3. Biarkan ${c.public_name} mewarnai sekreatif mungkin.\n4. Foto hasilnya dengan jelas, lalu unggah di bagian "Kirim karya" pada halaman yang sama.\n\nBatas kirim karya: ${deadline}.\n\nSelamat berkreasi bersama si kecil 🎨\n\n${closing}`;
    case "work_reminder":
      return `${greeting(c)}\n\nSekadar mengingatkan, karya ${c.public_name} untuk ${competition(c)} belum kami terima. Batas kirim karya: ${deadline}.\n\nUnggah lewat ${STATUS_URL} dengan kode ${c.registration_code}, pilih "Kirim karya", lalu kirim foto karya si kecil (JPG/PNG/WebP maksimal 2 MB).\n\nKami menunggu karya hebat ${c.public_name} 💛\n\n${closing}`;
    case "work_received":
      return `${greeting(c)}\n\nKarya ${c.public_name} sudah kami terima dan sedang diperiksa tim Idola Contest. Terima kasih sudah berkarya sepenuh hati!\n\nSetelah lolos pemeriksaan, karya akan tampil di galeri finalis dan dinilai oleh dewan juri. Pantau perkembangannya di ${STATUS_URL} dengan kode ${c.registration_code}.\n\n${closing}`;
    case "work_revision":
      return `${greeting(c)}\n\nTerima kasih sudah mengirim karya ${c.public_name}. Agar bisa dinilai dengan maksimal, kami mohon bantuan Mommy untuk mengunggah ulang karya dengan foto yang lebih jelas (pencahayaan cukup, tidak buram, seluruh karya terlihat).\n\nCaranya: buka ${STATUS_URL}, masukkan kode ${c.registration_code}, lalu pilih "Kirim karya". Batas kirim: ${deadline}.\n\nTerima kasih atas pengertiannya 💛\n\n${closing}`;
    case "work_rejected":
      return `${greeting(c)}\n\nTerima kasih sudah mengirim karya ${c.public_name}. Mohon maaf, karya tersebut belum dapat kami terima karena belum sesuai ketentuan lomba${theme}.\n\nMommy masih bisa mengirim karya baru sebelum ${deadline} lewat ${STATUS_URL} (kode ${c.registration_code}). Jika ada pertanyaan, balas pesan ini ya, kami siap membantu.\n\n${closing}`;
    case "work_published":
      return `${greeting(c)}\n\nSelamat! Karya ${c.public_name} sudah lolos pemeriksaan dan kini tampil di Galeri Finalis Idola Contest${season} ✨\n\nLihat kartu finalisnya di ${SITE}/galeri dan boleh dibagikan ke keluarga. Tahap berikutnya adalah penilaian dewan juri${c.announcement_at ? `, dengan pengumuman juara pada ${formatDate(c.announcement_at)}` : ""}.\n\nKode registrasi: ${c.registration_code}\nCek status: ${STATUS_URL}\n\n${closing}`;
    case "winner_announced":
      return `${greeting(c)}\n\nSELAMAT! 🏆 ${c.public_name} meraih ${c.award_code || "penghargaan"} pada ${competition(c)} Idola Contest${season}${c.rank_position ? ` (peringkat ${c.rank_position} di kategorinya)` : ""}.\n\nKami bangga sekali dengan keberanian dan kreativitas si kecil. Nama ${c.public_name} kini tampil di halaman pemenang: ${SITE}/hasil\n\nLangkah selanjutnya: klaim paket penghargaan (piala, medali, piagam, dan plakat) dengan biaya Rp120.000 sudah termasuk ongkir ke seluruh Indonesia. Invoice klaim bisa dilihat di ${STATUS_URL} dengan kode ${c.registration_code}.\n\n${closing}`;
    case "claim_invoice":
      return `${greeting(c)}\n\nInvoice klaim paket penghargaan ${c.public_name} (${c.award_code || "juara"}) sudah terbit:\n\nNomor invoice: ${c.invoice_number || "-"}\nJumlah: Rp120.000 (sudah termasuk ongkir seluruh Indonesia)\nTransfer ke: ${BANK}\n\nSetelah transfer, kirim bukti pembayaran ke DM ini. Begitu kami verifikasi, paket penghargaan langsung kami siapkan${c.shipping_at ? ` dan dikirim mulai ${formatDate(c.shipping_at)}` : ""}.\n\nCek status: ${STATUS_URL} (kode ${c.registration_code})\n\n${closing}`;
    case "claim_paid":
      return `${greeting(c)}\n\nTerima kasih, pembayaran klaim paket penghargaan ${c.public_name} sudah kami terima dan terverifikasi ✅\n\nPaket ${c.award_code || "penghargaan"} sedang kami siapkan dengan penuh kehati-hatian. Nomor resi akan muncul di ${STATUS_URL} (kode ${c.registration_code}) begitu paket dikirim, dan kami juga akan mengabari Mommy di sini.\n\n${closing}`;
    case "shipped":
      return `${greeting(c)}\n\nPaket penghargaan ${c.public_name} sudah dikirim 📦\n\nKurir: ${c.courier || "-"}\nNomor resi: ${c.tracking_number || "-"}\n\nMommy bisa melacak paket melalui situs/aplikasi kurir dengan nomor resi di atas, atau lewat ${STATUS_URL} (kode ${c.registration_code}). Mohon pastikan ada yang menerima paket di alamat pengiriman ya.\n\n${closing}`;
    case "delivered":
      return `${greeting(c)}\n\nPaket penghargaan ${c.public_name} tercatat sudah diterima 🎁 Semoga piala dan medalinya menjadi kenangan manis dan penyemangat si kecil untuk terus berkarya.\n\nKami akan sangat senang jika Mommy berkenan membagikan foto ${c.public_name} bersama hadiahnya dan menandai @idola.contest.\n\nSampai jumpa di season berikutnya!\n\n${closing}`;
    case "thank_you":
      return `${greeting(c)}\n\nTerima kasih sudah menemani ${c.public_name} berkarya di Idola Contest${season}. Kali ini ${c.public_name} belum terpilih sebagai juara, tetapi keberanian tampil dan karya yang dikirim sudah menjadi pencapaian besar bagi si kecil.\n\nKarya ${c.public_name} tetap tampil di galeri finalis${c.publication_status === "approved" ? ` (${SITE}/galeri)` : ""}. Kami tunggu di season berikutnya ya, Mommy 💛\n\n${closing}`;
  }
}
