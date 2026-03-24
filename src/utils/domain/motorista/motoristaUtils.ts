import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = (force: boolean = false) => {
    // Preservamos o que não é sessão (ex: onboarding, preferência de tema, etc)
    const onboardingDone = localStorage.getItem("onboarding_completed");
    
    // Limpamos o localStorage de forma segura
    localStorage.clear();
    
    // Restauramos as flags de experiência de usuário
    if (onboardingDone) {
        localStorage.setItem("onboarding_completed", onboardingDone);
    }
}

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}