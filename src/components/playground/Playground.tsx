import { lazy, Suspense } from "react";
import CursorTrail from "../effects/CursorTrail";

/* ═══════════════════════════════════════════════════════════════════
   Playground — Framer Motion + Three.js animation demos
   Access: ?playground=true
   Temporary page for testing animations before integrating into portfolio.
   ═══════════════════════════════════════════════════════════════════ */

// Framer Motion demos
import CursorSpotlightDemo from "./framer/CursorSpotlightDemo";
import CardSpotlightDemo from "./framer/CardSpotlightDemo";
import SpringRevealDemo from "./framer/SpringRevealDemo";
import StaggerDemo from "./framer/StaggerDemo";
import GlowPulseDemo from "./framer/GlowPulseDemo";
import TypingEffectDemo from "./framer/TypingEffectDemo";
import MicroAnimationsDemo from "./framer/MicroAnimationsDemo";
import ExpandCollapseDemo from "./framer/ExpandCollapseDemo";
import TerminalDemo from "./framer/TerminalDemo";

// Three.js demos — lazy loaded to avoid blocking initial render
const ChessBoardDemo = lazy(() => import("./three/ChessBoardDemo"));
const ParticleFieldDemo = lazy(() => import("./three/ParticleFieldDemo"));
const AbstractGeometryDemo = lazy(() => import("./three/AbstractGeometryDemo"));
const WaveMeshDemo = lazy(() => import("./three/WaveMeshDemo"));
const HeroParticlesFullDemo = lazy(() => import("./three/HeroParticlesFullDemo"));
const HeroParticlesZoneDemo = lazy(() => import("./three/HeroParticlesZoneDemo"));
const HeroParticlesNebulaDemo = lazy(() => import("./three/HeroParticlesNebulaDemo"));
const CityScene3DFlatDemo = lazy(() => import("./three/CityScene3DFlatDemo"));
const CityScene3DIsometricDemo = lazy(() => import("./three/CityScene3DIsometricDemo"));
const HeroParticlesHaloADemo = lazy(() => import("./three/HeroParticlesHaloADemo"));
const HeroParticlesHaloBDemo = lazy(() => import("./three/HeroParticlesHaloBDemo"));
const HeroParticlesHaloCDemo = lazy(() => import("./three/HeroParticlesHaloCDemo"));

function ThreeJsLoader() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
      <p className="animate-pulse text-sm text-slate-500">Chargement 3D...</p>
    </div>
  );
}

function ThreeDemo({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ThreeJsLoader />}>{children}</Suspense>;
}

/* ═══════════════════════════════════════════════════════════════════
   Main Playground Component
   ═══════════════════════════════════════════════════════════════════ */

export default function Playground() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CursorTrail />
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Animation Playground
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Demos interactives — Framer Motion + Three.js. Teste chaque
                animation et decide ce qui te plait.
              </p>
            </div>
            <a
              href="/"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-300"
            >
              Retour au site
            </a>
          </div>
        </div>
      </div>

      {/* Demos */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* ─── Framer Motion Demos (1-9) ─── */}
        <CursorSpotlightDemo />
        <CardSpotlightDemo />
        <SpringRevealDemo />
        <StaggerDemo />
        <GlowPulseDemo />
        <TypingEffectDemo />
        <MicroAnimationsDemo />
        <ExpandCollapseDemo />
        <TerminalDemo />

        {/* ─── Three.js Demos (10-13) ─── */}
        <div className="mb-12 mt-16 border-t border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-100">
            Three.js / WebGL
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Demos avancees avec Three.js via @react-three/fiber. Exploration
            seulement — sera retire si non utilise.
          </p>
        </div>

        <ThreeDemo><ChessBoardDemo /></ThreeDemo>
        <ThreeDemo><ParticleFieldDemo /></ThreeDemo>
        <ThreeDemo><AbstractGeometryDemo /></ThreeDemo>
        <ThreeDemo><WaveMeshDemo /></ThreeDemo>

        {/* ─── Hero Particles Variants (14-16) ─── */}
        <div className="mb-12 mt-16 border-t border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-100">
            Hero Particles — 3 variantes
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Particules pour le Hero section. Compare les 3 approches: full
            viewport, zone centree, et nebuleuse gaussienne.
          </p>
        </div>

        <ThreeDemo><HeroParticlesFullDemo /></ThreeDemo>
        <ThreeDemo><HeroParticlesZoneDemo /></ThreeDemo>
        <ThreeDemo><HeroParticlesNebulaDemo /></ThreeDemo>

        {/* ─── CityScene 3D Variants (17-18) ─── */}
        <div className="mb-12 mt-16 border-t border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-100">
            CityScene 3D — 2 variantes
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Remplacement potentiel du SVG CityScene actuel. Camera
            orthographique (flat 2D) vs perspective (isometrique).
          </p>
        </div>

        <ThreeDemo><CityScene3DFlatDemo /></ThreeDemo>
        <ThreeDemo><CityScene3DIsometricDemo /></ThreeDemo>

        {/* ─── Hero Particles Halo Variants (19-21) ─── */}
        <div className="mb-12 mt-16 border-t border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-100">
            Hero Particles — Halo / Centre
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            3 approches pour la concentration au centre: bias renforce,
            double distribution, et couche de glow.
          </p>
        </div>

        <ThreeDemo><HeroParticlesHaloADemo /></ThreeDemo>
        <ThreeDemo><HeroParticlesHaloBDemo /></ThreeDemo>
        <ThreeDemo><HeroParticlesHaloCDemo /></ThreeDemo>

        {/* Footer note */}
        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-500">
            Page temporaire — sera supprimee apres integration des animations
            choisies.
          </p>
        </div>
      </div>
    </div>
  );
}
