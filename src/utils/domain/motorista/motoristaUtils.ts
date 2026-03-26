import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = (force: boolean = false) => {
    // Preservamos flags globais que não devem ser limpas no logout (apenas em 'limpar cache')
    const onboardingDone = localStorage.getItem("van360_onboarding_done");

    // Limpamos o localStorage integralmente para garantir que não haja rastros de sessões anteriores
    localStorage.clear();

    // Restauramos as flags
    if (onboardingDone) {
        localStorage.setItem("van360_onboarding_done", onboardingDone);
    }
}

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}