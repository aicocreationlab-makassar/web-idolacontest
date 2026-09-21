"use client";
import { useEffect, useState } from "react";
export function Countdown({ close }: { close: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () =>
      setRemaining(Math.max(0, new Date(close).getTime() - Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [close]);
  return (
    <div className="countdown" aria-label="Waktu tersisa pendaftaran">
      {["Hari", "Jam", "Menit", "Detik"].map((label, i) => (
        <div key={label} className="countdown-tile">
          <b>
            {remaining === null
              ? "—"
              : Math.floor(remaining / [86400000, 3600000, 60000, 1000][i]) %
                [10000, 24, 60, 60][i]}
          </b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
