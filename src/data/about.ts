import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import ChessPawn from "lucide-react/dist/esm/icons/chess-pawn";
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2";
import Brain from "lucide-react/dist/esm/icons/brain";
import Code from "lucide-react/dist/esm/icons/code";
import Rocket from "lucide-react/dist/esm/icons/rocket";

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
  { key: "step1", icon: Brain },
  { key: "step2", icon: Code },
  { key: "step3", icon: Rocket },
] as const;
