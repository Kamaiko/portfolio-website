import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { REDUCED_MOTION } from "../../constants/accessibility";

const DOT_SIZE_PX = 6; // Tailwind w-1.5 = 6px
const DOT_OFFSET = DOT_SIZE_PX / 2;
const DOT_HOVER_SCALE = 2.5;
const DOT_HOVER_OPACITY = 0.6;
const CLICKABLE_SELECTOR = "a, button, [role='button'], input[type='submit']";
const HOVER_CHECK_INTERVAL_MS = 100;

/** True only when primary input is a precise pointer (mouse/trackpad) */
const HAS_FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

export default function CursorTrail() {
  const isMobile = useIsMobile();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const cursorVisibleRef = useRef(true);
  const lastHoverCheckRef = useRef(0);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ring: micro trail via spring
  const ringX = useSpring(mouseX, { stiffness: 4000, damping: 120 });
  const ringY = useSpring(mouseY, { stiffness: 4000, damping: 120 });

  useEffect(() => {
    if (isMobile || !HAS_FINE_POINTER || REDUCED_MOTION) return;

    const onMove = (e: MouseEvent) => {
      // Feed FM spring for the ring
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      // Direct DOM update for the dot — zero latency
      if (dotRef.current) {
        dotRef.current.style.translate =
          `${e.clientX - DOT_OFFSET}px ${e.clientY - DOT_OFFSET}px`;

        // Restore visibility on re-entry (mouseenter may fire after mousemove)
        if (!cursorVisibleRef.current) {
          cursorVisibleRef.current = true;
          dotRef.current.style.opacity = isHoveringRef.current
            ? String(DOT_HOVER_OPACITY)
            : "1";
          if (ringRef.current) ringRef.current.style.opacity = "1";
        }

        // Throttled hover detection — elementFromPoint is expensive
        const now = performance.now();
        if (now - lastHoverCheckRef.current >= HOVER_CHECK_INTERVAL_MS) {
          lastHoverCheckRef.current = now;
          const target = document.elementFromPoint(e.clientX, e.clientY);
          const isClickable = target?.closest(CLICKABLE_SELECTOR) != null;

          if (isClickable !== isHoveringRef.current) {
            isHoveringRef.current = isClickable;
            dotRef.current.style.scale = isClickable ? String(DOT_HOVER_SCALE) : "1";
            dotRef.current.style.opacity = isClickable ? String(DOT_HOVER_OPACITY) : "1";
          }
        }
      }
    };

    const onLeave = () => {
      cursorVisibleRef.current = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const onEnter = () => {
      cursorVisibleRef.current = true;
      if (dotRef.current) {
        dotRef.current.style.opacity = isHoveringRef.current
          ? String(DOT_HOVER_OPACITY)
          : "1";
      }
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [isMobile, mouseX, mouseY]);

  if (isMobile || !HAS_FINE_POINTER || REDUCED_MOTION) return null;

  return (
    <>
      {/* Ring: FM spring for trailing effect */}
      <motion.div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-40 rounded-full border border-cyan-400/50"
        style={{
          x: ringX,
          y: ringY,
          width: 28,
          height: 28,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
          transition: "opacity 0.3s ease-out",
        }}
      />
      {/* Dot: raw DOM — zero lag */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-40 h-1.5 w-1.5 rounded-full bg-cyan-400"
        style={{
          willChange: "translate, scale, opacity",
          transition:
            "scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease-out",
        }}
      />
    </>
  );
}
