/** Static check at module load — user must reload to pick up OS changes */
export const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
