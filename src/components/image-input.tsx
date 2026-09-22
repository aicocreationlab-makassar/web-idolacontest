"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Camera, CheckCircle2, ImageUp, Sparkles } from "lucide-react";
import { showSuccess } from "@/lib/success-event";
export function ImageInput({
  onChange,
  label = "Foto peserta",
}: {
  onChange: (file: File | null) => void;
  label?: string;
}) {
  const [source, setSource] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const previewRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  function previewFile(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const next = file ? URL.createObjectURL(file) : "";
    previewRef.current = next;
    setPreview(next);
  }

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  return (
    <div className="stack image-uploader">
      <label className="upload-zone">
        <span className="upload-icon">
          <Camera aria-hidden="true" />
        </span>
        <strong>
          {label === "Foto peserta" ? "Upload Foto Si Kecil" : label}
        </strong>
        <span>Ketuk untuk memilih JPG, PNG, atau WebP</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setSource(file);
            previewFile(file);
            onChange(file && file.size <= 2097152 ? file : null);
            setMessage(
              file
                ? file.size > 2097152
                  ? "Gambar melebihi 2 MB. Kompres sebelum melanjutkan."
                  : `${file.name} · ${(file.size / 1024).toFixed(0)} KB`
                : "",
            );
          }}
        />
      </label>
      {preview && (
        <div className="upload-preview">
          <Image
            src={preview}
            width={1000}
            height={750}
            unoptimized
            alt={`Preview ${label.toLowerCase()}`}
          />
          <span>
            <CheckCircle2 /> Foto berhasil dibaca
          </span>
        </div>
      )}
      <p className="upload-helper">
        <ImageUp size={18} /> Maksimum hasil akhir 2 MB.
      </p>
      {source && source.size > 2097152 && (
        <div className="compression-card">
          <Sparkles aria-hidden="true" />
          <div>
            <strong>Ups! Fotonya Terlalu Besar</strong>
            <p>
              Kami bisa mengecilkannya tanpa mengubah foto asli di perangkat.
            </p>
          </div>
          <button
            type="button"
            className="btn secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const compressed = await imageCompression(source, {
                  maxSizeMB: 1.45,
                  maxWidthOrHeight: 2000,
                  useWebWorker: true,
                  fileType: "image/webp",
                });
                const mime = ["image/jpeg", "image/png", "image/webp"].includes(
                  compressed.type,
                )
                  ? compressed.type
                  : source.type;
                const extension =
                  mime === "image/png"
                    ? "png"
                    : mime === "image/webp"
                      ? "webp"
                      : "jpg";
                const file = new File(
                  [compressed],
                  `foto-terkompres.${extension}`,
                  {
                    type: mime,
                    lastModified: Date.now(),
                  },
                );
                if (file.size > 2097152) throw new Error();
                if (inputRef.current) {
                  try {
                    const transfer = new DataTransfer();
                    transfer.items.add(file);
                    inputRef.current.files = transfer.files;
                  } catch {
                    // The React state below remains the upload source on older browsers.
                  }
                }
                onChange(file);
                previewFile(file);
                setMessage(
                  `Siap dikirim · ${(file.size / 1024).toFixed(0)} KB`,
                );
                setSource(file);
                showSuccess(
                  "Foto berhasil dikompres dan otomatis dipakai untuk upload.",
                  "camera",
                  "Foto siap dikirim",
                );
              } catch {
                setMessage("Kompresi gagal. Pilih gambar lebih kecil.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Mengompres…" : "Kompres Foto Otomatis"}
          </button>
        </div>
      )}
      {message && (
        <p role="status" className="upload-status">
          <CheckCircle2 size={18} />
          {message}
        </p>
      )}
    </div>
  );
}
