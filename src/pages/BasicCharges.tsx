import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceRequestData {
  id: string;
  main_service: string;
  sub_service: string | null;
  project: {
    id: string;
    pr_number: string | null;
    title: string;
  };
  property: {
    id: string;
    property_name: string;
  };
}

const BasicCharges = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceRequestId = searchParams.get("serviceRequestId");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ServiceRequestData | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Get serviceRequestId from URL or localStorage
  const resolvedServiceRequestId = serviceRequestId || localStorage.getItem("chargesServiceRequestId");

  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedServiceRequestId) {
        navigate("/select-charges");
        return;
      }

      try {
        // Fetch service request with project and property details
        const { data: srData, error: srError } = await supabase
          .from("service_requests")
          .select(`
            id,
            main_service,
            sub_service,
            project_id,
            property_id
          `)
          .eq("id", resolvedServiceRequestId)
          .single();

        if (srError) throw srError;

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("id, pr_number, title")
          .eq("id", srData.project_id)
          .single();

        if (projectError) throw projectError;

        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select("id, property_name")
          .eq("id", srData.property_id)
          .single();

        if (propertyError) throw propertyError;

        setData({
          id: srData.id,
          main_service: srData.main_service,
          sub_service: srData.sub_service,
          project: projectData,
          property: propertyData,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/select-charges");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedServiceRequestId, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePayNow = async () => {
    if (!consentAccepted) return;
    
    setProcessing(true);
    
    // Store consent and payment stage in localStorage for now
    localStorage.setItem(`chargesConsent_${resolvedServiceRequestId}`, "true");
    localStorage.setItem(`paymentStage_${resolvedServiceRequestId}`, "gap_analysis");
    localStorage.setItem(`paymentStatus_${resolvedServiceRequestId}`, "initiated");
    
    // Navigate to payment screen (placeholder for now)
    navigate(`/payment?serviceRequestId=${resolvedServiceRequestId}&chargeType=basic-legal`);
  };

  const handleSimulateSuccess = () => {
    localStorage.setItem(`paymentStatus_${resolvedServiceRequestId}`, "paid");
    toast.success("Payment simulated successfully!");
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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

      {/* Content */}
      <div className="flex-1 px-4 pb-6 flex flex-col">
        {/* Summary Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          {/* Card Header */}
          <div className="bg-primary/10 py-3 px-4">
            <h2 className="text-base font-semibold text-foreground text-center">
              Select Charges
            </h2>
          </div>
          
          {/* Card Content */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Project ID</span>
              <span className="text-sm text-muted-foreground text-right">
                {data?.project.pr_number || data?.project.id.slice(0, 8) || "—"}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Property Title</span>
              <span className="text-sm text-muted-foreground text-right max-w-[55%]">
                {data?.property.property_name || "—"}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Main Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[55%]">
                {data?.main_service || "—"}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Sub Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[55%]">
                {data?.sub_service || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Charge Type Banner */}
        <div className="bg-primary text-primary-foreground rounded-xl py-4 px-6 text-center mb-8">
          <span className="text-sm font-semibold">
            Basic Investigation /<br />Legal Charges
          </span>
        </div>

        {/* Consent Section */}
        <div className="space-y-4 mb-8">
          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms-consent"
              checked={consentAccepted}
              onCheckedChange={(checked) => setConsentAccepted(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-consent"
              className="text-sm text-foreground cursor-pointer"
            >
              click here to accept Terms & Conditions
            </label>
          </div>

          {/* Terms Text */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            By signing in, creating an account I am agreeing to e-DigiVault{" "}
            <button
              onClick={() => navigate("/terms")}
              className="text-primary hover:underline"
            >
              Terms & Conditions
            </button>{" "}
            and to our{" "}
            <button
              onClick={() => navigate("/privacy")}
              className="text-primary hover:underline"
            >
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Pay Now Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handlePayNow}
            disabled={!consentAccepted || processing}
            className="px-12 py-6 text-base font-semibold rounded-xl"
          >
            {processing ? "Processing..." : "Pay Now"}
          </Button>

          {/* Demo: Simulate Success Button */}
          <Button
            variant="outline"
            onClick={handleSimulateSuccess}
            className="text-sm"
          >
            Simulate Success (Demo)
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Note Text */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          This Amount is Generated Based on Your Service Selection only For Gap Analysis.
        </p>
      </div>
    </div>
  );
};

export default BasicCharges;
