import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { cn } from "../../utils/cn";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/** Radius (px) of the inner spotlight gradient */
const SPOTLIGHT_RADIUS = 200;
/** Radius (px) of the outer border-glow gradient */
const BORDER_GLOW_RADIUS = 400;

// ── Gradient color & stops ──
const CYAN_400_RGB = "34,211,238";
const SPOTLIGHT_OPACITY = 0.04;
const SPOTLIGHT_STOP = "70%";

// ── Shared spotlight layer classes ──
const SPOTLIGHT_LAYER_BASE =
  "pointer-events-none absolute rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100";

export default function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isMobile = useIsMobile();

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(${SPOTLIGHT_RADIUS}px circle at ${x}px ${y}px, rgba(${CYAN_400_RGB},${SPOTLIGHT_OPACITY}), transparent ${SPOTLIGHT_STOP})`,
  );

  const borderGlow = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(${BORDER_GLOW_RADIUS}px circle at ${x}px ${y}px, rgba(${CYAN_400_RGB},${SPOTLIGHT_OPACITY}), transparent ${SPOTLIGHT_STOP})`,
  );

  // Mobile: no spotlight, just render the card
  if (isMobile) {
    return <div className={cn("h-full", className)}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("group relative h-full overflow-hidden", className)}
    >
      {children}
      {/* Border glow — sits behind the border, bleeding outside by 1px */}
      <motion.div
        className={cn(SPOTLIGHT_LAYER_BASE, "-inset-px")}
        style={{ background: borderGlow }}
      />
      {/* Inner spotlight — soft radial fill inside the card */}
      <motion.div
        className={cn(SPOTLIGHT_LAYER_BASE, "inset-0")}
        style={{ background: spotlightBg }}
      />
    </div>
  );
}
