"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Camera, Save } from "lucide-react";
import { Fees } from "./shared";
import { showSuccess } from "@/lib/success-event";
const subscribe = () => () => {};
function snapshot() {
  try {
    return sessionStorage.getItem("idola-registration");
  } catch {
    return null;
  }
}
export function Success() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null);
  const [copied, setCopied] = useState("");
  let data: {
    code: string;
    public_name: string;
    registered_at?: string;
  } | null = null;
  try {
    const parsed = JSON.parse(stored || "null");
    if (
      parsed &&
      typeof parsed.code === "string" &&
      typeof parsed.public_name === "string"
    )
      data = parsed;
  } catch {
    /* Invalid local data is treated as absent. */
  }
  if (!data)
    return (
      <div className="notice">
        Kode tidak tersedia pada browser ini. Gunakan kode yang telah Anda
        simpan di{" "}
        <Link href="/cek-status" className="underline">
          Cek Status
        </Link>
        .
      </div>
    );
  const message = `Halo Admin Idola Contest, saya telah mendaftarkan ${data.public_name} dengan nomor registrasi ${data.code}. Saya ingin melakukan konfirmasi pembayaran registrasi.`;
  const code = data.code;
  return (
    <div className="card stack">
      <p>
        Pendaftaran {data.public_name} telah tersimpan. Simpan kode ini secara
        pribadi untuk mengakses status dan mengirim karya.
      </p>
      <div className="registration-code-box">
        <Save aria-hidden="true" />
        <span>KODE REGISTRASI — WAJIB DISIMPAN</span>
        <strong>{code}</strong>
        {data.registered_at && (
          <small>
            Terdaftar{" "}
            {new Date(data.registered_at).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              dateStyle: "full",
              timeStyle: "short",
            })}{" "}
            WIB
          </small>
        )}
      </div>
      <button
        className="btn secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied("Kode disalin");
            showSuccess("Kode registrasi berhasil disalin.", "copy");
          } catch {
            setCopied("Pilih dan salin kode di atas.");
          }
        }}
      >
        {copied || "Salin kode"}
      </button>
      <Fees />
      <div className="screenshot-important">
        <Camera aria-hidden="true" />
        <div>
          <span>WAJIB DILAKUKAN</span>
          <h2>Screenshot halaman ini</h2>
          <p>
            Kirim <b>nama peserta dan screenshot halaman ini</b> melalui DM
            Instagram <b>@idola.contest</b> agar pendaftaran segera diproses
            admin.
          </p>
          <a
            className="btn instagram-button"
            href="https://instagram.com/idola.contest"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram /> Kirim ke DM @idola.contest
          </a>
        </div>
      </div>
      {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? (
        <a
          className="btn bg-green-700!"
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
        >
          <FaWhatsapp /> Konfirmasi pembayaran
        </a>
      ) : (
        <p className="notice">
          Hubungi @idola.contest untuk konfirmasi pembayaran. Nomor WhatsApp
          admin belum dikonfigurasi.
        </p>
      )}
      <Link href="/cek-status" className="btn">
        Cek nomor registrasi nanti →
      </Link>
    </div>
  );
}
