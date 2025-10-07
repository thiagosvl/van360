
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