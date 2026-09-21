"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Fees } from "./shared";
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
  let data: { code: string; public_name: string } | null = null;
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
      <p className="notice font-mono break-all text-lg">{code}</p>
      <button
        className="btn secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied("Kode disalin");
          } catch {
            setCopied("Pilih dan salin kode di atas.");
          }
        }}
      >
        {copied || "Salin kode"}
      </button>
      <Fees />
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
        Cek status →
      </Link>
    </div>
  );
}
