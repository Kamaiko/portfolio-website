import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

/* ═══════════════════════════════════════════════════════════════════
   Demo 3: Spring Scroll Reveal (comparison)
   ═══════════════════════════════════════════════════════════════════ */

export default function SpringRevealDemo() {
  const [show, setShow] = useState(false);

  const easeOutVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  const springVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <DemoSection
      number={3}
      title="Spring Scroll Reveal"
      description="Comparaison: ease-out CSS (gauche) vs spring physics (droite). La spring a un leger overshoot naturel."
    >
      <button
        onClick={() => setShow(!show)}
        className="mb-6 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400 transition-colors hover:bg-cyan-400/20"
      >
        {show ? "Reset" : "Trigger Reveal"}
      </button>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-mono text-slate-500">ease-out (actuel)</p>
          <AnimatePresence mode="wait">
            {show && (
              <motion.div
                key="ease"
                variants={easeOutVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={cardClass}
              >
                <p className="text-sm text-slate-300">
                  Transition lineaire, previsible, un peu mecanique.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <p className="mb-2 text-xs font-mono text-slate-500">spring (propose)</p>
          <AnimatePresence mode="wait">
            {show && (
              <motion.div
                key="spring"
                variants={springVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={cardClass}
              >
                <p className="text-sm text-slate-300">
                  Spring physics, leger overshoot, plus naturel et vivant.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoSection>
  );
}
