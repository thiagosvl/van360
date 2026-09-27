import { BASE_DOMAIN, STORAGE_KEYS } from "@/constants";
import { clearImpersonating } from "@/utils/impersonate";

export const clearAppSession = () => {
    clearImpersonating();

    const savedCpf = localStorage.getItem(STORAGE_KEYS.SAVED_CPF);

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
        localStorage.setItem(STORAGE_KEYS.SAVED_CPF, savedCpf);
    }
};

export const buildPrepassageiroLink = (profileId: string) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}