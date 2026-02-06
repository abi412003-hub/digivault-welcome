import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DocumentField {
  key: string;
  label: string;
  docName: string;
}

interface UploadStatus {
  [key: string]: "idle" | "uploading" | "success" | "error";
}

interface DocumentFiles {
  [key: string]: File | null;
}

const DOCUMENT_FIELDS: DocumentField[] = [
  { key: "identityFront", label: "Upload Front Side", docName: "Identity Proof (Front)" },
  { key: "identityBack", label: "Upload Back Side", docName: "Identity Proof (Back)" },
  { key: "addressFront", label: "Upload Front Side", docName: "Address Proof (Front)" },
  { key: "addressBack", label: "Upload Back Side", docName: "Address Proof (Back)" },
  { key: "dobFront", label: "Upload Front Side", docName: "DOB Certificate (Front)" },
  { key: "dobBack", label: "Upload Back Side", docName: "DOB Certificate (Back)" },
];

const UploadCommonDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentFiles>({
    identityFront: null,
    identityBack: null,
    addressFront: null,
    addressBack: null,
    dobFront: null,
    dobBack: null,
  });
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    identityFront: "idle",
    identityBack: "idle",
    addressFront: "idle",
    addressBack: "idle",
    dobFront: "idle",
    dobBack: "idle",
  });

  // Get selected services from localStorage
  const mainServiceData = localStorage.getItem("selectedMainService");
  const selectedMainService = mainServiceData ? JSON.parse(mainServiceData).label : "No service selected";
  const selectedSubService = localStorage.getItem("selectedSubService") || "No sub-service selected";

  // File input refs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (fieldKey: string, docName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update local state - store files locally only (no backend upload)
    setDocuments(prev => ({ ...prev, [fieldKey]: file }));
    setUploadStatus(prev => ({ ...prev, [fieldKey]: "success" }));
    
    // Store document info in localStorage for later use
    const storedDocs = JSON.parse(localStorage.getItem("uploadedDocuments") || "{}");
    storedDocs[fieldKey] = { docName, fileName: file.name };
    localStorage.setItem("uploadedDocuments", JSON.stringify(storedDocs));
    
    toast({ title: "Selected", description: `${docName} selected successfully` });

    // Reset file input
    if (fileInputRefs.current[fieldKey]) {
      fileInputRefs.current[fieldKey]!.value = "";
    }
  };

  const triggerFileInput = (fieldKey: string) => {
    fileInputRefs.current[fieldKey]?.click();
  };

  const getUploadedCount = () => {
    return Object.values(uploadStatus).filter(status => status === "success").length;
  };

  const handleNext = () => {
    navigate("/review-documents");
  };

  const UploadBox = ({ 
    fieldKey,
    label, 
    file,
    status,
    onClick 
  }: { 
    fieldKey: string;
    label: string; 
    file: File | null;
    status: "idle" | "uploading" | "success" | "error";
    onClick: () => void;
  }) => {
    const isUploading = status === "uploading";
    const isSuccess = status === "success";
    const isError = status === "error";

    return (
      <button
        onClick={onClick}
        disabled={isUploading}
        className={`flex-1 min-w-0 h-12 px-3 flex items-center justify-between gap-2 border rounded-lg transition-colors ${
          isSuccess
            ? "border-primary bg-primary/10"
            : isError
            ? "border-destructive bg-destructive/10"
            : "border-border bg-background hover:bg-muted/50"
        }`}
      >
        <span className={`text-xs truncate ${
          isSuccess ? "text-primary" : "text-muted-foreground"
        }`}>
          {file ? file.name : label}
        </span>
        {isUploading ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
        ) : isSuccess ? (
          <Check className="w-4 h-4 text-primary flex-shrink-0" />
        ) : isError ? (
          <X className="w-4 h-4 text-destructive flex-shrink-0" />
        ) : (
          <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
    );
  };

  const DocumentSection = ({ 
    title, 
    frontField,
    backField,
  }: { 
    title: string; 
    frontField: DocumentField;
    backField: DocumentField;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{title}</label>
      <div className="flex gap-3">
        <UploadBox 
          fieldKey={frontField.key}
          label={frontField.label}
          file={documents[frontField.key]} 
          status={uploadStatus[frontField.key]}
          onClick={() => triggerFileInput(frontField.key)} 
        />
        <UploadBox 
          fieldKey={backField.key}
          label={backField.label}
          file={documents[backField.key]}
          status={uploadStatus[backField.key]}
          onClick={() => triggerFileInput(backField.key)} 
        />
      </div>
      <input
        ref={el => { fileInputRefs.current[frontField.key] = el; }}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => handleFileChange(frontField.key, frontField.docName, e)}
      />
      <input
        ref={el => { fileInputRefs.current[backField.key] = el; }}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => handleFileChange(backField.key, backField.docName, e)}
      />
    </div>
  );

  const uploadedCount = getUploadedCount();
  const isAnyUploading = Object.values(uploadStatus).some(s => s === "uploading");

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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Summary Card */}
        <div className="rounded-xl border border-border overflow-hidden mb-6">
          {/* Card Header */}
          <div className="bg-primary/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Upload Common Documents</h2>
          </div>
          {/* Card Content */}
          <div className="bg-card p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Main Service</span>
              <span className="text-sm font-medium text-foreground">{selectedMainService}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sub Service</span>
              <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{selectedSubService}</span>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadedCount > 0 && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary text-center">
              {uploadedCount} of 6 documents uploaded
            </p>
          </div>
        )}

        {/* Document Upload Sections */}
        <div className="space-y-6">
          <DocumentSection 
            title="Proof of Identity" 
            frontField={DOCUMENT_FIELDS[0]}
            backField={DOCUMENT_FIELDS[1]}
          />
          <DocumentSection 
            title="Proof of Address" 
            frontField={DOCUMENT_FIELDS[2]}
            backField={DOCUMENT_FIELDS[3]}
          />
          <DocumentSection 
            title="DOB Certificate" 
            frontField={DOCUMENT_FIELDS[4]}
            backField={DOCUMENT_FIELDS[5]}
          />
        </div>

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          You can proceed without uploading all documents. Missing documents can be uploaded on the review screen.
        </p>
      </div>

      {/* Next Button */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={handleNext}
          disabled={isAnyUploading}
          className="w-full h-12"
        >
          {isAnyUploading ? "Uploading..." : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default UploadCommonDocuments;