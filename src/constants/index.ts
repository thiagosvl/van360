
export const QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO = 500;
export const BASE_DOMAIN = import.meta.env.VITE_PUBLIC_APP_DOMAIN || (typeof window !== "undefined" ? window.location.origin : "");

/** Número do WhatsApp de suporte (sem formatação). Futuramente virá do banco (configuracao_interna). */
export const WHATSAPP_SUPORTE = "5511962508068";

/** Gera a URL do WhatsApp com mensagem pré-preenchida */
export function getWhatsAppUrl(message = "Olá, preciso de ajuda com o Van360") {
  return `https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(message)}`;
}
