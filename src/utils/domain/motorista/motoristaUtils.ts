import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = () => {
    // 1. Pegamos o CPF salvo antes de limpar para garantir a preferência do usuário
    const savedCpf = localStorage.getItem("van360_saved_cpf");
    const cookieConsent = localStorage.getItem("van360_cookie_consent");

    // Limpamos o localStorage integralmente para garantir que não haja rastros de sessões anteriores
    localStorage.clear();

    // 3. Devolvemos apenas o CPF se ele existir, preservando o 'Lembrar CPF'
    if (savedCpf) {
        localStorage.setItem("van360_saved_cpf", savedCpf);
    }

    if (cookieConsent) {
        localStorage.setItem("van360_cookie_consent", cookieConsent);
    }
}

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}