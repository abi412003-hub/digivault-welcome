import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const CHARGE_TYPES = [
  {
    id: "basic-legal",
    label: "Basic Investigation / Legal Charges",
    route: "/basic-charges",
  },
  {
    id: "estimated",
    label: "Estimated Charge",
    route: "/estimated-charges",
  },
  {
    id: "gov-fees",
    label: "Gov Fees",
    route: "/gov-fees",
  },
];

const SelectCharges = () => {
  const navigate = useNavigate();

  // Read from localStorage
  const mainServiceData = localStorage.getItem("selectedMainService");
  const selectedMainService = mainServiceData ? JSON.parse(mainServiceData).label : "E-katha";
  const selectedSubService = localStorage.getItem("selectedSubService") || "New E-Katha Registration";

  const projectData = JSON.parse(localStorage.getItem("currentProject") || "{}");
  const propertyData = JSON.parse(localStorage.getItem("currentProperty") || "{}");

  const projectId = projectData.prNumber || projectData.pr_number || "PR-784516";
  const propertyTitle = propertyData.propertyName || propertyData.property_name || "Ashwini Villa";

  const handleChargeSelect = (chargeType: typeof CHARGE_TYPES[0]) => {
    localStorage.setItem("selectedChargeType", chargeType.id);
    navigate(chargeType.route);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-foreground -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6">
        {/* Summary Card */}
        <div className="rounded-2xl border border-border overflow-hidden mb-8">
          <div className="bg-primary py-3 px-4">
            <h2 className="text-base font-semibold text-primary-foreground text-center">
              Select Charges
            </h2>
          </div>
          <div className="bg-card p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">Project ID</span>
              <span className="text-sm text-foreground">{projectId}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">Property Title</span>
              <span className="text-sm text-foreground text-right max-w-[55%]">{propertyTitle}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">Main Service</span>
              <span className="text-sm text-foreground text-right max-w-[55%]">{selectedMainService}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">Sub Service</span>
              <span className="text-sm text-foreground text-right max-w-[55%]">{selectedSubService}</span>
            </div>
          </div>
        </div>

        {/* Charge Type Buttons */}
        <div className="flex gap-3">
          {CHARGE_TYPES.map((chargeType) => (
            <button
              key={chargeType.id}
              onClick={() => handleChargeSelect(chargeType)}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-4 px-3 text-center hover:bg-primary/90 transition-colors"
            >
              <span className="text-xs font-semibold leading-tight">
                {chargeType.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectCharges;
