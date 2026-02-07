import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import DemoSection from "../DemoSection";

/* ═══════════════════════════════════════════════════════════════════
   Demo 1: Cursor Spotlight
   ═══════════════════════════════════════════════════════════════════ */

export default function CursorSpotlightDemo() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInside, setIsInside] = useState(false);

  // Inner dot — follows with slight delay (stiff spring)
  const dotX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const dotY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Outer ring — follows with more delay (softer spring)
  const ringX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const ringY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  // Background glow — follows with the ring (same soft spring)
  const background = useTransform(
    [ringX, ringY],
    ([x, y]) =>
      `radial-gradient(300px circle at ${x}px ${y}px, rgba(34,211,238,0.06), transparent 70%)`,
  );

  function handleMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <DemoSection
      number={1}
      title="Cursor Spotlight (Trailing)"
      description="Deux elements: un petit point cyan (delai leger) + un anneau plus large (delai plus grand). Le curseur est toujours en avance. Inspire de tamalsen.dev."
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsInside(true)}
        onMouseLeave={() => setIsInside(false)}
        className="relative h-72 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 cursor-none"
      >
        {/* Background glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ background, opacity: isInside ? 1 : 0 }}
        />

        {/* Outer ring — follows with more lag */}
        <motion.div
          className="pointer-events-none absolute transition-opacity duration-300"
          style={{
            x: ringX,
            y: ringY,
            width: 36,
            height: 36,
            marginLeft: -18,
            marginTop: -18,
            borderRadius: "50%",
            border: "1.5px solid rgba(34,211,238,0.5)",
            opacity: isInside ? 1 : 0,
          }}
        />

        {/* Inner dot — follows with slight lag */}
        <motion.div
          className="pointer-events-none absolute transition-opacity duration-300"
          style={{
            x: dotX,
            y: dotY,
            width: 6,
            height: 6,
            marginLeft: -3,
            marginTop: -3,
            borderRadius: "50%",
            backgroundColor: "rgb(34,211,238)",
            opacity: isInside ? 1 : 0,
          }}
        />

        <div className="flex h-full items-center justify-center">
          <p className="text-slate-500 text-sm">
            Deplacez votre souris ici (le curseur se cache)
          </p>
        </div>
      </div>
    </DemoSection>
  );
}
