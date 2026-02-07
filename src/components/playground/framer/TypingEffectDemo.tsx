import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   Demo 6: Typing Effect
   ═══════════════════════════════════════════════════════════════════ */

interface CodeToken {
  text: string;
  color: string;
}

const CODE_LINES: CodeToken[][] = [
  [
    { text: "const ", color: "text-purple-400" },
    { text: "patrick", color: "text-slate-200" },
    { text: " = {", color: "text-slate-500" },
  ],
  [
    { text: '  background', color: "text-cyan-400" },
    { text: ': ', color: "text-slate-500" },
    { text: '"psycho → dev"', color: "text-emerald-400" },
    { text: ",", color: "text-slate-500" },
  ],
  [
    { text: '  fuel', color: "text-cyan-400" },
    { text: ': [', color: "text-slate-500" },
    { text: '"code"', color: "text-emerald-400" },
    { text: ", ", color: "text-slate-500" },
    { text: '"lift"', color: "text-emerald-400" },
    { text: ", ", color: "text-slate-500" },
    { text: '"chess"', color: "text-emerald-400" },
    { text: "],", color: "text-slate-500" },
  ],
  [
    { text: '  status', color: "text-cyan-400" },
    { text: ': ', color: "text-slate-500" },
    { text: '"building cool stuff"', color: "text-emerald-400" },
    { text: ",", color: "text-slate-500" },
  ],
  [
    { text: "}", color: "text-slate-500" },
    { text: " satisfies ", color: "text-purple-400" },
    { text: "Developer", color: "text-yellow-400" },
    { text: ";", color: "text-slate-500" },
  ],
];

export default function TypingEffectDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [charIndex, setCharIndex] = useState(0);

  // Flatten all characters
  const allChars: { char: string; color: string; lineIdx: number }[] = [];
  CODE_LINES.forEach((line, lineIdx) => {
    line.forEach((token) => {
      for (const char of token.text) {
        allChars.push({ char, color: token.color, lineIdx });
      }
    });
    // Add newline between lines (except last)
    if (lineIdx < CODE_LINES.length - 1) {
      allChars.push({ char: "\n", color: "", lineIdx });
    }
  });

  useEffect(() => {
    if (!isInView) return;
    if (charIndex >= allChars.length) return;
    const timer = setTimeout(
      () => setCharIndex((prev) => prev + 1),
      35,
    );
    return () => clearTimeout(timer);
  }, [isInView, charIndex, allChars.length]);

  const visibleChars = allChars.slice(0, charIndex);
  const isDone = charIndex >= allChars.length;

  return (
    <DemoSection
      number={6}
      title="Typing Effect"
      description="Code qui s'ecrit caractere par caractere avec syntax highlighting. Cursor clignotant a la fin. Se joue une seule fois."
    >
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80",
        )}
      >
        {/* Terminal header */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/30" />
          <span className="ml-2 text-xs text-slate-600 font-mono">
            patrick.ts
          </span>
        </div>
        {/* Code area */}
        <pre className="p-4 font-mono text-sm leading-relaxed">
          <code>
            {visibleChars.map((c, i) =>
              c.char === "\n" ? (
                <br key={i} />
              ) : (
                <span key={i} className={c.color}>
                  {c.char}
                </span>
              ),
            )}
            {/* Blinking cursor */}
            <span
              className={cn(
                "inline-block w-[2px] h-[1.1em] bg-cyan-400 align-text-bottom ml-px",
                isDone ? "animate-pulse" : "",
              )}
            />
          </code>
        </pre>
      </div>
    </DemoSection>
  );
}
