import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useProperties } from "@/hooks/useProperties";

interface CurrentProject {
  id: string;
  title: string;
  refId: string;
}

const ProjectDetails = () => {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const { getPropertiesByProject } = useProperties();

  useEffect(() => {
    const stored = localStorage.getItem("currentProject");
    if (stored) {
      setCurrentProject(JSON.parse(stored));
    }
  }, []);

  const properties = currentProject ? getPropertiesByProject(currentProject.id) : [];

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Project Details</h1>
            {currentProject && (
              <p className="text-sm text-muted-foreground">{currentProject.title} • {currentProject.refId}</p>
            )}
          </div>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No properties added to this project yet.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/create-property")}
              >
                Add Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <Card key={property.id} className="shadow-sm border-0">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">{property.propertyName}</h3>
                  <p className="text-sm text-muted-foreground">{property.propertyType}</p>
                  <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
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

export default ProjectDetails;
