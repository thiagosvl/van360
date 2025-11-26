import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      const { data } = await supabase.auth.getSession();
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
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        // Ignorar o evento INITIAL_SESSION completamente
        // O loadInitial já carrega a sessão inicial, não precisamos do evento
        if (event === "INITIAL_SESSION") {
          return;
        }
        
        // Só atualizar se o ID do usuário realmente mudou
        // Isso evita atualizações desnecessárias que causam requisições duplicadas
        const newUserId = session?.user?.id ?? null;
        const currentUserId = userRef.current?.id ?? null;
        
        if (newUserId !== currentUserId) {
          const newUser = session?.user ?? null;
          setSession(session);
          setUser(newUser);
          userRef.current = newUser;
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
