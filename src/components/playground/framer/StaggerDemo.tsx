import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

/* ═══════════════════════════════════════════════════════════════════
   Demo 4: Stagger Children
   ═══════════════════════════════════════════════════════════════════ */

export default function StaggerDemo() {
  const [show, setShow] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        when: "beforeChildren" as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 150, damping: 18 },
    },
  };

  const items = [
    { name: "React", color: "bg-cyan-400" },
    { name: "TypeScript", color: "bg-blue-500" },
    { name: "Tailwind CSS", color: "bg-sky-400" },
    { name: "Supabase", color: "bg-emerald-500" },
    { name: "React Native", color: "bg-cyan-400" },
    { name: "Expo", color: "bg-slate-300" },
  ];

  return (
    <DemoSection
      number={4}
      title="Stagger Children"
      description="Chaque element apparait un apres l'autre avec spring physics. Effet cascade rapide."
    >
      <button
        onClick={() => setShow(!show)}
        className="mb-6 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400 transition-colors hover:bg-cyan-400/20"
      >
        {show ? "Reset" : "Trigger Stagger"}
      </button>
      <div className={cardClass}>
        <AnimatePresence mode="wait">
          {show && (
            <motion.div
              key="stagger"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-2 gap-3"
            >
              {items.map((tech) => (
                <motion.span
                  key={tech.name}
                  variants={itemVariants}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      tech.color,
                    )}
                  />
                  {tech.name}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoSection>
  );
}
