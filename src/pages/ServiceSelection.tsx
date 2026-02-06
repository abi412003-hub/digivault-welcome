import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  FileText,
  Map,
  Home,
  FileSearch,
  RefreshCw,
  Replace,
  Gift,
  Grid3X3,
  ClipboardCheck,
  FileEdit,
  ShieldCheck,
  Landmark,
  Building2,
  Scissors,
  Zap,
  Droplets,
  Factory,
  Ruler,
  Building,
  Scale,
  MessageSquare,
  Briefcase,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

const serviceOptions: ServiceOption[] = [
  { id: "record-room", label: "Record Room Documents", icon: FileText },
  { id: "survey", label: "Survey Documents", icon: Map },
  { id: "e-katha", label: "E-katha", icon: Home },
  { id: "property-id", label: "Property Identification Documents", icon: FileSearch },
  { id: "conversion", label: "Conversion of Land", icon: RefreshCw },
  { id: "change-land", label: "Change of Land", icon: Replace },
  { id: "land-grants", label: "Land Grants", icon: Gift },
  { id: "podi-durastthu", label: "Podi and Durastthu", icon: Grid3X3 },
  { id: "plan-approved", label: "Plan Approved", icon: ClipboardCheck },
  { id: "amendments", label: "Ammendments", icon: FileEdit },
  { id: "noc", label: "No Objection Certificate", icon: ShieldCheck },
  { id: "land-acquisitions", label: "Land Acquisitions", icon: Landmark },
  { id: "land-allotments", label: "Land Allotments", icon: Building2 },
  { id: "property-bifurcation", label: "Property Bifurcation", icon: Scissors },
  { id: "electricity", label: "Electricity Board Approvals", icon: Zap },
  { id: "water-supply", label: "Water Supply Board Approvals", icon: Droplets },
  { id: "pollution", label: "Pollution Control Board Approvals", icon: Factory },
  { id: "land-assessment", label: "Land Assessment, Survey & Property Valuations", icon: Ruler },
  { id: "local-authority", label: "Local Authority Services", icon: Building },
  { id: "legal", label: "Legal Documents", icon: Scale },
  { id: "third-party", label: "Third Party Opinion", icon: MessageSquare },
  { id: "business", label: "Business Records", icon: Briefcase },
  { id: "personal", label: "Personal Record", icon: User },
];

const ServiceSelection = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleBack = () => {
    navigate("/property-review");
  };

  const handleSelectService = (service: ServiceOption) => {
    setSelectedService(service.id);
    // Store in localStorage for next screen
    localStorage.setItem("selectedMainService", JSON.stringify({
      id: service.id,
      label: service.label,
    }));
    // Navigate to service details after short delay for visual feedback
    setTimeout(() => {
      navigate("/service-details");
    }, 200);
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
              Select Main Service
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Grid of Service Tiles */}
        <div className="grid grid-cols-3 gap-3">
          {serviceOptions.map((service) => {
            const isSelected = selectedService === service.id;
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 aspect-square",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-7 h-7 mb-2",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] leading-tight text-center font-medium line-clamp-3",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
