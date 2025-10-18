export const seForPago = (cobranca): boolean => {
    return cobranca.status === "pago";
}

export const seOrigemManual = (cobranca): boolean => {
    return cobranca.origem === "manual";
}

export const seOrigemAutomatica = (cobranca): boolean => {
    return cobranca.origem === "automatica";
}

export const disableRegistrarPagamento = (cobranca): boolean => {
    return seForPago(cobranca);
};

export const disableEnviarNotificacao = (cobranca): boolean => {
    return seForPago(cobranca) || (!seForPago(cobranca) && seOrigemManual(cobranca));
};

export const disableToggleLembretes = (cobranca): boolean => {
    return seForPago(cobranca) || (!seForPago(cobranca) && seOrigemManual(cobranca));
};

export const disableDesfazerPagamento = (cobranca): boolean => {
    return !seForPago(cobranca) || !cobranca.pagamento_manual;
};

export const disableExcluirCobranca = (cobranca): boolean => {
    return seForPago(cobranca);
};

export const disableBaixarBoleto = (cobranca): boolean => {
    return !cobranca.asaas_bankslip_url || seForPago(cobranca);
}

export const disableVerPaginaPagamento = (cobranca): boolean => {
    return !cobranca.asaas_invoice_url || seForPago(cobranca);
}