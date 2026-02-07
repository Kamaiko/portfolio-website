import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CursorTrail from "./effects/CursorTrail";

const EASE_OUT_EXPO = [0.25, 0.46, 0.45, 0.94] as const;

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <CursorTrail />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="px-6 text-center"
      >
        <h1 className="mb-4 text-8xl font-bold text-cyan-400/20">404</h1>
        <p className="mb-8 text-lg text-slate-400">{t("notFound.message")}</p>
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
