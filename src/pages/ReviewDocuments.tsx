import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ReviewDocuments = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ group: string; name: string } | null>(null);

  // Read service info from localStorage
  const mainServiceData = localStorage.getItem("selectedMainService");
  const selectedMainService = mainServiceData ? JSON.parse(mainServiceData).label : "E-katha";
  const selectedSubService = localStorage.getItem("selectedSubService") || "New E-Katha Registration";

  // Common documents from localStorage
  const storedCommonDocs = JSON.parse(localStorage.getItem("uploadedDocuments") || "{}");
  const commonDocNames = Object.keys(storedCommonDocs).length > 0
    ? [...new Set(Object.values(storedCommonDocs).map((d: any) => {
        // Simplify names: "Identity Proof (Front)" -> "Pan", etc.
        const name = d.docName || d.fileName || "Doc";
        if (name.toLowerCase().includes("identity")) return "Pan";
        if (name.toLowerCase().includes("address")) return "Aadhar";
        if (name.toLowerCase().includes("dob")) return "Birth";
        return name;
      }))]
    : ["Pan", "Aadhar", "Birth"];

  // Required/service-specific documents from localStorage
  const storedServiceDocs = JSON.parse(localStorage.getItem("serviceSpecificDocs") || "{}");

  // Get required doc names
  let requiredDocNames: string[] = [];
  try {
    const stored = localStorage.getItem("selectedRequiredDocs");
    if (stored) requiredDocNames = JSON.parse(stored);
  } catch { /* fallback */ }

  if (requiredDocNames.length === 0) {
    requiredDocNames = [
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

  // Build required doc statuses
  const requiredDocsStatus = requiredDocNames.map((name) => {
    const serviceDoc = storedServiceDocs[name];
    const isUploaded = serviceDoc?.status === "uploaded";
    const isNA = serviceDoc?.status === "not_available";
    return { name, uploaded: isUploaded, notAvailable: isNA };
  });

  // Additional "other" docs uploaded by user
  const [otherCommonDocs, setOtherCommonDocs] = useState<string[]>([]);
  const [otherRequiredDocs, setOtherRequiredDocs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const uploadedRequired = requiredDocsStatus.filter((d) => d.uploaded);
  const notAvailableRequired = requiredDocsStatus.filter((d) => d.notAvailable);

  // Shorten long doc names for tile display
  const shortenName = (name: string) => {
    if (name.length <= 16) return name;
    // Use first part before "/"
    const parts = name.split("/");
    if (parts[0].trim().length <= 16) return parts[0].trim();
    return name.substring(0, 14) + "…";
  };

  const handleTileClick = (group: string, name: string) => {
    setUploadTarget({ group, name });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    if (uploadTarget.group === "common-other") {
      setOtherCommonDocs((prev) => [...prev, file.name]);
    } else if (uploadTarget.group === "required-other") {
      setOtherRequiredDocs((prev) => [...prev, file.name]);
    }

    toast({ title: "Uploaded", description: `${file.name} added` });
    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveAndSubmit = () => {
    // Check all required docs are either uploaded or NA
    const incomplete = requiredDocsStatus.filter((d) => !d.uploaded && !d.notAvailable);
    if (incomplete.length > 0) {
      toast({
        title: "Missing Documents",
        description: `${incomplete.length} required document(s) need to be uploaded or marked Not Available`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      localStorage.removeItem("currentServiceRequestId");
      toast({ title: "Submitted", description: "Your service request has been submitted" });
      navigate("/select-charges");
    }, 800);
  };

  const DocTile = ({
    name,
    uploaded,
    onClick,
  }: {
    name: string;
    uploaded: boolean;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-colors ${
        uploaded
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      <FileText className="w-6 h-6 mb-1" />
      <span className="text-[11px] font-medium text-center leading-tight line-clamp-2 w-full">
        {shortenName(name)}
      </span>
      {uploaded && (
        <div className="absolute top-1.5 right-1.5">
          <FileText className="w-3 h-3" />
        </div>
      )}
    </button>
  );

  const OtherDocTile = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center p-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      <Plus className="w-5 h-5 mb-1" />
      <span className="text-[11px] font-medium text-center">Other Documents</span>
    </button>
  );

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
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Summary Card */}
        <div className="rounded-2xl border border-border overflow-hidden mb-6">
          <div className="bg-primary py-3 px-4">
            <h2 className="text-base font-semibold text-primary-foreground text-center">
              Review Documents
            </h2>
          </div>
          <div className="bg-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Main Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[55%]">
                {selectedMainService}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Sub Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[55%]">
                {selectedSubService}
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Banner */}
        <div className="rounded-xl border border-border py-2.5 px-4 mb-4">
          <p className="text-sm font-semibold text-foreground text-center">Uploaded Documents</p>
        </div>

        {/* Common Documents */}
        <div className="mb-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Common Document</p>
          <div className="grid grid-cols-3 gap-3">
            {commonDocNames.map((name) => (
              <DocTile key={name} name={name} uploaded />
            ))}
            {otherCommonDocs.map((name, i) => (
              <DocTile key={`other-c-${i}`} name={name} uploaded />
            ))}
            <OtherDocTile onClick={() => handleTileClick("common-other", "Other")} />
          </div>
        </div>

        {/* Required Documents */}
        <div className="mb-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Required Document</p>
          <div className="grid grid-cols-3 gap-3">
            {uploadedRequired.map((doc) => (
              <DocTile key={doc.name} name={doc.name} uploaded />
            ))}
            {otherRequiredDocs.map((name, i) => (
              <DocTile key={`other-r-${i}`} name={name} uploaded />
            ))}
            <OtherDocTile onClick={() => handleTileClick("required-other", "Other")} />
          </div>
        </div>

        {/* Not Available Documents */}
        {notAvailableRequired.length > 0 && (
          <div className="mb-5">
            <div className="rounded-xl border border-border py-2.5 px-4 mb-3">
              <p className="text-sm font-semibold text-foreground text-center">Not available Documents</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {notAvailableRequired.map((doc) => (
                <div
                  key={doc.name}
                  className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center p-2 text-muted-foreground opacity-60"
                >
                  <FileText className="w-6 h-6 mb-1" />
                  <span className="text-[11px] font-medium text-center leading-tight line-clamp-2 w-full">
                    {shortenName(doc.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Bottom Button */}
      <div className="p-4 flex justify-center">
        <Button
          onClick={handleSaveAndSubmit}
          disabled={submitting}
          className="px-10 h-12 rounded-xl font-semibold"
        >
          {submitting ? "Submitting..." : "Save & Submit"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewDocuments;
