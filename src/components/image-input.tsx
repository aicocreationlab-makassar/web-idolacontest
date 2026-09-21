"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
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
  return (
    <div className="stack">
      <label className="field">
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setSource(file);
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
      <p className="text-sm muted">
        JPG, PNG, atau WebP. Maksimum hasil akhir 2 MB.
      </p>
      {source && source.size > 2097152 && (
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const compressed = await imageCompression(source, {
                maxSizeMB: 1.8,
                maxWidthOrHeight: 2000,
                useWebWorker: false,
                fileType: "image/webp",
              });
              const file = new File([compressed], "foto.webp", {
                type: "image/webp",
              });
              if (file.size > 2097152) throw new Error();
              onChange(file);
              setMessage(`Siap dikirim · ${(file.size / 1024).toFixed(0)} KB`);
              setSource(file);
            } catch {
              setMessage("Kompresi gagal. Pilih gambar lebih kecil.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Mengompres…" : "Kompres gambar"}
        </button>
      )}
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
