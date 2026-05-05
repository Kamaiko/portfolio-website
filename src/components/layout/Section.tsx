import type { ReactNode } from "react";
import ScrollReveal from "../ui/ScrollReveal";
import { CONTAINER_WIDTH } from "../../constants/styles";
import { cn } from "../../utils/cn";

const SECTION_PADDING = "pt-24 pb-24 px-6";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Section({ id, title, children, className }: SectionProps) {
  return (
    <section id={id} className={cn(SECTION_PADDING, className)}>
      <div className={CONTAINER_WIDTH}>
        {/* Outer: continuous CSS parallax (animation-timeline: view) | Inner: one-time entrance reveal */}
        <div className="section-title-parallax">
          <ScrollReveal>
            <h2 className="mb-12 text-3xl font-bold text-white">
              {title}
              <span className="text-cyan-400">.</span>
            </h2>
          </ScrollReveal>
        </div>
        {children}
      </div>
    </section>
  );
}
