import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { createProject, createProperty, createOrUpdateServiceRequest } from "@/lib/api";

const eKathaSubServices = [
  "New E-Katha Registration",
  "Khata Bifurcation",
  "Khata Amalgamation",
  "Khata Conversion / Update",
  "Duplicate / Re-print Khata Certificate",
  "Correction / Update Khata Details_Name Correction in Khata",
  "Correction / Update Khata Details_Property Area / Measurement",
  "Correction / Update Khata Details_Property Usage / Type Correction",
  "Use downloadable e-Khata / Khata Certificate for legal/financial/trade use_Loan / Mortgage / Financial Transactions",
  "Use downloadable e-Khata / Khata Certificate for legal/financial/trade use_Property Sale / Purchase / Transfer",
  "Correction / Update Khata Details_Property Area / Measurement / Correction Details_Property Usage / Type Correction",
  "Use downloadable e-Khata / Khata Certificate for legal/financial/trade use_Legal / Court Verification",
  "Use downloadable e-Khata / Khata Certificate for legal/financial/trade use_Trade / Business Use (Mortgage, Lease, Rent)",
  "Use downloadable e-Khata / Khata Certificate for legal/financial/trade use_Gov Schemes / Subsidy Applications",
];

const EKathaServices = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate("/service-selection");
  };

  const handleSelectService = async (service: string) => {
    setSelectedService(service);
    
    // Save selections to localStorage
    localStorage.setItem("selectedMainService", JSON.stringify({
      id: "e-katha",
      label: "E-katha",
    }));
    localStorage.setItem("selectedSubService", service);
    
    // Get project and property from localStorage
    const projectData = localStorage.getItem("currentProject");
    const propertyData = localStorage.getItem("currentProperty");

    if (!projectData || !propertyData) {
      toast({
        title: "Error",
        description: "Missing project or property information",
        variant: "destructive",
      });
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

      // Update localStorage with the real database project
      localStorage.setItem("currentProject", JSON.stringify({
        ...localProject,
        id: dbProject.id,
        prNumber: dbProject.pr_number,
      }));

      // Step 2: Create the property in the database
      const propertyResult = await createProperty(dbProject.id, {
        propertyType: localProperty.propertyType || "Apartment",
        propertyName: localProperty.propertyName || "Untitled Property",
        addressShort: localProperty.address || localProperty.addressShort,
        sizeUnit: localProperty.propertySizeUnit || localProperty.sizeUnit,
        sizeValue: localProperty.propertySize ? parseFloat(localProperty.propertySize) : (localProperty.sizeValue || undefined),
        addressFields: {
          doorNo: localProperty.doorNo,
          buildingName: localProperty.buildingName,
          crossRoad: localProperty.crossRoad,
          mainRoad: localProperty.mainRoad,
          landmark: localProperty.landmark,
          areaName: localProperty.areaName,
          state: localProperty.state,
          zone: localProperty.zone,
          district: localProperty.district,
          taluk: localProperty.taluk,
          areaType: localProperty.areaType,
          municipalType: localProperty.municipalType,
          pattanaPanchayathi: localProperty.pattanaPanchayathi,
          urbanWard: localProperty.urbanWard,
          postOffice: localProperty.postOffice,
          pincode: localProperty.pincode,
        },
        latitude: localProperty.latitude ? parseFloat(localProperty.latitude) : undefined,
        longitude: localProperty.longitude ? parseFloat(localProperty.longitude) : undefined,
      });
      const dbProperty = propertyResult.property as { id: string };

      // Update localStorage with the real database property
      localStorage.setItem("currentProperty", JSON.stringify({
        ...localProperty,
        id: dbProperty.id,
      }));

      // Step 3: Create service request with real database IDs
      const result = await createOrUpdateServiceRequest(
        dbProject.id,
        dbProperty.id,
        "E-katha",
        service
      );

      // Store service request ID for next screens
      const serviceRequest = result.serviceRequest as { id: string };
      localStorage.setItem("currentServiceRequestId", serviceRequest.id);

      toast({
        title: "Service Request Created",
        description: "Proceeding to document upload",
      });

      // Skip Required Documents and go directly to Upload Common Documents
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
      <div className="sticky top-0 z-10 bg-background px-4 py-4">
        <button
          onClick={handleBack}
          disabled={loading}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Title Bar */}
      <div className="px-4 pb-4">
        <div className="w-full py-3 px-4 rounded-lg border border-input bg-background text-center">
          <span className="text-sm text-foreground font-medium">
            Select Main Service for E-katha
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Creating service request...</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Grid of Service Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {eKathaSubServices.map((service) => {
            const isSelected = selectedService === service;

            return (
              <button
                key={service}
                onClick={() => handleSelectService(service)}
                disabled={loading}
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl transition-all duration-200 min-h-[100px]",
                  isSelected
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-xs leading-tight text-center font-medium">
                  {service}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EKathaServices;
