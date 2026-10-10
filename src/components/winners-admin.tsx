"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Trophy, ImageOff } from "lucide-react";
import { categoryLabel, competitions } from "@/lib/business-rules";
import { formatDate } from "@/lib/season";
import { showSuccess } from "@/lib/success-event";

export type WinnerRow = {
  id: string;
  award_code: string;
  rank_position: number | null;
  final_score: number | null;
  competition_type: string;
  category: string;
  public_name: string;
  registration_code: string;
  registration_id: string | null;
  regency_name: string | null;
  image_url: string | null;
  published_at: string;
};

/** Permanent winner records with their artwork copy and a hard-delete control. */
export function WinnersAdmin({ winners }: { winners: WinnerRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  if (!winners.length)
    return (
      <p className="notice">
        Belum ada data pemenang. Data pemenang dibuat otomatis saat juara
        diumumkan dan tetap tersimpan walau data pendaftaran dihapus.
      </p>
    );
  return (
    <div className="stack">
      {message && (
        <p className="notice error" role="alert">
          {message}
        </p>
      )}
      <div className="winner-admin-grid">
        {winners.map((w) => (
          <article className="card stack winner-admin-card" key={w.id}>
            {w.image_url ? (
              <Image
                src={w.image_url}
                alt={`Karya ${w.public_name}`}
                width={400}
                height={400}
                unoptimized
              />
            ) : (
              <div className="winner-image placeholder" aria-hidden="true">
                <ImageOff />
              </div>
            )}
            <div>
              <span className="admin-status status-approved">
                <Trophy size={12} aria-hidden="true" /> {w.award_code}
                {w.rank_position ? ` · #${w.rank_position}` : ""}
              </span>
              <h3>{w.public_name}</h3>
              <p className="text-xs muted">
                {competitions[w.competition_type as keyof typeof competitions]} ·{" "}
                {categoryLabel(w.category)} · {w.regency_name}
              </p>
              <p className="text-xs break-all">{w.registration_code}</p>
              <p className="text-xs muted">
                Diumumkan {formatDate(w.published_at)}
                {w.registration_id ? "" : " · data pendaftaran sudah dihapus"}
              </p>
            </div>
            <button
              type="button"
              className="btn secondary danger-text"
              disabled={busy === w.id}
              onClick={async () => {
                if (
                  window.prompt(
                    `Hapus permanen data pemenang ${w.public_name} (${w.award_code}) beserta foto karyanya dari database dan storage? Ketik HAPUS PEMENANG`,
                  ) !== "HAPUS PEMENANG"
                )
                  return;
                setBusy(w.id);
                setMessage("");
                try {
                  const response = await fetch("/api/admin/winner", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: w.id, confirmation: "HAPUS PEMENANG" }),
                  });
                  const result = await response.json();
                  if (!response.ok) throw new Error(result.error);
                  showSuccess(`Data pemenang ${w.public_name} dihapus permanen.`, "delete");
                  router.refresh();
                } catch (error) {
                  setMessage((error as Error).message);
                } finally {
                  setBusy("");
                }
              }}
            >
              <Trash2 /> {busy === w.id ? "Menghapus…" : "Hapus data pemenang"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
