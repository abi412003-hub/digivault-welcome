import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Privacy = () => {
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
          🔒 Privacy Policy
        </h1>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-8">
          {/* 1. Data Collection */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              1. Data Collection
            </h2>
            <p className="text-muted-foreground mb-3">We collect:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Personal details (Name, Address, ID proofs)</li>
              <li>Property-related information</li>
              <li>Power of Attorney documents</li>
              <li>Government-issued land records</li>
            </ul>
          </section>

          {/* 2. Data Use */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              2. Data Use
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>To authenticate your authority</li>
              <li>To collect and store property documents</li>
              <li>For internal verification and customer support</li>
            </ul>
          </section>

          {/* 3. Data Protection */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              3. Data Protection
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>All data is stored using encrypted systems.</li>
              <li>Only authorized personnel with signed NDAs have access.</li>
            </ul>
          </section>

          {/* 4. Data Sharing */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              4. Data Sharing
            </h2>
            <p className="text-muted-foreground mb-3">
              We do not sell or share your data with third parties, except:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Government offices for document collection</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          {/* 5. Your Rights */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              5. Your Rights
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>You can request access, correction, or deletion of your data.</li>
              <li>You can revoke Power of Attorney by submitting a written request (effective only after legal validation).</li>
            </ul>
          </section>

          {/* 6. Retention */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              6. Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your documents for as long as the e-DigiVault account is active or until a deletion request is approved.
            </p>
          </section>

          {/* Contact & Dispute Resolution */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              📩 Contact & Dispute Resolution
            </h2>
            <p className="text-muted-foreground mb-3">
              For any concerns, contact us at:
            </p>
            <div className="text-muted-foreground space-y-2 ml-2">
              <p>
                <span className="font-medium text-foreground">Email:</span>{" "}
                <a href="mailto:support@edigivault.in" className="text-primary hover:underline">
                  support@edigivault.in
                </a>
              </p>
              <p>
                <span className="font-medium text-foreground">Phone:</span>{" "}
                +91-XXXXXXXXXX
              </p>
            </div>
          </section>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Privacy;
