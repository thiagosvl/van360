import type { AxiosError } from "axios";

type HandleApiErrorOptions = {
  fallbackMessage?: string;
  onUnauthorized?: () => void;
  logger?: (message: string, error?: unknown) => void;
};

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Ocorreu um erro inesperado."
) {
  if (typeof error === "string") {
    return error;
  }
  


  const formatMsg = (val: unknown): string | null => {
    if (!val) return null;
    if (typeof val === "string") {
      if (val === "[object Object]") return null;
      return val;
    }
    if (typeof val === "object") {
      const obj = val as Record<string, any>;
      if (obj.message && typeof obj.message === "string" && obj.message !== "[object Object]") {
        return obj.message;
      }
    }
    return null;
  };

  // Tenta extrair mensagem de erro da resposta da API (Axios)
  const axiosError = error as any;
  
  const errFromDataError = formatMsg(axiosError?.response?.data?.error);
  if (errFromDataError) return errFromDataError;

  const errFromDataMsg = formatMsg(axiosError?.response?.data?.message);
  if (errFromDataMsg) return errFromDataMsg;
  
  if (error instanceof Error) {
    const msg = formatMsg(error.message);
    if (msg) return msg;
  }

  const msgFromAxios = formatMsg(axiosError?.message);
  if (msgFromAxios) return msgFromAxios;

  return fallbackMessage;
}

export function handleApiError(
  error: unknown,
  options?: HandleApiErrorOptions
) {
  const message = getErrorMessage(error, options?.fallbackMessage);

  const axiosError = error as AxiosError;
  if (axiosError?.response?.status === 401) {
    options?.onUnauthorized?.();
  }

  options?.logger?.(message, error);

  return message;
}

