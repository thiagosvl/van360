import { useProfile } from "./useProfile";
import { useSession } from "./useSession";

export function useAppPreferences() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const formatoNomeResponsavel: "primeiro_nome" | "completo" =
    profile?.configuracoes?.formato_nome_responsavel || "primeiro_nome";

  return {
    formatoNomeResponsavel,
    isNomeCompleto: formatoNomeResponsavel === "completo",
  };
}
