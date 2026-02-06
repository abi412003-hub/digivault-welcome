import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useProjectServices } from "@/hooks/useProjectServices";

interface CurrentProject {
  id: string;
  title: string;
  refId: string;
}

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Ongoing":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "Pending":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    default:
      return "";
  }
};

const EFiles = () => {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const { getServicesByProject } = useProjectServices();

  useEffect(() => {
    const stored = localStorage.getItem("currentProject");
    if (stored) {
      setCurrentProject(JSON.parse(stored));
    }
  }, []);

  const services = currentProject ? getServicesByProject(currentProject.id) : [];

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">e-Files</h1>
            {currentProject && (
              <p className="text-sm text-muted-foreground">{currentProject.title} • {currentProject.refId}</p>
            )}
          </div>
        </div>

        {/* Services/Documents List */}
        {services.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No services or documents added yet.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/service-selection")}
              >
                Add Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.id} className="shadow-sm border-0">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{service.serviceName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeStyles(service.status)}>
                    {service.status}
                  </Badge>
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

export default EFiles;
