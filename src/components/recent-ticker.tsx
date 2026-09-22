import { Palette, Camera, Sparkles } from "lucide-react";
export function RecentTicker({
  items,
}: {
  items: { public_name: string; competition_type: string }[];
}) {
  const source = items.length
    ? items
    : [{ public_name: "", competition_type: "info" }];
  const repeated = [...source, ...source];
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
                  registrasi Rp20.000
                </>
              ) : (
                <>
                  {item.competition_type === "coloring" ? (
                    <Palette />
                  ) : (
                    <Camera />
                  )}
                  <b>{item.public_name}</b> telah registrasi Rp20.000 pada lomba{" "}
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
