import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import ScrollReveal from "../ui/ScrollReveal";
import { cn } from "../../utils/cn";

const TITLE_PARALLAX_PX = 40;

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Section({ id, title, children, className }: SectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const skip = !!prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Title floats: moves 20px slower than natural scroll
  const titleY = useTransform(
    scrollYProgress,
    [0, 1],
    [TITLE_PARALLAX_PX, -TITLE_PARALLAX_PX],
  );

  return (
    <section ref={sectionRef} id={id} className={cn("pt-24 pb-24 px-6", className)}>
      <div className="mx-auto max-w-5xl">
        {/* Outer: continuous parallax | Inner: one-time entrance reveal */}
        <motion.div style={skip ? undefined : { y: titleY }}>
          <ScrollReveal>
            <h2 className="mb-12 text-3xl font-bold text-white">
              {title}
              <span className="text-cyan-400">.</span>
            </h2>
          </ScrollReveal>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
