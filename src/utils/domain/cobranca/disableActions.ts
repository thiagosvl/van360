import {
    PASSAGEIRO_COBRANCA_STATUS_ATRASADO,
    PASSAGEIRO_COBRANCA_STATUS_PAGO,
    PASSAGEIRO_COBRANCA_STATUS_PENDENTE
} from "@/constants";
import { Cobranca } from "@/types/cobranca";
// Função depreciada removida: planoPermiteEnviarNotificacao

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

export const canSendNotification = (cobranca: Cobranca): boolean => {
  const isPendingOrOverdue = 
    cobranca.status === PASSAGEIRO_COBRANCA_STATUS_PENDENTE || 
    cobranca.status === PASSAGEIRO_COBRANCA_STATUS_ATRASADO;
    
  // Check for valid QR Code (PIX)
  const hasPix = !!cobranca.qr_code_payload;

  return isPendingOrOverdue && hasPix;
};

export const canViewReceipt = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && !!cobranca.recibo_url && cobranca.recibo_url !== "null";
};