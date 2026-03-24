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

    // 1. Se NÃO houver resposta do servidor (ex: queda de internet), apenas rejeitamos
    if (!error.response) {
      console.error('[ApiClient] Erro de rede ou timeout detectado:', error.message);
      return Promise.reject(error);
    }

    // 2. Check for 403 (Forbidden/Inactive) or 404 on profile summary
    // Removido o logout automático para respeitar a vontade do usuário (apenas manual)
    if (error.response && (error.response.status === 403 || (error.response.status === 404 && originalRequest.url.includes('/usuarios/resumo')))) {
        console.warn('[ApiClient] 403/404 Detectado em rota crítica. O usuário deve decidir sair manualmente.');
        const message = handleApiError(error);
        (error as AxiosError & { userMessage?: string }).userMessage = message;
        return Promise.reject(error);
    }

    // 3. Check for 401 (Unauthorized) - Token expired, invalid or user deleted
    if (error.response && error.response.status === 401) {
        if (!originalRequest._retry) {
            // Prevent infinite loop
            originalRequest._retry = true;

            try {
                console.log('[ApiClient] 401 detectado, tentando refresh de token...');
                // Attempt to refresh the token
                const { success } = await sessionManager.refreshToken();
                
                if (success) {
                    const { data } = await sessionManager.getSession();
                    const newToken = data.session?.access_token;

                    if (newToken) {
                        console.log('[ApiClient] Refresh realizado com sucesso, re-tentando requisição original.');
                        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                } else {
                    // Tenta ver se há uma sessão válida disponível (talvez renovada em outra aba)
                    const { data } = await sessionManager.getSession();
                    if (data.session?.access_token) {
                        console.log('[ApiClient] Sessão válida encontrada (possivelmente de outra aba), re-tentando...');
                        originalRequest.headers["Authorization"] = `Bearer ${data.session.access_token}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshErr) {
                console.warn('[ApiClient] Erro durante o processo de refresh:', refreshErr);
            }
        }

        // 🔹 LOGOUT MANUAL APENAS: Nunca forçamos o signOut via interceptor.
        // Se chegamos aqui, a sessão está inválida e o refresh não ajudou.
        // Apenas reportamos e deixamos o usuário decidir o que fazer (ou erros subsequentes ocorrerão).
        console.warn('[ApiClient] 401 Interceptor: Sessão inválida/expirada. Logout automático desativado por regra de negócio.', {
            url: originalRequest.url,
            status: error.response?.status
        });
    }

    const message = handleApiError(error);
    (error as AxiosError & { userMessage?: string }).userMessage = message;
    return Promise.reject(error);
  }
);

