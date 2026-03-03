import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { createProject, createProperty, createOrUpdateServiceRequest } from "@/lib/api";

const RequiredDocuments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Read from localStorage (set by ServiceDetails or EKathaServices)
  const mainServiceData = localStorage.getItem("selectedMainService");
  const selectedMainServiceGroup = mainServiceData ? JSON.parse(mainServiceData).label : "No service selected";
  const selectedMainServiceName = localStorage.getItem("selectedServiceMainName") || selectedMainServiceGroup;
  const selectedSubService = localStorage.getItem("selectedSubService") || "No sub-service selected";

  // Get the real required documents list
  let requiredDocs: string[] = [];
  try {
    const stored = localStorage.getItem("selectedRequiredDocs");
    if (stored) requiredDocs = JSON.parse(stored);
  } catch {
    // fallback
  }

  // If no docs from new flow, use legacy defaults
  if (requiredDocs.length === 0) {
    const LEGACY_DOCS: Record<string, string[]> = {
      "New E-Katha Registration": ["Pan Card", "Aadhar Card", "Birth Certificate", "Sale Deed", "Land Deed"],
      "Khata Bifurcation": ["Pan Card", "Aadhar Card", "Existing Khata", "Property Documents", "NOC from Co-owners"],
      default: ["Pan Card", "Aadhar Card", "Birth Certificate", "Sale Deed", "Land Deed"],
    };
    requiredDocs = LEGACY_DOCS[selectedSubService] || LEGACY_DOCS.default;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = async () => {
    const projectData = localStorage.getItem("currentProject");
    const propertyData = localStorage.getItem("currentProperty");

    if (!projectData || !propertyData) {
      toast({ title: "Error", description: "Missing project or property information", variant: "destructive" });
      return;
    }

    const localProject = JSON.parse(projectData);
    const localProperty = JSON.parse(propertyData);

    setLoading(true);
    try {
      // Step 1: Create the project in the database
      const projectResult = await createProject(
        localProject.title || "Untitled Project",
        localProject.description || ""
      );
      const dbProject = projectResult.project as { id: string; pr_number: string };

      localStorage.setItem("currentProject", JSON.stringify({
        ...localProject, id: dbProject.id, prNumber: dbProject.pr_number,
      }));

      // Step 2: Create the property
      const propertyResult = await createProperty(dbProject.id, {
        propertyType: localProperty.propertyType || "Apartment",
        propertyName: localProperty.propertyName || "Untitled Property",
        addressShort: localProperty.address || localProperty.addressShort,
        sizeUnit: localProperty.propertySizeUnit || localProperty.sizeUnit,
        sizeValue: localProperty.propertySize ? parseFloat(localProperty.propertySize) : (localProperty.sizeValue || undefined),
        addressFields: {
          doorNo: localProperty.doorNo, buildingName: localProperty.buildingName,
          crossRoad: localProperty.crossRoad, mainRoad: localProperty.mainRoad,
          landmark: localProperty.landmark, areaName: localProperty.areaName,
          state: localProperty.state, zone: localProperty.zone,
          district: localProperty.district, taluk: localProperty.taluk,
          areaType: localProperty.areaType, municipalType: localProperty.municipalType,
          pattanaPanchayathi: localProperty.pattanaPanchayathi,
          urbanWard: localProperty.urbanWard,
          postOffice: localProperty.postOffice, pincode: localProperty.pincode,
        },
        latitude: localProperty.latitude ? parseFloat(localProperty.latitude) : undefined,
        longitude: localProperty.longitude ? parseFloat(localProperty.longitude) : undefined,
      });
      const dbProperty = propertyResult.property as { id: string };

      localStorage.setItem("currentProperty", JSON.stringify({
        ...localProperty, id: dbProperty.id,
      }));

      // Step 3: Create service request
      const result = await createOrUpdateServiceRequest(
        dbProject.id,
        dbProperty.id,
        selectedMainServiceGroup,
        selectedSubService !== "No sub-service selected" ? selectedSubService : undefined
      );

      const serviceRequest = result.serviceRequest as { id: string };
      localStorage.setItem("currentServiceRequestId", serviceRequest.id);

      toast({ title: "Service Request Created", description: "Proceeding to document upload" });
      navigate("/upload-common-documents");
    } catch (error) {
      console.error("Error creating service request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create service request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-lg font-bold text-foreground">Required Documents</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Service Summary */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Selected Service</h2>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Service Group</span>
              <span className="text-sm font-medium text-foreground">{selectedMainServiceGroup}</span>
            </div>
            {selectedMainServiceName !== selectedMainServiceGroup && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Main Service</span>
                <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                  {selectedMainServiceName}
                </span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Sub Service</span>
              <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                {selectedSubService}
              </span>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-primary/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Documents Required ({requiredDocs.length})
            </h2>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {requiredDocs.map((doc, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-4 border-t border-border">
        <Button onClick={handleContinue} disabled={loading} className="w-full h-12 rounded-xl font-semibold">
          {loading ? "Creating..." : "Continue to Upload"}
        </Button>
      </div>
    </div>
  );
};

export default RequiredDocuments;
