import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { canUseNotificacoes } from "@/utils/domain/plano/accessRules";
import { Cobranca } from "@/types/cobranca";

export const seForPago = (cobranca: Cobranca): boolean => {
  return cobranca.status === PASSAGEIRO_COBRANCA_STATUS_PAGO;
};

export const seOrigemManual = (cobranca: Cobranca): boolean => {
  return cobranca.origem === "manual";
};

export const seOrigemAutomatica = (cobranca: Cobranca): boolean => {
  return cobranca.origem === "automatica";
};

export const disableRegistrarPagamento = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca);
};

/**
 * Valida se o plano do usuário permite enviar notificações
 * @param plano - Objeto com informações do plano do usuário (retornado por useProfile)
 * @returns true se o plano permite enviar notificações
 */
export const planoPermiteEnviarNotificacao = (
  plano?: { isCompletePlan?: boolean; isValidPlan?: boolean; isActive?: boolean; isEssentialPlan?: boolean; isValidTrial?: boolean; isTrial?: boolean } | null
): boolean => {
  return canUseNotificacoes(plano as any);
};

/**
 * Valida se a cobrança pode receber notificação
 * Uma cobrança pode receber notificação se:
 * - Não estiver paga
 * - Estiver vencida (data_vencimento < hoje)
 * @param cobranca - Objeto da cobrança
 * @returns true se a cobrança pode receber notificação
 */
export const cobrancaPodeReceberNotificacao = (cobranca: Cobranca): boolean => {
  // Não pode receber notificação se já estiver paga
  if (seForPago(cobranca)) {
    return false;
  }

  // Verifica se a data de vencimento já passou (está vencida)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const dataVencimento = new Date(cobranca.data_vencimento);
  dataVencimento.setHours(0, 0, 0, 0);

  return dataVencimento < hoje;
};

export const disableDesfazerPagamento = (cobranca: Cobranca): boolean => {
  return !seForPago(cobranca) || !cobranca.pagamento_manual;
};

export const disableExcluirCobranca = (cobranca: Cobranca): boolean => {
  return false;
};

export const disableEditarCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && !sePagamentoManual(cobranca);
};

export const sePagamentoManual = (cobranca: Cobranca): boolean => {
  return cobranca.pagamento_manual;
};