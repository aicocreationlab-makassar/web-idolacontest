"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Trophy } from "lucide-react";
import { showSuccess } from "@/lib/success-event";

export type ManagedSeason = {
  id: string;
  name: string;
  slug: string;
  registration_open_at: string;
  registration_close_at: string;
  is_active: boolean;
};

function dateInputValue(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

async function request(payload: Record<string, string>) {
  const response = await fetch("/api/admin/seasons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(data.error || "Perubahan belum tersimpan.");
}

export function SeasonManager({ seasons }: { seasons: ManagedSeason[] }) {
  const router = useRouter();
  const active = seasons.find((season) => season.is_active);
  const archived = seasons.filter((season) => !season.is_active);
  const [saving, setSaving] = useState<"dates" | "create" | null>(null);
  const [message, setMessage] = useState("");

  async function updateDates(form: HTMLFormElement) {
    if (!active) return;
    const data = new FormData(form);
    setSaving("dates");
    setMessage("");
    try {
      await request({
        action: "update_dates",
        seasonId: active.id,
        openDate: String(data.get("openDate") || ""),
        closeDate: String(data.get("closeDate") || ""),
      });
      setMessage("Tanggal pendaftaran sudah tersimpan.");
      showSuccess(
        "Tanggal pendaftaran berhasil diperbarui.",
        "admin",
        "Jadwal season siap!",
      );
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(null);
    }
  }

  async function createSeason(form: HTMLFormElement) {
    const data = new FormData(form);
    setSaving("create");
    setMessage("");
    try {
      await request({
        action: "create",
        name: String(data.get("name") || ""),
        openDate: String(data.get("openDate") || ""),
        closeDate: String(data.get("closeDate") || ""),
      });
      form.reset();
      setMessage("Season baru aktif dan informasi publik sudah diperbarui.");
      showSuccess(
        "Season baru berhasil dibuat dan langsung aktif.",
        "star",
        "Panggung baru sudah dibuka!",
      );
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="season-manager stack">
      <section className="season-manager-current card stack">
        <div className="season-manager-heading">
          <span className="season-manager-icon" aria-hidden="true">
            <CalendarDays />
          </span>
          <div>
            <span className="eyebrow">SEASON AKTIF</span>
            <h2>{active?.name || "Belum ada season aktif"}</h2>
            <p className="muted">
              Pilih tanggal melalui kalender. Pendaftaran dibuka pukul 00.00
              WIB dan ditutup pukul 23.59 WIB pada tanggal yang dipilih.
            </p>
          </div>
        </div>
        {active ? (
          <form
            className="season-date-form"
            onSubmit={(event) => {
              event.preventDefault();
              void updateDates(event.currentTarget);
            }}
          >
            <label className="field">
              Tanggal buka pendaftaran
              <input
                name="openDate"
                type="date"
                required
                defaultValue={dateInputValue(active.registration_open_at)}
              />
            </label>
            <label className="field">
              Tanggal tutup pendaftaran
              <input
                name="closeDate"
                type="date"
                required
                defaultValue={dateInputValue(active.registration_close_at)}
              />
            </label>
            <button className="btn" disabled={saving !== null}>
              {saving === "dates" ? "Menyimpan…" : "Simpan tanggal"}
            </button>
          </form>
        ) : (
          <p className="notice">Buat season baru untuk membuka pendaftaran.</p>
        )}
      </section>

      <section className="season-manager-create card stack">
        <div className="season-manager-heading">
          <span className="season-manager-icon pink" aria-hidden="true">
            <CheckCircle2 />
          </span>
          <div>
            <span className="eyebrow">EVENT BERIKUTNYA</span>
            <h2>Buat season baru</h2>
            <p className="muted">
              Season baru langsung menjadi season aktif. Season sebelumnya
              tersimpan sebagai arsip dan hanya pemenangnya yang tetap tampil
              untuk pengunjung.
            </p>
          </div>
        </div>
        <form
          className="season-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            void createSeason(event.currentTarget);
          }}
        >
          <label className="field season-name-field">
            Nama event / season
            <input
              name="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="Contoh: Season 2"
            />
          </label>
          <label className="field">
            Tanggal buka pendaftaran
            <input name="openDate" type="date" required />
          </label>
          <label className="field">
            Tanggal tutup pendaftaran
            <input name="closeDate" type="date" required />
          </label>
          <button className="btn" disabled={saving !== null}>
            {saving === "create" ? "Membuat season…" : "Buat & aktifkan season"}
          </button>
        </form>
      </section>

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      {archived.length > 0 && (
        <section className="season-archive card stack">
          <div className="season-manager-heading">
            <span className="season-manager-icon purple" aria-hidden="true">
              <Trophy />
            </span>
            <div>
              <span className="eyebrow">ARSIP</span>
              <h2>Season sebelumnya</h2>
            </div>
          </div>
          <div className="season-archive-list">
            {archived.map((season) => (
              <div key={season.id} className="season-archive-row">
                <div>
                  <b>{season.name}</b>
                  <span>Pendaftaran telah ditutup</span>
                </div>
                <Link className="btn secondary" href={`/hasil?season=${season.id}`}>
                  Lihat pemenang
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
