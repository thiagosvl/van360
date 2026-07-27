import { Passageiro } from "@/types/passageiro";
import { isResponsavelMockNome, isResponsavelMockTelefone } from "@/utils/formatters/name";

/**
 * Verifica se um responsável (principal ou adicional) possui dados incompletos ou dados mock do onboarding.
 */
export const isResponsavelIncompleto = (
  nome?: string | null,
  telefone?: string | null
): boolean => {
  const isNomeInvalido = !nome || nome.trim() === "" || isResponsavelMockNome(nome);
  const isTelefoneInvalido = !telefone || telefone.trim() === "" || isResponsavelMockTelefone(telefone);

  return isNomeInvalido || isTelefoneInvalido;
};

/**
 * Verifica se o cadastro geral do passageiro está incompleto.
 * Um cadastro é considerado incompleto se:
 * - O valor da cobrança for zero ou não informado
 * - Os dados do responsável principal estiverem incompletos (nome/telefone nulo, vazio ou mock)
 */
export const isCadastroPassageiroIncompleto = (
  passageiro?: Partial<Passageiro> | null
): boolean => {
  if (!passageiro) return true;

  const isValorInvalido = !passageiro.valor_cobranca || Number(passageiro.valor_cobranca) <= 0;
  const isResponsavelPrincipalIncompleto = isResponsavelIncompleto(
    passageiro.nome_responsavel,
    passageiro.telefone_responsavel
  );

  return isValorInvalido || isResponsavelPrincipalIncompleto;
};
