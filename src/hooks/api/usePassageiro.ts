import { passageiroApi } from "@/services/api/passageiro.api";
import { Passageiro } from "@/types/passageiro";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function usePassageiro(
  passageiroId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
    initialData?: Passageiro | null;
  }
) {
  const query = useQuery({
    queryKey: ["passageiro", passageiroId],
    enabled: (options?.enabled ?? true) && Boolean(passageiroId),
    initialData: options?.initialData,
    queryFn: async () => {
      if (!passageiroId) return null;
      const data = await passageiroApi.getPassageiro(passageiroId);
      return data as Passageiro;
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number; response?: { status?: number } })?.status ??
        (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });

  const onErrorRef = useRef(options?.onError);
  useEffect(() => {
    onErrorRef.current = options?.onError;
  });

  useEffect(() => {
    if (query.error && onErrorRef.current) {
      onErrorRef.current(query.error);
    }
  }, [query.error]);

  return query;
}
