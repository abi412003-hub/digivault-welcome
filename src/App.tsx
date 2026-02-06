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
import EKathaServices from "./pages/EKathaServices";
import ServiceDetails from "./pages/ServiceDetails";
import RequiredDocuments from "./pages/RequiredDocuments";
import UploadCommonDocuments from "./pages/UploadCommonDocuments";
import ServiceSpecificDocuments from "./pages/ServiceSpecificDocuments";
import ReviewDocuments from "./pages/ReviewDocuments";
import VideoVerification from "./pages/VideoVerification";
import SelectCharges from "./pages/SelectCharges";
import BasicCharges from "./pages/BasicCharges";
import EstimatedCharges from "./pages/EstimatedCharges";
import GovFees from "./pages/GovFees";
import Payment from "./pages/Payment";
import Settings from "./pages/Settings";
import Proposals from "./pages/Proposals";
import Estimate from "./pages/Estimate";
import Invoice from "./pages/Invoice";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Properties from "./pages/Properties";
import Transactions from "./pages/Transactions";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectOpinion from "./pages/ProjectOpinion";
import EFiles from "./pages/EFiles";
import NotificationsSettings from "./pages/settings/NotificationsSettings";
import LanguagePreference from "./pages/settings/LanguagePreference";
import PrivacySettings from "./pages/settings/PrivacySettings";
import Feedback from "./pages/settings/Feedback";
import ContactSupport from "./pages/settings/ContactSupport";
import UserManual from "./pages/settings/UserManual";
import FAQHelp from "./pages/settings/FAQHelp";
import AllPages from "./pages/AllPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
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
          <Route path="/e-katha-services" element={<EKathaServices />} />
          <Route path="/service-details" element={<ServiceDetails />} />
          <Route path="/required-documents" element={<RequiredDocuments />} />
          <Route path="/upload-common-documents" element={<UploadCommonDocuments />} />
          <Route path="/review-documents" element={<ReviewDocuments />} />
          <Route path="/video-verification" element={<VideoVerification />} />
          <Route path="/select-charges" element={<SelectCharges />} />
          <Route path="/basic-charges" element={<BasicCharges />} />
          <Route path="/estimated-charges" element={<EstimatedCharges />} />
          <Route path="/gov-fees" element={<GovFees />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/service-specific-documents" element={<ServiceSpecificDocuments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/project-details" element={<ProjectDetails />} />
          <Route path="/project-opinion" element={<ProjectOpinion />} />
          <Route path="/e-files" element={<EFiles />} />
          <Route path="/settings/notifications" element={<NotificationsSettings />} />
          <Route path="/settings/language" element={<LanguagePreference />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/settings/feedback" element={<Feedback />} />
          <Route path="/settings/support" element={<ContactSupport />} />
          <Route path="/settings/manual" element={<UserManual />} />
          <Route path="/settings/faq" element={<FAQHelp />} />
          <Route path="/all-pages" element={<AllPages />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
