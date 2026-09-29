import {
    AuthUser,
    Session,
    sessionManager
} from "@/services/sessionManager";
import { useEffect, useRef, useState } from "react";

export function useSession() {
  const [session, setSession] = useState<Session | null>(() => sessionManager.getCurrentSession());
  const [user, setUser] = useState<AuthUser | null>(() => sessionManager.getCurrentUser());
  const [loading, setLoading] = useState(() => !sessionManager.getCurrentSession());
  const userRef = useRef<AuthUser | null>(user);
  const initialLoadDoneRef = useRef(!!session);

  useEffect(() => {
    let mounted = true;

    const { data: listener } = sessionManager.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        const newUserId = session?.user?.id ?? null;
        const currentUserId = userRef.current?.id ?? null;
        
        if (event === "INITIAL_SESSION") {
            const newUser = session?.user ?? null;
            setSession(session);
            setUser(newUser);
            userRef.current = newUser;
            setLoading(false);
            initialLoadDoneRef.current = true;
            return; 
        }

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
