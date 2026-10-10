import { useId } from "react";

const denominations = [
  { value: 100000, label: "100.000", a: "#ff8a8a", b: "#d93a3a", d: "#9c1f1f" },
  { value: 50000, label: "50.000", a: "#7fb8ff", b: "#2f6fd1", d: "#1b4a99" },
  { value: 20000, label: "20.000", a: "#8fe3a8", b: "#2e9d5c", d: "#1b6b3d" },
  { value: 10000, label: "10.000", a: "#d3b3ff", b: "#8a4fd6", d: "#5c2fa0" },
  { value: 5000, label: "5.000", a: "#ffd9a3", b: "#e0903a", d: "#9c5c15" },
] as const;

function notesFor(amount: number) {
  const notes: (typeof denominations)[number][] = [];
  let rest = Math.max(0, Math.round(amount));
  for (const note of denominations) {
    while (rest >= note.value && notes.length < 8) {
      notes.push(note);
      rest -= note.value;
    }
  }
  return notes;
}

/**
 * Stylised stack of rupiah notes matching a cash prize. Drawn, not photographed,
 * so it stays legal to reproduce and matches the site's 3D cartoon look.
 */
export function CashStack({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const notes = notesFor(amount);
  if (!notes.length) return null;
  const spread = Math.min(notes.length - 1, 6);
  return (
    <svg
      className={`cash-stack ${className}`.trim()}
      viewBox="0 0 240 150"
      aria-label={`Uang tunai Rp${amount.toLocaleString("id-ID")}`}
      role="img"
    >
      <defs>
        {denominations.map((note) => (
          <linearGradient id={`${id}-${note.value}`} key={note.value} x2="0.3" y2="1">
            <stop stopColor={note.a} />
            <stop offset="1" stopColor={note.b} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}-coin`} cx="0.35" cy="0.3">
          <stop stopColor="#fff2a8" />
          <stop offset="0.6" stopColor="#ffc63a" />
          <stop offset="1" stopColor="#c98a00" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1d2a4a" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        {notes.map((note, i) => {
          const angle = -10 + (spread ? (20 * i) / spread : 0);
          const dx = 20 + i * (spread ? 12 : 0);
          const dy = 40 - i * 6;
          return (
            <g key={i} transform={`translate(${dx} ${dy}) rotate(${angle} 80 40)`}>
              <rect width="160" height="80" rx="12" fill={`url(#${id}-${note.value})`} stroke="#fff" strokeWidth="4" />
              <rect x="12" y="12" width="136" height="56" rx="8" fill="none" stroke="#ffffff88" strokeWidth="2" strokeDasharray="6 5" />
              <circle cx="40" cy="40" r="17" fill="#ffffff33" stroke="#ffffffaa" strokeWidth="2" />
              <path d="M32 40l6 6 11-13" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <text x="70" y="32" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="12" fill="#fff" opacity="0.9">
                RUPIAH
              </text>
              <text x="70" y="56" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="21" fill="#fff" stroke={note.d} strokeWidth="0.6">
                {note.label}
              </text>
            </g>
          );
        })}
        <circle cx="206" cy="118" r="18" fill={`url(#${id}-coin)`} stroke="#fff" strokeWidth="3" />
        <circle cx="188" cy="128" r="18" fill={`url(#${id}-coin)`} stroke="#fff" strokeWidth="3" />
        <text x="188" y="134" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="16" fill="#7a4a00">
          Rp
        </text>
      </g>
    </svg>
  );
}
