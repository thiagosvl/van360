export const BASE_DOMAIN = import.meta.env.VITE_PUBLIC_APP_DOMAIN || (typeof window !== "undefined" ? window.location.origin : "");

/** Duração do período de teste grátis (Trial) em dias. */
export const TRIAL_DURATION_DAYS = 15;

/** Número do WhatsApp de suporte (sem formatação). Futuramente virá do banco (configuracao_interna). */
export const WHATSAPP_SUPORTE = "5511962508068";

/** Chaves centralizadas do LocalStorage */
export const STORAGE_KEYS = {
  SAVED_CPF: "van360_saved_cpf",
  SAVED_RESPONSAVEL_PHONE: "van360_saved_responsavel_phone",
  RESPONSAVEL_TOKEN: "@van360:responsavel_token",
  RESPONSAVEL_PASSAGEIRO_ID: "@van360:responsavel_passageiro_id",
  DISMISS_NATIVE_UPDATE_PROMPT: "van360_dismiss_native_update_prompt",
  PENDING_UPDATE: "pendingUpdate"
} as const;

/** Gera a URL do WhatsApp com mensagem pré-preenchida */
export function getWhatsAppUrl(message = "Olá, preciso de ajuda com o Van360") {
  return `https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(message)}`;
}

export * from "./navigation";
