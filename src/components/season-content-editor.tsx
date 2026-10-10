"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  categoryKeys,
  prizeTones,
  rupiah,
  type ContestMode,
  type SeasonContent,
} from "@/lib/contest-modes";
import { allCategoryLabels } from "@/lib/business-rules";
import { ToyIcon, toyIconNames } from "./toy-icon";

const toneLabels: Record<(typeof prizeTones)[number], string> = {
  pink: "Pink",
  blue: "Biru",
  green: "Hijau",
  orange: "Oranye",
  yellow: "Kuning",
  purple: "Ungu",
};

/**
 * Edits everything the public site shows for a season's contest mode.
 * Plain controlled inputs; the parent form owns the draft.
 */
export function SeasonContentEditor({
  mode,
  content,
  registrationFee,
  claimFee,
  onContent,
  onFee,
}: {
  mode: ContestMode;
  content: SeasonContent;
  registrationFee: string;
  claimFee: string;
  onContent: (next: SeasonContent) => void;
  onFee: (key: "registration_fee" | "claim_fee", value: string) => void;
}) {
  const set = <K extends keyof SeasonContent>(key: K, value: SeasonContent[K]) =>
    onContent({ ...content, [key]: value });
  const national = mode === "national";
  const hasType = (key: "photogenic" | "coloring") =>
    content.contest_types.some((type) => type.key === key);
  return (
    <div className="stack content-editor">
      <details open>
        <summary>
          <b>Teks utama &amp; biaya</b>
          <small>Judul hero, ribbon season, biaya registrasi dan penebusan.</small>
        </summary>
        <div className="grid2">
          <label className="field">
            Judul besar (hero)
            <input maxLength={80} value={content.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
          </label>
          <label className="field">
            Sub-judul / slogan
            <input maxLength={120} value={content.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} />
          </label>
          <label className="field">
            Ribbon season (mis. Season 2)
            <input maxLength={40} value={content.season_ribbon} onChange={(e) => set("season_ribbon", e.target.value)} />
          </label>
          <label className="field">
            Catatan finalis / kuota
            <input maxLength={80} value={content.finalist_note} onChange={(e) => set("finalist_note", e.target.value)} placeholder="Finalis terbatas! Hanya 1 pekan pendaftaran" />
          </label>
          <label className="field">
            Biaya registrasi (Rp)
            <input type="number" min={0} step={1000} value={registrationFee} onChange={(e) => onFee("registration_fee", e.target.value)} />
            <small className="muted">Tampil sebagai {rupiah(Number(registrationFee) || 0)} di seluruh website dan dipakai saat pendaftaran.</small>
          </label>
          <label className="field">
            Biaya penebusan hadiah (Rp, 0 = gratis)
            <input type="number" min={0} step={1000} value={claimFee} onChange={(e) => onFee("claim_fee", e.target.value)} />
            <small className="muted">0 berarti juara hanya mengonfirmasi alamat &amp; rekening hadiah di Cek Status tanpa membayar.</small>
          </label>
        </div>
      </details>

      <details open={national}>
        <summary>
          <b>Rekening &amp; Instagram</b>
          <small>Dipakai di form daftar, halaman sukses, Cek Status, dan pesan DM.</small>
        </summary>
        <div className="grid2">
          <label className="field">
            Nama bank
            <input maxLength={40} value={content.bank_name} onChange={(e) => set("bank_name", e.target.value)} />
          </label>
          <label className="field">
            Nomor rekening
            <input maxLength={40} value={content.bank_account} onChange={(e) => set("bank_account", e.target.value)} />
          </label>
          <label className="field">
            Atas nama
            <input maxLength={80} value={content.bank_holder} onChange={(e) => set("bank_holder", e.target.value)} />
          </label>
          <label className="field">
            Username Instagram (tanpa @)
            <input maxLength={40} value={content.instagram} onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))} />
          </label>
        </div>
        <label className="field">
          Teks peringatan WAJIB transfer &amp; kirim bukti (form daftar)
          <textarea maxLength={220} rows={2} value={content.dm_alert} onChange={(e) => set("dm_alert", e.target.value)} />
        </label>
      </details>

      <details open={national}>
        <summary>
          <b>Kategori peserta</b>
          <small>Nama, emoji, dan rentang usia tiap kategori. Mode Nasional memvalidasi usia sesuai rentang ini.</small>
        </summary>
        <div className="stack">
          {content.categories.map((category, i) => (
            <div className="content-editor-row categories" key={`${category.key}-${i}`}>
              <label className="field">
                Kunci
                <select
                  value={category.key}
                  onChange={(e) =>
                    set(
                      "categories",
                      content.categories.map((item, j) =>
                        j === i ? { ...item, key: e.target.value as SeasonContent["categories"][number]["key"] } : item,
                      ),
                    )
                  }
                >
                  {categoryKeys.map((key) => (
                    <option key={key} value={key}>
                      {key} · {allCategoryLabels[key]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Nama tampil
                <input maxLength={60} value={category.label} onChange={(e) => set("categories", content.categories.map((item, j) => (j === i ? { ...item, label: e.target.value } : item)))} />
              </label>
              <label className="field">
                Ikon
                <span className="icon-select">
                  <ToyIcon name={category.icon || "star"} size={30} />
                  <select value={category.icon || "star"} onChange={(e) => set("categories", content.categories.map((item, j) => (j === i ? { ...item, icon: e.target.value } : item)))}>
                    {toyIconNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="field">
                Usia min (th)
                <input type="number" min={0} max={18} value={category.age_min} onChange={(e) => set("categories", content.categories.map((item, j) => (j === i ? { ...item, age_min: Number(e.target.value) } : item)))} />
              </label>
              <label className="field">
                Usia maks (th)
                <input type="number" min={0} max={18} value={category.age_max} onChange={(e) => set("categories", content.categories.map((item, j) => (j === i ? { ...item, age_max: Number(e.target.value) } : item)))} />
              </label>
              <label className="check">
                <input type="checkbox" checked={category.months_allowed} onChange={(e) => set("categories", content.categories.map((item, j) => (j === i ? { ...item, months_allowed: e.target.checked } : item)))} />
                <span>Boleh usia bulan</span>
              </label>
              <label className="field">
                Catatan kecil
                <input maxLength={120} value={category.note} onChange={(e) => set("categories", content.categories.map((item, j) => (j === i ? { ...item, note: e.target.value } : item)))} />
              </label>
              <button
                type="button"
                className="btn secondary danger-text"
                aria-label="Hapus kategori"
                disabled={content.categories.length <= 1}
                onClick={() => set("categories", content.categories.filter((_, j) => j !== i))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn secondary self-start"
            disabled={content.categories.length >= 8}
            onClick={() =>
              set("categories", [
                ...content.categories,
                { key: "kids", label: "Kategori baru", icon: "star", age_min: 5, age_max: 13, months_allowed: false, note: "" },
              ])
            }
          >
            <Plus size={16} /> Tambah kategori
          </button>
        </div>
      </details>

      <details open={national}>
        <summary>
          <b>Jenis lomba</b>
          <small>Nama dan tagline yang tampil di kartu lomba.</small>
        </summary>
        <div className="stack">
          {(["photogenic", "coloring"] as const).map((key) => {
            const type = content.contest_types.find((item) => item.key === key);
            return (
              <div className="content-editor-row types" key={key}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={hasType(key)}
                    disabled={hasType(key) && content.contest_types.length === 1}
                    onChange={(e) =>
                      set(
                        "contest_types",
                        e.target.checked
                          ? [...content.contest_types, { key, label: key === "coloring" ? "Lomba Mewarnai" : "Lomba Fotogenik", tagline: "" }]
                          : content.contest_types.filter((item) => item.key !== key),
                      )
                    }
                  />
                  <span>{key === "coloring" ? "Mewarnai" : "Fotogenik"}</span>
                </label>
                <label className="field">
                  Nama tampil
                  <input maxLength={60} disabled={!type} value={type?.label ?? ""} onChange={(e) => set("contest_types", content.contest_types.map((item) => (item.key === key ? { ...item, label: e.target.value } : item)))} />
                </label>
                <label className="field">
                  Tagline
                  <input maxLength={140} disabled={!type} value={type?.tagline ?? ""} onChange={(e) => set("contest_types", content.contest_types.map((item) => (item.key === key ? { ...item, tagline: e.target.value } : item)))} />
                </label>
              </div>
            );
          })}
        </div>
      </details>

      <details open={national}>
        <summary>
          <b>Hadiah</b>
          <small>Kartu hadiah berwarna, teks voucher, dan catatan (mis. berlaku tiap kategori).</small>
        </summary>
        <div className="stack">
          {content.prizes.map((prize, i) => (
            <div className="content-editor-row prizes" key={i}>
              <label className="field">
                Nama hadiah
                <input maxLength={60} value={prize.title} onChange={(e) => set("prizes", content.prizes.map((item, j) => (j === i ? { ...item, title: e.target.value } : item)))} />
              </label>
              <label className="field">
                Uang tunai (Rp)
                <input type="number" min={0} step={10000} value={prize.cash} onChange={(e) => set("prizes", content.prizes.map((item, j) => (j === i ? { ...item, cash: Number(e.target.value) } : item)))} />
              </label>
              <label className="field">
                Tambahan
                <input maxLength={80} value={prize.extras} onChange={(e) => set("prizes", content.prizes.map((item, j) => (j === i ? { ...item, extras: e.target.value } : item)))} placeholder="+ Piala + Sertifikat" />
              </label>
              <label className="field">
                Warna
                <select value={prize.tone} onChange={(e) => set("prizes", content.prizes.map((item, j) => (j === i ? { ...item, tone: e.target.value as (typeof prizeTones)[number] } : item)))}>
                  {prizeTones.map((tone) => (
                    <option key={tone} value={tone}>
                      {toneLabels[tone]}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn secondary danger-text" aria-label="Hapus hadiah" onClick={() => set("prizes", content.prizes.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn secondary self-start"
            disabled={content.prizes.length >= 8}
            onClick={() => set("prizes", [...content.prizes, { title: "Hadiah baru", cash: 0, extras: "", tone: prizeTones[content.prizes.length % prizeTones.length] }])}
          >
            <Plus size={16} /> Tambah hadiah
          </button>
          <div className="grid2">
            <label className="field">
              Teks voucher (kosongkan jika tidak ada)
              <input maxLength={120} value={content.voucher_text} onChange={(e) => set("voucher_text", e.target.value)} />
            </label>
            <label className="field">
              Catatan hadiah
              <input maxLength={80} value={content.prize_note} onChange={(e) => set("prize_note", e.target.value)} placeholder="Berlaku tiap kategori" />
            </label>
          </div>
        </div>
      </details>

      <details open={national}>
        <summary>
          <b>Semua FREE setelah menang</b>
          <small>Judul dan poin-poin (satu baris per poin).</small>
        </summary>
        <div className="grid2">
          <label className="field">
            Judul
            <input maxLength={80} value={content.free_title} onChange={(e) => set("free_title", e.target.value)} />
          </label>
          <label className="field">
            Poin-poin
            <textarea
              rows={4}
              value={content.free_bullets.join("\n")}
              onChange={(e) =>
                set(
                  "free_bullets",
                  e.target.value
                    .split("\n")
                    .map((line) => line.trim().slice(0, 80))
                    .filter(Boolean)
                    .slice(0, 6),
                )
              }
            />
          </label>
        </div>
      </details>

      <details open={national}>
        <summary>
          <b>Brand ambassador / maskot</b>
          <small>Foto, gelar, dan kalimat sapaan. Tampil di strip atas tiap halaman, bagian spotlight beranda, maskot pojok, loading, dan notifikasi.</small>
        </summary>
        <div className="stack">
          {content.ambassadors.map((person, i) => (
            <div className="content-editor-row ambassadors" key={i}>
              <label className="field">
                Nama
                <input maxLength={60} value={person.name} onChange={(e) => set("ambassadors", content.ambassadors.map((item, j) => (j === i ? { ...item, name: e.target.value } : item)))} />
              </label>
              <label className="field">
                Gelar / prestasi
                <input maxLength={80} value={person.award} onChange={(e) => set("ambassadors", content.ambassadors.map((item, j) => (j === i ? { ...item, award: e.target.value } : item)))} />
              </label>
              <label className="field">
                Kalimat sapaan
                <input maxLength={140} value={person.tagline} onChange={(e) => set("ambassadors", content.ambassadors.map((item, j) => (j === i ? { ...item, tagline: e.target.value } : item)))} />
              </label>
              <label className="field">
                Foto badan penuh (URL)
                <input maxLength={200} value={person.image} onChange={(e) => set("ambassadors", content.ambassadors.map((item, j) => (j === i ? { ...item, image: e.target.value } : item)))} placeholder="/ambassadors/nama.webp" />
              </label>
              <label className="field">
                Foto wajah / avatar (URL)
                <input maxLength={200} value={person.avatar} onChange={(e) => set("ambassadors", content.ambassadors.map((item, j) => (j === i ? { ...item, avatar: e.target.value } : item)))} placeholder="/ambassadors/nama-avatar.webp" />
              </label>
              <button type="button" className="btn secondary danger-text" aria-label="Hapus ambassador" onClick={() => set("ambassadors", content.ambassadors.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn secondary self-start"
            disabled={content.ambassadors.length >= 4}
            onClick={() => set("ambassadors", [...content.ambassadors, { name: "Nama", award: "Juara Season 1", tagline: "Yuk ikut bareng aku!", image: "", avatar: "" }])}
          >
            <Plus size={16} /> Tambah ambassador
          </button>
          <p className="muted text-sm">
            Kosongkan daftar ini jika season tidak memakai brand ambassador. Foto diunggah ke folder <code>public/ambassadors</code> (PNG/WebP transparan).
          </p>
        </div>
      </details>

      <details open={national}>
        <summary>
          <b>Poster</b>
          <small>Tampilkan poster resmi di hero dan bagian poster.</small>
        </summary>
        <div className="grid2">
          <label className="check">
            <input type="checkbox" checked={content.show_poster} onChange={(e) => set("show_poster", e.target.checked)} />
            <span>Tampilkan poster di website</span>
          </label>
          <label className="field">
            Alamat gambar poster
            <input maxLength={200} value={content.poster_src} onChange={(e) => set("poster_src", e.target.value)} placeholder="/poster-season-2.jpg" />
            <small className="muted">File di folder public (mis. /poster-season-2.jpg) atau URL gambar.</small>
          </label>
          <label className="field">
            Keterangan poster
            <input maxLength={160} value={content.poster_caption} onChange={(e) => set("poster_caption", e.target.value)} />
          </label>
        </div>
      </details>
    </div>
  );
}
