import { Cobranca } from "@/types/cobranca";

export const seForPago = (cobranca: Cobranca): boolean => {
    return cobranca.status === "pago";
}

export const seOrigemManual = (cobranca: Cobranca): boolean => {
    return cobranca.origem === "manual";
}

export const seOrigemAutomatica = (cobranca: Cobranca): boolean => {
    return cobranca.origem === "automatica";
}

export const disableRegistrarPagamento = (cobranca: Cobranca): boolean => {
    return seForPago(cobranca);
};

export const disableEnviarNotificacao = (cobranca: Cobranca): boolean => {
    return seForPago(cobranca) || (!seForPago(cobranca) && !cobranca.asaas_payment_id);
};

export const disableToggleLembretes = (cobranca: Cobranca): boolean => {
    return seForPago(cobranca) || (!seForPago(cobranca) && !cobranca.asaas_payment_id);
};

export const disableDesfazerPagamento = (cobranca: Cobranca): boolean => {
    return !seForPago(cobranca) || !cobranca.pagamento_manual;
};

export const disableExcluirCobranca = (cobranca: Cobranca): boolean => {
    return seForPago(cobranca);
};

export const disableBaixarBoleto = (cobranca: Cobranca): boolean => {
    return !cobranca.asaas_bankslip_url || seForPago(cobranca);
}

export const disableVerPaginaPagamento = (cobranca: Cobranca): boolean => {
    return !cobranca.asaas_invoice_url || seForPago(cobranca);
}