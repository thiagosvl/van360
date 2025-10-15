import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/usuario";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const fetchProfileByAuthUserId = async (
  authUserId: string
): Promise<Usuario | null> => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_uid", authUserId)
      .single();

    if (error) throw error;

    return data as Usuario;
  } catch (error) {
    console.error("Erro ao buscar usuario:", error);
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Usuario | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Usuario | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        const userProfile = await fetchProfileByAuthUserId(user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false); 
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT"
      ) {
        handleAuthChange(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
};