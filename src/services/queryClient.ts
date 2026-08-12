import { QueryClient } from "@tanstack/react-query";

/**
 * Configuração do React Query
 * 
 * staleTime: Tempo que os dados são considerados "frescos" (não refaz requisição)
 * cacheTime: Tempo que os dados ficam no cache após componente desmontar
 * refetchOnWindowFocus: Refaz requisição ao focar a janela (útil para dados em tempo real)
 * refetchOnReconnect: Refaz requisição ao reconectar à internet
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      refetchOnMount: true,
    },
  },
});
