import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { erpnext } from "@/lib/api";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already logged in, go to dashboard
  useEffect(() => {
    const check = async () => {
      const stored = localStorage.getItem('edv_user');
      if (stored) navigate('/dashboard', { replace: true });
    };
    check();
  }, [navigate]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await erpnext.login(email, password);

      if (res.message === "Logged In") {
        // Store user info
        localStorage.setItem("edv_user", JSON.stringify({ email, name: res.full_name || email }));
        localStorage.setItem("edv_fullname", res.full_name || email);

        toast({
          title: "Success",
          description: `Welcome to e-DigiVault, ${res.full_name || 'User'}!`,
        });

        navigate("/dashboard");
      } else {
        throw new Error(res.message || "Invalid credentials");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
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
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input-field"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Demo accounts info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Demo accounts</p>
          <p className="text-xs text-muted-foreground text-center">client1@demo.com / Chilume@123</p>
          <p className="text-xs text-muted-foreground text-center">aravindh@chilume.com / Chilume@123</p>
        </div>

        {/* Register Link */}
        <p className="text-center mt-6 text-muted-foreground">
          Don't have an account?{" "}
          <a href="/" className="link-text">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
