import { motion } from "framer-motion";
import { Dumbbell, Swords, Gamepad2 } from "lucide-react";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

/* ═══════════════════════════════════════════════════════════════════
   Demo 7: Micro-animations Hover
   ═══════════════════════════════════════════════════════════════════ */

export default function MicroAnimationsDemo() {
  const icons = [
    {
      name: "Musculation",
      icon: Dumbbell,
      hover: { y: [-2, 0, -1, 0], transition: { type: "spring" as const, stiffness: 300, damping: 10 } },
    },
    {
      name: "Echecs",
      icon: Swords,
      hover: { rotate: [0, 8, -3, 0], transition: { type: "spring" as const, stiffness: 200, damping: 12 } },
    },
    {
      name: "Gaming",
      icon: Gamepad2,
      hover: { x: [0, 1.5, -1.5, 1, -0.5, 0], transition: { duration: 0.4 } },
    },
  ];

  return (
    <DemoSection
      number={7}
      title="Micro-animations Hover"
      description="Icones qui reagissent au hover: bounce, rotate, vibrate. Tres subtil (2-3px max). Survolez chaque interet."
    >
      <div className={cardClass}>
        <div className="flex flex-col gap-4">
          {icons.map(({ name, icon: Icon, hover }) => (
            <motion.div
              key={name}
              className="flex items-center gap-3 cursor-default"
              whileHover="hover"
            >
              <motion.div
                variants={{ hover }}
                className="text-slate-400"
              >
                <Icon size={18} />
              </motion.div>
              <span className="text-sm font-medium text-slate-200">
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </DemoSection>
  );
}
