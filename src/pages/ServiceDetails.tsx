import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, FileText, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SERVICE_ID_TO_GROUP,
  getMainServices,
  getSubServices,
  getRequiredDocuments,
} from "@/data/servicesData";

interface SelectedService {
  id: string;
  label: string;
}

const ServiceDetails = () => {
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [mainServices, setMainServices] = useState<string[]>([]);
  const [selectedMainService, setSelectedMainService] = useState<string>("");
  const [subServices, setSubServices] = useState<string[]>([]);
  const [selectedSubService, setSelectedSubService] = useState<string>("");
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);

  // Load the selected service group from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("selectedMainService");
    if (stored) {
      const svc: SelectedService = JSON.parse(stored);
      setSelectedService(svc);

      const group = SERVICE_ID_TO_GROUP[svc.id];
      if (group) {
        setGroupName(group);
        setMainServices(getMainServices(group));
      }
    }
  }, []);

  // When main service changes, load sub services
  useEffect(() => {
    if (groupName && selectedMainService) {
      const subs = getSubServices(groupName, selectedMainService);
      setSubServices(subs);
      setSelectedSubService("");
      setRequiredDocs([]);
      setCheckedDocs({});
    }
  }, [groupName, selectedMainService]);

  // When sub service changes, load required documents
  useEffect(() => {
    if (groupName && selectedMainService && selectedSubService) {
      const docs = getRequiredDocuments(groupName, selectedMainService, selectedSubService);
      setRequiredDocs(docs);
      const initial: Record<string, boolean> = {};
      docs.forEach((d) => (initial[d] = false));
      setCheckedDocs(initial);
    }
  }, [groupName, selectedMainService, selectedSubService]);

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
  const allChecked = requiredDocs.length > 0 && checkedCount === requiredDocs.length;

  const handleBack = () => {
    navigate("/service-selection");
  };

  const handleContinue = () => {
    localStorage.setItem(
      "selectedMainService",
      JSON.stringify({ id: selectedService?.id || "", label: selectedService?.label || "" })
    );
    localStorage.setItem("selectedServiceMainName", selectedMainService);
    localStorage.setItem("selectedSubService", selectedSubService);
    localStorage.setItem("selectedRequiredDocs", JSON.stringify(requiredDocs));
    localStorage.setItem("checkedDocs", JSON.stringify(checkedDocs));

    navigate("/required-documents");
  };

  const hasData = !!groupName && mainServices.length > 0;

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
            <h1 className="text-lg font-bold text-foreground">Select Service Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-5">
        {/* Selected Group Badge */}
        {selectedService && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Service Group
            </p>
            <p className="text-base font-semibold text-primary">{selectedService.label}</p>
          </div>
        )}

        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-border rounded-xl p-6 text-center">
            <FileText className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">Service details coming soon</p>
            <p className="text-xs">
              Sub-service selection for {selectedService?.label} will be available in a future
              update.
            </p>
          </div>
        ) : (
          <>
            {/* Main Service Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Main Service</label>
              <div className="relative">
                <button
                  onClick={() => {
                    setMainDropdownOpen(!mainDropdownOpen);
                    setSubDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/50"
                >
                  <span className={selectedMainService ? "text-sm text-foreground" : "text-sm text-muted-foreground"}>
                    {selectedMainService || "Select main service"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${mainDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {mainDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                    {mainServices.map((svc) => (
                      <button
                        key={svc}
                        onClick={() => {
                          setSelectedMainService(svc);
                          setMainDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0 ${
                          selectedMainService === svc ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sub Service Dropdown */}
            {selectedMainService && subServices.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sub Service</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setSubDropdownOpen(!subDropdownOpen);
                      setMainDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/50"
                  >
                    <span className={selectedSubService ? "text-sm text-foreground" : "text-sm text-muted-foreground"}>
                      {selectedSubService || "Select sub service"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${subDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {subDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                      {subServices.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedSubService(sub);
                            setSubDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0 ${
                            selectedSubService === sub ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Required Documents Checklist */}
            {requiredDocs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Required Documents</label>
                  <span className="text-xs text-muted-foreground">
                    {checkedCount}/{requiredDocs.length} selected
                  </span>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {requiredDocs.map((doc, index) => {
                    const isChecked = checkedDocs[doc] || false;
                    return (
                      <button
                        key={`${doc}-${index}`}
                        onClick={() => toggleDoc(doc)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0 ${
                          isChecked ? "bg-green-50 dark:bg-green-900/10" : "hover:bg-muted/30"
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground w-5 flex-shrink-0">
                            {index + 1}.
                          </span>
                          <span className={`text-sm ${isChecked ? "text-foreground font-medium" : "text-foreground"}`}>
                            {doc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!allChecked && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    Please confirm you have all required documents before proceeding
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        {hasData ? (
          <Button
            className="w-full h-12 rounded-xl font-semibold"
            onClick={handleContinue}
            disabled={!selectedMainService || !selectedSubService || !allChecked}
          >
            {!selectedMainService
              ? "Select a Main Service"
              : !selectedSubService
              ? "Select a Sub Service"
              : !allChecked
              ? `Confirm All Documents (${checkedCount}/${requiredDocs.length})`
              : "Continue to Upload"}
          </Button>
        ) : (
          <Button
            className="w-full h-12 rounded-xl font-semibold"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
