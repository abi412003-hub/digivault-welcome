import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { erpnext } from "@/lib/api";
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
  Building2,
  MapPin,
  Users,
  FolderOpen
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";

const actionButtons = [
  { label: "Proposals", icon: FileText, path: "/proposals" },
  { label: "Estimate", icon: Calculator, path: "/estimate" },
  { label: "Invoice", icon: Receipt, path: "/invoice" },
];

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "Completed": case "Approved": case "Paid":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "In Progress": case "Assigned": case "Processing":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "Pending": case "Draft": case "Pending For Approval":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    case "Rejected": case "Cancelled":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ projects: 0, properties: 0, estimates: 0, leads: 0, services: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentEstimates, setRecentEstimates] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      // Check auth
      const stored = localStorage.getItem('edv_user');
      if (!stored) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(stored);
      setUserName(user.name || user.email || "User");

      // Fetch all data from ERPNext in parallel
      try {
        const [projCount, propCount, estCount, leadCount, svcCount, projects, estimates] = await Promise.all([
          erpnext.count("DigiVault Project"),
          erpnext.count("DigiVault Property"),
          erpnext.count("DigiVault Estimate"),
          erpnext.count("DigiVault Lead"),
          erpnext.count("DigiVault Service"),
          erpnext.list("DigiVault Project", ["name", "project_name", "project_status", "client", "creation"], null, 5),
          erpnext.list("DigiVault Estimate", ["name", "client", "service", "estimate_status", "total_price", "estimate_date"], null, 5),
        ]);

        setStats({
          projects: projCount,
          properties: propCount,
          estimates: estCount,
          leads: leadCount,
          services: svcCount,
        });
        setRecentProjects(projects || []);
        setRecentEstimates(estimates || []);
      } catch (e) {
        console.log("ERPNext fetch error:", e);
      }

      setIsLoading(false);
    };

    init();
  }, [navigate]);

  const statusCards = [
    { label: "Projects", count: stats.projects, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Properties", count: stats.properties, icon: MapPin, color: "text-green-600", bg: "bg-green-50" },
    { label: "Estimates", count: stats.estimates, icon: Calculator, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Leads", count: stats.leads, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

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
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statusCards.map((card) => (
            <Card key={card.label} className={`shadow-sm border-0 ${card.bg}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-white/70 flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-foreground">{card.count}</span>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
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

        {/* Recent Projects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent projects</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="text-primary">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentProjects.length === 0 ? (
            <Card className="shadow-sm border-0">
              <CardContent className="p-6 text-center">
                <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No projects yet</p>
              </CardContent>
            </Card>
          ) : (
            recentProjects.map((p) => (
              <Card key={p.name} className="shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/projects")}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.project_name}</p>
                      <p className="text-xs text-muted-foreground">{p.name} • {p.client || ""}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getStatusBadgeStyles(p.project_status)}`}>
                    {p.project_status || "Pending"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Estimates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent estimates</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/estimate")} className="text-primary">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentEstimates.length === 0 ? (
            <Card className="shadow-sm border-0">
              <CardContent className="p-6 text-center">
                <Calculator className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No estimates yet</p>
              </CardContent>
            </Card>
          ) : (
            recentEstimates.map((e) => (
              <Card key={e.name} className="shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.service} • {e.estimate_date}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${getStatusBadgeStyles(e.estimate_status)}`}>
                      {e.estimate_status}
                    </Badge>
                    {e.total_price && (
                      <p className="text-sm font-bold text-primary mt-1">₹{Number(e.total_price).toLocaleString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Services count */}
        <Card className="shadow-sm border-0 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-4 flex items-center justify-between" onClick={() => navigate("/service-selection")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{stats.services} Services Available</p>
                <p className="text-xs text-muted-foreground">Browse our service catalog</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
