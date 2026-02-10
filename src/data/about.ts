import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import ChessPawn from "lucide-react/dist/esm/icons/chess-pawn";
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2";
import Brain from "lucide-react/dist/esm/icons/brain";
import Code from "lucide-react/dist/esm/icons/code";
/** Tech stack items with Tailwind color-dot classes */
export const stackItems = [
  { name: "React", color: "bg-cyan-400" },
  { name: "React Native", color: "bg-cyan-400" },
  { name: "TypeScript", color: "bg-blue-500" },
  { name: "Tailwind CSS", color: "bg-sky-400" },
  { name: "Expo", color: "bg-slate-300" },
  { name: "Supabase", color: "bg-emerald-500" },
  { name: "Vite", color: "bg-violet-400" },
  { name: "Node.js", color: "bg-green-500" },
] as const;

/** Personal interests with i18n keys and Lucide icons */
export const interests = [
  { key: "fitness", icon: Dumbbell },
  { key: "chess", icon: ChessPawn },
  { key: "gaming", icon: Gamepad2 },
] as const;

/** Journey timeline steps with i18n keys and Lucide icons */
export const journeySteps = [
  { key: "step2", icon: Code, current: true },
  { key: "step1", icon: Brain },
] as const;

/** Syntax-highlighted code token for the typing snippet */
export interface CodeToken {
  text: string;
  color: string;
}


/** Typing snippet — assert grind (syntax-highlighted token lines) */
export const SNIPPET_LINES: CodeToken[][] = [
  [
    { text: "function ", color: "text-violet-400" },
    { text: "assert", color: "text-blue-400" },
    { text: "(", color: "text-slate-500" },
  ],
  [
    { text: "  dev", color: "text-slate-200" },
    { text: ": ", color: "text-slate-500" },
    { text: "Junior", color: "text-cyan-400" },
  ],
  [
    { text: "): ", color: "text-slate-500" },
    { text: "asserts ", color: "text-violet-400" },
    { text: "dev", color: "text-slate-200" },
    { text: " is ", color: "text-violet-400" },
    { text: "Senior", color: "text-cyan-400" },
    { text: " {", color: "text-slate-500" },
  ],
  [
    { text: "  let ", color: "text-violet-400" },
    { text: "h", color: "text-slate-200" },
    { text: " = ", color: "text-slate-500" },
    { text: "0", color: "text-orange-400" },
    { text: ";", color: "text-slate-500" },
  ],
  [
    { text: "  while ", color: "text-violet-400" },
    { text: "(", color: "text-slate-500" },
    { text: "h", color: "text-slate-200" },
    { text: " < ", color: "text-slate-500" },
    { text: "10_000", color: "text-orange-400" },
    { text: ") ", color: "text-slate-500" },
    { text: "h", color: "text-slate-200" },
    { text: " += ", color: "text-slate-500" },
    { text: "grind", color: "text-blue-400" },
    { text: "();", color: "text-slate-500" },
  ],
  [
    { text: "  // clean as you code", color: "text-slate-500" },
  ],
  [
    { text: "}", color: "text-slate-500" },
  ],
];
