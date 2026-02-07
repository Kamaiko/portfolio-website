import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { REDUCED_MOTION } from "../../constants/accessibility";

const DOT_SIZE_PX = 6; // Tailwind w-1.5 = 6px
const DOT_OFFSET = DOT_SIZE_PX / 2;

export default function CursorTrail() {
  const isMobile = useIsMobile();
  const dotRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ring: micro trail via spring
  const ringX = useSpring(mouseX, { stiffness: 4000, damping: 120 });
  const ringY = useSpring(mouseY, { stiffness: 4000, damping: 120 });

  useEffect(() => {
    if (isMobile || REDUCED_MOTION) return;
    const onMove = (e: MouseEvent) => {
      // Feed FM spring for the ring
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      // Direct DOM update for the dot — zero latency
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX - DOT_OFFSET}px, ${e.clientY - DOT_OFFSET}px)`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile, mouseX, mouseY]);

  if (isMobile || REDUCED_MOTION) return null;

  return (
    <>
      {/* Ring: FM spring for trailing effect */}
      <motion.div
        className="pointer-events-none fixed z-40 rounded-full border border-cyan-400/50"
        style={{
          x: ringX,
          y: ringY,
          width: 28,
          height: 28,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
        }}
      />
      {/* Dot: raw DOM — zero lag */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-40 h-1.5 w-1.5 rounded-full bg-cyan-400"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
