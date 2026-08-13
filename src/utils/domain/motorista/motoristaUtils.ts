import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = () => {
    const savedCpf = localStorage.getItem("van360_saved_cpf");
    const cookieConsent = localStorage.getItem("van360_cookie_consent");

    // Limpar apenas chaves da sessao do motorista / Supabase
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
        if (
            key.startsWith("sb-") ||
            key.includes("supabase") ||
            key === "van360_user" ||
            key === "van360_session"
        ) {
            localStorage.removeItem(key);
        }
    });

    if (savedCpf) {
        localStorage.setItem("van360_saved_cpf", savedCpf);
    }

    if (cookieConsent) {
        localStorage.setItem("van360_cookie_consent", cookieConsent);
    }
};

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}