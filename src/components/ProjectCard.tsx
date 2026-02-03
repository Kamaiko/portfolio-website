import { useTranslation } from "react-i18next";
import { ExternalLink, Github, Code2 } from "lucide-react";
import type { Project } from "../data/projects";
import ScreenshotFan from "./ScreenshotFan";
import ScrollReveal from "./ScrollReveal";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation();

  const projectName = t(`${project.translationKey}.name`);

  return (
    <ScrollReveal
      className={`group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.06)] hover:scale-[1.01] ${project.featured ? "md:col-span-2" : ""}`}
    >
      {/* Image / Screenshot fan */}
      {project.screenshots && project.screenshots.length === 3 ? (
        <div className="bg-slate-800/30">
          <ScreenshotFan screenshots={project.screenshots} projectName={projectName} />
        </div>
      ) : (
        <div className="relative h-48 w-full overflow-hidden bg-slate-800/30">
          {project.image ? (
            <img
              src={project.image}
              alt={projectName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Code2 size={48} className="text-slate-700" />
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {project.featured && (
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
            {t("projects.featured_badge")}
          </span>
        )}

        <h3 className="mb-2 text-xl font-semibold text-white">
          {projectName}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          {t(`${project.translationKey}.description`)}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
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
            className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
          >
            <Github size={16} />
            {t("projects.view_code")}
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              <ExternalLink size={16} />
              {t("projects.view_demo")}
            </a>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}
