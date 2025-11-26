import { useMemo } from "react";
import { verificarLimitePassageiros } from "@/utils/domain/passageiro/limites";

/**
 * Hook para verificar limites do plano
 */
export function useLimites(plano: any, totalPassageiros: number) {
  const podeAdicionarPassageiro = useMemo(() => {
    return verificarLimitePassageiros(plano, totalPassageiros);
  }, [plano, totalPassageiros]);

  return {
    podeAdicionarPassageiro,
  };
}

