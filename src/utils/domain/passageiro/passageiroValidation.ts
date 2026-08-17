import { Passageiro } from "@/types/passageiro";

/**
 * Verifica se um responsável (principal ou adicional) possui dados incompletos.
 */
export const isResponsavelIncompleto = (
  nome?: string | null,
  telefone?: string | null
): boolean => {
  const isNomeInvalido = !nome || nome.trim() === "";
  const isTelefoneInvalido = !telefone || telefone.trim() === "";

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

  if (passageiro.isento === true) {
    return isResponsavelIncompleto(
      passageiro.responsavel_principal?.nome,
      passageiro.responsavel_principal?.telefone
    );
  }

  const isValorInvalido = !passageiro.valor_cobranca || Number(passageiro.valor_cobranca) <= 0;
  const isResponsavelPrincipalIncompleto = isResponsavelIncompleto(
    passageiro.responsavel_principal?.nome,
    passageiro.responsavel_principal?.telefone
  );

  return isValorInvalido || isResponsavelPrincipalIncompleto;
};
