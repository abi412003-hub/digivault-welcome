import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileUp, Shield, BarChart3 } from "lucide-react";

type OnboardingScreen = "splash" | "screen1" | "screen2" | "screen3";

const Onboarding = () => {
  const [currentScreen, setCurrentScreen] = useState<OnboardingScreen>("splash");
  const navigate = useNavigate();

  // Auto-advance from splash after 1.5 seconds
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("screen1");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleNext = () => {
    switch (currentScreen) {
      case "screen1":
        setCurrentScreen("screen2");
        break;
      case "screen2":
        setCurrentScreen("screen3");
        break;
      case "screen3":
        navigate("/register");
        break;
    }
  };

  const handleSkip = () => {
    navigate("/register");
  };

  const getProgressDots = () => {
    const screens: OnboardingScreen[] = ["screen1", "screen2", "screen3"];
    const currentIndex = screens.indexOf(currentScreen);
    
    return (
      <div className="flex gap-2">
        {screens.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  // Splash Screen
  if (currentScreen === "splash") {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-brand-accent tracking-tight">
          e-DigiVault
        </h1>
      </div>
    );
  }

  // Content screens data
  const screenData = {
    screen1: {
      icon: FileUp,
      title: "Upload with Confidence",
      subtitle: "Moderators can securely upload documents with detailed metadata.",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    screen2: {
      icon: Shield,
      title: "Safe and Secure",
      subtitle: "In-Charge roles review, verify, or reject documents transparently.",
      iconBg: "bg-status-success-light",
      iconColor: "text-status-success",
    },
    screen3: {
      icon: BarChart3,
      title: "Track Your Work",
      subtitle: "Clients can check statuses, view, download, and share verified documents anytime.",
      iconBg: "bg-status-warning-light",
      iconColor: "text-status-warning",
    },
  };

  const data = screenData[currentScreen];
  const IconComponent = data.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Skip Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-16">
        {/* Illustration */}
        <div className={`w-32 h-32 ${data.iconBg} rounded-full flex items-center justify-center mb-10`}>
          <IconComponent className={`w-16 h-16 ${data.iconColor}`} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-4">
          {data.title}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center max-w-xs leading-relaxed">
          {data.subtitle}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-6 pb-8">
        {/* Progress Dots */}
        {getProgressDots()}

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <ArrowRight className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
