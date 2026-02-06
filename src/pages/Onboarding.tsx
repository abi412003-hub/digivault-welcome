import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft } from "lucide-react";
import onboardingUpload from "@/assets/onboarding-upload.png";
import onboardingSecure from "@/assets/onboarding-secure.png";
import onboardingTrack from "@/assets/onboarding-track.png";

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
        navigate("/registration-type");
        break;
    }
  };

  const handleBack = () => {
    switch (currentScreen) {
      case "screen2":
        setCurrentScreen("screen1");
        break;
      case "screen3":
        setCurrentScreen("screen2");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const handleSkip = () => {
    navigate("/registration-type");
  };

  const getProgressDots = () => {
    const screens: OnboardingScreen[] = ["screen1", "screen2", "screen3"];
    const currentIndex = screens.indexOf(currentScreen);
    
    return (
      <div className="flex gap-2 items-center">
        {screens.map((_, index) => (
          <div
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "w-2.5 h-2.5 bg-primary" 
                : "w-2 h-2 bg-primary/30"
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
        <h1 className="text-4xl font-bold text-brand-accent tracking-tight animate-fade-in">
          e-DigiVault
        </h1>
      </div>
    );
  }

  // Content screens data
  const screenData = {
    screen1: {
      image: onboardingUpload,
      title: "Upload with Confidence",
      subtitle: '"Moderators can securely upload documents with detailed metadata."',
    },
    screen2: {
      image: onboardingSecure,
      title: "Safe and Secure",
      subtitle: '"In-Charge roles review, verify, or reject documents—transparently."',
    },
    screen3: {
      image: onboardingTrack,
      title: "Track Your Work",
      subtitle: '"Clients can check statuses, view, download, and share verified documents anytime."',
    },
  };

  const data = screenData[currentScreen];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Header with Back and Skip */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleSkip}
          className="px-4 py-1.5 text-primary text-sm font-medium border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        {/* Illustration */}
        <div className="w-full max-w-xs mb-10">
          <img 
            src={data.image} 
            alt={data.title}
            className="w-full h-auto object-contain animate-fade-in"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-primary text-center mb-4">
          {data.title}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center max-w-xs leading-relaxed">
          {data.subtitle}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-6 pb-8">
        {/* Next Button - Ring style */}
        <button
          onClick={handleNext}
          className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-primary bg-transparent hover:bg-primary/5 active:scale-95 transition-all duration-200"
        >
          <ArrowRight className="w-6 h-6 text-primary" />
        </button>

        {/* Progress Dots */}
        {getProgressDots()}
      </div>
    </div>
  );
};

export default Onboarding;
