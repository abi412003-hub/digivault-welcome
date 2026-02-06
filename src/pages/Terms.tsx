import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Terms = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-foreground ml-2">
          🔒 e-DigiVault – Terms & Conditions
        </h1>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-8">
          {/* Service Description */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Service Description
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              e-DigiVault is a secure document management service where clients authorize us via a valid Power of Attorney (PoA) to collect, verify, and store land-related documents, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Khata</li>
              <li>Patta</li>
              <li>Encumbrance Certificate (EC)</li>
              <li>Property Tax Receipts</li>
              <li>Sale Deeds and Registration Copies</li>
            </ul>
          </section>

          {/* Client Responsibilities */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Client Responsibilities
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>The client must provide a legally valid and notarized Power of Attorney (PoA).</li>
              <li>The client must ensure all personal and property details provided are true and accurate.</li>
              <li>The client agrees to cooperate in providing any additional verification or authorization required.</li>
            </ul>
          </section>

          {/* Our Responsibilities */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Our Responsibilities
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Act solely within the limits of the PoA provided.</li>
              <li>Maintain confidentiality and security of all documents and data.</li>
              <li>Use collected documents only for the purpose of retrieval, verification, and storage as per client's authorization.</li>
            </ul>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Limitations
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>e-DigiVault is not liable for the authenticity of the original land records issued by third-party authorities.</li>
              <li>We do not represent clients in court or perform legal conveyance without explicit agreements and legal partnerships.</li>
              <li>We are not responsible for any delays or rejections by government offices.</li>
            </ul>
          </section>

          {/* Document Access & Delivery */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Document Access & Delivery
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Collected documents will be uploaded to the client's e-DigiVault account.</li>
              <li>Physical documents will be returned upon request or destroyed securely (with consent).</li>
            </ul>
          </section>

          {/* Fees & Payments */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Fees & Payments
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Fees for document collection, processing, and service charges will be clearly communicated before execution.</li>
              <li>Once service is initiated based on a valid PoA, fees are non-refundable unless otherwise stated.</li>
            </ul>
          </section>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Terms;
