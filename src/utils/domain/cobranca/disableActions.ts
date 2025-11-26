import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
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

export const podeEnviarNotificacao = (
  cobranca: Cobranca,
  plano?: { isCompletePlan?: boolean; isValidPlan?: boolean } | null
): boolean => {
  const isPendente = cobranca.status !== 'PAGO'; // ou !seForPago(cobranca)

  const isPlanoValido = !!(plano?.isCompletePlan && plano?.isValidPlan);

  return isPendente && isPlanoValido;
};

export const disableDesfazerPagamento = (cobranca: Cobranca): boolean => {
  return !seForPago(cobranca) || !cobranca.pagamento_manual;
};

export const disableExcluirCobranca = (cobranca: Cobranca): boolean => {
  return false;
};