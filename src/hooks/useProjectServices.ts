import { useLocalStorage } from "./useLocalStorage";

export interface ProjectService {
  id: string;
  projectId: string;
  serviceId: string;
  serviceName: string;
  status: "Completed" | "Ongoing" | "Pending";
  createdAt: string;
}

const SERVICES_KEY = "edigivault_project_services";

export function useProjectServices() {
  const [services, setServices] = useLocalStorage<ProjectService[]>(SERVICES_KEY, []);

  const addService = (service: Omit<ProjectService, "id" | "createdAt">) => {
    const newService: ProjectService = {
      ...service,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setServices([newService, ...services]);
    return newService;
  };

  const getServicesByProject = (projectId: string) => {
    return services.filter((s) => s.projectId === projectId);
  };

  const getStatusCountsByProject = (projectId: string) => {
    const projectServices = services.filter((s) => s.projectId === projectId);
    return {
      completed: projectServices.filter((s) => s.status === "Completed").length,
      ongoing: projectServices.filter((s) => s.status === "Ongoing").length,
      pending: projectServices.filter((s) => s.status === "Pending").length,
    };
  };

  const updateService = (id: string, updates: Partial<Omit<ProjectService, "id" | "createdAt">>) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  return {
    services,
    addService,
    getServicesByProject,
    getStatusCountsByProject,
    updateService,
    deleteService,
  };
}
