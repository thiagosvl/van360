import { BASE_DOMAIN, STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";

export const clearLoginStorageMotorista = () => {
    const keys = [
        "app_role",
        "app_user_id",
        STORAGE_KEY_QUICKSTART_STATUS,
        "user",
        "authTokens",
    ];

    keys.forEach((k) => localStorage.removeItem(k));

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") && key.includes("-auth-token")) {
            localStorage.removeItem(key);
        }
    });
}

export const buildPrepassageiroLink = (profileId) => {
    return `${BASE_DOMAIN}/cadastro-passageiro/${profileId}`;
}