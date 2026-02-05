/* ═══════════════════════════════════════════════════════════════════
   CityScene data — palette, dimensions, building coordinates, stars
   Consumed by src/components/CityScene.tsx
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Shared types ─── */

export interface Bldg {
  x: number;
  w: number;
  h: number;
  path?: string;
  roofEdge?: string;
  /** Extra top padding for buildings with custom roof geometry */
  roofOffset?: number;
}

export interface MidWin {
  x: number;
  y: number;
  delay: number;
  /** Staggered delay before pulse cycle starts */
  cycleDelay: number;
  /** Window's dim opacity (0.20-0.60 range) */
  minOpacity: number;
  /** Window's bright opacity (0.60-0.90 range) */
  maxOpacity: number;
}

export interface BackWin {
  x: number;
  y: number;
}

/* ─── Palette ─── */

export const SKY = "#0c1222";
export const BACK_CLR = "#1e293b";
export const BACK_WIDE_CLR = "#182032";
export const MID_CLR = "#283548";
export const MID_GRADS = ["url(#mid-grad-0)", "url(#mid-grad-1)", "url(#mid-grad-2)"];
export const MID_EDGE_CLR = "#4a6280";
export const FRONT_CLR = "#0a1018";
export const CYAN = "#22d3ee";
export const STAR_CLR = "#e2e8f0";

/* ─── Dimensions ─── */

/** Viewport width — also used for CSS city-scroll keyframe (-800px) */
export const W = 800;
export const H = 160;
export const GROUND_Y = H - 6;

/* ─── Scroll speeds (seconds per full loop) ─── */

export const SPEED_BACK = 300;
export const SPEED_MID = 240;
export const SPEED_FRONT = 55;

/* ─── Knuth multiplicative hash constants for deterministic pseudo-random ─── */

export const HASH_A = 2654435761;
export const HASH_B = 2246822519;
export const HASH_C = 1597334677;

/* ─── Window grid sizing ─── */

export const WIN = {
  mid: { pad: 8, gap: 10, rowGap: 12, w: 5, h: 7 },
  back: { pad: 6, gap: 8, rowGap: 10, w: 3, h: 4 },
  backThin: { rowGap: 10, w: 3, h: 4 },
} as const;

/** Window animation timing configuration */
export const WIN_ANIM = {
  /** Fade-in duration for initial window reveal */
  fadeIn_S: 0.8,
  /** Pulsing window configuration */
  pulse: {
    /** Base animation cycle (includes pause + fade phases) */
    baseCycle_S: 8.0,
    /** Number of timing variants for desynchronization */
    variants: 7,
    /** Time offset between consecutive variants */
    variantStep_S: 0.6,
  },
  /** Staggered reveal timing */
  delay: {
    base_S: 1.0,
    perBuilding_S: 0.2,
    perRow_S: 0.08,
  },
  /** Roll threshold for window density (0-100 scale) */
  roll: {
    /** Windows with roll > skip are not rendered */
    skip: 30,
  },
  /** Base glow windows (every 2nd window, very faint) */
  baseGlow: { opacity: 0.08 },
} as const;

/* ─── Moon position ─── */

export const MOON = { cx: 590, cy: 54, r: 7, cutCx: 593.5, cutCy: 52.5, cutR: 6 } as const;

/* ═══════════════════════════════════════════════════════════════════
   Layer data — ordered back to front
   ═══════════════════════════════════════════════════════════════════ */

/* ─── BACK layer — thin spires + wide low blocks (300s scroll) ─── */

export const BACK_BUILDINGS: Bldg[] = [
  { x: 10, w: 12, h: 65 },
  { x: 55, w: 10, h: 52 },
  { x: 90, w: 26, h: 30 },
  { x: 148, w: 10, h: 70 },
  { x: 195, w: 14, h: 50 },
  { x: 240, w: 22, h: 16 },
  { x: 330, w: 11, h: 58 },
  { x: 355, w: 13, h: 38 },
  { x: 400, w: 28, h: 26 },
  { x: 458, w: 13, h: 58 },
  { x: 500, w: 12, h: 62 },
  { x: 545, w: 24, h: 14 },
  { x: 580, w: 11, h: 75 },
  { x: 640, w: 14, h: 55 },
  { x: 685, w: 25, h: 22 },
  { x: 725, w: 12, h: 63 },
  { x: 760, w: 11, h: 60 },
];

/** Wide back buildings (w > 15) get faded cyan windows */
export const BACK_WIDE = BACK_BUILDINGS.filter((b) => b.w > 15);

