import { Dumbbell, Swords, Gamepad2, Brain, Code, Rocket } from "lucide-react";

/** Tech stack items with Tailwind color-dot classes */
export const stackItems = [
  { name: "React", color: "bg-cyan-400" },
  { name: "React Native", color: "bg-cyan-400" },
  { name: "TypeScript", color: "bg-blue-500" },
  { name: "Tailwind CSS", color: "bg-sky-400" },
  { name: "Expo", color: "bg-slate-300" },
  { name: "Supabase", color: "bg-emerald-500" },
] as const;

/** Personal interests with i18n keys and Lucide icons */
export const interests = [
  { key: "fitness", icon: Dumbbell },
  { key: "chess", icon: Swords },
  { key: "gaming", icon: Gamepad2 },
] as const;

/** Journey timeline steps with i18n keys and Lucide icons */
export const journeySteps = [
  { key: "step1", icon: Brain },
  { key: "step2", icon: Code },
  { key: "step3", icon: Rocket },
] as const;
