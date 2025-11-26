import { useCallback, useMemo } from "react";
import { useProfile } from "./useProfile";
import { usePassageiroContagem } from "../api/usePassageiroContagem";
import { usePassageiro } from "../api/usePassageiro";
import { Usuario } from "@/types/usuario";

export interface ValidacaoFranquiaResult {
  podeAtivar: boolean;
  franquiaContratada: number;
  cobrancasEmUso: number;
  restante: number;
}

/**
 * Hook para validar franquia de cobranças automáticas usando dados já carregados via hooks
 * Este hook usa os dados do React Query para evitar chamadas duplicadas à API
 * 
 * @param authUid - O auth_uid do usuário (user?.id do Supabase), não o ID da tabela usuarios
 * @param passageiroIdAtual - ID do passageiro atual (opcional)
 * @param profileProp - Profile já carregado (opcional, para evitar chamadas duplicadas de useProfile)
 */
export function useValidarFranquia(
  authUid?: string, 
  passageiroIdAtual?: string,
  profileProp?: Usuario | null
) {
  // Só chamar useProfile se não receber profile como prop
  // E usar authUid (user?.id) ao invés de profile?.id
  const { profile: profileFromHook } = useProfile(profileProp ? undefined : authUid);
  const profile = profileProp || profileFromHook;
  
  // Buscar contagem de passageiros com cobranças automáticas
  // Usar profile?.id (ID da tabela usuarios) para buscar contagem
  const usuarioIdForContagem = profile?.id;
  const { data: countData = { count: 0 } } = usePassageiroContagem(
    usuarioIdForContagem,
    { enviar_cobranca_automatica: "true" },
    { enabled: !!usuarioIdForContagem }
  );

  // Buscar passageiro atual se necessário
  const { data: passageiroAtual } = usePassageiro(
    passageiroIdAtual,
    { enabled: !!passageiroIdAtual }
  );

  // Calcular validação usando dados já carregados
  const validacao = useMemo((): ValidacaoFranquiaResult => {
    // Usar profile?.id (ID da tabela usuarios) para buscar contagem
    const usuarioIdFromProfile = profile?.id;
    
    if (!usuarioIdFromProfile || !profile?.assinaturas_usuarios?.[0]) {
      return {
        podeAtivar: false,
        franquiaContratada: 0,
        cobrancasEmUso: 0,
        restante: 0,
      };
    }

    const assinatura = profile.assinaturas_usuarios[0];
    const franquiaContratada = assinatura.franquia_contratada_cobrancas || 0;

    // Usar dados já carregados via hooks
    let cobrancasEmUso = countData.count ?? 0;

    // Se estamos editando um passageiro que já estava ativo, não contar ele
    if (passageiroIdAtual && passageiroAtual?.enviar_cobranca_automatica === true) {
      cobrancasEmUso = Math.max(0, cobrancasEmUso - 1);
    }

    const restante = Math.max(0, franquiaContratada - cobrancasEmUso);
    const podeAtivar = restante > 0;

    return {
      podeAtivar,
      franquiaContratada,
      cobrancasEmUso,
      restante,
    };
  }, [profile, countData, passageiroIdAtual, passageiroAtual]);

  // Função para validar (mantida para compatibilidade, mas agora usa dados em memória)
  const validar = useCallback(async (): Promise<ValidacaoFranquiaResult> => {
    return validacao;
  }, [validacao]);

  return {
    validacao,
    validar,
    isLoading: false, // Dados já estão carregados via hooks
  };
}

