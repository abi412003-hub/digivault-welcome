import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Properties = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Properties</h1>
        </div>

        {/* Placeholder Content */}
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Properties list coming soon</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Properties;
