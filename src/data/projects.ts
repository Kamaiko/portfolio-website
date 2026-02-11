export interface Project {
  id: string;
  translationKey: string;
  github: string;
  tech: string[];
  demo?: string;
  screenshots?: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: "halterofit",
    translationKey: "projects.halterofit",
    github: "https://github.com/Kamaiko/Halterofit",
    tech: ["React Native", "Expo", "TypeScript", "WatermelonDB", "Supabase", "NativeWind"],
    screenshots: [
      "/images/projects/ExerciceID.webp",
      "/images/projects/DayDetails.webp",
      "/images/projects/Overview.webp",
    ],
    featured: true,
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
