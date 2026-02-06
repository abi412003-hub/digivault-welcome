import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface RequiredDoc {
  docName: string;
  file: File | null;
  notAvailable: boolean;
}

const REQUIRED_DOCUMENTS = [
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

const ReviewDocuments = () => {
  const navigate = useNavigate();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  
  const selectedMainService = localStorage.getItem("selectedMainService") || "No service selected";
  const selectedSubService = localStorage.getItem("selectedSubService") || "No sub-service selected";

  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>(() => 
    REQUIRED_DOCUMENTS.map(docName => ({
      docName,
      file: null,
      notAvailable: false,
    }))
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (index: number, file: File | null) => {
    setRequiredDocs(prev => prev.map((doc, i) => 
      i === index ? { ...doc, file, notAvailable: false } : doc
    ));
  };

  const handleNotAvailable = (index: number) => {
    setRequiredDocs(prev => prev.map((doc, i) => 
      i === index ? { ...doc, notAvailable: !doc.notAvailable, file: null } : doc
    ));
  };

  const handleDeleteFile = (index: number) => {
    setRequiredDocs(prev => prev.map((doc, i) => 
      i === index ? { ...doc, file: null } : doc
    ));
    // Reset the file input
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const handlePreviewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const handleUploadClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const validateDocs = (): boolean => {
    return requiredDocs.every(doc => doc.file !== null || doc.notAvailable);
  };

  const saveDocuments = (status: "Draft" | "Submitted") => {
    const commonDocs = localStorage.getItem("commonDocs");
    const currentProjectId = localStorage.getItem("currentProjectId") || "default";
    const currentPropertyId = localStorage.getItem("currentPropertyId") || "default";

    const serviceRequest = {
      projectId: currentProjectId,
      propertyId: currentPropertyId,
      selectedMainService,
      selectedSubService,
      commonDocs: commonDocs ? JSON.parse(commonDocs) : null,
      requiredDocs: requiredDocs.map(doc => ({
        docName: doc.docName,
        fileName: doc.file?.name || null,
        notAvailable: doc.notAvailable,
      })),
      status,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingRequests = JSON.parse(localStorage.getItem("serviceRequests") || "[]");
    existingRequests.push(serviceRequest);
    localStorage.setItem("serviceRequests", JSON.stringify(existingRequests));

    return serviceRequest;
  };

  const handleSave = () => {
    saveDocuments("Draft");
    toast({
      title: "Saved",
      description: "Your documents have been saved as draft.",
    });
  };

  const handleSaveAndSubmit = () => {
    if (!validateDocs()) {
      toast({
        title: "Validation Error",
        description: "Please upload or mark not available for all required documents.",
        variant: "destructive",
      });
      return;
    }

    const serviceRequest = saveDocuments("Submitted");

    // Create activity entries
    const activities = JSON.parse(localStorage.getItem("activities") || "[]");
    activities.push({
      id: Date.now().toString(),
      type: "service_request",
      title: `${selectedSubService} - Pending Review`,
      description: `Service request for ${selectedMainService}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("activities", JSON.stringify(activities));

    toast({
      title: "Submitted successfully",
      description: "Your service request has been submitted.",
    });

    navigate("/dashboard");
  };

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
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {/* Summary Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="bg-primary/10 py-3 px-4">
            <h2 className="text-base font-semibold text-foreground text-center">
              Review Documents
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Main Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[60%]">
                {selectedMainService}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Sub Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[60%]">
                {selectedSubService}
              </span>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <h3 className="text-base font-semibold text-foreground text-center mb-6">
          {selectedSubService} Required Documents
        </h3>

        {/* Required Documents List */}
        <div className="space-y-4">
          {requiredDocs.map((doc, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {doc.docName}
              </label>
              <div className="flex items-center gap-2">
                {doc.file ? (
                  // File uploaded state
                  <div className="flex-1 h-11 px-4 rounded-full border border-border bg-background flex items-center justify-between">
                    <span className="text-sm text-foreground truncate max-w-[120px]">
                      {doc.file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewFile(doc.file!)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(index)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload state
                  <div
                    onClick={() => !doc.notAvailable && handleUploadClick(index)}
                    className={`flex-1 h-11 px-4 rounded-full border border-border bg-background flex items-center justify-between ${
                      doc.notAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">Upload File</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotAvailable(index);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          doc.notAvailable
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        Not Available
                      </button>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <input
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  disabled={doc.notAvailable}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            variant="default"
            className="flex-1 h-12"
          >
            Save
          </Button>
          <Button
            onClick={handleSaveAndSubmit}
            variant="default"
            className="flex-1 h-12"
          >
            Save & Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDocuments;
