"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { awards, criteria, weights, weightedScore } from "@/lib/business-rules";
import { ImageInput } from "./image-input";
import { showSuccess } from "@/lib/success-event";

type Control =
  | "payment"
  | "review"
  | "publish"
  | "unpublish"
  | "score"
  | "award"
  | "result_publish"
  | "publish_group"
  | "invoice"
  | "claim_paid"
  | "claim_status"
  | "shipment"
  | "registration_review";

export async function mutate(
  action: Control,
  id: string,
  data: Record<string, unknown> = {},
) {
  const response = await fetch("/api/admin/mutate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, id, data }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "Perubahan belum dapat disimpan.");
  return result;
}

export function AdminControl({
  action,
  id,
  published = false,
  competition = "photogenic",
  initial = {},
  compact = false,
  label,
  successMessage,
  awardOptions = awards,
}: {
  action: Control;
  id: string;
  published?: boolean;
  competition?: string;
  initial?: Record<string, string | number | null | undefined>;
  compact?: boolean;
  label?: string;
  successMessage?: string;
  awardOptions?: string[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<number[]>(() => {
    const raw = initial.scores;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length === 5)
        return parsed.map((value) => Number(value) || 0);
    } catch {}
    return [0, 0, 0, 0, 0];
  });
  const alreadyScored =
    action === "score" && typeof initial.scores === "string" && initial.scores.length > 0;
  return (
    <form
      className={`stack admin-control${compact ? " compact" : ""}`}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        setFailed(false);
        const f = new FormData(e.currentTarget);
        const data: Record<string, unknown> = Object.fromEntries(f);
        if (action === "score") data.scores = scores;
        if (action === "result_publish") data.published = !published;
        if (action === "publish_group") {
          data.published = !published;
          data.competition = initial.competition;
          data.category = initial.category;
        }
        try {
          await mutate(action, id, data);
          setMessage("Tersimpan.");
          showSuccess(
            successMessage ||
              {
                score: "Nilai tersimpan. Peringkat kategori diperbarui otomatis.",
                award: "Penghargaan ditetapkan.",
                result_publish: published
                  ? "Hasil disembunyikan dari publik."
                  : "Juara diumumkan; langkah klaim/konfirmasi hadiah terbuka di Cek Status.",
                publish_group: published
                  ? "Seluruh hasil kategori disembunyikan."
                  : "Seluruh juara kategori diumumkan; klaim/konfirmasi hadiah terbuka di Cek Status.",
                invoice: "Invoice klaim diterbitkan.",
                claim_paid: "Klaim hadiah ditandai lunas.",
                claim_status: "Status klaim diperbarui.",
                shipment: "Data pengiriman tersimpan dan tampil di Cek Status peserta.",
                payment: "Status pembayaran diperbarui.",
                review: "Review karya tersimpan.",
                publish: "Karya dipublikasikan ke galeri.",
                unpublish: "Publikasi karya ditarik.",
                registration_review: "Keputusan pendaftaran tersimpan.",
              }[action],
            action === "publish" ? "camera" : "admin",
          );
          router.refresh();
        } catch (error) {
          setFailed(true);
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {(action === "payment" ||
        action === "review" ||
        action === "registration_review") && (
        <>
          <label className="field">
            Status
            <select
              name="status"
              defaultValue={String(initial.status ?? "pending")}
            >
              {(action === "payment"
                ? [
                    ["pending", "Menunggu"],
                    ["paid", "Sudah dibayar"],
                    ["rejected", "Ditolak"],
                    ["refunded", "Dikembalikan"],
                  ]
                : action === "registration_review"
                  ? [
                      ["pending", "Menunggu review"],
                      ["approved", "Approve pendaftaran"],
                      ["rejected", "Reject pendaftaran"],
                    ]
                  : [
                      ["approved", "Disetujui"],
                      ["revision_required", "Perlu revisi"],
                      ["rejected", "Ditolak"],
                    ]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Catatan internal
            <textarea
              name="note"
              maxLength={500}
              defaultValue={String(initial.note ?? "")}
            />
          </label>
        </>
      )}
      {action === "score" && (
        <>
          {alreadyScored && (
            <p className="admin-scored-badge">
              <CheckCircle2 /> Sudah Anda nilai · total {weightedScore(scores)}
              . Ubah nilai lalu simpan untuk memperbarui.
            </p>
          )}
          <div className="score-grid">
            {criteria[competition === "coloring" ? "coloring" : "photogenic"].map(
              (name, i) => (
                <label className="field score-field" key={name}>
                  <span>
                    {name} <small>bobot {weights[i]}%</small>
                  </span>
                  <span className="score-inputs">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={scores[i]}
                      aria-label={`${name} (geser)`}
                      onChange={(e) =>
                        setScores((old) =>
                          old.map((n, j) => (j === i ? Number(e.target.value) : n)),
                        )
                      }
                    />
                    <input
                      required
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      inputMode="numeric"
                      value={scores[i]}
                      onChange={(e) =>
                        setScores((old) =>
                          old.map((n, j) =>
                            j === i
                              ? Math.max(0, Math.min(100, Number(e.target.value)))
                              : n,
                          ),
                        )
                      }
                    />
                  </span>
                </label>
              ),
            )}
          </div>
          <div className="score-total">
            <span>Total berbobot</span>
            <b>{weightedScore(scores)}</b>
            <small>dari 100</small>
          </div>
          <label className="field">
            Catatan juri (opsional)
            <textarea
              name="notes"
              maxLength={500}
              defaultValue={String(initial.notes ?? "")}
            />
          </label>
        </>
      )}
      {action === "award" && (
        <label className="field">
          Penghargaan
          <select name="award" defaultValue={String(initial.award ?? "auto")}>
            <option value="auto">Otomatis (sesuai peringkat)</option>
            {awardOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      )}
      {action === "claim_status" && (
        <label className="field">
          Status klaim
          <select name="status" defaultValue={String(initial.status ?? "issued")}>
            <option value="issued">Menunggu pembayaran</option>
            <option value="paid">Sudah dibayar</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </label>
      )}
      {action === "shipment" && (
        <>
          <label className="field">
            Kurir
            <input
              name="courier"
              defaultValue={String(initial.courier ?? "")}
              required
              maxLength={60}
              placeholder="J&T / SiCepat / AnterAja / JNE"
            />
          </label>
          <label className="field">
            Nomor resi
            <input
              name="tracking"
              defaultValue={String(initial.tracking_number ?? "")}
              maxLength={100}
              placeholder="Wajib untuk status dikirim/diterima"
            />
          </label>
          <label className="field">
            Status
            <select
              name="status"
              defaultValue={String(initial.shipping_status ?? "prepared")}
            >
              {[
                ["waiting", "Menunggu"],
                ["prepared", "Sedang disiapkan"],
                ["shipped", "Sudah dikirim"],
                ["delivered", "Sudah diterima"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <button
        className={`btn ${
          ["publish_group", "result_publish", "score", "shipment", "claim_paid"].includes(action) && !published
            ? ""
            : "secondary"
        }`}
        disabled={busy}
      >
        {busy
          ? "Menyimpan…"
          : label ||
            {
              publish: "Publikasikan karya",
              unpublish: "Tarik publikasi",
              invoice: "Terbitkan invoice klaim",
              claim_paid: "Tandai klaim lunas",
              claim_status: "Simpan status klaim",
              result_publish: published ? "Sembunyikan hasil" : "Umumkan juara",
              publish_group: published
                ? "Sembunyikan semua hasil kategori ini"
                : "Umumkan semua juara kategori ini",
              payment: "Simpan pembayaran",
              review: "Simpan review",
              score: alreadyScored ? "Perbarui nilai" : "Simpan nilai",
              award: "Simpan penghargaan",
              shipment: "Simpan pengiriman",
              registration_review: "Simpan keputusan pendaftaran",
            }[action]}
      </button>
      {message && (
        <p
          className={`notice text-sm ${failed ? "error" : "success"}`}
          role={failed ? "alert" : "status"}
        >
          {failed ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {message}
        </p>
      )}
    </form>
  );
}

export function PrivateMedia({
  id,
  kind,
}: {
  id: string;
  kind: "participant" | "submission" | "worksheet";
}) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, kind }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.url as string;
      })
      .then(setUrl)
      .catch((error) => {
        if (!controller.signal.aborted)
          setMessage((error as Error).message || "Foto belum dapat dimuat.");
      });
    return () => controller.abort();
  }, [id, kind, attempt]);

  return (
    <div className="admin-media-preview stack">
      {!url && !message && <p className="muted">Memuat foto…</p>}
      {url && (
        <>
          <Image
            src={url}
            width={1000}
            height={1000}
            unoptimized
            alt={kind === "submission" ? "Karya peserta" : "Foto peserta"}
          />
          <div className="actions">
            <a
              className="btn secondary"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Buka ukuran penuh
            </a>
            <a
              className="btn"
              href={`/api/admin/media?id=${encodeURIComponent(id)}&kind=${kind}`}
              download
            >
              Download foto
            </a>
          </div>
        </>
      )}
      {message && (
        <p role="alert" className="notice error">
          {message}{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMessage("");
              setAttempt((n) => n + 1);
            }}
          >
            Coba lagi
          </button>
        </p>
      )}
    </div>
  );
}

export function WorksheetUpload({ id }: { id: string }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!photo) return;
        setBusy(true);
        try {
          const f = new FormData();
          f.set("photo", photo);
          f.set("id", id);
          const r = await fetch("/api/admin/worksheet", {
            method: "POST",
            body: f,
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setMessage("Versi worksheet baru tersimpan.");
          showSuccess("Worksheet baru berhasil diunggah.", "upload");
          router.refresh();
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <ImageInput label="Worksheet personal (gambar A4)" onChange={setPhoto} />
      <button className="btn" disabled={busy || !photo}>
        Unggah worksheet
      </button>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </form>
  );
}

export function DeleteRegistration({ id }: { id: string }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="danger-zone stack">
      <h3>Hapus permanen peserta</h3>
      <p>
        Menghapus data peserta, registrasi, pembayaran, worksheet, karya privat,
        foto publik, nilai, klaim, dan pengiriman. Tindakan ini dicatat di audit
        log.
      </p>
      <label className="field">
        Ketik <b>HAPUS</b> untuk melanjutkan
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
        />
      </label>
      <button
        type="button"
        className="btn danger-button"
        disabled={busy || confirmation !== "HAPUS"}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/admin/delete-registration", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, confirmation }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            showSuccess(
              "Peserta dan seluruh file terkait berhasil dihapus.",
              "delete",
            );
            router.push("/admin/peserta");
            router.refresh();
          } catch (error) {
            setMessage((error as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "Menghapus file dan data…" : "Hapus peserta & seluruh foto"}
      </button>
      {message && (
        <p className="notice error" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}

export function PurgeSeasonMedia({ id }: { id: string }) {
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <div className="danger-zone stack">
      <h3>Hapus seluruh foto season</h3>
      <p>
        Data registrasi tetap ada. Foto peserta, worksheet, karya privat,
        salinan galeri, dan nilai yang terkait karya akan dihapus permanen.
      </p>
      <label className="field">
        Ketik <b>HAPUS FOTO SEASON</b>
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn danger-button"
        disabled={busy || confirmation !== "HAPUS FOTO SEASON"}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/admin/purge-season-media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, confirmation }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setMessage("Seluruh media season telah dihapus.");
            showSuccess("Seluruh media season berhasil dihapus.", "delete");
            setConfirmation("");
            router.refresh();
          } catch (error) {
            setMessage((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Menghapus semua media…" : "Hapus semua foto season"}
      </button>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
