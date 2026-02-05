import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Hourglass, ChevronRight, FileText, Calculator, Receipt } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const statusCards = [
  { label: "Completed", count: 2, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  { label: "Ongoing", count: 6, icon: Hourglass, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pending", count: 2, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
];

const actionButtons = [
  { label: "Proposals", icon: FileText, path: "/proposals" },
  { label: "Estimate", icon: Calculator, path: "/estimate" },
  { label: "Invoice", icon: Receipt, path: "/invoice" },
];

const activities = [
  { title: "E-khatha Certificate", date: "08 Apr 2025", status: "Completed" },
  { title: "Khatha Certificate", date: "06 Apr 2025", status: "Ongoing" },
  { title: "Khatha Extract", date: "05 Apr 2025", status: "Pending" },
  { title: "Tax Paid Receipt", date: "05 Apr 2025", status: "Pending" },
];

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Ongoing":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "Pending":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    default:
      return "";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back!</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          {statusCards.map((card) => (
            <Card key={card.label} className="shadow-sm border-0">
              <CardContent className="p-3 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center mb-2`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className="text-2xl font-bold text-foreground">{card.count}</span>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects Card */}
        <Card 
          className="shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/projects")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">02</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {actionButtons.map((action) => (
            <Button
              key={action.label}
              variant="default"
              className="flex flex-col h-auto py-4 gap-2"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* All Activity Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">All Activity</h2>
          <Card className="shadow-sm border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {activities.map((activity, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                    <Badge className={`ml-2 ${getStatusBadgeStyles(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
