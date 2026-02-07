import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   Demo 2: Card Spotlight Hover
   ═══════════════════════════════════════════════════════════════════ */

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(200px circle at ${x}px ${y}px, rgba(34,211,238,0.08), transparent 70%)`,
  );

  const borderGlow = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(400px circle at ${x}px ${y}px, rgba(34,211,238,0.15), transparent 70%)`,
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("group relative overflow-hidden rounded-2xl", className)}
    >
      {/* Border glow layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: borderGlow }}
      />
      {/* Inner spotlight layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: isHovered ? spotlightBg : undefined }}
      />
      {/* Content */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-colors duration-300 group-hover:border-slate-700/80">
        {children}
      </div>
    </div>
  );
}

export default function CardSpotlightDemo() {
  return (
    <DemoSection
      number={2}
      title="Card Spotlight Hover"
      description="Un halo interieur suit la souris dans chaque carte. Le border glow aussi. Survolez les cartes."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SpotlightCard>
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-2">
            Stack
          </h3>
          <p className="text-sm text-slate-300">
            React, TypeScript, Tailwind
          </p>
        </SpotlightCard>
        <SpotlightCard>
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-2">
            Interets
          </h3>
          <p className="text-sm text-slate-300">
            Musculation, Echecs, Gaming
          </p>
        </SpotlightCard>
        <SpotlightCard>
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-2">
            Status
          </h3>
          <p className="text-sm text-slate-300">
            Building cool stuff
          </p>
        </SpotlightCard>
      </div>
    </DemoSection>
  );
}
