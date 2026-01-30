import { BASE_DOMAIN } from "@/constants";


export const clearAppSession = (force: boolean = false) => {
    // We now trust Supabase persistence. 
    // If we want to clear the session (logout), we clear everything.
    // The force parameter is kept for compatibility but functionally we just clear.
    localStorage.clear();
}

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}