"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories, competitions } from "@/lib/business-rules";
import { formatDate, formatDateTime } from "@/lib/season";
import { ImageInput } from "./image-input";
import { Fees } from "./shared";
import {
  Check,
  Download,
  Paintbrush,
  PartyPopper,
  Printer,
  Trophy,
  Truck,
  Receipt,
  Clock3,
} from "lucide-react";
import { showSuccess } from "@/lib/success-event";
import { formatParticipantAge } from "@/lib/participant";

type Status = {
  public_name: string;
  age?: number;
  age_unit?: "years" | "months";
  competition_type: keyof typeof competitions;
  category: keyof typeof categories;
  payment_status: string;
  registration_status: string;
  review_status: string;
  registered_at: string;
  deadline: string;
  worksheet_ready: boolean;
  season: {
    name: string;
    theme_title: string;
    announcement_at: string;
    shipping_at: string;
  } | null;
  submission: {
    status: string;
    publication_status: string;
    slug: string;
    submitted_at: string;
  } | null;
  result: {
    award_code: string;
    final_score: number;
    rank_position: number | null;
    published_at: string | null;
  } | null;
  claim: {
    invoice_number: string;
    amount: number;
    status: string;
    paid_at: string | null;
  } | null;
  shipment: {
    courier: string;
    tracking_number: string | null;
    shipping_status: string;
    shipped_at: string | null;
    delivered_at: string | null;
  } | null;
};

const statusLabel: Record<string, string> = {
  pending: "Menunggu verifikasi",
  paid: "Sudah dibayar",
  verified: "Aktif",
  registered: "Terdaftar",
  rejected: "Ditolak",
  refunded: "Dikembalikan",
  cancelled: "Dibatalkan",
  disqualified: "Didiskualifikasi",
  pending_review: "Menunggu pemeriksaan",
  approved: "Disetujui",
  revision_required: "Perlu diperbaiki",
  revision_requested: "Perlu diperbaiki",
  issued: "Menunggu pembayaran",
  waiting: "Menunggu",
  prepared: "Sedang disiapkan",
  shipped: "Sudah dikirim",
  delivered: "Sudah diterima",
};
const friendlyStatus = (value: string) =>
  statusLabel[value] || value.replaceAll("_", " ");

type Step = {
  key: string;
  label: string;
  state: "done" | "current" | "todo" | "blocked";
  detail: string;
};

