import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { Cobranca } from "@/types/cobranca";
import { canUseNotificacoes } from "@/utils/domain/plano/accessRules";

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
  plano?: { IsProfissionalPlan?: boolean; isValidPlan?: boolean; isActive?: boolean; isEssentialPlan?: boolean; isValidTrial?: boolean; isTrial?: boolean } | null
): boolean => {
  return canUseNotificacoes(plano as any);
};

export const disableDesfazerPagamento = (cobranca: Cobranca): boolean => {
  return !seForPago(cobranca) || !cobranca.pagamento_manual;
};

export const disableExcluirCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && !sePagamentoManual(cobranca);
};

export const disableEditarCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && !sePagamentoManual(cobranca);
};

export const sePagamentoManual = (cobranca: Cobranca): boolean => {
  return cobranca.pagamento_manual;
};