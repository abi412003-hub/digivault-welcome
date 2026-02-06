import { Link } from "react-router-dom";

const AllPages = () => {
  const pages = [
    { path: "/", label: "Index / Welcome" },
    { path: "/onboarding", label: "Onboarding" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
    { path: "/registration-type", label: "Registration Type" },
    { path: "/individual-registration", label: "Individual Registration" },
    { path: "/organization-registration", label: "Organization Registration" },
    { path: "/create-project", label: "Create Project" },
    { path: "/create-property", label: "Create Property" },
    { path: "/property-review", label: "Property Review" },
    { path: "/service-selection", label: "Service Selection" },
    { path: "/service-details", label: "Service Details" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/properties", label: "Properties / Details" },
    { path: "/project-details", label: "Project Details" },
    { path: "/project-opinion", label: "Project Opinion" },
    { path: "/e-files", label: "E-Files" },
    { path: "/transactions", label: "Transactions" },
    { path: "/proposals", label: "Proposals" },
    { path: "/estimate", label: "Estimate" },
    { path: "/invoice", label: "Invoice" },
    { path: "/settings", label: "Settings" },
    { path: "/settings/notifications", label: "Notifications Settings" },
    { path: "/settings/language", label: "Language Preference" },
    { path: "/settings/privacy", label: "Privacy Settings" },
    { path: "/settings/feedback", label: "Feedback" },
    { path: "/settings/contact", label: "Contact Support" },
    { path: "/settings/manual", label: "User Manual" },
    { path: "/settings/faq", label: "FAQ / Help" },
    { path: "/privacy", label: "Privacy Policy" },
    { path: "/terms", label: "Terms of Service" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">All Pages</h1>
      <div className="space-y-2">
        {pages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="block p-3 bg-card rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <span className="text-foreground font-medium">{page.label}</span>
            <span className="text-muted-foreground text-sm ml-2">{page.path}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllPages;
