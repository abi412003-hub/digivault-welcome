import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RegistrationTypeValue = "individual" | "organization" | "land_aggregator";

const Register = () => {
  const location = useLocation();
  const registrationType = (location.state?.registrationType as RegistrationTypeValue) || "individual";
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRegistrationLabel = () => {
    switch (registrationType) {
      case "organization":
        return "Organization";
      case "land_aggregator":
        return "Land Aggregator";
      default:
        return "Individual";
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (!phoneNumber.startsWith("+")) {
      return `+91${digits}`;
    }
    return `+${digits}`;
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setIsOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      if (data.user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        // If no profile exists, create one with the selected registration type
        if (!profile) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            role: "client",
            user_type: registrationType,
            phone: formattedPhone,
          });

          if (insertError) throw insertError;
        }

        toast({
          title: "Welcome!",
          description: "Your account has been created successfully",
        });

        // Navigate based on registration type
        if (registrationType === "individual") {
          navigate("/individual-registration", { state: { phone: formattedPhone } });
        } else if (registrationType === "organization") {
          navigate("/organization-registration", { state: { phone: formattedPhone } });
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/registration-type");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Header with Back */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Registering as <span className="text-primary font-medium">{getRegistrationLabel()}</span>
            </p>
          </div>

        {/* Form */}
        <div className="space-y-6">
          {!isOtpSent ? (
            <>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Mobile Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile number"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="input-field text-center tracking-widest text-lg"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? "Verifying..." : "Verify & Register"}
              </button>

              <button
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp("");
                }}
                className="w-full text-center text-muted-foreground text-sm hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                Change number
              </button>
            </>
          )}
        </div>

          {/* Login Link */}
          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/" className="link-text">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