/** Thin back buildings (w <= 15) get 1-2 sparse cyan windows */
export const BACK_THIN = BACK_BUILDINGS.filter((b) => b.w <= 15);

/* ─── MID layer — main buildings with windows + antennas (240s scroll) ─── */

export const MID_BUILDINGS: Bldg[] = [
  { x: 30, w: 40, h: 80 },
  { x: 95, w: 48, h: 100 },
  { x: 168, w: 36, h: 70 },
  { x: 228, w: 44, h: 105, roofOffset: 20,
    path:     "M228,160 V68 H234 V62 H240 V57 H245 V52 H255 V57 H260 V62 H266 V68 H272 V160 Z",
    roofEdge: "M228,68 H234 V62 H240 V57 H245 V52 H255 V57 H260 V62 H266 V68 H272",
  },
  { x: 300, w: 40, h: 82 },
  { x: 370, w: 52, h: 115, roofOffset: 18,
    path:     "M370,160 V55 H376 V50 H385 L396,38 L407,50 H416 V55 H422 V160 Z",
    roofEdge: "M370,55 H376 V50 H385 L396,38 L407,50 H416 V55 H422",
  },
  { x: 450, w: 42, h: 90 },
  { x: 520, w: 50, h: 108 },
  { x: 600, w: 38, h: 75, roofOffset: 10,
    path:     "M600,160 V79 H605 V85 H611 V79 H616 V85 H622 V79 H627 V85 H633 V79 H638 V160 Z",
    roofEdge: "M600,79 H605 V85 H611 V79 H616 V85 H622 V79 H627 V85 H633 V79 H638",
  },
  { x: 660, w: 48, h: 95 },
  { x: 735, w: 44, h: 68 },
];

/** Indices into MID_BUILDINGS that get rooftop antennas */
export const ANTENNA_INDICES = [1, 7, 9];

/* ─── FRONT layer — low silhouettes with varied rooflines (55s scroll) ─── */

export const FRONT_PATHS: string[] = [
  "M-5,160 V138 H10 V132 L22,125 L34,132 V138 H48 V160 Z",
  "M80,160 V148 H90 V144 L100,138 L110,144 V148 H120 V152 H125 V146 H130 V152 H140 V160 Z",
  "M212,160 V141 H222 V136 H226 V141 H232 V138 L247,130 L257,138 V160 Z",
  "M293,160 V144 H313 V160 Z M296,144 V136 H310 V144 Z M299,136 V131 H307 V136 Z",
  "M395,160 V150 H405 V143 H409 V150 H415 V147 L430,140 L445,147 V160 Z",
  "M500,160 V144 H510 V138 L516,132 L522,138 V144 H540 V160 Z",
  "M575,160 V136 L595,126 L615,136 V160 Z",
  "M700,160 V150 H710 V144 H714 V150 H725 V156 H733 V146 H740 V142 H744 V146 H757 V160 Z",
  "M790,160 V142 H808 V136 H815 V142 H830 V160 Z",
];

/* ─── Stars ─── */

export const STARS = [
  { cx: 25, cy: 42, r: 0.7 },
  { cx: 80, cy: 58, r: 0.4 },
  { cx: 130, cy: 35, r: 0.5 },
  { cx: 175, cy: 50, r: 0.9 },
  { cx: 220, cy: 40, r: 0.4 },
  { cx: 270, cy: 55, r: 1.0 },
  { cx: 315, cy: 38, r: 0.6 },
  { cx: 370, cy: 48, r: 1.2 },
  { cx: 420, cy: 36, r: 0.5 },
  { cx: 465, cy: 52, r: 0.8 },
  { cx: 510, cy: 42, r: 0.3 },
  { cx: 555, cy: 60, r: 0.6 },
  { cx: 595, cy: 37, r: 1.1 },
  { cx: 640, cy: 50, r: 0.4 },
  { cx: 680, cy: 44, r: 0.7 },
  { cx: 720, cy: 56, r: 0.5 },
  { cx: 755, cy: 39, r: 0.9 },
  { cx: 50, cy: 62, r: 0.3 },
  { cx: 350, cy: 63, r: 0.3 },
  { cx: 620, cy: 64, r: 0.4 },
  { cx: 160, cy: 72, r: 0.4 },
  { cx: 390, cy: 78, r: 0.3 },
  { cx: 540, cy: 68, r: 0.5 },
  { cx: 700, cy: 75, r: 0.3 },
  { cx: 440, cy: 82, r: 0.4 },
];
