import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Hourglass, 
  ChevronRight, 
  FileText, 
  Calculator, 
  Receipt,
  Bell,
  MessageCircle,
  Building2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import { useActivities } from "@/hooks/useActivities";
import { useProjects } from "@/hooks/useProjects";

const actionButtons = [
  { label: "Proposals", icon: FileText, path: "/proposals" },
  { label: "Estimate", icon: Calculator, path: "/estimate" },
  { label: "Invoice", icon: Receipt, path: "/invoice" },
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
  const { activities, getStatusCounts } = useActivities();
  const { projectCount } = useProjects();

  const statusCounts = getStatusCounts();

  const statusCards = [
    { label: "Completed", count: statusCounts.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Ongoing", count: statusCounts.ongoing, icon: Hourglass, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending", count: statusCounts.pending, icon: Clock, color: "text-orange-500", bg: "bg-orange-100" },
  ];

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
          <div className="grid grid-cols-3 gap-3">
            {statusCards.map((card) => (
              <Card key={card.label} className={`shadow-sm border-0 ${card.bg}`}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <card.icon className={`w-6 h-6 ${card.color} mb-2`} />
                  <span className="text-2xl font-bold text-foreground">{card.count}</span>
                  <span className="text-xs text-muted-foreground mt-1">{card.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Projects Card */}
        <Card 
          className="shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow bg-card"
          onClick={() => navigate("/projects")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {projectCount.toString().padStart(2, "0")}
              </span>
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
              className="flex flex-col h-auto py-4 gap-2 bg-primary hover:bg-primary/90"
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
          <Card className="shadow-sm border-0 overflow-hidden bg-card">
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Table Header */}
                  <div className="p-3 bg-muted/50 grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Document Title</span>
                    <span className="text-center">Date</span>
                    <span className="text-right">Status</span>
                  </div>
                  {/* Table Rows */}
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-3 grid grid-cols-3 gap-2 items-center">
                      <p className="font-medium text-foreground text-sm truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground text-center">{activity.date}</p>
                      <div className="flex justify-end">
                        <Badge className={`text-xs ${getStatusBadgeStyles(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
