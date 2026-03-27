import { sessionManager } from "@/services/sessionManager";
import { handleApiError } from "@/utils/errorHandler";
import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let cachedToken: string | null = null;

sessionManager.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token ?? null;
});

async function getAccessToken() {
  const { data } = await sessionManager.getSession();
  cachedToken = data.session?.access_token ?? null;
  return cachedToken;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      // @ts-ignore
      config.headers = config.headers || {};
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
    async (error) => {
    const originalRequest = error.config;
    const responseData = error.response?.data;
    const errorCode = responseData?.code;

    // Erros de rede (timeout, offline, etc)
    if (!error.response) {
      return Promise.reject(error);
    }

    // Identificação de Erros Fatais (Conta deletada, desativada ou perfil inexistente)
    const isFatalAuthError = 
        errorCode === "AUTH_PROFILE_NOT_FOUND" || 
        errorCode === "AUTH_USER_NOT_FOUND" ||
        errorCode === "AUTH_USER_INACTIVE" ||
        (error.response.status === 404 && originalRequest.url.includes('/usuarios/resumo'));

    if (isFatalAuthError) {
        await sessionManager.signOut();
        const message = handleApiError(error);
        (error as AxiosError & { userMessage?: string }).userMessage = message;
        return Promise.reject(error);
    }

    // 401 Unauthorized - Fluxo de Refresh Automático
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const { success } = await sessionManager.refreshToken();
            
            if (success) {
                const { data } = await sessionManager.getSession();
                const newToken = data.session?.access_token;

                if (newToken) {
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } else {
                // Se o refresh falhar (usuário removido do auth.users), forçamos o logout
                await sessionManager.signOut();
            }
        } catch (refreshErr) {
            await sessionManager.signOut();
        }
    }

    const message = handleApiError(error);
    (error as AxiosError & { userMessage?: string }).userMessage = message;
    return Promise.reject(error);
  }
);

