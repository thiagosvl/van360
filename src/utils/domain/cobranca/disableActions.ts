import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";

export const seForPago = (cobranca: Cobranca): boolean => {
  return cobranca.status === CobrancaStatus.PAGO;
};

export const disableRegistrarPagamento = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca);
};

export const disableExcluirCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && cobranca.pagamento_manual;
};

export const disableEditarCobranca = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && cobranca.pagamento_manual;
};

export const canSendNotification = (cobranca: Cobranca): boolean => {
  const isPendingOrOverdue =
    cobranca.status === CobrancaStatus.PENDENTE;

  return isPendingOrOverdue;
};

export const canViewReceipt = (cobranca: Cobranca): boolean => {
  return seForPago(cobranca) && !!cobranca.recibo_url && cobranca.recibo_url !== "null";
};