import {
    AuthUser,
    Session,
    sessionManager
} from "@/services/sessionManager";
import { useEffect, useRef, useState } from "react";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<AuthUser | null>(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const { data: listener } = sessionManager.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        const newUserId = session?.user?.id ?? null;
        const currentUserId = userRef.current?.id ?? null;
        
        // Handle Initial Session (always updates state)
        if (event === "INITIAL_SESSION") {
            const newUser = session?.user ?? null;
            setSession(session);
            setUser(newUser);
            userRef.current = newUser;
            setLoading(false);
            initialLoadDoneRef.current = true;
            return; 
        }

        // Handle Status Changes
        if (newUserId !== currentUserId) {
          const newUser = session?.user ?? null;
          setSession(session);
          setUser(newUser);
          userRef.current = newUser;
        } else if (event === "SIGNED_OUT") {
           setSession(null);
           setUser(null);
           userRef.current = null;
        }
        
        // Always ensure loading is false after any auth event
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}
