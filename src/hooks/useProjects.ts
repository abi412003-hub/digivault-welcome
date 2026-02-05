import { useLocalStorage } from "./useLocalStorage";

export interface LocalProject {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

const PROJECTS_KEY = "edigivault_projects";

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<LocalProject[]>(PROJECTS_KEY, []);

  const addProject = (project: Omit<LocalProject, "id" | "createdAt">) => {
    const newProject: LocalProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Omit<LocalProject, "id" | "createdAt">>) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return {
    projects,
    projectCount: projects.length,
    addProject,
    updateProject,
    deleteProject,
  };
}
