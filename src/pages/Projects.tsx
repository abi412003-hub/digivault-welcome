import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { erpnext } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Project {
  id: string;
  title: string;
  status: string;
  client: string;
  created_at: string;
}

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "Completed": case "Approved":
      return "bg-green-100 text-green-700";
    case "In Progress": case "Assigned":
      return "bg-blue-100 text-blue-700";
    case "Pending": case "Draft":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      // Auth check
      const stored = localStorage.getItem('edv_user');
      if (!stored) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const data = await erpnext.list(
          "DigiVault Project",
          ["name", "project_name", "project_status", "client", "start_date", "creation"],
          null, 50
        );
        if (data && data.length > 0) {
          setProjects(data.map((p: any) => ({
            id: p.name,
            title: p.project_name || p.name,
            status: p.project_status || "Pending",
            client: p.client || "",
            created_at: p.creation || p.start_date || new Date().toISOString(),
          })));
        }
      } catch (e) {
        console.error("ERPNext fetch failed:", e);
        // Fallback to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem("edigivault_projects") || "[]");
          setProjects(stored.map((p: any) => ({
            id: p.id,
            title: p.title || "Untitled",
            status: p.status || "Pending",
            client: p.description || "",
            created_at: p.createdAt || new Date().toISOString(),
          })));
        } catch {}
      }
      setLoading(false);
    };

    fetchProjects();
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button size="sm" onClick={() => navigate("/projects/create")}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <Button onClick={() => navigate("/projects/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{project.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.id} {project.client ? `• ${project.client}` : ""} • {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusBadgeStyles(project.status)}`}>
                      {project.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Projects;
