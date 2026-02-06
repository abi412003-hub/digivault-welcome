import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import RegistrationType from "./pages/RegistrationType";
import IndividualRegistration from "./pages/IndividualRegistration";
import OrganizationRegistration from "./pages/OrganizationRegistration";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import CreateProperty from "./pages/CreateProperty";
import PropertyReview from "./pages/PropertyReview";
import ServiceSelection from "./pages/ServiceSelection";
import ServiceDetails from "./pages/ServiceDetails";
import Settings from "./pages/Settings";
import Proposals from "./pages/Proposals";
import Estimate from "./pages/Estimate";
import Invoice from "./pages/Invoice";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/registration-type" element={<RegistrationType />} />
          <Route path="/register" element={<Register />} />
          <Route path="/individual-registration" element={<IndividualRegistration />} />
          <Route path="/organization-registration" element={<OrganizationRegistration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/create-property" element={<CreateProperty />} />
          <Route path="/property-review" element={<PropertyReview />} />
          <Route path="/service-selection" element={<ServiceSelection />} />
          <Route path="/service-details" element={<ServiceDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
