/** Constants for the dot-grid background effect (inspired by vvd.world) */
export const DOT_GRID = {
  /** Vertical gradient: slate-950 edges → muted blue (#142a3c) peak at center */
  verticalGradient:
    "linear-gradient(#020617 0%, #020617 10%, #0b1c2d 30%, #142a3c 50%, #0b1c2d 70%, #020617 90%, #020617 100%)",

  /** Wide elliptical radial glow — muted steel blue, concentrates blue at center */
  radialGlow: "radial-gradient(100% 50%, rgba(56, 120, 160, 0.08) 0%, transparent 70%)",

  /** Repeating dot pattern: white 1px circles, 16px grid */
  dots: "radial-gradient(circle, rgba(255, 255, 255, 0.22) 1px, transparent 1px)",

  /** Dot grid spacing */
  dotSize: "16px 16px",

  /** Mask: fade-in top 15%, solid middle, fade-out bottom 15% */
  mask: "linear-gradient(transparent 0%, black 30%, black 85%, transparent 100%)",
} as const;
