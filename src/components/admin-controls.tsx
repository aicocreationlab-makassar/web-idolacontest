"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  | "invoice"
  | "claim_paid"
  | "shipment"
  | "settings"
  | "registration_review";
export function AdminControl({
  action,
  id,
  published = false,
  competition = "photogenic",
  initial = {},
}: {
  action: Control;
  id: string;
  published?: boolean;
  competition?: string;
  initial?: Record<string, string | number | null>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const f = new FormData(e.currentTarget);
        const data: Record<string, unknown> = Object.fromEntries(f);
        if (action === "score") data.scores = scores;
        if (action === "result_publish") data.published = !published;
        try {
          const r = await fetch("/api/admin/mutate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, id, data }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setMessage("Tersimpan.");
          showSuccess(
            "Perubahan admin berhasil disimpan dan sudah diperbarui.",
          );
          router.refresh();
        } catch (e) {
          setMessage((e as Error).message);
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
          {criteria[competition === "coloring" ? "coloring" : "photogenic"].map(
            (v, i) => (
              <label className="field" key={v}>
                {v} ({weights[i]}%)
                <input
                  required
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
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
              </label>
            ),
          )}
          <b>Total berbobot: {weightedScore(scores)}</b>
          <label className="field">
            Catatan juri
            <textarea name="notes" maxLength={500} />
          </label>
        </>
      )}
      {action === "award" && (
        <label className="field">
          Penghargaan
          <select name="award">
            {awards.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      )}
      {action === "shipment" && (
        <>
          <label className="field">
            Kurir
            <input
              name="courier"
              defaultValue={initial.courier ?? ""}
              required
              maxLength={60}
              placeholder="J&T / SiCepat / AnterAja"
            />
          </label>
          <label className="field">
            Nomor resi
            <input
              name="tracking"
              defaultValue={initial.tracking_number ?? ""}
              maxLength={100}
            />
          </label>
          <label className="field">
            Status
            <select
              name="status"
              defaultValue={initial.shipping_status ?? "waiting"}
            >
              {["waiting", "prepared", "shipped", "delivered"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </>
      )}
      {action === "settings" && (
        <>
          {[
            "registration_open_at",
            "registration_close_at",
            "submission_global_close_at",
          ].map((v) => (
            <label className="field" key={v}>
              {v} (ISO 8601 beserta zona waktu)
              <input name={v} required defaultValue={initial[v] ?? ""} />
            </label>
          ))}
          <label className="field">
            Kuota (kosong = tanpa batas)
            <input
              name="quota"
              type="number"
              min={1}
              defaultValue={initial.quota ?? ""}
            />
          </label>
        </>
      )}
      <button className="btn secondary" disabled={busy}>
        {busy
          ? "Menyimpan…"
          : {
              publish: "Publikasikan karya",
              unpublish: "Tarik publikasi",
              invoice: "Terbitkan invoice Rp120.000",
              claim_paid: "Verifikasi klaim dibayar",
              result_publish: published
                ? "Sembunyikan hasil"
                : "Publikasikan hasil",
              payment: "Simpan pembayaran",
              review: "Simpan review",
              score: "Simpan nilai",
              award: "Tetapkan penghargaan",
              shipment: "Simpan pengiriman",
              settings: "Simpan pengaturan",
              registration_review: "Simpan keputusan pendaftaran",
            }[action]}
      </button>
      {message && (
        <p className="notice text-sm" role="status">
          {message}
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
  return (
    <div className="stack">
      <button
        type="button"
        className="text-purple underline"
        onClick={async () => {
          try {
            const r = await fetch("/api/admin/media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, kind }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            setUrl(d.url);
            showSuccess("Tautan file privat siap dibuka selama 60 detik.");
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
      >
        Siapkan file privat
      </button>
      {url && (
        <a
          className="block underline text-purple"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          Buka file (berlaku 60 detik)
        </a>
      )}
      {message && <p role="alert">{message}</p>}
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
          showSuccess("Worksheet baru berhasil diunggah.");
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
            showSuccess("Peserta dan seluruh file terkait berhasil dihapus.");
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
            showSuccess("Seluruh media season berhasil dihapus.");
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
