import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = () => {
    localStorage.clear();
}

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}