
export const disableRegistrarPagamento = (cobranca): boolean => {
    return cobranca.status === "pago";
};

export const disableEnviarNotificacao = (cobranca): boolean => {
    return cobranca.status === "pago" || cobranca.origem === "manual";
};

export const disableToggleLembretes = (cobranca): boolean => {
    return disableEnviarNotificacao(cobranca);
};

export const disableDesfazerPagamento = (cobranca): boolean => {
    return cobranca.status !== "pago" || !cobranca.pagamento_manual;
};

export const disableExcluirMensalidade = (cobranca): boolean => {
    return cobranca.status === "pago" || cobranca.origem === "automatica";
};

export const disableBaixarBoleto = (cobranca): boolean => {
    return !cobranca.asaas_bankslip_url || cobranca.status === "pago" || cobranca.origem === "manual";
}

export const disableVerPaginaPagamento = (cobranca): boolean => {
    return !cobranca.asaas_invoice_url || cobranca.status === "pago" || cobranca.origem === "manual";
}