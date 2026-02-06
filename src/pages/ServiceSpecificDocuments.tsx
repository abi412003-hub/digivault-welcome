import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServiceSpecificDocuments = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  // Get selected services from localStorage
  const selectedMainService = localStorage.getItem("selectedMainService") || "No service selected";
  const selectedSubService = localStorage.getItem("selectedSubService") || "No sub-service selected";

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
              Service-Specific Documents
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-muted/30 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Selected Service:</h2>
          <p className="text-sm text-muted-foreground">{selectedMainService} - {selectedSubService}</p>
        </div>

        <div className="bg-muted/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Service-Specific Documents</h2>
          <p className="text-sm text-muted-foreground">
            Additional service-specific document requirements will be displayed here.
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={handleContinue}
          className="w-full h-12"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ServiceSpecificDocuments;
