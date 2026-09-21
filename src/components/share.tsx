"use client";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
export function Share({ url, name }: { url: string; name: string }) {
  const [message, setMessage] = useState("");
  return (
    <div className="actions">
      <a
        className="btn bg-green-700!"
        href={`https://wa.me/?text=${encodeURIComponent(`Lihat karya ${name} di Idola Contest! ${url}`)}`}
        target="_blank"
        rel="noreferrer"
      >
        <FaWhatsapp /> Bagikan
      </a>
      <button
        className="btn secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setMessage("Tautan disalin");
          } catch {
            setMessage("Salin tautan dari bilah alamat browser.");
          }
        }}
      >
        {message || "Salin tautan"}
      </button>
    </div>
  );
}
