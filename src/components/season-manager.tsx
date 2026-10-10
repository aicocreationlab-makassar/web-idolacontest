"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Palette,
  Plus,
  Power,
  Trash2,
  Pencil,
  X,
  EyeOff,
  Flag,
  LayoutTemplate,
  SlidersHorizontal,
} from "lucide-react";
import {
  themes,
  themeKeys,
  themeFor,
  toWibInput,
  fromWibInput,
  formatDate,
  seasonPhase,
  type Season,
} from "@/lib/season";
import {
  contestModeInfo,
  contestModes,
  defaultContent,
  defaultFees,
  modeOf,
  resolveContent,
  rupiah,
  type ContestMode,
  type SeasonContent,
} from "@/lib/contest-modes";
import { showSuccess } from "@/lib/success-event";
import { PurgeSeasonMedia } from "./admin-controls";
import { SeasonContentEditor } from "./season-content-editor";

type Draft = {
  name: string;
  slug: string;
  theme_key: string;
  theme_title: string;
  tagline: string;
  description: string;
  registration_open_at: string;
  registration_close_at: string;
  submission_global_close_at: string;
  judging_at: string;
  announcement_at: string;
  shipping_at: string;
  prize_preparation_start: string;
  prize_preparation_end: string;
  quota: string;
  contest_mode: ContestMode;
  registration_fee: string;
  claim_fee: string;
  content: SeasonContent;
};

type TextKey = Exclude<keyof Draft, "content" | "contest_mode">;

function stripResolved(content: ReturnType<typeof resolveContent>): SeasonContent {
  const { mode: _mode, registration_fee: _fee, claim_fee: _claim, quota: _quota, ...rest } = content;
  void _mode;
  void _fee;
  void _claim;
  void _quota;
  return rest;
}

function draftFrom(season?: Season | null, nextSlug = "S2"): Draft {
  if (!season)
    return {
      name: `Season ${nextSlug.replace(/\D/g, "") || "baru"}`,
      slug: nextSlug,
      theme_key: "rainbow",
      theme_title: "",
      tagline: "",
      description: "",
      registration_open_at: "",
      registration_close_at: "",
      submission_global_close_at: "",
      judging_at: "",
      announcement_at: "",
      shipping_at: "",
      prize_preparation_start: "",
      prize_preparation_end: "",
      quota: "",
      contest_mode: "national",
      registration_fee: String(defaultFees.national.registration),
      claim_fee: String(defaultFees.national.claim),
      content: defaultContent.national,
    };
  const resolved = resolveContent(season);
  return {
    name: season.name,
    slug: season.slug,
    theme_key: season.theme_key,
    theme_title: season.theme_title,
    tagline: season.tagline || "",
    description: season.description || "",
    registration_open_at: toWibInput(season.registration_open_at),
    registration_close_at: toWibInput(season.registration_close_at),
    submission_global_close_at: toWibInput(season.submission_global_close_at),
    judging_at: toWibInput(season.judging_at),
    announcement_at: toWibInput(season.announcement_at),
    shipping_at: toWibInput(season.shipping_at),
    prize_preparation_start: season.prize_preparation_start || "",
    prize_preparation_end: season.prize_preparation_end || "",
    quota: season.quota ? String(season.quota) : "",
    contest_mode: resolved.mode,
    registration_fee: String(resolved.registration_fee),
    claim_fee: String(resolved.claim_fee),
    content: stripResolved(resolved),
  };
}

