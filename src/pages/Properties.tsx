import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Bell, 
  MessageCircle, 
  FolderOpen, 
  Eye, 
  FileText, 
  CheckCircle,
  Hourglass,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import { useProjects, LocalProject } from "@/hooks/useProjects";
import { useProjectServices } from "@/hooks/useProjectServices";

const Properties = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { getStatusCountsByProject } = useProjectServices();

  const handleViewDetails = (project: LocalProject) => {
    localStorage.setItem("currentProject", JSON.stringify({
      id: project.id,
      title: project.title,
      refId: localStorage.getItem(`projectRefId_${project.id}`) || `PR-${Math.random().toString().slice(2, 8)}`
    }));
    navigate("/project-details");
  };

  const handleProjectOpinion = (project: LocalProject) => {
    localStorage.setItem("currentProject", JSON.stringify({
      id: project.id,
      title: project.title,
      refId: localStorage.getItem(`projectRefId_${project.id}`) || `PR-${Math.random().toString().slice(2, 8)}`
    }));
    navigate("/project-opinion");
  };

  const handleEFiles = (project: LocalProject) => {
    localStorage.setItem("currentProject", JSON.stringify({
      id: project.id,
      title: project.title,
      refId: localStorage.getItem(`projectRefId_${project.id}`) || `PR-${Math.random().toString().slice(2, 8)}`
    }));
    navigate("/e-files");
  };

  const getProjectRefId = (projectId: string): string => {
    const storedRefId = localStorage.getItem(`projectRefId_${projectId}`);
    if (storedRefId) return storedRefId;
    
    // Generate and store a new one if not exists
    const newRefId = `PR-${Math.random().toString().slice(2, 8)}`;
    localStorage.setItem(`projectRefId_${projectId}`, newRefId);
    return newRefId;
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5 text-primary" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Select Project Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Select Project</span>
          </div>
          <Button 
            onClick={() => navigate("/projects/create")}
            className="bg-primary hover:bg-primary/90"
          >
            Add Project
          </Button>
        </div>

        {/* Project Cards */}
        {projects.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No projects yet. Create your first project!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const statusCounts = getStatusCountsByProject(project.id);
              const refId = getProjectRefId(project.id);

              return (
                <Card key={project.id} className="shadow-sm border border-border overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    {/* Project Header */}
                    <div className="text-center border-l-4 border-primary pl-4 -ml-4">
                      <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{refId}</p>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                        onClick={() => handleViewDetails(project)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View details
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                        onClick={() => handleProjectOpinion(project)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Project opinion
                      </Button>
                    </div>

                    {/* E-Files Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 hover:opacity-90 text-white font-medium"
                      onClick={() => handleEFiles(project)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      e-files
                    </Button>

                    {/* Status Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-100 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <span className="text-lg font-bold text-green-700">{statusCounts.completed}</span>
                          <p className="text-xs text-green-600">Completed</p>
                        </div>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3 flex items-center gap-2">
                        <Hourglass className="h-5 w-5 text-blue-600" />
                        <div>
                          <span className="text-lg font-bold text-blue-700">{statusCounts.ongoing}</span>
                          <p className="text-xs text-blue-600">Ongoing</p>
                        </div>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <div>
                          <span className="text-lg font-bold text-orange-600">{statusCounts.pending}</span>
                          <p className="text-xs text-orange-500">Pending</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Properties;
