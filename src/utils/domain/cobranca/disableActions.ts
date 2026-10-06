import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";

export const seForPago = (cobranca: Cobranca): boolean => {
  return cobranca.status === CobrancaStatus.PAGO;
};

export const disableRegistrarPagamento = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) || cobranca.status === CobrancaStatus.CANCELADA || !!cobranca.repasse_em_processamento;
};

export const disableExcluirCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) || cobranca.status === CobrancaStatus.CANCELADA || !!cobranca.repasse_em_processamento;
};

export const disableEditarCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) || cobranca.status === CobrancaStatus.CANCELADA || !!cobranca.repasse_em_processamento;
};

export const disableDesfazerPagamento = (cobranca: Cobranca): boolean => {
  return !seForPago(cobranca) || cobranca.pagamento_manual !== true || !!cobranca.repasse_em_processamento;
};

export const canSendNotification = (cobranca: Cobranca): boolean => {
  const isPendingOrOverdue =
    cobranca.status === CobrancaStatus.PENDENTE;

  return isPendingOrOverdue;
};

export const canViewReceipt = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && !!cobranca.recibo_url && cobranca.recibo_url !== "null";
};