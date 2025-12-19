export const ROLE_MOTORISTA = "motorista";
export const ROLE_ADMIN = "admin";
export const ROLE_RESPONSAVEL = "responsavel";

export const PLANO_GRATUITO = "gratuito";
export const PLANO_ESSENCIAL = "essencial";
export const PLANO_PROFISSIONAL = "profissional";

// Feature Flags for Upsell Context
export const FEATURE_GASTOS = "controle_gastos";
export const FEATURE_RELATORIOS = "relatorios_avancados";
export const FEATURE_COBRANCA_AUTOMATICA = "cobranca_automatica";
export const FEATURE_NOTIFICACOES = "notificacoes_whatsapp";
export const FEATURE_LIMITE_PASSAGEIROS = "limite_passageiros";
export const FEATURE_LIMITE_FRANQUIA = "limite_franquia";
export const FEATURE_PRE_PASSAGEIRO = "pre_passageiro"; // Legacy/Specific

export const PASSAGEIRO_COBRANCA_STATUS_PAGO = "pago";
export const PASSAGEIRO_COBRANCA_STATUS_PENDENTE = "pendente";
export const PASSAGEIRO_COBRANCA_STATUS_ATRASADO = "atrasado";

export const ASSINATURA_USUARIO_STATUS_ATIVA = "ativa";
export const ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO = "pendente_pagamento";
export const ASSINATURA_USUARIO_STATUS_CANCELADA = "cancelada";
export const ASSINATURA_USUARIO_STATUS_SUSPENSA = "suspensa";
export const ASSINATURA_USUARIO_STATUS_TRIAL = "trial";

export const ASSINATURA_COBRANCA_STATUS_PAGO = "pago";
export const ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO = "pendente_pagamento";
export const ASSINATURA_COBRANCA_STATUS_CANCELADA = "cancelada";

export const STORAGE_KEY_QUICKSTART_STATUS = "van360:quickstart_status";
export const QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO = 50; 
export const BASE_DOMAIN = typeof window !== "undefined" ? window.location.origin : ""; 
