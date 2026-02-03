import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Lock at final state after first reveal (default: true) */
  once?: boolean;
  /** Vertical offset in px to slide up from (default: 20, use 0 for opacity-only) */
  yOffset?: number;
}

export default function ScrollReveal({
  children,
  className,
  once = true,
  yOffset = 20,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  const skip = prefersReducedMotion;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: skip || isInView ? 1 : 0,
        transform: `translateY(${skip || isInView ? 0 : yOffset}px)`,
        transition: skip
          ? "none"
          : "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      {children}
    </div>
  );
}
