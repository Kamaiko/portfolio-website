export interface Project {
  id: string;
  translationKey: string;
  github: string;
  tech: string[];
  demo?: string;
  image?: string;
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
      "/images/projects/ExerciceID.png",
      "/images/projects/DayDetails.png",
      "/images/projects/Overview.png",
    ],
    featured: true,
  },
  {
    id: "blundermate",
    translationKey: "projects.blundermate",
    github: "https://github.com/Kamaiko/BlunderMate-Chessbot",
    tech: ["Prolog"],
  },
  {
    id: "portfolio",
    translationKey: "projects.portfolio",
    github: "https://github.com/Kamaiko/halterofit-website",
    tech: ["React", "Vite", "TypeScript", "Tailwind CSS", "Framer Motion", "i18next"],
    demo: "https://halterofit.ca",
  },
];
