import { useTranslation } from "react-i18next";
import Section from "../layout/Section";
import ProjectCard from "../ui/ProjectCard";
import { projects } from "../../data/projects";

export default function Projects() {
  const { t } = useTranslation();

  return (
    <Section id="projects" title={t("projects.title")}>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
  );
}
