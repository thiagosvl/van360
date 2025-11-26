import { useMemo } from "react";

interface UseLoadingStateOptions {
  isLoading?: boolean;
  isFetching?: boolean;
  isPending?: boolean;
}

/**
 * Hook para padronizar estados de loading
 * Combina diferentes estados de loading em um único estado
 */
export function useLoadingState({
  isLoading = false,
  isFetching = false,
  isPending = false,
}: UseLoadingStateOptions = {}) {
  const loading = useMemo(
    () => isLoading || isFetching || isPending,
    [isLoading, isFetching, isPending]
  );

  return {
    loading,
    isLoading,
    isFetching,
    isPending,
  };
}

