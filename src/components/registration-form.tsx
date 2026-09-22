"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { categories, competitions, feeConsent } from "@/lib/business-rules";
import { ImageInput } from "./image-input";
import {
  Check,
  Copy,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
type Fields = Record<string, string | boolean>;
type Region = { id: string; name: string };
const groups = [
  [
    "full_name",
    "public_name",
    "age",
    "school_name",
    "class_label",
    "dream_job",
  ],
  ["parent_name", "whatsapp", "instagram_username"],
  [
    "address_line",
    "province_code",
    "regency_code",
    "district_code",
    "village_code",
    "postal_code",
  ],
  ["competition_type", "category"],
  [
    "consent_parent_guardian",
    "consent_publication",
    "consent_terms",
    "consent_fee",
  ],
];
export function RegistrationForm({ manual = false }: { manual?: boolean }) {
  const router = useRouter();
  const {
    register,
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Fields>({
    defaultValues: {
      competition_type: "photogenic",
      category: "paud",
      registration_source: manual ? "instagram_dm" : "website",
    },
  });
  const [step, setStep] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Region[][]>([[], [], [], []]);
  const [loading, setLoading] = useState(true);
  const competition = useWatch({ control, name: "competition_type" });
  async function loadRegions(index: number, parent = "") {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/regions/${["provinces", "regencies", "districts", "villages"][index]}?parent=${parent}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLocations((old) =>
        old.map((items, i) => (i === index ? data : items)),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/regions/provinces", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data as Region[];
      })
      .then((data) => setLocations([data, [], [], []]))
      .catch((error) => {
        if (!controller.signal.aborted) setError((error as Error).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  function field(name: string, label: string, type = "text", required = true) {
    return (
      <label key={name} className="field">
        {label}
        <input
          type={type}
          {...register(name, {
            required: required ? "Wajib diisi" : false,
            ...(type === "number"
              ? { min: 1, max: 18 }
              : { maxLength: name === "address_line" ? 300 : 120 }),
          })}
          aria-invalid={!!errors[name]}
        />
        {errors[name] && (
          <span className="text-red-700 text-xs">
            {String(errors[name]?.message || "Periksa nilai")}
          </span>
        )}
      </label>
    );
  }
  async function next() {
    if (await trigger(groups[step])) {
      setStep(step + 1);
      setError("");
      requestAnimationFrame(() =>
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }
  async function submit() {
    if (!(await trigger())) return;
    if (!photo) {
      setError("Pilih foto valid maksimum 2 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("data", JSON.stringify(getValues()));
      form.set("photo", photo);
      const r = await fetch("/api/registrations", {
        method: "POST",
        body: form,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      sessionStorage.setItem("idola-registration", JSON.stringify(data));
      router.push("/daftar/sukses");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function confirmSubmission() {
    if (!(await trigger(groups[4]))) return;
    if (!photo) {
      setError("Pilih foto valid maksimum 2 MB.");
      return;
    }
    setConfirming(true);
  }
  function back() {
    setStep((current) => Math.max(0, current - 1));
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  return (
    <div className="registration-panel card stack" ref={topRef}>
      {busy && (
        <div className="submit-loading" role="status" aria-live="polite">
          <div className="loading-mascot">
            <Sparkles />
            <LoaderCircle />
          </div>
          <h2>Sedang menyiapkan panggung si kecil…</h2>
          <p>Foto dan data sedang diamankan. Sebentar lagi selesai!</p>
        </div>
      )}
      <ol className="registration-progress" aria-label="Langkah pendaftaran">
        {["Data Anak", "Orang Tua", "Alamat", "Foto", "Konfirmasi"].map(
          (s, i) => (
            <li
              key={s}
              className={step === i ? "active" : step > i ? "done" : ""}
              aria-current={step === i ? "step" : undefined}
            >
              <span>{step > i ? <Check size={17} /> : i + 1}</span>
              <b>{s}</b>
            </li>
          ),
        )}
      </ol>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 4) void next();
          else void confirmSubmission();
        }}
      >
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>
        <div hidden={step !== 0} className="stack">
          <h2 className="text-2xl">Kenalan dengan bintang kecil ✨</h2>
          <div className="grid2">
            {field("full_name", "Nama lengkap anak")}
            {field("public_name", "Nama publik / nama panggilan")}
            {field("age", "Usia (tahun)", "number")}
            {field("school_name", "Nama sekolah / belum sekolah")}
            {field("class_label", "Kelas (opsional)", "text", false)}
            {field("dream_job", "Cita-cita anak")}
          </div>
        </div>
        <div hidden={step !== 1} className="stack">
          <h2 className="text-2xl">Data orang tua / wali</h2>
          <p className="muted">
            Data ini privat dan hanya digunakan untuk administrasi lomba.
          </p>
          <div className="grid2">
            {field("parent_name", "Nama orang tua / wali")}
            {field("whatsapp", "WhatsApp aktif", "tel")}
            {field("instagram_username", "Username Instagram")}
          </div>
        </div>
        <div hidden={step !== 2} className="stack">
          <h2 className="text-2xl">Alamat pengiriman</h2>
          <p className="muted">
            Alamat disimpan privat untuk kebutuhan administrasi dan pengiriman
            hadiah.
          </p>
          <div className="grid2">
            {field("address_line", "Jalan / nomor rumah")}
            {["province", "regency", "district", "village"].map((key, i) => (
              <label className="field" key={key}>
                {
                  [
                    "Provinsi",
                    "Kabupaten / Kota",
                    "Kecamatan",
                    "Kelurahan / Desa",
                  ][i]
                }
                <select
                  {...register(`${key}_code`, {
                    required: "Pilih wilayah",
                    onChange: async (e) => {
                      const item = locations[i].find(
                        (v) => v.id === e.target.value,
                      );
                      setValue(`${key}_name`, item?.name || "");
                      for (let j = i + 1; j < 4; j++) {
                        const k = [
                          "province",
                          "regency",
                          "district",
                          "village",
                        ][j];
                        setValue(`${k}_code`, "");
                        setValue(`${k}_name`, "");
                      }
                      setLocations((old) =>
                        old.map((items, j) => (j > i ? [] : items)),
                      );
                      if (i < 3 && item) await loadRegions(i + 1, item.id);
                      if (i === 3 && item) {
                        const d = await fetch(
                          `/api/postcode?village=${item.id}`,
                        )
                          .then((r) => r.json())
                          .catch(() => ({}));
                        setValue("postal_code", d.postal_code || "");
                      }
                    },
                  })}
                  disabled={loading || (i > 0 && !locations[i].length)}
                >
                  <option value="">Pilih wilayah</option>
                  {locations[i].map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                {errors[`${key}_code`] && (
                  <span className="field-error">Pilih wilayah</span>
                )}
              </label>
            ))}
            {field(
              "postal_code",
              "Kode pos (5 digit; isi manual jika belum terisi)",
            )}
          </div>
          <button
            type="button"
            className="text-purple underline self-start"
            onClick={() => void loadRegions(0)}
          >
            Muat ulang daftar provinsi
          </button>
        </div>
        <div hidden={step !== 3} className="stack">
          <h2 className="text-2xl">Pilih lomba & foto</h2>
          <div className="grid2">
            <label className="field">
              Jenis lomba
              <select
                {...register("competition_type", {
                  required: true,
                  onChange: () => setValue("category", "paud"),
                })}
              >
                {Object.entries(competitions).map(([v, n]) => (
                  <option value={v} key={v}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Kategori
              <select {...register("category", { required: true })}>
                {Object.entries(categories)
                  .filter(
                    ([v]) => competition !== "coloring" || v !== "preschool",
                  )
                  .map(([v, n]) => (
                    <option value={v} key={v}>
                      {n}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <ImageInput onChange={setPhoto} />
        </div>
        <div hidden={step !== 4} className="stack">
          <h2 className="text-2xl">Konfirmasi pendaftaran</h2>
          <div className="payment-highlight">
            <div className="payment-highlight-icon">
              <CreditCard />
            </div>
            <div>
              <span>INFO PENTING</span>
              <h3>Biaya registrasi Rp20.000</h3>
              <p>
                Transfer ke BSI a.n. <b>Riswan Ramadhan</b>
              </p>
              <button
                type="button"
                className="account-copy"
                onClick={async () => {
                  await navigator.clipboard.writeText("7341301558");
                  setCopied(true);
                }}
              >
                <code>7341301558</code>
                <Copy size={17} />
                {copied ? "Tersalin" : "Salin rekening"}
              </button>
            </div>
          </div>
          <div className="notice important-note">
            <ShieldCheck />
            <p>
              Simpan bukti pendaftaran dan kirim bukti pembayaran melalui DM
              Instagram{" "}
              <a
                href="https://instagram.com/idola.contest"
                target="_blank"
                rel="noreferrer"
              >
                <b>@idola.contest</b>
              </a>
              .
            </p>
          </div>
          <p>
            <a
              className="text-purple underline"
              href="https://instagram.com/idola.contest"
              target="_blank"
              rel="noreferrer"
            >
              Follow @idola.contest
            </a>{" "}
            untuk mengikuti pengumuman dan informasi lomba.
          </p>
          {[
            [
              "consent_parent_guardian",
              "Saya adalah orang tua/wali dan menyetujui keikutsertaan anak.",
            ],
            [
              "consent_publication",
              "Saya mengizinkan publikasi nama publik, wilayah kota/provinsi, dan karya yang disetujui.",
            ],
            [
              "consent_terms",
              "Saya telah membaca serta menyetujui syarat & ketentuan dan kebijakan privasi.",
            ],
            ["consent_fee", feeConsent],
          ].map(([key, label]) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                {...register(key, { required: "Persetujuan wajib" })}
              />
              <span>
                {label}
                {errors[key] && (
                  <b className="block text-red-700">Persetujuan wajib</b>
                )}
              </span>
            </label>
          ))}
          <p className="text-sm">
            <a className="underline" href="/syarat-ketentuan" target="_blank">
              Syarat & ketentuan
            </a>{" "}
            ·{" "}
            <a className="underline" href="/kebijakan-privasi" target="_blank">
              Kebijakan privasi
            </a>
          </p>
          {manual && (
            <label className="field">
              Sumber registrasi
              <select {...register("registration_source")}>
                <option value="instagram_dm">Instagram DM</option>
                <option value="admin_manual">Admin manual</option>
              </select>
            </label>
          )}
        </div>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          {step > 0 && (
            <button type="button" className="btn secondary" onClick={back}>
              Kembali
            </button>
          )}
          <button className="btn" disabled={busy}>
            {busy
              ? "Menyimpan…"
              : step < 4
                ? "Lanjutkan →"
                : "Kirim pendaftaran →"}
          </button>
        </div>
      </form>
      {confirming && (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-confirm-title"
        >
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <CreditCard />
            </div>
            <h2 id="payment-confirm-title">Sudah transfer Rp20.000?</h2>
            <p>
              Pastikan pembayaran registrasi telah ditransfer ke BSI 7341301558
              a.n. Riswan Ramadhan.
            </p>
            <div className="actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setConfirming(false)}
              >
                Belum, kembali bayar
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setConfirming(false);
                  void submit();
                }}
              >
                Sudah, kirim data
              </button>
            </div>
            <small>
              Jika memilih “Belum”, data tidak dikirim dan tidak disimpan.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
