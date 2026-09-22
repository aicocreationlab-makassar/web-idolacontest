"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories, competitions } from "@/lib/business-rules";
import { ImageInput } from "./image-input";
import { Fees } from "./shared";
import { Download, Paintbrush, PartyPopper, Printer } from "lucide-react";
import { showSuccess } from "@/lib/success-event";
type Status = {
  public_name: string;
  competition_type: keyof typeof competitions;
  category: keyof typeof categories;
  payment_status: string;
  registration_status: string;
  deadline: string;
  worksheet_ready: boolean;
  submission: {
    status: string;
    publication_status: string;
    slug: string;
  } | null;
  claim: { invoice_number: string; amount: number; status: string } | null;
  shipment: {
    courier: string;
    tracking_number: string;
    shipping_status: string;
  } | null;
};
const statusLabel: Record<string, string> = {
  pending: "Menunggu verifikasi",
  paid: "Sudah dibayar",
  verified: "Aktif",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
  pending_review: "Menunggu pemeriksaan",
  approved: "Disetujui",
  revision_requested: "Perlu diperbaiki",
};
const friendlyStatus = (value: string) =>
  statusLabel[value] || value.replaceAll("_", " ");
export function Status() {
  const [code, setCode] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [worksheet, setWorksheet] = useState<{
    url: string;
    downloadUrl: string;
    version: number;
  } | null>(null);
  async function lookup() {
    setBusy(true);
    setError("");
    setData(null);
    setWorksheet(null);
    try {
      const r = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setData(d);
      setVerifiedCode(code);
      if (d.worksheet_ready && d.payment_status === "paid") {
        const worksheetResponse = await fetch("/api/worksheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const worksheetData = await worksheetResponse.json();
        if (worksheetResponse.ok) {
          setWorksheet({
            url: worksheetData.url,
            downloadUrl: worksheetData.download_url,
            version: worksheetData.version,
          });
        }
      }
      showSuccess(
        "Status peserta berhasil ditemukan.",
        "star",
        "Halo, data ditemukan!",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <form
        className="card stack"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup();
        }}
      >
        <label className="field">
          Kode registrasi
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            maxLength={45}
            autoComplete="off"
            placeholder="IDC-AHMAD-K7P9X2Q4"
            spellCheck={false}
          />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? "Memeriksa…" : "Cek status →"}
        </button>
      </form>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {data && (
        <>
          <div className="card stack">
            <h2 className="text-2xl">Halo, {data.public_name}!</h2>
            <p>
              {competitions[data.competition_type]} ·{" "}
              {categories[data.category]}
            </p>
            {data.payment_status === "paid" ? (
              <div className="notice bg-mint! flex items-center gap-3">
                <PartyPopper aria-hidden="true" /> Yeay! Pembayaranmu Sudah
                Terverifikasi!
              </div>
            ) : (
              <>
                <p className="notice">
                  Status pembayaran: {friendlyStatus(data.payment_status)}. Data
                  sudah tersimpan. Jika belum transfer, ikuti petunjuk berikut.
                  Jika sudah, konfirmasikan ke admin dan tunggu verifikasi.
                </p>
                <Fees />
              </>
            )}
            <p>
              Status pendaftaran:{" "}
              <b>{friendlyStatus(data.registration_status)}</b>
            </p>
            <p>
              Batas pengumpulan:{" "}
              <b>
                {new Date(data.deadline).toLocaleString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}{" "}
                WIB
              </b>
            </p>
            <p>
              Status karya:{" "}
              <b>
                {data.submission?.status
                  ? friendlyStatus(data.submission.status)
                  : "Belum dikirim"}
              </b>
            </p>
            {data.submission?.publication_status === "approved" &&
              data.submission.slug && (
                <div className="publication-success">
                  <PartyPopper aria-hidden="true" />
                  <div>
                    <h3>Karyamu sudah dipublikasikan!</h3>
                    <p>
                      Foto atau karya peserta sekarang sudah tampil di Galeri
                      Idola Contest.
                    </p>
                    <Link
                      className="btn"
                      href={`/galeri?highlight=${data.submission.slug}#finalis-${data.submission.slug}`}
                    >
                      Lihat kartu peserta di galeri →
                    </Link>
                  </div>
                </div>
              )}
            <Link
              className="text-purple underline"
              href={`/lomba/${data.competition_type === "coloring" ? "mewarnai" : "fotogenik"}`}
            >
              Baca instruksi lomba
            </Link>
            {data.worksheet_ready && data.payment_status === "paid" && (
              <section className="worksheet-ready-card">
                <div className="worksheet-ready-heading">
                  <Paintbrush aria-hidden="true" />
                  <div>
                    <span>KHUSUS UNTUK {data.public_name.toUpperCase()}</span>
                    <h3>Worksheet Cita-Cita Si Kecil</h3>
                    <p>
                      Admin Idola sudah menyiapkan lembar mewarnai eksklusif
                      dari foto dan cita-cita {data.public_name}.
                    </p>
                  </div>
                </div>
                {worksheet && (
                  <>
                    <Image
                      className="worksheet-direct-preview"
                      src={worksheet.url}
                      width={1200}
                      height={1600}
                      unoptimized
                      alt={`Worksheet cita-cita ${data.public_name}`}
                    />
                    <ol className="worksheet-instructions">
                      <li>
                        <Download /> Unduh worksheet dalam kualitas penuh.
                      </li>
                      <li>
                        <Printer /> Cetak pada kertas A4 dengan ukuran penuh.
                      </li>
                      <li>
                        <Paintbrush /> Warnai sekreatif mungkin bersama si
                        kecil.
                      </li>
                    </ol>
                    <p className="worksheet-finish-note">
                      Setelah karya selesai diwarnai, foto hasilnya dengan jelas
                      lalu unggah melalui bagian <b>Kirim karya</b> di bawah
                      ini.
                    </p>
                    <a
                      className="btn worksheet-download"
                      href={worksheet.downloadUrl}
                    >
                      <Download /> Download worksheet A4
                    </a>
                  </>
                )}
              </section>
            )}
          </div>
          {data.payment_status === "paid" &&
            data.registration_status === "verified" &&
            !["pending_review", "approved"].includes(
              data.submission?.status || "",
            ) &&
            new Date(data.deadline) > new Date() && (
              <form
                className="card stack"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!photo) {
                    setError("Pilih foto terlebih dahulu.");
                    return;
                  }
                  setBusy(true);
                  try {
                    const f = new FormData();
                    f.set("code", verifiedCode);
                    f.set("photo", photo);
                    const r = await fetch("/api/submissions", {
                      method: "POST",
                      body: f,
                    });
                    const d = await r.json();
                    if (!r.ok) throw new Error(d.error);
                    setMessage(d.message);
                    showSuccess(
                      "Karya berhasil dikirim untuk direview admin.",
                      "upload",
                      "Karya hebat sudah terkirim!",
                    );
                    await lookup();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h3>Kirim karya terbaikmu</h3>
                <ImageInput label="Foto karya" onChange={setPhoto} />
                <button className="btn" disabled={busy}>
                  Kirim untuk direview
                </button>
              </form>
            )}
          {data.claim && (
            <div className="card stack">
              <h3>Klaim penghargaan</h3>
              <p>Invoice {data.claim.invoice_number}</p>
              <p>
                Rp120.000 · termasuk ongkir seluruh Indonesia ·{" "}
                <b>{data.claim.status}</b>
              </p>
              <p>
                BSI 7341301558 a.n. Riswan Ramadhan. Konfirmasi pembayaran
                kepada admin.
              </p>
            </div>
          )}
          {data.shipment && (
            <div className="card stack">
              <h3>Pengiriman</h3>
              <p>
                {data.shipment.courier} · {data.shipment.shipping_status}
              </p>
              <p>Resi: {data.shipment.tracking_number || "Belum tersedia"}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
