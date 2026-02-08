import { lazy, Suspense } from "react";
import CursorTrail from "../effects/CursorTrail";

/* ═══════════════════════════════════════════════════════════════════
   Playground — Animation demos + 404 Easter Egg prototypes
   Access: ?playground=true
   ═══════════════════════════════════════════════════════════════════ */

// Framer Motion demos (1-4)
import TypingEffectDemo from "./framer/TypingEffectDemo";
import MicroAnimationsDemo from "./framer/MicroAnimationsDemo";
import ExpandCollapseDemo from "./framer/ExpandCollapseDemo";
import TerminalDemo from "./framer/TerminalDemo";

// Three.js demos — lazy loaded (5-8)
const ChessBoardDemo = lazy(() => import("./three/ChessBoardDemo"));
const ParticleFieldDemo = lazy(() => import("./three/ParticleFieldDemo"));
const AbstractGeometryDemo = lazy(() => import("./three/AbstractGeometryDemo"));
const HeroParticlesZoneDemo = lazy(() => import("./three/HeroParticlesZoneDemo"));

// 404 Easter Egg prototypes — lazy loaded (9-11)
const RunnerDemo = lazy(() => import("./canvas/RunnerDemo"));
const Particles404Demo = lazy(() => import("./three/Particles404Demo"));
const Destruction404Demo = lazy(() => import("./three/Destruction404Demo"));

function ThreeJsLoader() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
      <p className="animate-pulse text-sm text-slate-500">Chargement 3D...</p>
    </div>
  );
}

function LazyDemo({ children }: { children: React.ReactNode }) {
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
                11 demos — Framer Motion, Three.js, et prototypes 404 Easter Egg.
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
        {/* ─── Framer Motion Demos (1-4) ─── */}
        <TypingEffectDemo />
        <MicroAnimationsDemo />
        <ExpandCollapseDemo />
        <TerminalDemo />

        {/* ─── Three.js Demos (5-8) ─── */}
        <div className="mb-12 mt-16 border-t border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-100">
            Three.js / WebGL
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Demos avancees avec Three.js via @react-three/fiber.
          </p>
        </div>

        <LazyDemo><ChessBoardDemo /></LazyDemo>
        <LazyDemo><ParticleFieldDemo /></LazyDemo>
        <LazyDemo><AbstractGeometryDemo /></LazyDemo>
        <LazyDemo><HeroParticlesZoneDemo /></LazyDemo>

        {/* ─── 404 Easter Egg Prototypes (9-11) ─── */}
        <div className="mb-12 mt-16 border-t border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-100">
            404 Easter Egg — 3 prototypes
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Trois approches pour transformer la page 404 en experience
            interactive. Compare: runner pixel (Canvas 2D), particules texte
            (R3F), et destruction physique (R3F).
          </p>
        </div>

        <LazyDemo><RunnerDemo /></LazyDemo>
        <LazyDemo><Particles404Demo /></LazyDemo>
        <LazyDemo><Destruction404Demo /></LazyDemo>

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
