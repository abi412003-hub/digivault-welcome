import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Bell, 
  Languages, 
  KeyRound, 
  MessageSquareText, 
  HeadphonesIcon, 
  BookOpen, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

interface SettingsItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
}

const Settings = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Get user name from local storage
    const individualProfile = localStorage.getItem("individualProfile");
    const organizationProfile = localStorage.getItem("organizationProfile");

    if (individualProfile) {
      try {
        const parsed = JSON.parse(individualProfile);
        if (parsed.fullName) {
          setUserName(parsed.fullName);
        }
      } catch (e) {
        console.error("Error parsing individual profile:", e);
      }
    } else if (organizationProfile) {
      try {
        const parsed = JSON.parse(organizationProfile);
        if (parsed.representativeName) {
          setUserName(parsed.representativeName);
        }
      } catch (e) {
        console.error("Error parsing organization profile:", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    // Clear local storage
    localStorage.removeItem("individualProfile");
    localStorage.removeItem("organizationProfile");
    localStorage.removeItem("registrationType");
    localStorage.removeItem("currentProject");
    localStorage.removeItem("currentProperty");
    localStorage.removeItem("selectedMainService");
    localStorage.removeItem("edigivault_projects");
    localStorage.removeItem("edigivault_activities");
    localStorage.removeItem("edigivault_properties");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Navigate to login
    navigate("/");
  };

  const settingsItems: SettingsItem[] = [
    { label: "Notifications", icon: Bell, path: "/settings/notifications" },
    { label: "Language preference", icon: Languages, path: "/settings/language" },
    { label: "Privacy Settings", icon: KeyRound, path: "/settings/privacy" },
    { label: "Feedback", icon: MessageSquareText, path: "/settings/feedback" },
    { label: "Contact Support", icon: HeadphonesIcon, path: "/settings/support" },
    { label: "User Manual", icon: BookOpen, path: "/settings/manual" },
    { label: "FAQ/Help", icon: HelpCircle, path: "/settings/faq" },
    { label: "Log Out", icon: LogOut, action: () => setShowLogoutDialog(true) },
  ];

  const handleItemClick = (item: SettingsItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Blue Profile Header */}
      <div className="bg-primary rounded-b-[40px] pt-4 pb-8 px-4 shadow-lg">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Profile Photo and Name */}
        <div className="flex flex-col items-center mt-4">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-white text-primary text-2xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-xl font-semibold text-white">{userName}</h2>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4">
        <h1 className="text-xl font-bold text-foreground mb-4">Settings</h1>

        {/* Settings List */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={item.label}>
                <button
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                {index < settingsItems.length - 1 && (
                  <div className="h-px bg-border ml-18" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-[90%] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="flex-1 bg-destructive hover:bg-destructive/90"
              onClick={handleLogout}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Settings;
