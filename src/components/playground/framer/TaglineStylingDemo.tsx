import { useRef } from "react";
import type { ReactNode } from "react";
import { useInView } from "framer-motion";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

const SUBTITLE_TEXT = "Je construis des produits pensés pour les utilisateurs.";

interface Variant {
  label: string;
  name: string;
  description: string;
  renderSubtitle: (text: string) => ReactNode;
}

const VARIANTS: Variant[] = [
  {
    label: "A",
    name: "Editorial hierarchy",
    description: "Smaller + font-light + spacing — 3 hierarchy signals",
    renderSubtitle: (text) => (
      <span className="mt-2 block text-base font-light text-slate-400 md:text-lg">
        {text}
      </span>
    ),
  },
  {
    label: "B",
    name: "Magazine italic",
    description: "Smaller + italic — editorial feature feel",
    renderSubtitle: (text) => (
      <span className="mt-2 block text-base italic text-slate-400/90 md:text-lg">
        {text}
      </span>
    ),
  },
  {
    label: "C",
    name: "Accent border",
    description: "Cyan left border — structured, visual anchor",
    renderSubtitle: (text) => (
      <span className="mt-3 block border-l-2 border-cyan-400/20 pl-3 text-base text-slate-400 md:text-lg">
        {text}
      </span>
    ),
  },
  {
    label: "D",
    name: "Gradient text",
    description: "Subtle gradient — modern, premium depth",
    renderSubtitle: (text) => (
      <span className="mt-2 block bg-linear-to-r from-slate-400 to-slate-500 bg-clip-text text-base text-transparent md:text-lg">
        {text}
      </span>
    ),
  },
];

function TaglinePreview({ variant }: { variant: Variant }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div className={cardClass}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-400">
          {variant.label}
        </span>
        <div>
          <span className="text-xs font-medium text-slate-300">{variant.name}</span>
          <span className="ml-2 text-xs text-slate-500">{variant.description}</span>
        </div>
      </div>
      <div
        ref={ref}
        className={cn("tagline-glow", isInView && "glow-active")}
      >
        <p className="text-xl leading-relaxed text-slate-300 md:text-2xl">
          Diplômé en{" "}
          <span className="glow-pulse text-cyan-400">psycho</span>, reconverti
          en <span className="glow-pulse text-cyan-400">dev</span>.
          {variant.renderSubtitle(SUBTITLE_TEXT)}
        </p>
      </div>
    </div>
  );
}

export default function TaglineStylingDemo() {
  return (
    <DemoSection
      number={5}
      title="Tagline Styling"
      description="4 directions for the second-line treatment. All use size reduction + spacing (the biggest win). Compare typography, accents, and gradients."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {VARIANTS.map((variant) => (
          <TaglinePreview key={variant.label} variant={variant} />
        ))}
      </div>
    </DemoSection>
  );
}
