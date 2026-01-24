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

    async function loadInitial() {
      const { data } = await sessionManager.getSession();
      if (!mounted) return;
      const initialUser = data.session?.user ?? null;
      setSession(data.session);
      setUser(initialUser);
      userRef.current = initialUser;
      setLoading(false);
      initialLoadDoneRef.current = true;
    }

    const { data: listener } = sessionManager.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        const newUserId = session?.user?.id ?? null;
        const currentUserId = userRef.current?.id ?? null;
        const isInitialEvent = event === "INITIAL_SESSION";
        
        if (newUserId !== currentUserId || (isInitialEvent && session && !userRef.current)) {
          const newUser = session?.user ?? null;
          setSession(session);
          setUser(newUser);
          userRef.current = newUser;
          setLoading(false);
          initialLoadDoneRef.current = true;
        } else if (event === "SIGNED_OUT") {
           setSession(null);
           setUser(null);
           userRef.current = null;
           setLoading(false);
        }
      }
    );

    loadInitial();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}
