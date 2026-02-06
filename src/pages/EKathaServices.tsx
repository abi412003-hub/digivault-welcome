import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleBack = () => {
    navigate("/service-selection");
  };

  const handleSelectService = (service: string) => {
    setSelectedService(service);
    
    // Save selections to localStorage only - no database calls
    localStorage.setItem("selectedMainService", JSON.stringify({
      id: "e-katha",
      label: "E-katha",
    }));
    localStorage.setItem("selectedSubService", service);
    
    // Navigate directly to upload common documents - bypass everything
    navigate("/upload-common-documents");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 py-4">
        <button
          onClick={handleBack}
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
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl transition-all duration-200 min-h-[100px]",
                  isSelected
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
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
