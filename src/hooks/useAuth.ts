import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * Hook that checks for an active Supabase session.
 * Redirects to /login if not authenticated.
 * Returns { isLoading, session, user }
 */
export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) {
        navigate("/login");
        return;
      }
      setSession(s);
      setUser(s.user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) {
        navigate("/login");
      } else {
        setSession(s);
        setUser(s.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { isLoading, session, user };
}
