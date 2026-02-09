import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import DemoSection from "../DemoSection";
import { INVIEW_MARGIN } from "../../../constants/layout";

/* ═══════════════════════════════════════════════════════════════════
   Demo 9: Creative Zone — Terminal variant
   ═══════════════════════════════════════════════════════════════════ */

const TERMINAL_LINES = [
  { prompt: true, text: "npx patrick --about" },
  { prompt: false, text: "> fullstack dev from QC" },
  { prompt: false, text: "> powered by TypeScript & cafe" },
  { prompt: false, text: "> shipping since day one" },
];

export default function CreativeZoneDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: INVIEW_MARGIN });
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!isInView) return;
    if (lineIdx >= TERMINAL_LINES.length) return;

    const currentLine = TERMINAL_LINES[lineIdx];
    const prefix = currentLine.prompt ? "$ " : "";
    const fullText = prefix + currentLine.text;

    if (charIdx < fullText.length) {
      const speed = currentLine.prompt ? 40 : 25;
      const timer = setTimeout(() => setCharIdx((prev) => prev + 1), speed);
      return () => clearTimeout(timer);
    }
    // Line done — commit it and move to next
    const timer = setTimeout(() => {
      setLines((prev) => [...prev, fullText]);
      setLineIdx((prev) => prev + 1);
      setCharIdx(0);
    }, currentLine.prompt ? 300 : 150);
    return () => clearTimeout(timer);
  }, [isInView, lineIdx, charIdx]);

  const currentLine = lineIdx < TERMINAL_LINES.length ? TERMINAL_LINES[lineIdx] : null;
  const currentPrefix = currentLine?.prompt ? "$ " : "";
  const currentFullText = currentLine ? currentPrefix + currentLine.text : "";
  const partialText = currentFullText.slice(0, charIdx);
  const isDone = lineIdx >= TERMINAL_LINES.length;

  return (
    <DemoSection
      number={4}
      title="Creative Zone — Terminal"
      description="Mini terminal avec typing anime. Une option pour le bloc fun/snippet. Se joue une seule fois."
    >
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/30" />
          <span className="ml-2 text-xs text-slate-600 font-mono">
            terminal
          </span>
        </div>
        <div className="p-4 font-mono text-sm leading-relaxed min-h-[120px]">
          {/* Completed lines */}
          {lines.map((line, i) => (
            <div key={i}>
              {line.startsWith("$ ") ? (
                <>
                  <span className="text-emerald-400">$ </span>
                  <span className="text-slate-300">{line.slice(2)}</span>
                </>
              ) : (
                <span className="text-slate-400">{line}</span>
              )}
            </div>
          ))}
          {/* Current line being typed */}
          {currentLine && (
            <div>
              {currentLine.prompt ? (
                <>
                  <span className="text-emerald-400">
                    {partialText.slice(0, 2)}
                  </span>
                  <span className="text-slate-300">
                    {partialText.slice(2)}
                  </span>
                </>
              ) : (
                <span className="text-slate-400">{partialText}</span>
              )}
              <span className="inline-block w-[2px] h-[1.1em] bg-cyan-400 align-text-bottom ml-px animate-pulse" />
            </div>
          )}
          {/* Final cursor */}
          {isDone && (
            <div>
              <span className="text-emerald-400">$ </span>
              <span className="inline-block w-[2px] h-[1.1em] bg-cyan-400 align-text-bottom ml-px animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </DemoSection>
  );
}
