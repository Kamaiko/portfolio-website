import type { ReactNode } from "react";
import ScrollReveal from "./ScrollReveal";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <h2 className="mb-12 text-3xl font-bold text-white">
            {title}
            <span className="text-cyan-400">.</span>
          </h2>
        </ScrollReveal>
        {children}
      </div>
    </section>
  );
}
