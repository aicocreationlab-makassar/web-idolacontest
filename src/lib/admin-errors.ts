const messages: Array<[RegExp, string]> = [
  [/Unauthorized|permission denied/i, "Akses ditolak. Login ulang sebagai admin."],
  [/Super admin required/i, "Hanya super admin yang dapat melakukan ini."],
  [/Not approved/i, "Karya belum disetujui, jadi belum bisa dinilai."],
  [/Results locked/i, "Hasil sudah diumumkan, nilai dikunci. Sembunyikan hasil dulu jika perlu mengubah."],
  [/Five scores required|Invalid score/i, "Lima nilai 0–100 wajib diisi."],
  [/Missing submission/i, "Karya tidak ditemukan."],
  [/Missing registration/i, "Peserta tidak ditemukan."],
  [/Missing season/i, "Season tidak ditemukan."],
  [/Unpublish first/i, "Tarik publikasi karya terlebih dahulu."],
  [/Invalid review/i, "Status review tidak valid."],
  [/Not publishable/i, "Karya belum memenuhi syarat publikasi: harus disetujui, pembayaran lunas, dan pendaftaran aktif."],
  [/Invalid payment/i, "Status pembayaran tidak valid."],
  [/Not eligible/i, "Worksheet hanya untuk peserta lomba mewarnai."],
  [/Not paid/i, "Pembayaran peserta belum berstatus lunas."],
  [/Result required/i, "Peserta belum memiliki hasil atau penghargaan."],
  [/Invoice required/i, "Invoice klaim belum diterbitkan."],
  [/Invalid claim status/i, "Status klaim tidak valid."],
  [/Already shipped/i, "Paket sudah dikirim, klaim tidak dapat dibatalkan."],
  [/Paid claim required/i, "Klaim hadiah belum dibayar. Tandai klaim lunas dulu sebelum mengatur pengiriman."],
  [/Invalid shipment/i, "Status pengiriman tidak valid."],
  [/Tracking required/i, "Nomor resi wajib diisi untuk status dikirim/diterima."],
  [/Courier required/i, "Nama kurir wajib diisi."],
  [/Season active/i, "Season yang sedang aktif tidak dapat dihapus. Aktifkan season lain dulu."],
  [/Season has registrations/i, "Season sudah memiliki peserta, tidak dapat dihapus."],
  [/valid_dates/i, "Urutan tanggal tidak valid: buka ≤ tutup ≤ batas karya < penilaian < pengumuman < pengiriman."],
  [/valid_slug|seasons_slug_key/i, "Kode season harus unik, huruf besar/angka maksimal 12 karakter (contoh: S2)."],
  [/seasons_theme_key_check/i, "Tema season tidak dikenal."],
  [/bounded_season_text/i, "Nama, tema, atau tagline season terlalu panjang."],
  [/one_active_season/i, "Hanya satu season yang boleh aktif."],
  [/quota/i, "Kuota harus berupa angka lebih dari 0 atau dikosongkan."],
  [/registration_code_shape/i, "Format kode registrasi tidak valid."],
  [/shipment_fields/i, "Nama kurir maksimal 60 karakter dan nomor resi maksimal 100 karakter."],
  [/bounded_review_note|bounded_registration_review_note/i, "Catatan maksimal 500 karakter."],
  [/function .* does not exist|could not find the function/i, "Fungsi database belum tersedia. Terapkan migration terbaru di Supabase (supabase/migrations)."],
  [/column .* does not exist/i, "Skema database belum diperbarui. Terapkan migration terbaru di Supabase."],
  [/invalid input syntax for type timestamp|date\/time field value out of range/i, "Format tanggal tidak valid."],
  [/invalid input syntax for type integer/i, "Angka tidak valid."],
  [/Unknown action/i, "Aksi tidak dikenal."],
  [/fetch failed|ECONNREFUSED|ENOTFOUND|network/i, "Tidak dapat terhubung ke database. Periksa koneksi internet lalu coba lagi."],
];

/** Converts PostgREST / PostgreSQL errors into clear Indonesian guidance for admins. */
export function describeDatabaseError(error: unknown, fallback = "Perubahan belum dapat disimpan.") {
  const raw =
    typeof error === "string"
      ? error
      : error && typeof error === "object"
        ? String(
            (error as { message?: string; details?: string; hint?: string }).message ||
              (error as { details?: string }).details ||
              "",
          )
        : "";
  for (const [pattern, message] of messages) if (pattern.test(raw)) return message;
  return raw ? `${fallback} (${raw.slice(0, 160)})` : fallback;
}
