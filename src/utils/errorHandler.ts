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
  


  // Tenta extrair mensagem de erro da resposta da API (Axios)
  // Prioridade alta pois contém a regra de negócio/validação do backend
  const axiosError = error as any; // Cast para any para facilitar acesso seguro
  
  // Backend retorna { error: "mensagem" } ?
  if (axiosError?.response?.data?.error) {
    return axiosError.response.data.error;
  }

  // Backend retorna { message: "mensagem" } ?
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }
  
  // Tratamento para erro genérico (Error) ou msg de rede do Axios
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  if (axiosError?.message) {
    return axiosError.message;
  }

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

