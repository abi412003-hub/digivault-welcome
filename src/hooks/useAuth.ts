import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { erpnext } from "@/lib/api";

/**
 * Hook that checks for an active ERPNext session.
 * Redirects to /login if not authenticated.
 */
export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem('edv_user');
      if (!stored) {
        navigate("/login");
        return;
      }
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setSession({ user: parsed, access_token: 'erpnext-session' });
      setIsLoading(false);

      // Verify session is still valid with ERPNext
      try {
        const loggedUser = await erpnext.getLoggedUser();
        if (!loggedUser) {
          localStorage.removeItem('edv_user');
          navigate("/login");
        }
      } catch {
        // Network error — keep going with stored session
      }
    };

    checkAuth();
  }, [navigate]);

  return { isLoading, session, user };
}
