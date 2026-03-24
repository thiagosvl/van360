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

    // Erros de rede (timeout, offline, etc)
    if (!error.response) {
      return Promise.reject(error);
    }

    // 403/404 em rotas críticas - Política de Logout Manual
    if (error.response.status === 403 || (error.response.status === 404 && originalRequest.url.includes('/usuarios/resumo'))) {
        const message = handleApiError(error);
        (error as AxiosError & { userMessage?: string }).userMessage = message;
        return Promise.reject(error);
    }

    // 401 Unauthorized - Fluxo de Refresh Automático
    if (error.response.status === 401) {
        if (!originalRequest._retry) {
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
                    // Tenta recuperar sessão caso tenha sido renovada em outra aba
                    const { data } = await sessionManager.getSession();
                    if (data.session?.access_token) {
                        originalRequest.headers["Authorization"] = `Bearer ${data.session.access_token}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshErr) {
                // Falha silenciosa no refresh
            }
        }

        // Importante: Nunca forçamos o signOut() via interceptor para evitar logouts involuntários.
        // O usuário deve decidir sair manualmente se as chamadas continuarem falhando.
    }

    const message = handleApiError(error);
    (error as AxiosError & { userMessage?: string }).userMessage = message;
    return Promise.reject(error);
  }
);

