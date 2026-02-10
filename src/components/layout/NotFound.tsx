import { lazy, Suspense, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CursorTrail from "../effects/CursorTrail";
import ErrorBoundary from "../ui/ErrorBoundary";
import { REDUCED_MOTION } from "../../constants/accessibility";
import { EASE_OUT_EXPO } from "../../constants/animation";
import { cn } from "../../utils/cn";

const NotFound3D = lazy(() => import("./NotFound3D"));

// ── Entrance animation ──
const ENTRANCE_DURATION_S = 0.6;
const ENTRANCE_DELAY_S = 0.3;
const ENTRANCE_Y_PX = 20;

// ── 3D scene container ──
const SCENE_HEIGHT_CLASS = "h-[320px]";

function Flat404() {
  return (
    <h1 className="text-[10rem] leading-none font-bold text-cyan-400/20">
      404
    </h1>
  );
}

export default function NotFound() {
  const { t } = useTranslation();
  const [sceneReady, setSceneReady] = useState(false);
  const handleReady = useCallback(() => setSceneReady(true), []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <CursorTrail />

      {/* 3D "404" or flat fallback */}
      <div className={cn("relative w-full max-w-xl", SCENE_HEIGHT_CLASS)}>
        {REDUCED_MOTION ? (
          <div className="flex h-full items-center justify-center">
            <Flat404 />
          </div>
        ) : (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              sceneReady ? "opacity-100" : "opacity-0",
            )}
          >
            <ErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Flat404 />
                </div>
              }
            >
              <Suspense fallback={null}>
                <NotFound3D onReady={handleReady} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Message + back button — renders immediately */}
      <motion.div
        initial={{ opacity: 0, y: ENTRANCE_Y_PX }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ENTRANCE_DURATION_S, delay: ENTRANCE_DELAY_S, ease: EASE_OUT_EXPO }}
        className="mt-8 px-6 text-center"
      >
        <p className="mb-8 font-mono text-lg text-slate-400">
          {t("notFound.message")}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition-colors hover:bg-cyan-400"
        >
          {t("notFound.back")}
        </a>
      </motion.div>
    </div>
  );
}
