import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

/* ═══════════════════════════════════════════════════════════════════
   Demo 5: Glow Pulse
   ═══════════════════════════════════════════════════════════════════ */

export default function GlowPulseDemo() {
  return (
    <DemoSection
      number={5}
      title="Glow Pulse"
      description="Les mots highlights ont un glow cyan qui 'respire'. 3 mots, chacun desynchro. Tres subtil."
    >
      <div className={cn(cardClass, "flex items-center")}>
        <p className="text-xl leading-relaxed text-slate-300 md:text-2xl">
          {"Diplome en "}
          <span className="glow-pulse text-cyan-400" style={{ animationDelay: "0s" }}>
            psycho
          </span>
          {", reconverti en "}
          <span className="glow-pulse text-cyan-400" style={{ animationDelay: "1.3s" }}>
            dev
          </span>
          {". Je build des apps pensees pour leurs "}
          <span className="glow-pulse text-cyan-400" style={{ animationDelay: "2.7s" }}>
            utilisateurs
          </span>
          .
        </p>
      </div>
    </DemoSection>
  );
}
