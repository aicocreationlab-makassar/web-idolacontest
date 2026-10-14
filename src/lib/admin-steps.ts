import type { MessageContext } from "./messages";

export type AdminStep = {
  label: string;
  /** action: an admin must act · wait: waiting on the parent or schedule · done · stop */
  tone: "action" | "wait" | "done" | "stop";
};

/**
 * The one thing an admin should know about a participant at a glance: what
 * happens next and whether it is the admin's move.
 */
export function nextAdminStep(c: MessageContext): AdminStep {
  if (c.review_status === "rejected")
    return { label: "Pendaftaran ditolak", tone: "stop" };
  if (c.review_status !== "approved" || c.payment_status !== "paid")
    return { label: "Perlu verifikasi pembayaran", tone: "action" };
  if (c.shipping_status === "delivered")
    return { label: "Selesai · hadiah diterima", tone: "done" };
  if (c.shipping_status === "shipped")
    return { label: "Hadiah dalam pengiriman", tone: "wait" };
  if (c.claim_status === "paid") return { label: "Siap kirim hadiah", tone: "action" };
  if (c.result_published && c.award_code)
    return {
      label: (c.claim_fee ?? 120000) === 0 ? "Menunggu konfirmasi hadiah" : "Menunggu pembayaran klaim",
      tone: "wait",
    };
  if (c.submission_status === "approved")
    return c.award_code
      ? { label: "Menunggu pengumuman juara", tone: "wait" }
      : { label: "Siap dinilai juri", tone: "action" };
  if (c.submission_status === "pending_review")
    return { label: "Karya perlu direview", tone: "action" };
  if (c.submission_status === "revision_required")
    return { label: "Menunggu revisi karya", tone: "wait" };
  if (c.submission_status === "rejected")
    return { label: "Menunggu karya baru", tone: "wait" };
  if (c.competition_type === "photogenic")
    return { label: "Foto lomba diproses otomatis", tone: "wait" };
  if (!c.worksheet_ready) return { label: "Upload worksheet", tone: "action" };
  return { label: "Menunggu karya mewarnai", tone: "wait" };
}
