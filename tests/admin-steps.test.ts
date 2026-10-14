import { test } from "node:test";
import assert from "node:assert/strict";
import { nextAdminStep } from "../src/lib/admin-steps";

const base = {
  public_name: "Bintang",
  registration_code: "IDC-BINTANG-1234",
  competition_type: "coloring",
  category: "kids",
};

test("Admin summaries name the next step for each stage", () => {
  const step = (extra: object) => nextAdminStep({ ...base, ...extra }).label;
  assert.equal(step({ payment_status: "pending" }), "Perlu verifikasi pembayaran");
  assert.equal(
    step({ review_status: "approved", payment_status: "pending" }),
    "Perlu verifikasi pembayaran",
  );
  assert.equal(step({ review_status: "rejected" }), "Pendaftaran ditolak");
  const verified = { review_status: "approved", payment_status: "paid" };
  assert.equal(step(verified), "Upload worksheet");
  assert.equal(step({ ...verified, worksheet_ready: true }), "Menunggu karya mewarnai");
  assert.equal(
    step({ ...verified, competition_type: "photogenic" }),
    "Foto lomba diproses otomatis",
  );
  assert.equal(step({ ...verified, submission_status: "pending_review" }), "Karya perlu direview");
  assert.equal(step({ ...verified, submission_status: "approved" }), "Siap dinilai juri");
  assert.equal(
    step({ ...verified, submission_status: "approved", award_code: "Juara Umum" }),
    "Menunggu pengumuman juara",
  );
  assert.equal(
    step({
      ...verified,
      submission_status: "approved",
      award_code: "Juara Umum",
      result_published: true,
      claim_fee: 0,
    }),
    "Menunggu konfirmasi hadiah",
  );
  assert.equal(step({ ...verified, claim_status: "paid" }), "Siap kirim hadiah");
  assert.equal(step({ ...verified, shipping_status: "delivered" }), "Selesai · hadiah diterima");
  assert.equal(nextAdminStep({ ...base, ...verified }).tone, "action");
  assert.equal(nextAdminStep({ ...base, ...verified, worksheet_ready: true }).tone, "wait");
});
