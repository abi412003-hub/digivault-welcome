import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");
    // If it doesn't start with +, assume it needs country code
    if (!phoneNumber.startsWith("+")) {
      // Default to +91 for India if no country code
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
        // Call ensure_profile RPC to create/update profile with safe defaults
        const { error: rpcError } = await supabase.rpc('ensure_profile');
        
        if (rpcError) {
          console.error('Profile ensure error:', rpcError);
        }

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        console.log('User profile:', profile);

        toast({
          title: "Success",
          description: "Welcome to e-DigiVault!",
        });

        // Navigate to Client Dashboard
        navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
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
            Welcome to e-DigiVault
          </h1>
          <p className="text-muted-foreground">Secure Access to Documents</p>
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
                {isLoading ? "Verifying..." : "Verify OTP"}
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

        {/* Register Link */}
        <p className="text-center mt-8 text-muted-foreground">
          Don't have an account?{" "}
          <a href="/onboarding" className="link-text">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
