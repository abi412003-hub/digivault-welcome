import { useState, useEffect } from "react";
import { erpnext } from "@/lib/api";
import { useLocalStorage } from "./useLocalStorage";

export interface LocalProject {
  id: string;
  title: string;
  description: string | null;
  status?: string;
  createdAt: string;
}

const PROJECTS_KEY = "edigivault_projects";

export function useProjects() {
  const [localProjects, setLocalProjects] = useLocalStorage<LocalProject[]>(PROJECTS_KEY, []);
  const [projects, setProjects] = useState<LocalProject[]>(localProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFromERPNext = async () => {
      try {
        const data = await erpnext.list(
          "DigiVault Project",
          ["name", "project_name", "project_status", "client", "start_date", "creation"],
          null, 50
        );
        if (data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.name,
            title: p.project_name || p.name,
            description: p.client || null,
            status: p.project_status,
            createdAt: p.creation || p.start_date || new Date().toISOString(),
          }));
          setProjects(mapped);
        } else {
          setProjects(localProjects);
        }
      } catch {
        setProjects(localProjects);
      }
      setLoading(false);
    };
    fetchFromERPNext();
  }, []);

  const addProject = (project: Omit<LocalProject, "id" | "createdAt">) => {
    const newProject: LocalProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newProject, ...localProjects];
    setLocalProjects(updated);
    setProjects(updated);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Omit<LocalProject, "id" | "createdAt">>) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return {
    projects,
    projectCount: projects.length,
    loading,
    addProject,
    updateProject,
    deleteProject,
  };
}
