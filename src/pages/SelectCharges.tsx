import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const CHARGE_TYPES = [
  {
    id: "basic-legal",
    label: "Basic Investigation / Legal Charges",
    shortLabel: "Basic Investigation / Legal Charges",
    route: "/basic-charges",
  },
  {
    id: "estimated",
    label: "Estimated Charge",
    shortLabel: "Estimated Charge",
    route: "/estimated-charges",
  },
  {
    id: "gov-fees",
    label: "Gov Fees",
    shortLabel: "Gov Fees",
    route: "/gov-fees",
  },
];

const SelectCharges = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceRequestId = searchParams.get("serviceRequestId");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ServiceRequestData | null>(null);

  // Get serviceRequestId from URL or localStorage
  const resolvedServiceRequestId = serviceRequestId || localStorage.getItem("submittedServiceRequestId");

  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedServiceRequestId) {
        // No redirect - just show empty state
        setLoading(false);
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
        // Don't redirect, just show with empty data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedServiceRequestId, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChargeSelect = (chargeType: typeof CHARGE_TYPES[0]) => {
    // Save selected charge type
    localStorage.setItem("selectedChargeType", chargeType.id);
    localStorage.setItem("chargesServiceRequestId", resolvedServiceRequestId || "");
    
    // Navigate to charge details screen
    navigate(`${chargeType.route}?serviceRequestId=${resolvedServiceRequestId}`);
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
      <div className="flex-1 px-4 pb-6">
        {/* Summary Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
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

        {/* Charge Type Buttons */}
        <div className="flex flex-wrap gap-3">
          {CHARGE_TYPES.map((chargeType) => (
            <button
              key={chargeType.id}
              onClick={() => handleChargeSelect(chargeType)}
              className="flex-1 min-w-[100px] bg-primary text-primary-foreground rounded-xl py-4 px-3 text-center hover:bg-primary/90 transition-colors"
            >
              <span className="text-xs font-medium leading-tight">
                {chargeType.shortLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectCharges;