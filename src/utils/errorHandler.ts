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

  const axiosError = error as any;

  if (axiosError?.userMessage && typeof axiosError.userMessage === "string") {
    return axiosError.userMessage;
  }

  const isTimeout =
    axiosError?.code === "ECONNABORTED" ||
    axiosError?.response?.status === 504 ||
    (typeof axiosError?.message === "string" && /(timeout|timed\s*out)/i.test(axiosError.message)) ||
    (error instanceof Error && /(timeout|timed\s*out)/i.test(error.message));

  if (isTimeout) {
    return "A conexão demorou para responder. Verifique sua internet e tente novamente.";
  }

  const isNetworkError =
    axiosError?.code === "ERR_NETWORK" ||
    axiosError?.code === "ENOTFOUND" ||
    axiosError?.code === "ECONNREFUSED" ||
    (typeof axiosError?.message === "string" && /(network\s*error|failed to fetch)/i.test(axiosError.message)) ||
    (error instanceof Error && /(network\s*error|failed to fetch)/i.test(error.message));

  if (isNetworkError) {
    return "Sem conexão com a internet. Verifique sua rede e tente novamente.";
  }

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

