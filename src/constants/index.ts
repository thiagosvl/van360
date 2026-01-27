
export const PLANO_ESSENCIAL = "essencial";
export const PLANO_PROFISSIONAL = "profissional";

// Feature Flags for Upsell Context
export const FEATURE_GASTOS = "controle_gastos";
export const FEATURE_RELATORIOS = "relatorios_avancados";
export const FEATURE_COBRANCA_AUTOMATICA = "cobranca_automatica";
export const FEATURE_NOTIFICACOES = "notificacoes_whatsapp";

export const FEATURE_LIMITE_FRANQUIA = "limite_franquia";
export const FEATURE_LIMITE_PASSAGEIROS = "limite_passageiros";

// Upgrade Contexts
export const FEATURE_TRIAL_CONVERSION = "trial_conversion";
export const FEATURE_UPGRADE_AUTOMACAO = "automacao"; // Contexto específico de upgrade de franquia
export const FEATURE_UPGRADE_AUTO = "upgrade_auto";
export const FEATURE_OUTROS = "outros";

export const QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO = 500; 
export const BASE_DOMAIN = import.meta.env.VITE_PUBLIC_APP_DOMAIN || (typeof window !== "undefined" ? window.location.origin : ""); 