async function call(body: Record<string, unknown>) {
  const response = await fetch("/api/admin/season", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Season belum dapat disimpan.");
  return result;
}

const dateFields: Array<[TextKey, string, string]> = [
  ["registration_open_at", "Pendaftaran dibuka", "Form daftar terbuka mulai waktu ini."],
  ["registration_close_at", "Pendaftaran ditutup", "Setelah ini form daftar tertutup."],
  ["submission_global_close_at", "Batas akhir kirim karya", "Batas global; tiap peserta juga punya batas 7 hari."],
  ["judging_at", "Penilaian juri", "Juri mulai menilai karya."],
  ["announcement_at", "Pengumuman juara", "Tanggal pengumuman yang tampil di website."],
  ["shipping_at", "Mulai pengiriman hadiah", "Tanggal pengiriman serentak."],
];

export function SeasonManager({
  seasons,
  canPurge,
  canDelete,
}: {
  seasons: Season[];
  canPurge: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const nextSlug = `S${seasons.length + 1}`;
  const editingSeason = editing && editing !== "new" ? seasons.find((s) => s.id === editing) : null;

  async function run(key: string, body: Record<string, unknown>, success: string) {
    setBusy(key);
    setMessage("");
    try {
      await call(body);
      showSuccess(success, "admin", "Season diperbarui");
      setEditing(null);
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="stack">
      {message && (
        <p className="notice error" role="alert">
          {message}
        </p>
      )}
      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing("new");
            setMessage("");
          }}
        >
          <Plus /> Buat season baru
        </button>
      </div>
      {editing && (
        <SeasonForm
          key={editing}
          initial={draftFrom(editingSeason, nextSlug)}
          title={editingSeason ? `Ubah ${editingSeason.name}` : "Season baru"}
          busy={busy === "save"}
          onCancel={() => setEditing(null)}
          onSubmit={(draft) =>
            run(
              "save",
              {
                action: "save",
                id: editingSeason?.id ?? null,
                data: {
                  ...draft,
                  registration_fee: Number(draft.registration_fee) || 0,
                  claim_fee: Number(draft.claim_fee) || 0,
                  registration_open_at: fromWibInput(draft.registration_open_at),
                  registration_close_at: fromWibInput(draft.registration_close_at),
                  submission_global_close_at: fromWibInput(draft.submission_global_close_at),
                  judging_at: fromWibInput(draft.judging_at),
                  announcement_at: fromWibInput(draft.announcement_at),
                  shipping_at: fromWibInput(draft.shipping_at),
                },
              },
              editingSeason
                ? "Season, mode kontes, tema, konten, dan timeline tersimpan."
                : "Season baru dibuat. Aktifkan saat siap dimulai.",
            )
          }
        />
      )}
      <div className="season-list">
        {seasons.map((season) => {
          const theme = themeFor(season.theme_key);
          const content = resolveContent(season);
          const mode = modeOf(season);
          return (
            <article
              className={`card stack season-card${season.is_active ? " active" : ""}`}
              key={season.id}
            >
              <div className="season-card-head">
                <span
                  className="season-swatch"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`,
                  }}
                >
                  {theme.motifs[0]}
                </span>
                <div>
                  <h3>
                    {season.name} <small>· {season.slug}</small>
                  </h3>
                  <p className="muted">
                    Tema <b>{season.theme_title}</b> · tampilan {theme.name}
                  </p>
                  <p className="muted text-sm">
                    {contestModeInfo[mode].emoji} {contestModeInfo[mode].label} · registrasi{" "}
                    {rupiah(content.registration_fee)} ·{" "}
                    {content.claim_fee === 0 ? "hadiah gratis tanpa penebusan" : `klaim ${rupiah(content.claim_fee)}`}
                  </p>
                </div>
                <span className={`admin-status ${season.is_active ? "status-approved" : ""}`}>
                  {season.is_active ? "Season aktif" : "Tidak aktif"}
                </span>
                {seasonPhase(season) === "shipping" && (
                  <span className="season-done-badge">
                    <Flag size={12} aria-hidden="true" /> Jadwal selesai · data peserta tetap tersimpan
                  </span>
                )}
              </div>
              <dl className="season-dates-grid">
                <div>
                  <dt>Pendaftaran</dt>
                  <dd>
                    {formatDate(season.registration_open_at)} – {formatDate(season.registration_close_at)}
                  </dd>
                </div>
                <div>
                  <dt>Penilaian</dt>
                  <dd>{formatDate(season.judging_at)}</dd>
                </div>
                <div>
                  <dt>Pengumuman</dt>
                  <dd>{formatDate(season.announcement_at)}</dd>
                </div>
                <div>
                  <dt>Pengiriman</dt>
                  <dd>Mulai {formatDate(season.shipping_at)}</dd>
                </div>
                <div>
                  <dt>Kuota</dt>
                  <dd>{season.quota ?? "Tanpa batas"}</dd>
                </div>
              </dl>
              <div className="actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setEditing(season.id);
                    setMessage("");
                  }}
                >
                  <Pencil /> Ubah mode, tema, konten & timeline
                </button>
                {!season.is_active && (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy === season.id}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Aktifkan ${season.name}? Website publik akan berganti ke ${contestModeInfo[mode].label}, tema "${theme.name}", biaya registrasi ${rupiah(content.registration_fee)}, dan jadwal baru. Season sebelumnya dinonaktifkan.`,
                        )
                      )
                        run(
                          season.id,
                          { action: "activate", id: season.id },
                          `${season.name} aktif. Website kini memakai ${contestModeInfo[mode].label} dengan tema ${theme.name}.`,
                        );
                    }}
                  >
                    <Power /> {busy === season.id ? "Mengaktifkan…" : "Aktifkan season ini"}
                  </button>
                )}
                {canDelete && !season.is_active && (
                  <button
                    type="button"
                    className="btn secondary danger-text"
                    disabled={busy === `delete-${season.id}`}
                    onClick={() => {
                      if (window.prompt(`Ketik HAPUS SEASON untuk menghapus ${season.name}`) === "HAPUS SEASON")
                        run(
                          `delete-${season.id}`,
                          { action: "delete", id: season.id, confirmation: "HAPUS SEASON" },
                          "Season dihapus.",
                        );
                    }}
                  >
                    <Trash2 /> Hapus
                  </button>
                )}
              </div>
              <details>
                <summary className="muted text-sm">Zona berbahaya: tarik publikasi & hapus media</summary>
                <div className="danger-zone stack">
                  <h3>Tarik semua publikasi karya season ini</h3>
                  <p>
                    Semua karya yang tampil di galeri publik disembunyikan dan file publiknya
                    dihapus permanen dari storage. Data pendaftaran, nilai, dan karya juara
                    (data pemenang) tetap ada.
                  </p>
                  <button
                    type="button"
                    className="btn danger-button"
                    disabled={busy === `unpublish-${season.id}`}
                    onClick={async () => {
                      if (window.prompt(`Ketik TARIK PUBLIKASI untuk menarik semua karya ${season.name} dari galeri`) !== "TARIK PUBLIKASI") return;
                      setBusy(`unpublish-${season.id}`);
                      setMessage("");
                      try {
                        const response = await fetch("/api/admin/unpublish-season", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: season.id, confirmation: "TARIK PUBLIKASI" }),
                        });
                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error);
                        showSuccess(`${result.removed} file publik dihapus. Galeri ${season.name} kini kosong.`, "delete");
                        router.refresh();
                      } catch (error) {
                        setMessage((error as Error).message);
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    <EyeOff /> {busy === `unpublish-${season.id}` ? "Menarik publikasi…" : "Tarik semua publikasi karya"}
                  </button>
                </div>
                {canPurge && <PurgeSeasonMedia id={season.id} />}
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SeasonForm({
  initial,
  title,
  busy,
  onCancel,
  onSubmit,
}: {
  initial: Draft;
  title: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const set = (key: TextKey, value: string) =>
    setDraft((old) => ({ ...old, [key]: value }));
  const theme = themeFor(draft.theme_key);
  function switchMode(mode: ContestMode) {
    if (mode === draft.contest_mode) return;
    if (
      !window.confirm(
        `Ganti ke ${contestModeInfo[mode].label}? Konten website dan biaya akan diisi ulang dengan bawaan mode ini (bisa diedit lagi di bawah).`,
      )
    )
      return;
    setDraft((old) => ({
      ...old,
      contest_mode: mode,
      registration_fee: String(defaultFees[mode].registration),
      claim_fee: String(defaultFees[mode].claim),
      content: defaultContent[mode],
    }));
  }
  return (
    <form
      className="card stack season-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="admin-section-title">
        <div>
          <span className="eyebrow">Season & tema</span>
          <h2>{title}</h2>
        </div>
        <button type="button" className="admin-install-close" aria-label="Tutup" onClick={onCancel}>
          <X />
        </button>
      </div>
      <div className="grid2">
        <label className="field">
          Nama season
          <input required maxLength={80} value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Season 2" />
        </label>
        <label className="field">
          Kode season (unik, huruf besar)
          <input
            required
            maxLength={12}
            pattern="[A-Za-z0-9]{1,12}"
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value.toUpperCase())}
            placeholder="S2"
          />
        </label>
        <label className="field">
          Tema lomba
          <input
            required
            maxLength={80}
            value={draft.theme_title}
            onChange={(e) => set("theme_title", e.target.value)}
            placeholder="Contoh: Bebas, Pahlawanku, Alam Indonesia"
          />
        </label>
        <label className="field">
          Tagline (opsional)
          <input maxLength={160} value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Lomba Anak Nasional Online" />
        </label>
      </div>
      <label className="field">
        Deskripsi singkat (opsional, tampil di halaman lomba)
        <textarea maxLength={600} value={draft.description} onChange={(e) => set("description", e.target.value)} />
      </label>

      <fieldset className="mode-picker">
        <legend>
          <LayoutTemplate /> Mode kontes
        </legend>
        <p className="muted text-sm">
          Mode menentukan kategori peserta, biaya, nama juara otomatis, dan tata letak
          website publik. Mode 1 adalah tampilan Season 1; Mode 2 mengikuti poster
          Lomba Anak Nasional Online.
        </p>
        <div className="mode-options">
          {contestModes.map((mode) => (
            <label
              key={mode}
              className={`mode-option${draft.contest_mode === mode ? " selected" : ""}`}
            >
              <input
                type="radio"
                name="contest_mode"
                value={mode}
                checked={draft.contest_mode === mode}
                onChange={() => switchMode(mode)}
              />
              <span className="mode-option-emoji" aria-hidden="true">
                {contestModeInfo[mode].emoji}
              </span>
              <b>{contestModeInfo[mode].label}</b>
              <small>{contestModeInfo[mode].description}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="content-fields">
        <legend>
          <SlidersHorizontal /> Konten website mode ini
        </legend>
        <p className="muted text-sm">
          Semua teks, kategori, hadiah, biaya, dan rekening di bawah tampil di website
          publik saat season ini aktif. Ubah sesuai kebutuhan, lalu simpan.
        </p>
        <SeasonContentEditor
          mode={draft.contest_mode}
          content={draft.content}
          registrationFee={draft.registration_fee}
          claimFee={draft.claim_fee}
          onContent={(content) => setDraft((old) => ({ ...old, content }))}
          onFee={(key, value) => setDraft((old) => ({ ...old, [key]: value }))}
        />
      </fieldset>

      <fieldset className="theme-picker">
        <legend>
          <Palette /> Tampilan website season ini
        </legend>
        <p className="muted text-sm">
          Setiap season wajib tampil berbeda. Pilih gaya warna; header, hero, tombol,
          dan dekorasi website publik akan mengikuti saat season diaktifkan. Tema
          Pelangi Ceria, Permen Karet, Pesta Balon, Matahari Ceria, Karnaval, dan
          Unicorn mengikuti gaya 3D ceria poster.
        </p>
        <div className="theme-options">
          {themeKeys.map((key) => {
            const option = themes[key];
            return (
              <label
                key={key}
                className={`theme-option${draft.theme_key === key ? " selected" : ""}`}
                style={{
                  background: `linear-gradient(150deg, ${option.primary}, ${option.primaryLight})`,
                }}
              >
                <input
                  type="radio"
                  name="theme_key"
                  value={key}
                  checked={draft.theme_key === key}
                  onChange={() => set("theme_key", key)}
                />
                <span className="theme-option-motifs" aria-hidden="true">
                  {option.motifs.join(" ")}
                </span>
                <b>{option.name}</b>
                <small>{option.mood}</small>
                <span
                  className="theme-option-btn"
                  style={{ background: option.accentTwo, color: option.primaryDark }}
                >
                  Tombol
                </span>
                <span className="theme-option-accent" style={{ background: option.accent }} />
              </label>
            );
          })}
        </div>
        <p className="theme-preview-note">
          Pratinjau: header <span style={{ background: theme.primary }} /> aksen{" "}
          <span style={{ background: theme.accent }} /> tombol{" "}
          <span style={{ background: theme.accentTwo }} /> stiker {theme.motifs.join(" ")} ·{" "}
          <i>“{theme.sticker}”</i>
        </p>
      </fieldset>

      <fieldset className="timeline-fields">
        <legend>
          <CalendarDays /> Timeline (waktu WIB)
        </legend>
        <div className="grid2">
          {dateFields.map(([key, label, hint]) => (
            <label className="field" key={key}>
              {label}
              <input
                type="datetime-local"
                required
                value={draft[key]}
                onChange={(e) => set(key, e.target.value)}
              />
              <small className="muted">{hint}</small>
            </label>
          ))}
          <label className="field">
            Persiapan hadiah mulai
            <input type="date" value={draft.prize_preparation_start} onChange={(e) => set("prize_preparation_start", e.target.value)} />
          </label>
          <label className="field">
            Persiapan hadiah selesai
            <input type="date" value={draft.prize_preparation_end} onChange={(e) => set("prize_preparation_end", e.target.value)} />
          </label>
          <label className="field">
            Kuota pendaftar (kosong = tanpa batas)
            <input type="number" min={1} value={draft.quota} onChange={(e) => set("quota", e.target.value)} />
          </label>
        </div>
        <p className="muted text-sm">
          Urutan wajib: dibuka → ditutup → batas karya → penilaian → pengumuman → pengiriman.
        </p>
      </fieldset>
      <div className="actions">
        <button className="btn" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan season"}
        </button>
        <button type="button" className="btn secondary" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}