function buildSteps(d: Status): Step[] {
  const paid = d.payment_status === "paid";
  const rejected = d.review_status === "rejected" || d.registration_status === "cancelled";
  const submission = d.submission?.status;
  const hasWork = submission === "pending_review" || submission === "approved";
  const claimPaid = d.claim?.status === "paid";
  const shipped =
    d.shipment?.shipping_status === "shipped" || d.shipment?.shipping_status === "delivered";
  const delivered = d.shipment?.shipping_status === "delivered";
  const steps: Step[] = [
    {
      key: "register",
      label: "Pendaftaran",
      state: rejected ? "blocked" : "done",
      detail: rejected
        ? "Pendaftaran ditolak admin. Hubungi @idola.contest untuk informasi."
        : `Terdaftar ${formatDateTime(d.registered_at)}.`,
    },
    {
      key: "payment",
      label: "Pembayaran registrasi",
      state: paid ? "done" : d.payment_status === "pending" ? "current" : "blocked",
      detail: paid
        ? "Pembayaran terverifikasi."
        : d.payment_status === "pending"
          ? "Transfer Rp20.000 lalu konfirmasi ke admin."
          : `Status: ${friendlyStatus(d.payment_status)}.`,
    },
    {
      key: "work",
      label: "Kirim karya",
      state:
        submission === "approved"
          ? "done"
          : hasWork
            ? "current"
            : paid && !rejected
              ? "current"
              : "todo",
      detail:
        submission === "approved"
          ? d.submission?.publication_status === "approved"
            ? "Karya disetujui dan tampil di galeri."
            : "Karya disetujui admin."
          : submission === "pending_review"
            ? "Karya sedang diperiksa admin."
            : submission
              ? `${friendlyStatus(submission)}. Kirim ulang karya sebelum batas waktu.`
              : `Batas kirim ${formatDateTime(d.deadline)}.`,
    },
    {
      key: "judging",
      label: "Penilaian juri",
      state: d.result ? "done" : submission === "approved" ? "current" : "todo",
      detail: d.result
        ? "Penilaian selesai."
        : submission === "approved"
          ? "Karya dinilai juri dan diranking otomatis per kategori."
          : "Dimulai setelah karya disetujui.",
    },
    {
      key: "result",
      label: "Pengumuman juara",
      state: d.result ? "done" : "todo",
      detail: d.result
        ? `${d.result.award_code} · diumumkan ${formatDate(d.result.published_at)}.`
        : d.season
          ? `Pengumuman ${formatDate(d.season.announcement_at)}.`
          : "Menunggu pengumuman.",
    },
    {
      key: "claim",
      label: "Klaim paket penghargaan",
      state: claimPaid ? "done" : d.claim ? "current" : "todo",
      detail: claimPaid
        ? `Klaim lunas ${formatDate(d.claim?.paid_at)}.`
        : d.claim
          ? d.claim.status === "cancelled"
            ? "Klaim dibatalkan."
            : `Invoice ${d.claim.invoice_number} · Rp120.000 menunggu pembayaran.`
          : "Invoice terbit otomatis setelah juara diumumkan.",
    },
    {
      key: "shipping",
      label: "Pengiriman hadiah",
      state: delivered ? "done" : shipped ? "current" : d.shipment ? "current" : "todo",
      detail: delivered
        ? `Paket diterima ${formatDate(d.shipment?.delivered_at)}.`
        : shipped
          ? `${d.shipment?.courier} · resi ${d.shipment?.tracking_number} · dikirim ${formatDate(d.shipment?.shipped_at)}.`
          : d.shipment
            ? `${friendlyStatus(d.shipment.shipping_status)} oleh admin.`
            : d.season
              ? `Pengiriman serentak mulai ${formatDate(d.season.shipping_at)}.`
              : "Menunggu jadwal pengiriman.",
    },
  ];
  return steps;
}

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
  async function lookup(quiet = false) {
    setBusy(true);
    setError("");
    if (!quiet) {
      setData(null);
      setWorksheet(null);
    }
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
      if (!quiet)
        showSuccess(
          d.result
            ? `Selamat! ${d.public_name} meraih ${d.result.award_code}.`
            : "Status peserta berhasil ditemukan.",
          d.result ? "celebrate" : "star",
          d.result ? "Juara ditemukan!" : "Halo, data ditemukan!",
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const steps = data ? buildSteps(data) : [];
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
              {data.season ? ` · ${data.season.name} · Tema ${data.season.theme_title}` : ""}
            </p>
            {data.age !== undefined && data.age !== null && (
              <p>
                Usia peserta: <b>{formatParticipantAge(data.age, data.age_unit)}</b>
              </p>
            )}
            {data.result && (
              <div className="winner-banner">
                <Trophy aria-hidden="true" />
                <div>
                  <span className="eyebrow">SELAMAT!</span>
                  <h3>{data.result.award_code}</h3>
                  <p>
                    {data.result.rank_position
                      ? `Peringkat ${data.result.rank_position} kategori ${categories[data.category]} · `
                      : ""}
                    skor akhir {Number(data.result.final_score)} · diumumkan{" "}
                    {formatDate(data.result.published_at)}.
                  </p>
                </div>
              </div>
            )}
            <ol className="journey-tracker" aria-label="Perjalanan peserta">
              {steps.map((step, i) => (
                <li className={`journey-step ${step.state}`} key={step.key}>
                  <span className="journey-step-icon" aria-hidden="true">
                    {step.state === "done" ? <Check /> : step.state === "current" ? <Clock3 /> : i + 1}
                  </span>
                  <div>
                    <b>{step.label}</b>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
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
                    <h3>Worksheet {data.season?.theme_title || "Cita-Cita"} Si Kecil</h3>
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
                      alt={`Worksheet ${data.public_name}`}
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
                    await lookup(true);
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
              <h3 className="flex items-center gap-2">
                <Receipt aria-hidden="true" /> Klaim paket penghargaan
              </h3>
              <p>
                Invoice <b>{data.claim.invoice_number}</b>
              </p>
              <p>
                Rp120.000 · termasuk ongkir seluruh Indonesia ·{" "}
                <b>{friendlyStatus(data.claim.status)}</b>
                {data.claim.paid_at ? ` · lunas ${formatDate(data.claim.paid_at)}` : ""}
              </p>
              {data.claim.status === "issued" && (
                <p>
                  Transfer ke BSI <b>7341301558</b> a.n. <b>Riswan Ramadhan</b>, lalu
                  konfirmasi pembayaran kepada admin. Setelah lunas, paket disiapkan
                  dan dikirim.
                </p>
              )}
            </div>
          )}
          {data.shipment && (
            <div className="card stack">
              <h3 className="flex items-center gap-2">
                <Truck aria-hidden="true" /> Pengiriman
              </h3>
              <p>
                {data.shipment.courier} · <b>{friendlyStatus(data.shipment.shipping_status)}</b>
              </p>
              <p>Resi: {data.shipment.tracking_number || "Belum tersedia"}</p>
              {data.shipment.shipped_at && (
                <p className="muted">Dikirim {formatDateTime(data.shipment.shipped_at)}</p>
              )}
              {data.shipment.delivered_at && (
                <p className="muted">Diterima {formatDateTime(data.shipment.delivered_at)}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
