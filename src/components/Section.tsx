import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function Section({ id, title, children }: SectionProps) {
  const isMobile = useIsMobile();

  return (
    <section id={id} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? "-50px" : "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-3xl font-bold text-white"
        >
          {title}
          <span className="text-cyan-400">.</span>
        </motion.h2>
        {children}
      </div>
    </section>
  );
}
