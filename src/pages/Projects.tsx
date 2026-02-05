import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [location.state]);

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
              <Card key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                {project.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                )}
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
