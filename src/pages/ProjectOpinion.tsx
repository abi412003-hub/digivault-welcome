import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

interface CurrentProject {
  id: string;
  title: string;
  refId: string;
}

const ProjectOpinion = () => {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentProject");
    if (stored) {
      setCurrentProject(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Project Opinion</h1>
            {currentProject && (
              <p className="text-sm text-muted-foreground">{currentProject.title} • {currentProject.refId}</p>
            )}
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Project opinion feature coming soon</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProjectOpinion;
