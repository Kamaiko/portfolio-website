import { DOT_GRID } from "../../constants/dot-grid";

export default function DotGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[100vh] bottom-0 -z-10">
      {/* Layer 1 — Vertical gradient: dark edges → muted blue center ("glob") */}
      <div className="absolute inset-0" style={{ background: DOT_GRID.verticalGradient }} />

      {/* Layer 2 — Radial glow: wide ellipse concentrating blue at center */}
      <div className="absolute inset-0" style={{ background: DOT_GRID.radialGlow }} />

      {/* Layer 3 — Dot grid pattern with fade-in/fade-out mask */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: DOT_GRID.dots,
          backgroundSize: DOT_GRID.dotSize,
          maskImage: DOT_GRID.mask,
          WebkitMaskImage: DOT_GRID.mask,
        }}
      />
    </div>
  );
}
