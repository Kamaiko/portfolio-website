import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CursorTrail from "../effects/CursorTrail";
import { EASE_OUT_EXPO } from "../../constants/animation";

// ── Entrance animation ──
const ENTRANCE_DURATION_S = 0.6;
const ENTRANCE_DELAY_S = 0.3;
const ENTRANCE_Y_PX = 20;

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <CursorTrail />

      {/* Large ghost "404" */}
      <motion.h1
        initial={{ opacity: 0, y: ENTRANCE_Y_PX }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ENTRANCE_DURATION_S, ease: EASE_OUT_EXPO }}
        className="bg-linear-to-r from-cyan-400/20 to-slate-600/20 bg-clip-text text-[10rem] leading-none font-bold text-transparent select-none"
      >
        404
      </motion.h1>

      {/* Message + back button */}
      <motion.div
        initial={{ opacity: 0, y: ENTRANCE_Y_PX }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ENTRANCE_DURATION_S, delay: ENTRANCE_DELAY_S, ease: EASE_OUT_EXPO }}
        className="mt-8 px-6 text-center"
      >
        <p className="mb-8 font-mono text-lg text-slate-400">{t("notFound.message")}</p>
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
