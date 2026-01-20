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
      // Marcar como carregado imediatamente após setar os valores
      initialLoadDoneRef.current = true;
    }

    // Configurar o listener ANTES de carregar a sessão inicial
    // Isso garante que capturamos o evento INITIAL_SESSION corretamente
    const { data: listener } = sessionManager.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        // Em casos de race condition, o INITIAL_SESSION pode ser útil se loadInitial falhar
        // ou se o cliente Supabase emitir o evento após o loadInitial
        
        // Só atualizar se o ID do usuário realmente mudou ou se for uma sessão inicial válida
        const newUserId = session?.user?.id ?? null;
        const currentUserId = userRef.current?.id ?? null;
        const isInitialEvent = event === "INITIAL_SESSION";
        
        // Se temos uma sessão nova e o estado atual é vazio, atualize!
        if (newUserId !== currentUserId || (isInitialEvent && session && !userRef.current)) {
          const newUser = session?.user ?? null;
          setSession(session);
          setUser(newUser);
          userRef.current = newUser;
          // Se recebemos um evento de sessão, não estamos mais carregando
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

    // Carregar a sessão inicial DEPOIS de configurar o listener
    loadInitial();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}
