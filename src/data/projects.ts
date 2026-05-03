export interface Project {
  id: string;
  translationKey: string;
  github: string;
  tech: string[];
  demo?: string;
  screenshots?: string[];
  featured?: boolean;
  wordmark?: string;
}

export const projects: Project[] = [
  {
    id: "halterofit",
    translationKey: "projects.halterofit",
    github: "https://github.com/Kamaiko/halterofit-showcase",
    tech: ["React Native", "Expo", "TypeScript", "WatermelonDB", "Supabase", "Zustand"],
    screenshots: [
      "/images/projects/ExerciceID.webp",
      "/images/projects/DayDetails.webp",
      "/images/projects/ExerciceCategories.webp",
    ],
    featured: true,
    wordmark: "/images/projects/halterofit-wordmark.png",
  },
  {
    id: "aquilon",
    translationKey: "projects.aquilon",
    github: "https://github.com/Kamaiko/refuge-website",
    demo: "https://refuge-aquilon.vercel.app/",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    screenshots: ["/images/projects/hero-aquilon.avif"],
  },
  {
    id: "blundermate",
    translationKey: "projects.blundermate",
    github: "https://github.com/Kamaiko/BlunderMate-Chessbot",
    tech: ["Prolog"],
    screenshots: ["/images/projects/PARTIE_IVH.webp"],
  },
  {
    id: "chainride",
    translationKey: "projects.chainride",
    github: "https://github.com/Kamaiko/chainride",
    tech: ["Solidity", "Ethereum", "Hardhat", "React", "Vite", "Wagmi", "Tailwind CSS"],
    screenshots: ["/images/projects/ChainRide.webp"],
  },
];
