import { Palette, Camera, Sparkles } from "lucide-react";
import { rupiah } from "@/lib/contest-modes";
export function RecentTicker({
  items,
  fee = 20000,
}: {
  items: { public_name: string; competition_type: string }[];
  fee?: number;
}) {
  const source = items.length
    ? items
    : [{ public_name: "", competition_type: "info" }];
  const repeated = [...source, ...source];
  const amount = rupiah(fee);
  return (
    <aside className="recent-ticker" aria-label="Registrasi terbaru">
      <span className="ticker-label">
        <Sparkles /> Terbaru
      </span>
      <div className="ticker-window">
        <div className="ticker-track">
          {repeated.map((item, index) => (
            <span key={`${item.public_name}-${index}`}>
              {item.competition_type === "info" ? (
                <>
                  <Sparkles /> Pendaftaran Idola Contest sedang dibuka · biaya
                  registrasi {amount}
                </>
              ) : (
                <>
                  {item.competition_type === "coloring" ? (
                    <Palette />
                  ) : (
                    <Camera />
                  )}
                  <b>{item.public_name}</b> telah registrasi {amount} pada lomba{" "}
                  {item.competition_type === "coloring"
                    ? "mewarnai"
                    : "fotogenik"}
                </>
              )}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
