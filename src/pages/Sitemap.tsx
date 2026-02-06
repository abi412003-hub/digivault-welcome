import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const routes = [
  { path: "/", label: "Login", category: "Auth" },
  { path: "/onboarding", label: "Onboarding", category: "Auth" },
  { path: "/registration-type", label: "Registration Type", category: "Auth" },
  { path: "/register", label: "Register (OTP)", category: "Auth" },
  { path: "/individual-registration", label: "Individual Registration", category: "Auth" },
  { path: "/organization-registration", label: "Organization Registration", category: "Auth" },
  { path: "/dashboard", label: "Dashboard", category: "Main" },
  { path: "/projects", label: "Projects List", category: "Main" },
  { path: "/projects/create", label: "Create Project", category: "Main" },
  { path: "/properties", label: "Properties (Details)", category: "Main" },
  { path: "/create-property", label: "Create Property", category: "Main" },
  { path: "/property-review", label: "Property Review", category: "Main" },
  { path: "/project-details", label: "Project Details", category: "Main" },
  { path: "/project-opinion", label: "Project Opinion", category: "Main" },
  { path: "/e-files", label: "E-Files", category: "Main" },
  { path: "/service-selection", label: "Service Selection", category: "Services" },
  { path: "/service-details", label: "Service Details", category: "Services" },
  { path: "/transactions", label: "Transactions", category: "Main" },
  { path: "/proposals", label: "Proposals", category: "Actions" },
  { path: "/estimate", label: "Estimate", category: "Actions" },
  { path: "/invoice", label: "Invoice", category: "Actions" },
  { path: "/settings", label: "Settings", category: "Settings" },
  { path: "/settings/notifications", label: "Notifications Settings", category: "Settings" },
  { path: "/settings/language", label: "Language Preference", category: "Settings" },
  { path: "/settings/privacy", label: "Privacy Settings", category: "Settings" },
  { path: "/settings/feedback", label: "Feedback", category: "Settings" },
  { path: "/settings/support", label: "Contact Support", category: "Settings" },
  { path: "/settings/manual", label: "User Manual", category: "Settings" },
  { path: "/settings/faq", label: "FAQ / Help", category: "Settings" },
  { path: "/terms", label: "Terms & Conditions", category: "Legal" },
  { path: "/privacy", label: "Privacy Policy", category: "Legal" },
];

const categories = ["Auth", "Main", "Services", "Actions", "Settings", "Legal"];

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">📍 All Pages</h1>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {routes
                  .filter((r) => r.category === category)
                  .map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {route.label}
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sitemap;
