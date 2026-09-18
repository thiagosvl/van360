import { BASE_DOMAIN } from "@/constants";
import { clearImpersonating } from "@/utils/impersonate";

export const clearAppSession = () => {
    clearImpersonating();

    const savedCpf = localStorage.getItem("van360_saved_cpf");

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