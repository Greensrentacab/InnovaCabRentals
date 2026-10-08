/**
 * ServiceScenes.tsx — illustrated SVG bands for the service cards
 * (design.md §3.3 "Illustrated scene palettes", viewBox 0 0 400 200).
 */

const svgProps = {
  viewBox: '0 0 400 200',
  preserveAspectRatio: 'xMidYMid slice',
  className: 'h-full w-full',
  'aria-hidden': true,
} as const;

export function AirportScene() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="sky-airport" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="60%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#sky-airport)" />
      <circle cx="300" cy="150" r="48" fill="#FDE68A" opacity="0.55" />
      {/* Terminal + control tower */}
      <rect x="20" y="118" width="160" height="50" rx="3" fill="#1E293B" />
      <rect x="20" y="112" width="160" height="10" rx="2" fill="#334155" />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={30 + i * 16} y="128" width="10" height="16" rx="1.5" fill="#FDE68A" opacity="0.7" />
      ))}
      <rect x="196" y="80" width="10" height="88" fill="#334155" />
      <rect x="184" y="70" width="34" height="14" rx="3" fill="#1E293B" />
      {/* Plane */}
      <g transform="translate(250 38) rotate(-14)">
        <path d="M0 14 L92 8 Q104 8 104 14 Q104 20 92 20 L0 16 Z" fill="#F8FAFC" />
        <path d="M44 14 L28 -14 L40 -14 L66 12 Z" fill="#E2E8F0" />
        <path d="M44 16 L30 40 L42 40 L66 18 Z" fill="#E2E8F0" />
        <path d="M2 14 L-6 0 L4 0 L14 13 Z" fill="#E2E8F0" />
      </g>
      {/* Runway */}
      <rect x="0" y="168" width="400" height="32" fill="#0F172A" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={12 + i * 52} y="182" width="26" height="4" rx="2" fill="#FDE68A" opacity="0.8" />
      ))}
    </svg>
  );
}

export function OutstationScene() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="sky-outstation" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#sky-outstation)" />
      <circle cx="300" cy="58" r="22" fill="#FDBA74" />
      <path d="M0 130 L80 60 L150 120 L220 40 L300 115 L360 70 L400 100 L400 200 L0 200 Z" fill="#64748B" opacity="0.55" />
      <path d="M0 150 L70 110 L140 145 L230 95 L320 140 L400 115 L400 200 L0 200 Z" fill="#047857" opacity="0.85" />
      <path d="M0 175 L90 145 L190 170 L290 140 L400 165 L400 200 L0 200 Z" fill="#065F46" />
      {/* Winding road */}
      <path d="M-10 205 C 120 190, 200 170, 410 150" stroke="#1E293B" strokeWidth="22" fill="none" />
      <path d="M-10 205 C 120 190, 200 170, 410 150" stroke="#FDE68A" strokeWidth="2" strokeDasharray="10 9" fill="none" />
    </svg>
  );
}

export function LocalScene() {
  const towers = [
    { x: 14, w: 44, h: 96, c: '#1E1B4B' },
    { x: 64, w: 34, h: 130, c: '#272463' },
    { x: 104, w: 50, h: 82, c: '#1E1B4B' },
    { x: 160, w: 40, h: 150, c: '#272463' },
    { x: 206, w: 54, h: 108, c: '#1E1B4B' },
    { x: 266, w: 38, h: 140, c: '#272463' },
    { x: 310, w: 48, h: 92, c: '#1E1B4B' },
    { x: 362, w: 34, h: 120, c: '#272463' },
  ];
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="sky-local" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#sky-local)" />
      {towers.map((t, i) => {
        const top = 182 - t.h;
        const cols = Math.max(2, Math.floor((t.w - 8) / 10));
        const rows = Math.floor((t.h - 14) / 16);
        return (
          <g key={i}>
            <rect x={t.x} y={top} width={t.w} height={t.h} fill={t.c} />
            {Array.from({ length: rows * cols }).map((_, j) => {
              const r = Math.floor(j / cols);
              const col = j % cols;
              // Deterministic "lit window" pattern
              if ((i * 7 + j * 3) % 4 === 0) return null;
              return (
                <rect
                  key={j}
                  x={t.x + 6 + col * 10}
                  y={top + 10 + r * 16}
                  width="5"
                  height="7"
                  fill="#FDE68A"
                  opacity="0.7"
                />
              );
            })}
          </g>
        );
      })}
      <rect x="0" y="182" width="400" height="18" fill="#0F172A" />
      <rect x="0" y="190" width="400" height="1.5" fill="#FDE68A" opacity="0.6" />
    </svg>
  );
}
