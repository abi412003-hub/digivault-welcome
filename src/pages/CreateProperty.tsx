import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateProperty = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/projects/create");
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
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Welcome to e-DigiVault
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure Access to Documents
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Property Details
          </h2>
          <div className="mt-2 h-px bg-border" />
        </div>

        {/* Placeholder content */}
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Property details form will be implemented here
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex justify-end">
          <Button className="px-8 h-12 rounded-xl font-semibold">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
