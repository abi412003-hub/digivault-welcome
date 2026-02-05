import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Proposals = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Proposals</h1>
        </div>
        <p className="text-muted-foreground text-center py-12">
          Proposals screen coming soon...
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default Proposals;
