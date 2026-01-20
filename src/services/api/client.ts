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
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 403 (Forbidden/Inactive) - User is authenticated but blocked (active=false or insufficient permissions)
    // In this case, we MUST logout immediately, no retry.
    if (error.response && error.response.status === 403) {
         sessionManager.signOut().catch(() => {});
         const message = handleApiError(error);
         (error as AxiosError & { userMessage?: string }).userMessage = message;
         return Promise.reject(error);
    }

    // Check for 401 (Unauthorized) - Token expired or invalid
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        
        // Prevent infinite loop
        originalRequest._retry = true;

        try {
            // Attempt to refresh the token
            const { success } = await sessionManager.refreshToken();
            
            if (success) {
                // Get the new token (sessionManager already updated internal state)
                const { data } = await sessionManager.getSession();
                const newToken = data.session?.access_token;

                if (newToken) {
                    // Update headers and retry
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            }
        } catch (refreshErr) {
            // Refresh failed (network error, etc) - proceed to logout
        }

        // If refresh failed or returned success=false
        sessionManager.signOut().catch(() => {});
    }

    const message = handleApiError(error);
    (error as AxiosError & { userMessage?: string }).userMessage = message;
    return Promise.reject(error);
  }
);

