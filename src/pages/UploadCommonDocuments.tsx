import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentFiles {
  identityFront: File | null;
  identityBack: File | null;
  addressFront: File | null;
  addressBack: File | null;
  dobFront: File | null;
  dobBack: File | null;
}

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

  // Get selected services from localStorage
  const mainServiceData = localStorage.getItem("selectedMainService");
  const selectedMainService = mainServiceData ? JSON.parse(mainServiceData).label : "No service selected";
  const selectedSubService = localStorage.getItem("selectedSubService") || "No sub-service selected";

  // File input refs
  const fileInputRefs = {
    identityFront: useRef<HTMLInputElement>(null),
    identityBack: useRef<HTMLInputElement>(null),
    addressFront: useRef<HTMLInputElement>(null),
    addressBack: useRef<HTMLInputElement>(null),
    dobFront: useRef<HTMLInputElement>(null),
    dobBack: useRef<HTMLInputElement>(null),
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (field: keyof DocumentFiles) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const triggerFileInput = (field: keyof DocumentFiles) => {
    fileInputRefs[field].current?.click();
  };

  const isAllDocumentsUploaded = 
    documents.identityFront && 
    documents.identityBack && 
    documents.addressFront && 
    documents.addressBack && 
    documents.dobFront && 
    documents.dobBack;

  const handleNext = () => {
    // Store document info in localStorage (storing file names for reference)
    const commonDocs = {
      identityFront: documents.identityFront?.name || null,
      identityBack: documents.identityBack?.name || null,
      addressFront: documents.addressFront?.name || null,
      addressBack: documents.addressBack?.name || null,
      dobFront: documents.dobFront?.name || null,
      dobBack: documents.dobBack?.name || null,
    };
    localStorage.setItem("commonDocs", JSON.stringify(commonDocs));
    navigate("/review-documents");
  };

  const UploadBox = ({ 
    label, 
    file, 
    onClick 
  }: { 
    label: string; 
    file: File | null; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex-1 min-w-0 h-12 px-3 flex items-center justify-between gap-2 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
    >
      <span className="text-xs text-muted-foreground truncate">
        {file ? file.name : label}
      </span>
      <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );

  const DocumentSection = ({ 
    title, 
    frontField, 
    backField 
  }: { 
    title: string; 
    frontField: keyof DocumentFiles; 
    backField: keyof DocumentFiles;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{title}</label>
      <div className="flex gap-3">
        <UploadBox 
          label="Upload Front Side" 
          file={documents[frontField]} 
          onClick={() => triggerFileInput(frontField)} 
        />
        <UploadBox 
          label="Upload Back Side" 
          file={documents[backField]} 
          onClick={() => triggerFileInput(backField)} 
        />
      </div>
      <input
        ref={fileInputRefs[frontField]}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange(frontField)}
      />
      <input
        ref={fileInputRefs[backField]}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange(backField)}
      />
    </div>
  );

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

        {/* Document Upload Sections */}
        <div className="space-y-6">
          <DocumentSection 
            title="Proof of Identity" 
            frontField="identityFront" 
            backField="identityBack" 
          />
          <DocumentSection 
            title="Proof of Address" 
            frontField="addressFront" 
            backField="addressBack" 
          />
          <DocumentSection 
            title="DOB Certificate" 
            frontField="dobFront" 
            backField="dobBack" 
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={handleNext}
          disabled={!isAllDocumentsUploaded}
          className="w-full h-12"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UploadCommonDocuments;
