import axios, { AxiosError, AxiosInstance } from "axios";
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "@/utils/errorHandler";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let cachedToken: string | null = null;

supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token ?? null;
});

async function getAccessToken() {
  if (cachedToken) return cachedToken;

  const { data } = await supabase.auth.getSession();
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
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = handleApiError(error);
    (error as AxiosError & { userMessage?: string }).userMessage = message;
    return Promise.reject(error);
  }
);

