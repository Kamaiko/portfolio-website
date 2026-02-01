import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "../data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const { t } = useTranslation();

  const techList = t(`${project.translationKey}.tech`).split(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-slate-700 ${project.featured ? "md:col-span-2" : ""}`}
    >
      {project.featured && (
        <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Featured
        </span>
      )}

      <h3 className="mb-2 text-xl font-semibold text-white">
        {t(`${project.translationKey}.name`)}
      </h3>

      <p className="mb-4 text-sm leading-relaxed text-slate-300">
        {t(`${project.translationKey}.description`)}
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {techList.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <Github size={16} />
          {t("projects.view_code")}
        </a>
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ExternalLink size={16} />
            {t("projects.view_demo")}
          </a>
        )}
      </div>
    </motion.div>
  );
}
