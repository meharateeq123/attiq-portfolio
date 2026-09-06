/**
 * A procedural preview for each project card.
 *
 * The brief rules out photography and people, so instead of screenshots each
 * card gets an abstract "interface readout" built from the same holographic
 * language as the 3D scene. The variant index picks the arrangement, and all
 * values are derived arithmetically so every render is identical.
 */
export function ProjectVisual({ variant, className = "" }: { variant: number; className?: string }) {
  const v = variant % 4;

  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`pv-bg-${v}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#0b1729" />
          <stop offset="100%" stopColor="#050912" />
        </linearGradient>
        <linearGradient id={`pv-bar-${v}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1566d6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7ee8ff" stopOpacity="0.95" />
        </linearGradient>
        <filter id={`pv-glow-${v}`}>
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        {/* Every id is variant-suffixed: four of these render on one page and
            duplicate ids would make all four resolve to the first definition. */}
        <linearGradient id={`pv-fade-${v}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor="#050912" stopOpacity="0" />
          <stop offset="100%" stopColor="#050912" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#pv-bg-${v})`} />

      {/* Faint grid substrate shared by every variant */}
      <g stroke="#57a6ff" strokeOpacity="0.07" strokeWidth="0.6">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 20 + 10} x2="320" y2={i * 20 + 10} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={i * 22 + 12} y1="0" x2={i * 22 + 12} y2="180" />
        ))}
      </g>

      {/* Window chrome */}
      <rect x="14" y="14" width="292" height="152" rx="3" fill="none" stroke="#57a6ff" strokeOpacity="0.22" />
      <g fill="#57a6ff" fillOpacity="0.5">
        <circle cx="26" cy="26" r="2.4" />
        <circle cx="35" cy="26" r="2.4" />
        <circle cx="44" cy="26" r="2.4" />
      </g>
      <line x1="14" y1="38" x2="306" y2="38" stroke="#57a6ff" strokeOpacity="0.18" />

      {/* --- Variant 0 · agent trace: a branching plan ------------------- */}
      {v === 0 && (
        <g>
          <g stroke="#57a6ff" strokeOpacity="0.55" strokeWidth="1" fill="none">
            <path d="M52 130 L96 96 L150 96 L196 66 L262 66" />
            <path d="M96 96 L150 124 L214 124" />
          </g>
          {[
            [52, 130],
            [96, 96],
            [150, 96],
            [196, 66],
            [262, 66],
            [150, 124],
            [214, 124],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="7" fill="#7ee8ff" opacity="0.18" filter={`url(#pv-glow-${v})`} />
              <circle cx={cx} cy={cy} r="3.2" fill="#9fdcff" />
            </g>
          ))}
          <rect x="232" y="48" width="56" height="12" rx="2" fill="#2b86f5" fillOpacity="0.3" />
        </g>
      )}

      {/* --- Variant 1 · workflow: stacked pipeline lanes ----------------- */}
      {v === 1 && (
        <g>
          {[0, 1, 2].map((row) => (
            <g key={row} transform={`translate(0 ${row * 32})`}>
              <rect x="30" y="56" width="72" height="20" rx="2" fill="#1566d6" fillOpacity={0.22 + row * 0.1} />
              <rect x="122" y="56" width="72" height="20" rx="2" fill="#1566d6" fillOpacity={0.16 + row * 0.1} />
              <rect x="214" y="56" width="72" height="20" rx="2" fill="#7ee8ff" fillOpacity={0.14 + row * 0.14} />
              <g stroke="#7ee8ff" strokeOpacity="0.5" strokeWidth="1">
                <line x1="102" y1="66" x2="122" y2="66" />
                <line x1="194" y1="66" x2="214" y2="66" />
              </g>
            </g>
          ))}
        </g>
      )}

      {/* --- Variant 2 · retrieval: document shelf + match bars ---------- */}
      {v === 2 && (
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={30 + i * 20}
              y={56}
              width="13"
              height="40"
              rx="1.5"
              fill="#57a6ff"
              fillOpacity={i === 3 ? 0.85 : 0.16}
            />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <g key={i}>
              <rect x="182" y={58 + i * 16} width="104" height="7" rx="3.5" fill="#57a6ff" fillOpacity="0.12" />
              <rect
                x="182"
                y={58 + i * 16}
                width={[88, 64, 44, 30][i]}
                height="7"
                rx="3.5"
                fill={`url(#pv-bar-${v})`}
              />
            </g>
          ))}
          <rect x="30" y="112" width="256" height="1" fill="#57a6ff" fillOpacity="0.2" />
          <rect x="30" y="124" width="150" height="6" rx="3" fill="#57a6ff" fillOpacity="0.18" />
          <rect x="30" y="138" width="98" height="6" rx="3" fill="#57a6ff" fillOpacity="0.12" />
        </g>
      )}

      {/* --- Variant 3 · dashboard: metric bars + trend ------------------ */}
      {v === 3 && (
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            // Deterministic pseudo-height — a smooth wave, not random noise.
            const h = 14 + Math.abs(Math.sin(i * 0.9)) * 52;
            return (
              <rect
                key={i}
                x={32 + i * 22}
                y={140 - h}
                width="11"
                height={h}
                rx="1.5"
                fill={`url(#pv-bar-${v})`}
                opacity={0.45 + (i % 3) * 0.2}
              />
            );
          })}
          <path
            d="M37 96 L59 84 L81 92 L103 70 L125 78 L147 58 L169 66 L191 50 L213 60 L235 44 L257 52"
            fill="none"
            stroke="#7ee8ff"
            strokeWidth="1.4"
            strokeOpacity="0.9"
          />
          <rect x="30" y="48" width="44" height="10" rx="2" fill="#2b86f5" fillOpacity="0.35" />
        </g>
      )}

      {/* Foreground fade so the art never competes with the card text below */}
      <rect width="320" height="180" fill={`url(#pv-fade-${v})`} />
    </svg>
  );
}
