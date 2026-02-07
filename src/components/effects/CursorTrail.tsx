import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";

const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

export default function CursorTrail() {
  const isMobile = useIsMobile();
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Dot: near-snapped to cursor
  const dotX = useSpring(mouseX, { stiffness: 6000, damping: 150 });
  const dotY = useSpring(mouseY, { stiffness: 6000, damping: 150 });

  // Ring: micro trail — barely perceptible
  const ringX = useSpring(mouseX, { stiffness: 2500, damping: 100 });
  const ringY = useSpring(mouseY, { stiffness: 2500, damping: 100 });

  useEffect(() => {
    if (isMobile || REDUCED_MOTION) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile, mouseX, mouseY]);

  if (isMobile || REDUCED_MOTION) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed z-40 rounded-full border border-cyan-400/50"
        style={{
          x: ringX,
          y: ringY,
          width: 28,
          height: 28,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed z-40 rounded-full bg-cyan-400"
        style={{
          x: dotX,
          y: dotY,
          width: 6,
          height: 6,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
