"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Camera, Copy, Save } from "lucide-react";
import { Fees } from "./shared";
import { showSuccess } from "@/lib/success-event";
import {
  bankLine,
  defaultContent,
  defaultFees,
  instagramUrl,
  rupiah,
  type ResolvedContent,
} from "@/lib/contest-modes";
const subscribe = () => () => {};
function snapshot() {
  try {
    return sessionStorage.getItem("idola-registration");
  } catch {
    return null;
  }
}
const classicContent: ResolvedContent = {
  ...defaultContent.classic,
  mode: "classic",
  registration_fee: defaultFees.classic.registration,
  claim_fee: defaultFees.classic.claim,
  quota: null,
};
export function Success({
  content = classicContent,
}: {
  content?: ResolvedContent;
}) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null);
  const [copied, setCopied] = useState("");
  const [accountCopied, setAccountCopied] = useState(false);
  const instagram = content.instagram.replace(/^@/, "");
  const fee = rupiah(content.registration_fee);
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
      <div className="wajib-alert" role="alert">
        <span className="wajib-alert-badge">WAJIB</span>
        <div>
          <h3>Transfer {fee} &amp; kirim buktinya ke DM</h3>
          <p>
            {content.dm_alert} Transfer ke <b>{bankLine(content)}</b>.
            Pendaftaran diproses setelah bukti transfer diterima admin.
          </p>
          <div className="actions">
            <button
              type="button"
              className="btn secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(content.bank_account);
                  setAccountCopied(true);
                  showSuccess("Nomor rekening berhasil disalin.", "copy");
                } catch {
                  setAccountCopied(false);
                }
              }}
            >
              <Copy size={16} /> {accountCopied ? "Rekening tersalin" : "Salin rekening"}
            </button>
          </div>
        </div>
      </div>
      <Fees content={content} />
      <div className="screenshot-important">
        <Camera aria-hidden="true" />
        <div>
          <span>WAJIB DILAKUKAN</span>
          <h2>Screenshot halaman ini</h2>
          <p>
            Kirim <b>nama peserta, bukti transfer {fee}, dan screenshot halaman ini</b>{" "}
            melalui DM Instagram <b>@{instagram}</b> agar pendaftaran segera
            diproses admin.
          </p>
          <a
            className="btn instagram-button"
            href={instagramUrl(instagram)}
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram /> Kirim ke DM @{instagram}
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
          Hubungi @{instagram} untuk konfirmasi pembayaran. Nomor WhatsApp
          admin belum dikonfigurasi.
        </p>
      )}
      <Link href="/cek-status" className="btn">
        Cek nomor registrasi nanti →
      </Link>
    </div>
  );
}
