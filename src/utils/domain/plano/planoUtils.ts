import { PLANO_COMPLETO } from "@/constants";
import { Plano, SubPlano } from "@/types/plano";

/**
 * Obtém o maior sub-plano do plano Completo
 * @param planos - Array de planos base
 * @param subPlanos - Array de sub-planos
 * @returns O maior sub-plano ou null se não encontrado
 */
export function getMaiorSubplanoCompleto(
  planos: Plano[],
  subPlanos: SubPlano[]
): SubPlano | null {
  const planoCompletoBase = planos.find((p) => p.slug === PLANO_COMPLETO);
  if (!planoCompletoBase) return null;

  const subplanosCompleto = subPlanos.filter(
    (s) => s.parent_id === planoCompletoBase.id
  );
  if (subplanosCompleto.length === 0) return null;

  return subplanosCompleto.sort(
    (a, b) => b.franquia_cobrancas_mes - a.franquia_cobrancas_mes
  )[0];
}

/**
 * Obtém a quantidade mínima para plano personalizado
 * Mínimo = maior sub-plano + 1
 * @param planos - Array de planos base
 * @param subPlanos - Array de sub-planos
 * @returns Quantidade mínima ou null se não encontrado
 */
export function getQuantidadeMinimaPersonalizada(
  planos: Plano[],
  subPlanos: SubPlano[]
): number | null {
  const maiorSubplano = getMaiorSubplanoCompleto(planos, subPlanos);
  if (!maiorSubplano) return null;
  return maiorSubplano.franquia_cobrancas_mes + 1;
}

/**
 * Obtém a assinatura ativa do perfil do usuário
 * @param profile - Perfil do usuário com assinaturas
 * @returns Assinatura ativa ou null se não encontrada
 */
export function getAssinaturaAtiva(profile: any) {
  if (!profile?.assinaturas_usuarios) return null;
  return profile.assinaturas_usuarios.find((a: any) => a.ativo === true) || null;
}

