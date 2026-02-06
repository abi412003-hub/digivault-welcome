import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceRequestId = searchParams.get("serviceRequestId");
  const chargeType = searchParams.get("chargeType");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSimulatePayment = () => {
    if (serviceRequestId) {
      localStorage.setItem(`paymentStatus_${serviceRequestId}`, "paid");
    }
    toast.success("Payment completed successfully!");
    navigate("/dashboard");
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
              Payment
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
        <div className="bg-muted/30 rounded-xl p-8 text-center max-w-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Payment Integration Coming Soon
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Payment gateway integration will be available in a future update.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleSimulatePayment}
              className="w-full"
            >
              Simulate Successful Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
