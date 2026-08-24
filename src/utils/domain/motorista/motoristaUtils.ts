import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = () => {
    const savedCpf = localStorage.getItem("van360_saved_cpf");

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
};

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}