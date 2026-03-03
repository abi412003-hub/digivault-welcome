import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Eye, Trash2, MessageCircle, Bell, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

interface DocState {
  file: File | null;
  status: "idle" | "uploaded" | "not_available";
  previewUrl: string | null;
}

const ServiceSpecificDocuments = () => {
  const navigate = useNavigate();

  // Get selected services from localStorage
  const mainServiceData = localStorage.getItem("selectedMainService");
  const selectedMainService = mainServiceData ? JSON.parse(mainServiceData).label : "";
  const selectedSubService = localStorage.getItem("selectedSubService") || "";

  // Get required documents list
  let requiredDocs: string[] = [];
  try {
    const stored = localStorage.getItem("selectedRequiredDocs");
    if (stored) requiredDocs = JSON.parse(stored);
  } catch {
    // fallback
  }

  if (requiredDocs.length === 0) {
    // Default E-Katha New Registration docs from screenshot
    requiredDocs = [
      "Sale Deed / Registered Deed",
      "Mother Deed / Parent Deed",
      "Gift Deed / Partition Deed / Will",
      "Latest Property Tax Receipt",
      "Electricity / BESCOM Connection ID",
      "Property Survey Sketch / Layout Plan",
      "Utility Bill / Address Proof",
      "Property Photographs",
      "No Objection Certificate (NOC)",
      "Encumbrance Certificate (EC)",
    ];
  }

  const serviceTitle = selectedSubService
    ? `${selectedSubService}`
    : selectedMainService || "New E-Katha Registration";

  // Document states
  const [docStates, setDocStates] = useState<Record<string, DocState>>(() => {
    const initial: Record<string, DocState> = {};
    requiredDocs.forEach((doc) => {
      initial[doc] = { file: null, status: "idle", previewUrl: null };
    });
    return initial;
  });

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDocStates((prev) => ({
      ...prev,
      [docName]: { file, status: "uploaded", previewUrl },
    }));

    // Store in localStorage
    const storedDocs = JSON.parse(localStorage.getItem("serviceSpecificDocs") || "{}");
    storedDocs[docName] = { fileName: file.name, status: "uploaded" };
    localStorage.setItem("serviceSpecificDocs", JSON.stringify(storedDocs));

    toast({ title: "Uploaded", description: `${docName} selected` });
    if (fileInputRefs.current[docName]) fileInputRefs.current[docName]!.value = "";
  };

  const handleNotAvailable = (docName: string) => {
    setDocStates((prev) => ({
      ...prev,
      [docName]: { file: null, status: prev[docName].status === "not_available" ? "idle" : "not_available", previewUrl: null },
    }));
  };

  const handleView = (docName: string) => {
    const state = docStates[docName];
    if (state?.previewUrl) {
      window.open(state.previewUrl, "_blank");
    }
  };

  const handleDelete = (docName: string) => {
    setDocStates((prev) => ({
      ...prev,
      [docName]: { file: null, status: "idle", previewUrl: null },
    }));
    const storedDocs = JSON.parse(localStorage.getItem("serviceSpecificDocs") || "{}");
    delete storedDocs[docName];
    localStorage.setItem("serviceSpecificDocs", JSON.stringify(storedDocs));
    toast({ title: "Removed", description: `${docName} removed` });
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Documents saved as draft" });
  };

  const handleSaveSubmit = () => {
    // Check all docs are either uploaded or marked not available
    const incomplete = requiredDocs.filter((doc) => docStates[doc].status === "idle");
    if (incomplete.length > 0) {
      toast({
        title: "Missing Documents",
        description: `${incomplete.length} document(s) still need to be uploaded or marked as Not Available`,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Submitted", description: "Service request submitted successfully" });
    navigate("/select-charges");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold text-foreground">Services</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-foreground" />
            </button>
            <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            <Avatar className="w-9 h-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-muted text-xs">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Service Title Banner */}
      <div className="px-4 pb-4">
        <div className="border border-border rounded-xl py-3 px-4 text-center">
          <p className="text-sm font-semibold text-foreground">{serviceTitle}</p>
          <p className="text-sm font-medium text-foreground">Required Documents</p>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 px-4 space-y-4 overflow-y-auto">
        {requiredDocs.map((docName) => {
          const state = docStates[docName];
          const isUploaded = state.status === "uploaded";
          const isNA = state.status === "not_available";

          return (
            <div key={docName}>
              <p className="text-sm font-medium text-foreground mb-1.5">{docName}</p>
              {isUploaded ? (
                /* Uploaded state - show filename with view/delete */
                <div className="flex items-center gap-2 border border-border rounded-lg h-11 px-3">
                  <span className="flex-1 text-sm text-foreground truncate">
                    {state.file?.name || docName}
                  </span>
                  <button onClick={() => handleView(docName)} className="text-muted-foreground hover:text-foreground">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(docName)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Upload / Not Available state */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRefs.current[docName]?.click()}
                    disabled={isNA}
                    className={`flex-1 flex items-center border rounded-lg h-11 px-3 transition-colors ${
                      isNA ? "border-border bg-muted/50 opacity-50" : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">Upload File</span>
                  </button>
                  <button
                    onClick={() => handleNotAvailable(docName)}
                    className={`shrink-0 px-3 h-11 rounded-lg text-xs font-medium border transition-colors ${
                      isNA
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-primary border-primary hover:bg-primary/10"
                    }`}
                  >
                    Not Available
                  </button>
                  <button
                    onClick={() => fileInputRefs.current[docName]?.click()}
                    disabled={isNA}
                    className={`shrink-0 w-11 h-11 flex items-center justify-center border border-border rounded-lg transition-colors ${
                      isNA ? "opacity-50" : "hover:bg-muted/30"
                    }`}
                  >
                    <Upload className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              )}
              <input
                ref={(el) => { fileInputRefs.current[docName] = el; }}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(docName, e)}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Buttons */}
      <div className="px-4 pt-4 pb-4 flex gap-3">
        <Button
          variant="outline"
          onClick={handleSave}
          className="flex-1 h-12 rounded-xl font-semibold border-primary text-primary"
        >
          Save
        </Button>
        <Button
          onClick={handleSaveSubmit}
          className="flex-1 h-12 rounded-xl font-semibold"
        >
          Save & Submit
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServiceSpecificDocuments;
