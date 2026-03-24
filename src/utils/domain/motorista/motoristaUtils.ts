import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = (force: boolean = false) => {
    // Limpamos o localStorage integralmente para garantir que não haja rastros de sessões anteriores
    localStorage.clear();
}

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}