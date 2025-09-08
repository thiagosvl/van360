import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Motorista } from "@/types/motorista";
import { Admin } from "@/types/admin";

interface SessionContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  motoristaId: string | null;
  isAdmin: boolean;
  motorista: Motorista | null;
  admin: Admin | null;
  ensureMotoristaProfile: () => Promise<void>;
  ensureAdminProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  session: null,
  loading: true,
  motoristaId: null,
  isAdmin: false,
  motorista: null,
  admin: null,
  ensureMotoristaProfile: async () => {},
  ensureAdminProfile: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  
  // Refs to prevent duplicate requests
  const lastUserIdFetched = useRef<string | null>(null);
  const lastAccessTokenFetched = useRef<string | null>(null);
  const fetchInFlight = useRef<boolean>(false);

  // Don't automatically load profiles - only do it on demand
  const maybeLoadProfile = (session: Session | null) => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    
    // Just set loading to false, don't fetch profiles automatically
    setLoading(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Handle auth events explicitly to avoid unnecessary refetches
        if (event === "SIGNED_OUT") {
          setMotorista(null);
          setAdmin(null);
          setLoading(false);
          lastUserIdFetched.current = null;
          lastAccessTokenFetched.current = null;
          fetchInFlight.current = false;
          return;
        }

        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          maybeLoadProfile(session);
        }
        // Ignore TOKEN_REFRESHED to prevent redundant profile queries
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      maybeLoadProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (userId: string) => {
    try {
      // Check if user is a motorista
      const { data: motoristaData, error: motoristaError } = await supabase
        .from("motoristas")
        .select("*")
        .eq("auth_uid", userId)
        .maybeSingle();

      if (motoristaData && !motoristaError) {
        setMotorista(motoristaData);
        setAdmin(null); // Clear admin if motorista found
        setLoading(false);
        return;
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("auth_uid", userId)
        .maybeSingle();

      if (adminData && !adminError) {
        setAdmin(adminData);
        setMotorista(null); // Clear motorista if admin found
      } else {
        // User exists but is neither motorista nor admin
        setMotorista(null);
        setAdmin(null);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      setMotorista(null);
      setAdmin(null);
    } finally {
      setLoading(false);
      fetchInFlight.current = false;
    }
  };

  const ensureMotoristaProfile = async () => {
    if (!user || motorista || fetchInFlight.current) return;
    
    fetchInFlight.current = true;
    try {
      const { data: motoristaData } = await supabase
        .from("motoristas")
        .select("*")
        .eq("auth_uid", user.id)
        .maybeSingle();

      if (motoristaData) {
        setMotorista(motoristaData);
        setAdmin(null);
      }
    } catch (error) {
      console.error("Error fetching motorista profile:", error);
    } finally {
      fetchInFlight.current = false;
    }
  };

  const ensureAdminProfile = async () => {
    if (!user || admin || fetchInFlight.current) return;
    
    fetchInFlight.current = true;
    try {
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("auth_uid", user.id)
        .maybeSingle();

      if (adminData) {
        setAdmin(adminData);
        setMotorista(null);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      fetchInFlight.current = false;
    }
  };

  const value = {
    user,
    session,
    loading,
    motoristaId: motorista?.id || null,
    isAdmin: !!admin,
    motorista,
    admin,
    ensureMotoristaProfile,
    ensureAdminProfile,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
};