import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Swords, Gamepad2 } from "lucide-react";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

/* ═══════════════════════════════════════════════════════════════════
   Demo 8: AnimatePresence (expand/collapse)
   ═══════════════════════════════════════════════════════════════════ */

export default function ExpandCollapseDemo() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const items = [
    {
      key: "fitness",
      label: "Musculation",
      icon: Dumbbell,
      fact: "Jamais toujours skip leg day",
    },
    {
      key: "chess",
      label: "Echecs",
      icon: Swords,
      fact: "Blitz a 3am, aucun regret",
    },
    {
      key: "gaming",
      label: "Gaming",
      icon: Gamepad2,
      fact: "gg no re",
    },
  ];

  return (
    <DemoSection
      number={3}
      title="AnimatePresence (expand/collapse)"
      description="Les fun facts sont caches par defaut. Au hover, ils apparaissent avec une transition smooth. Sur mobile, ils seraient toujours visibles."
    >
      <div className={cardClass}>
        <div className="flex flex-col gap-3">
          {items.map(({ key, label, icon: Icon, fact }) => (
            <div
              key={key}
              className="cursor-default"
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="shrink-0 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">
                  {label}
                </span>
              </div>
              <AnimatePresence>
                {hoveredKey === key && (
                  <motion.div
                    key={`fact-${key}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-1 ml-[30px] text-xs text-slate-500">
                      {fact}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </DemoSection>
  );
}
