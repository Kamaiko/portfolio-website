/** Radial gradient backgrounds for spotlights and glows */
export const GRADIENT = {
  // Hero.tsx — spotlight glows
  spotlightCyan:
    "radial-gradient(circle, rgba(6,182,212,0.07) 0%, rgba(6,182,212,0.02) 45%, transparent 70%)",
  spotlightBlue:
    "radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.015) 45%, transparent 70%)",
  spotlightTeal:
    "radial-gradient(circle, rgba(34,211,238,0.04) 0%, rgba(34,211,238,0.012) 45%, transparent 70%)",

  // ScreenshotFan.tsx — glow behind phones
  fanGlow: "radial-gradient(ellipse at center, rgba(34,211,238,0.12) 0%, transparent 70%)",
} as const;

/** SVG noise texture (feTurbulence fractalNoise) encoded as a data URI */
export const NOISE_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E";
