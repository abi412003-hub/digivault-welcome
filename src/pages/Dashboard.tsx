import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, FileText, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
interface Profile {
  id: string;
  role: string;
  user_type: string;
  phone: string | null;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      setProfile(profileData);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">e-DigiVault</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Welcome Card */}
          <div className="card-container">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Client Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  {profile?.phone || "Welcome back"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                {profile?.role || "client"}
              </span>
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full">
                {profile?.user_type || "individual"}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="card-container hover:border-primary/50 border border-transparent transition-colors text-left">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">My Documents</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View & manage
              </p>
            </button>
            <button className="card-container hover:border-primary/50 border border-transparent transition-colors text-left">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Settings & logs
              </p>
            </button>
          </div>

          {/* Empty State */}
          <div className="card-container text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              No documents yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your secure documents will appear here
            </p>
            <button className="btn-primary max-w-xs mx-auto">
              Upload Document
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
