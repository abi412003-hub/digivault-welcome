import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, FileText, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  uploadDocument,
  toggleNotAvailable,
  submitServiceRequest,
} from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

interface DocumentRecord {
  id: string;
  doc_group: string;
  doc_name: string;
  file_url: string | null;
  not_available: boolean;
  status: string | null;
}

interface ServiceRequest {
  id: string;
  main_service: string;
  sub_service: string | null;
  status: string;
}

// Required documents per sub-service (can be expanded)
const REQUIRED_DOCUMENTS: Record<string, string[]> = {
  "New E-Khatha Registration": [
    "Pan",
    "Aadhar",
    "Birth",
    "Sale Deed",
    "Land Deed",
  ],
  default: [
    "Pan",
    "Aadhar",
    "Birth",
    "Sale Deed",
    "Land Deed",
  ],
};

const ReviewDocuments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceRequestId = searchParams.get("serviceRequestId");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ docGroup: string; docName: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get serviceRequestId from URL or localStorage
  const resolvedServiceRequestId = serviceRequestId || localStorage.getItem("currentServiceRequestId");

  // Fetch service request and documents
  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedServiceRequestId) {
        toast({ title: "Error", description: "No service request found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      try {
        // Fetch service request
        const { data: srData, error: srError } = await supabase
          .from("service_requests")
          .select("*")
          .eq("id", resolvedServiceRequestId)
          .single();

        if (srError) throw srError;
        setServiceRequest(srData as unknown as ServiceRequest);

        // Fetch documents for this service request
        const { data: docsData, error: docsError } = await supabase
          .from("documents")
          .select("*")
          .eq("service_request_id", resolvedServiceRequestId);

        if (docsError) throw docsError;
        setDocuments((docsData || []) as unknown as DocumentRecord[]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedServiceRequestId, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const getRequiredDocs = (): string[] => {
    if (!serviceRequest?.sub_service) return REQUIRED_DOCUMENTS.default;
    return REQUIRED_DOCUMENTS[serviceRequest.sub_service] || REQUIRED_DOCUMENTS.default;
  };

  const getCommonDocs = () => {
    return documents.filter((doc) => doc.doc_group === "common" && doc.file_url);
  };

  const getRequiredDocsWithStatus = () => {
    const requiredDocNames = getRequiredDocs();
    return requiredDocNames.map((docName) => {
      const doc = documents.find(
        (d) => d.doc_group === "required" && d.doc_name === docName
      );
      return {
        docName,
        uploaded: !!doc?.file_url,
        notAvailable: !!doc?.not_available,
        documentId: doc?.id,
      };
    });
  };

  const getNotAvailableDocs = () => {
    return documents.filter((doc) => doc.not_available);
  };

  const handleTileClick = (docGroup: string, docName: string) => {
    setUploadTarget({ docGroup, docName });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget || !resolvedServiceRequestId) return;

    setUploading(true);
    try {
      await uploadDocument(resolvedServiceRequestId, uploadTarget.docGroup, uploadTarget.docName, file);
      
      // Refresh documents
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("service_request_id", resolvedServiceRequestId);
      
      setDocuments((docsData || []) as unknown as DocumentRecord[]);
      setValidationErrors((prev) => prev.filter((err) => err !== uploadTarget.docName));
      toast({ title: "Uploaded", description: `${uploadTarget.docName} uploaded successfully` });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleNotAvailable = async (docName: string, currentState: boolean) => {
    if (!resolvedServiceRequestId) return;

    try {
      await toggleNotAvailable(resolvedServiceRequestId, docName, !currentState);
      
      // Refresh documents
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("service_request_id", resolvedServiceRequestId);
      
      setDocuments((docsData || []) as unknown as DocumentRecord[]);
      setValidationErrors((prev) => prev.filter((err) => err !== docName));
    } catch (error) {
      console.error("Toggle error:", error);
      toast({ title: "Error", description: "Failed to update document status", variant: "destructive" });
    }
  };

  const handleSaveAndSubmit = async () => {
    if (!resolvedServiceRequestId) return;

    // Validate required documents
    const requiredDocsStatus = getRequiredDocsWithStatus();
    const missingDocs = requiredDocsStatus.filter(
      (doc) => !doc.uploaded && !doc.notAvailable
    );

    if (missingDocs.length > 0) {
      setValidationErrors(missingDocs.map((d) => d.docName));
      toast({
        title: "Validation Error",
        description: "Please upload or mark all required documents as not available",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setSubmitting(true);
    try {
      const requiredDocNames = getRequiredDocs();
      await submitServiceRequest(resolvedServiceRequestId, requiredDocNames);
      toast({ title: "Submitted", description: "Your service request has been submitted" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast({ title: "Error", description: "Failed to submit service request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const commonDocs = getCommonDocs();
  const requiredDocsStatus = getRequiredDocsWithStatus();
  const notAvailableDocs = getNotAvailableDocs();

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
                {serviceRequest?.main_service || "—"}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">Sub Service</span>
              <span className="text-sm text-muted-foreground text-right max-w-[60%]">
                {serviceRequest?.sub_service || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Uploaded Documents</h3>
          
          {/* Common Documents */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Common Document</p>
            <div className="grid grid-cols-3 gap-3">
              {commonDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleTileClick("common", doc.doc_name)}
                  className="relative aspect-square rounded-xl bg-primary flex flex-col items-center justify-center p-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <FileText className="w-8 h-8 mb-1" />
                  <span className="text-xs font-medium text-center truncate w-full">
                    {doc.doc_name}
                  </span>
                  <div className="absolute top-2 right-2">
                    <FileText className="w-3 h-3" />
                  </div>
                </button>
              ))}
              {/* Other Documents tile */}
              <button
                onClick={() => handleTileClick("common", "Other")}
                className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center p-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium text-center">Other Documents</span>
              </button>
            </div>
          </div>
        </div>

        {/* Required Documents Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Required Document</h3>
          <div className="grid grid-cols-3 gap-3">
            {requiredDocsStatus.map((doc) => {
              const hasError = validationErrors.includes(doc.docName);
              const isUploaded = doc.uploaded;
              const isNotAvailable = doc.notAvailable;

              return (
                <div key={doc.docName} className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (!isNotAvailable) {
                        handleTileClick("required", doc.docName);
                      }
                    }}
                    disabled={isNotAvailable}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-colors ${
                      isUploaded
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : isNotAvailable
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : hasError
                        ? "bg-destructive/10 border-2 border-destructive text-destructive"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {isUploaded ? (
                      <FileText className="w-8 h-8 mb-1" />
                    ) : (
                      <Upload className="w-8 h-8 mb-1" />
                    )}
                    <span className="text-xs font-medium text-center truncate w-full">
                      {doc.docName}
                    </span>
                    {isUploaded && (
                      <div className="absolute top-2 right-2">
                        <FileText className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                  {!isUploaded && !isNotAvailable && (
                    <button
                      onClick={() => handleToggleNotAvailable(doc.docName, false)}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark N/A
                    </button>
                  )}
                </div>
              );
            })}
            {/* Other Documents tile */}
            <button
              onClick={() => handleTileClick("required", "Other")}
              className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center p-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center">Other Documents</span>
            </button>
          </div>
        </div>

        {/* Not Available Documents Section */}
        {notAvailableDocs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Not available Documents</h3>
            <div className="grid grid-cols-3 gap-3">
              {notAvailableDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center p-2 text-muted-foreground opacity-60"
                >
                  <FileText className="w-8 h-8 mb-1" />
                  <span className="text-xs font-medium text-center truncate w-full">
                    {doc.doc_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {validationErrors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-destructive text-center">
              Please upload or mark all required documents
            </p>
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleSaveAndSubmit}
          disabled={submitting || uploading}
          className="w-full h-12"
        >
          {submitting ? "Submitting..." : uploading ? "Uploading..." : "Save & Submit"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewDocuments;
