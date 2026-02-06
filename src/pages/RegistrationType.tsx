import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Building2, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

type RegistrationTypeValue = "individual" | "organization" | "land_aggregator";

interface SelectionCard {
  id: RegistrationTypeValue;
  icon: typeof User;
  label: string;
}

const RegistrationType = () => {
  const [selectedType, setSelectedType] = useState<RegistrationTypeValue | null>(null);
  const navigate = useNavigate();

  const cards: SelectionCard[] = [
    { id: "individual", icon: User, label: "Individual" },
    { id: "organization", icon: Building2, label: "Organization" },
  ];

  const landAggregatorCard: SelectionCard = {
    id: "land_aggregator",
    icon: Landmark,
    label: "Land Aggregator",
  };

  const handleSelect = (type: RegistrationTypeValue) => {
    setSelectedType(type);
    // Navigate to register after a brief delay to show selection
    setTimeout(() => {
      navigate("/register", { state: { registrationType: type } });
    }, 300);
  };

  const handleBack = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome to e-DigiVault
        </h1>
        <p className="text-muted-foreground">Secure Access to Documents</p>
      </div>

      {/* Instruction */}
      <p className="text-center text-foreground font-medium mb-6">
        Please choose how you'd like to Register
      </p>

      {/* Selection Cards */}
      <div className="space-y-4">
        {/* First row - Individual & Organization */}
        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedType === card.id;
            
            return (
              <button
                key={card.id}
                onClick={() => handleSelect(card.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200",
                  "border-2",
                  isSelected
                    ? "bg-primary/15 border-primary"
                    : "bg-card border-transparent shadow-sm hover:shadow-md"
                )}
                style={{ boxShadow: !isSelected ? "var(--shadow-card)" : undefined }}
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center mb-3",
                    isSelected ? "bg-primary/20" : "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-7 h-7",
                      isSelected ? "text-primary" : "text-primary"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Second row - Land Aggregator (full width) */}
        <button
          onClick={() => handleSelect(landAggregatorCard.id)}
          className={cn(
            "w-full flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200",
            "border-2",
            selectedType === landAggregatorCard.id
              ? "bg-primary/15 border-primary"
              : "bg-card border-transparent shadow-sm hover:shadow-md"
          )}
          style={{
            boxShadow:
              selectedType !== landAggregatorCard.id
                ? "var(--shadow-card)"
                : undefined,
          }}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mb-3",
              selectedType === landAggregatorCard.id
                ? "bg-primary/20"
                : "bg-primary/10"
            )}
          >
            <Landmark
              className={cn(
                "w-7 h-7",
                selectedType === landAggregatorCard.id
                  ? "text-primary"
                  : "text-primary"
              )}
            />
          </div>
          <span
            className={cn(
              "font-medium text-sm",
              selectedType === landAggregatorCard.id
                ? "text-primary"
                : "text-foreground"
            )}
          >
            {landAggregatorCard.label}
          </span>
        </button>
      </div>

      {/* Note Section */}
      <div className="mt-8 p-4 bg-muted/50 rounded-xl">
        <h3 className="font-semibold text-foreground mb-2">Note:</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Register as an <span className="text-foreground font-medium">Individual</span> for Personal use.</li>
          <li>Register as a <span className="text-foreground font-medium">Business or Organization</span>.</li>
          <li>Register as a <span className="text-foreground font-medium">Land Aggregator</span>.</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrationType;
