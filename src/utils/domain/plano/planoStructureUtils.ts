import { PLANO_PROFISSIONAL } from "@/constants";
import { Plano, SubPlano } from "@/types/plano";

/**
 * Utilitários para trabalhar com a estrutura de planos e sub-planos
 * (não relacionado a assinaturas ou validações de acesso)
 */

/**
 * Obtém o maior sub-plano do plano Profissional
 * @param planos - Array de planos base
 * @param subPlanos - Array de sub-planos
 * @returns O maior sub-plano ou null se não encontrado
 */
export function getMaiorSubplanoProfissional(
  planos: Plano[],
  subPlanos: SubPlano[]
): SubPlano | null {
  const planoProfissionalBase = planos.find((p) => p.slug === PLANO_PROFISSIONAL);
  if (!planoProfissionalBase) return null;

  const subplanosProfissional = subPlanos.filter(
    (s) => s.parent_id === planoProfissionalBase.id
  );
  if (subplanosProfissional.length === 0) return null;

  return subplanosProfissional.sort(
    (a, b) => b.franquia_cobrancas_mes - a.franquia_cobrancas_mes
  )[0];
}

/**
 * Calcula a quantidade mínima para personalização do plano Profissional
 * A quantidade mínima é o maior sub-plano + 1
 * @param planos - Array de planos base
 * @param subPlanos - Array de sub-planos
 * @returns A quantidade mínima (maior sub-plano + 1) ou null se não houver sub-planos
 */
export function getQuantidadeMinimaPersonalizada(
  planos: Plano[],
  subPlanos: SubPlano[]
): number | null {
  const maiorSubplano = getMaiorSubplanoProfissional(planos, subPlanos);
  if (!maiorSubplano) return null;
  return maiorSubplano.franquia_cobrancas_mes + 1;
}

