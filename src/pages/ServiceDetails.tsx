import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedService {
  id: string;
  label: string;
}

const ServiceDetails = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedMainService");
    if (stored) {
      setSelectedService(JSON.parse(stored));
    }
  }, []);

  const handleBack = () => {
    navigate("/service-selection");
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
              Select Service Details
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Selected Service Badge */}
        {selectedService && (
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Selected Main Service
            </p>
            <p className="text-base font-semibold text-primary">
              {selectedService.label}
            </p>
          </div>
        )}

        {/* Placeholder content */}
        <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          Service details form will be implemented here
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <Button className="w-full h-12 rounded-xl font-semibold">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetails;
