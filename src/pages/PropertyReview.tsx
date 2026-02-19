import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProperties, LocalProperty } from "@/hooks/useProperties";

const PropertyReview = () => {
  const navigate = useNavigate();
  const { getPropertiesByProject } = useProperties();

  const [currentProject, setCurrentProject] = useState<{ id: string; title: string } | null>(null);
  const [projectRefId, setProjectRefId] = useState("");
  const [currentProperty, setCurrentProperty] = useState<LocalProperty | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);

  useEffect(() => {
    // Get current project
    const projectStored = localStorage.getItem("currentProject");
    if (projectStored) {
      const project = JSON.parse(projectStored);
      setCurrentProject(project);
      
      // Get property count for this project
      const projectProperties = getPropertiesByProject(project.id);
      setPropertyCount(projectProperties.length);
    }

    // Get project reference ID
    const refId = localStorage.getItem("projectRefId");
    if (refId) {
      setProjectRefId(refId);
    }

    // Get current property
    const propertyStored = localStorage.getItem("currentProperty");
    if (propertyStored) {
      setCurrentProperty(JSON.parse(propertyStored));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    navigate("/create-property");
  };

  const handleContinueToService = () => {
    navigate("/service-selection");
  };

  const handleUploadAnother = () => {
    // Clear current property to start fresh
    localStorage.removeItem("currentProperty");
    navigate("/create-property");
  };

  const handleEditProperty = () => {
    // Navigate to create-property with edit mode (property data remains in localStorage)
    navigate("/create-property", { state: { editMode: true } });
  };

  // Helper to format value or show fallback
  const formatValue = (value: string | undefined, fallback = "—") => {
    return value?.trim() || fallback;
  };

  // Check if under BBMP (simplified logic)
  const getPanchayathiDisplay = () => {
    if (currentProperty?.pattanaPanchayathi) {
      return currentProperty.pattanaPanchayathi;
    }
    if (currentProperty?.municipalType === "MC" || currentProperty?.district?.toLowerCase().includes("bengaluru")) {
      return "Not Applicable (Under BBMP)";
    }
    return "—";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-bold text-foreground">
              {currentProject?.title || "Project"}
            </h1>
            <p className="text-sm text-muted-foreground">{projectRefId}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground text-center">
            Property Details
          </h2>
          <div className="mt-2 h-px bg-border" />
        </div>

        {/* Property Review Card */}
        <Card className="rounded-2xl shadow-sm border border-border">
          <CardContent className="p-4">
            {/* Badge and Edit Button Row */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full">
                Uploaded Property Details - {propertyCount}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditProperty}
                className="h-8 px-3 text-primary hover:text-primary/80"
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
            </div>

            {/* Property Details Grid */}
            <div className="space-y-3">
              <DetailRow 
                label="Property Type" 
                value={formatValue(currentProperty?.propertyType)} 
              />
              <DetailRow 
                label="Title" 
                value={formatValue(currentProperty?.propertyName)} 
              />
              
              {/* Address Section */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Address
                </p>
                <div className="space-y-2 pl-2 border-l-2 border-border">
                  <DetailRow 
                    label="State" 
                    value={formatValue(currentProperty?.state)} 
                  />
                  <DetailRow 
                    label="District" 
                    value={formatValue(currentProperty?.district)} 
                  />
                  <DetailRow 
                    label="Taluk" 
                    value={formatValue(currentProperty?.taluk)} 
                  />
                  <DetailRow 
                    label="Urban/Rural" 
                    value={currentProperty?.areaType === "urban" ? "Urban" : currentProperty?.areaType === "rural" ? "Rural" : "—"} 
                  />
                  <DetailRow 
                    label="Urban" 
                    value={formatValue(currentProperty?.urbanWard)} 
                  />
                  <DetailRow 
                    label="Pattana Panchayathi" 
                    value={getPanchayathiDisplay()} 
                  />
                  <DetailRow 
                    label="Door No" 
                    value={formatValue(currentProperty?.doorNo)} 
                  />
                  <DetailRow 
                    label="Building Name" 
                    value={formatValue(currentProperty?.buildingName)} 
                  />
                  <DetailRow 
                    label="Main Road" 
                    value={formatValue(currentProperty?.mainRoad)} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Buttons */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4 space-y-3">
        <Button
          onClick={handleContinueToService}
          className="w-full h-12 rounded-xl font-semibold"
        >
          Continue for the service selection
        </Button>
        <Button
          variant="secondary"
          onClick={handleUploadAnother}
          className="w-full h-12 rounded-xl font-semibold"
        >
          Upload Another Property
        </Button>
      </div>
    </div>
  );
};

// Helper component for detail rows
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default PropertyReview;
