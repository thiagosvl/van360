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

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
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

