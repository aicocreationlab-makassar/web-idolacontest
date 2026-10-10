"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { competitions } from "@/lib/business-rules";
import {
  ageRuleFor,
  bankLine,
  categoryAgeText,
  categoryForAge,
  categoryOptions,
  defaultContent,
  defaultFees,
  feeConsentText,
  instagramUrl,
  rupiah,
  type ResolvedContent,
} from "@/lib/contest-modes";
import { ImageInput } from "./image-input";
import { showSuccess } from "@/lib/success-event";
import {
  Check,
  Copy,
  CreditCard,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { ToyIcon } from "./toy-icon";
import { MascotAvatars } from "./ambassadors";
type Fields = Record<string, string | boolean>;
type Region = { id: string; name: string };
const groups = [
  [
    "full_name",
    "public_name",
    "age",
    "age_unit",
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
  ],
  ["competition_type", "category"],
  [
    "consent_parent_guardian",
    "consent_publication",
    "consent_terms",
    "consent_fee",
  ],
];
const steps: Array<[string, string]> = [
  ["kid", "Data Anak"],
  ["family", "Orang Tua"],
  ["home", "Alamat"],
  ["camera", "Foto"],
  ["check", "Konfirmasi"],
];
const classicContent: ResolvedContent = {
  ...defaultContent.classic,
  mode: "classic",
  registration_fee: defaultFees.classic.registration,
  claim_fee: defaultFees.classic.claim,
  quota: null,
};
export function RegistrationForm({
  manual = false,
  content = classicContent,
}: {
  manual?: boolean;
  content?: ResolvedContent;
}) {
  const router = useRouter();
  const national = content.mode === "national";
  const instagram = content.instagram.replace(/^@/, "");
  const fee = rupiah(content.registration_fee);
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
      category: national
        ? categoryOptions(content, "photogenic")[0]?.key ?? "baby"
        : "paud",
      age_unit: "years",
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
  const category = String(useWatch({ control, name: "category" }) ?? "");
  const ageUnit =
    useWatch({ control, name: "age_unit" }) === "months"
      ? "months"
      : "years";
  const ageMaximum = ageUnit === "months" ? 216 : 18;
  const options = categoryOptions(content, String(competition));
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
  /** National mode: the age must fit the chosen category. */
  function validateCategoryAge(value: string | boolean) {
    if (!national) return true;
    const key = String(value);
    const unit = getValues("age_unit") === "months" ? "months" : "years";
    const age = Number(getValues("age"));
    const rule = ageRuleFor(content, key, unit);
    if (!rule.allowed) return rule.message;
    if (age < rule.min || age > rule.max) return rule.message;
    return true;
  }
  async function next() {
    if (await trigger(groups[step])) {
      if (national && step === 2) {
        const suggested = categoryForAge(
          content,
          Number(getValues("age")),
          getValues("age_unit") === "months" ? "months" : "years",
        );
        if (suggested && options.some((item) => item.key === suggested.key))
          setValue("category", suggested.key);
      }
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
      showSuccess(
        "Pendaftaran berhasil disimpan. Jangan lupa simpan kode registrasi.",
        "star",
        "Si kecil resmi terdaftar!",
      );
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
  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(content.bank_account);
      setCopied(true);
      showSuccess("Nomor rekening berhasil disalin.", "copy");
    } catch {
      setError("Salin nomor rekening secara manual.");
    }
  }
  return (
    <div className="registration-panel card stack" ref={topRef}>
      {busy && (
        <div className="submit-loading" role="status" aria-live="polite">
          {content.ambassadors.length > 0 && (
            <MascotAvatars ambassadors={content.ambassadors} size={72} mood="bounce" />
          )}
          <div className="loading-mascot">
            <Sparkles />
            <LoaderCircle />
          </div>
          <h2>Sedang menyiapkan panggung si kecil…</h2>
          <p>Foto dan data sedang diamankan. Sebentar lagi selesai!</p>
        </div>
      )}
      <ol className="registration-progress" aria-label="Langkah pendaftaran">
        {steps.map(([icon, s], i) => (
          <li
            key={s}
            className={step === i ? "active" : step > i ? "done" : ""}
            aria-current={step === i ? "step" : undefined}
          >
            <span>
              {step > i ? <Check size={17} /> : <ToyIcon name={icon} size={40} />}
            </span>
            <b>{s}</b>
          </li>
        ))}
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
          <h2 className="reg-step-title">
            <ToyIcon name="kid" size={44} />Kenalan dengan bintang kecil
          </h2>
          <span className="wajib-mini">
            <ToyIcon name="card" size={22} /> Biaya registrasi <b>{fee}</b> · wajib transfer
            &amp; kirim bukti via DM @{instagram}
          </span>
          <div className="grid2">
            {field("full_name", "Nama lengkap anak")}
            {field("public_name", "Nama publik / nama panggilan")}
            <label className="field">
              Usia anak
              <div className="age-input-row">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={ageMaximum}
                  placeholder={ageUnit === "months" ? "Contoh: 18" : "Contoh: 7"}
                  {...register("age", {
                    required: "Usia wajib diisi",
                    min: { value: 1, message: "Usia minimal 1" },
                    max: {
                      value: ageMaximum,
                      message:
                        ageUnit === "months"
                          ? "Usia maksimal 216 bulan"
                          : "Usia maksimal 18 tahun",
                    },
                  })}
                  aria-invalid={!!errors.age}
                />
                <select
                  {...register("age_unit", { required: "Pilih satuan usia" })}
                  aria-label="Satuan usia"
                >
                  <option value="years">Tahun</option>
                  <option value="months">Bulan</option>
                </select>
              </div>
              <span className="field-help">
                Masukkan usia dalam {ageUnit === "months" ? "bulan" : "tahun"}.
                {national ? " Kategori mengikuti usia:" : ""}
              </span>
              {national && (
                <span className="age-category-hint">
                  {content.categories.map((item) => (
                    <span key={item.key}>
                      <ToyIcon name={item.icon || "star"} size={18} /> {item.label}{" "}
                      {categoryAgeText(item)}
                    </span>
                  ))}
                </span>
              )}
              {errors.age && (
                <span className="field-error">{String(errors.age.message)}</span>
              )}
            </label>
            {national
              ? field(
                  "school_name",
                  "Nama sekolah (opsional, kosongkan jika belum sekolah)",
                  "text",
                  false,
                )
              : field("school_name", "Nama sekolah / belum sekolah")}
            {field("class_label", "Kelas (opsional)", "text", false)}
            {field("dream_job", "Cita-cita anak")}
          </div>
        </div>
        <div hidden={step !== 1} className="stack">
          <h2 className="reg-step-title">
            <ToyIcon name="family" size={44} />Data orang tua / wali
          </h2>
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
          <h2 className="reg-step-title">
            <ToyIcon name="home" size={44} />Alamat pengiriman
          </h2>
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
              "Kode pos (opsional, 5 digit)",
              "text",
              false,
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
          <h2 className="reg-step-title">
            <ToyIcon name="camera" size={44} />Pilih lomba &amp; foto
          </h2>
          <div className="grid2">
            <label className="field">
              Jenis lomba
              <select
                {...register("competition_type", {
                  required: true,
                  onChange: (e) =>
                    setValue(
                      "category",
                      national
                        ? categoryOptions(content, e.target.value)[0]?.key ?? ""
                        : "paud",
                    ),
                })}
              >
                {(national
                  ? content.contest_types.map((type) => [type.key, type.label])
                  : Object.entries(competitions)
                ).map(([v, n]) => (
                  <option value={v} key={v}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            {national ? (
              <div className="field">
                Kategori
                <div className="category-pick">
                  {options.map((item) => (
                    <label
                      key={item.key}
                      className={category === item.key ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        value={item.key}
                        {...register("category", {
                          required: "Pilih kategori",
                          validate: validateCategoryAge,
                        })}
                      />
                      <ToyIcon name={item.icon || "star"} size={44} />
                      {item.label}
                      <small>{categoryAgeText(item)}</small>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <span className="field-error">
                    {String(errors.category.message || "Pilih kategori")}
                  </span>
                )}
              </div>
            ) : (
              <label className="field">
                Kategori
                <select {...register("category", { required: true })}>
                  {options.map((item) => (
                    <option value={item.key} key={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <ImageInput onChange={setPhoto} />
        </div>
        <div hidden={step !== 4} className="stack">
          <h2 className="reg-step-title">
            <ToyIcon name="check" size={44} />Konfirmasi pendaftaran
          </h2>
          <div className="wajib-alert" role="alert">
            <span className="wajib-alert-badge">WAJIB</span>
            <div>
              <h3>
                Transfer {fee} &amp; kirim buktinya ke DM
              </h3>
              <p>
                {content.dm_alert} Transfer ke <b>{bankLine(content)}</b>, lalu
                DM Instagram{" "}
                <a href={instagramUrl(instagram)} target="_blank" rel="noreferrer">
                  <b>@{instagram}</b>
                </a>
                .
              </p>
              <div className="actions">
                <button type="button" className="btn secondary" onClick={copyAccount}>
                  <Copy size={16} /> {copied ? "Rekening tersalin" : "Salin rekening"}
                </button>
                <a
                  className="btn secondary"
                  href={instagramUrl(instagram)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram /> Buka DM @{instagram}
                </a>
              </div>
            </div>
          </div>
          <div className="payment-highlight">
            <div className="payment-highlight-icon">
              <Image
                src="/logo-bsi.png"
                width={180}
                height={90}
                alt="Bank Syariah Indonesia"
              />
            </div>
            <div>
              <span>INFO PENTING</span>
              <h3>Biaya registrasi {fee}</h3>
              <p>
                Transfer ke {content.bank_name} a.n. <b>{content.bank_holder}</b>
              </p>
              <button type="button" className="account-copy" onClick={copyAccount}>
                <code>{content.bank_account}</code>
                <Copy size={17} />
                {copied ? "Tersalin" : "Salin rekening"}
              </button>
            </div>
          </div>
          <p>
            <a
              className="text-purple underline"
              href={instagramUrl(instagram)}
              target="_blank"
              rel="noreferrer"
            >
              Follow @{instagram}
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
            ["consent_fee", feeConsentText(content)],
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
            <h2 id="payment-confirm-title">Sudah transfer {fee}?</h2>
            <p>
              Pastikan pembayaran registrasi telah ditransfer ke{" "}
              {bankLine(content)}, lalu kirim buktinya ke DM Instagram @{instagram}.
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
