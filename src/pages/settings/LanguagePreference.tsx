import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LanguagePreference = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Language Preference</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Language preference settings coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default LanguagePreference;
