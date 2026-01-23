import { useUsuarioResumo } from "../api/useUsuarioResumo";

interface UsePlanLimitsProps {
  currentPassengerCount?: number;
}

export function usePlanLimits({ currentPassengerCount }: UsePlanLimitsProps = {}) {
  const { data: systemSummary, isLoading } = useUsuarioResumo();

  const usuario = systemSummary?.usuario;
  const plano = usuario?.plano;
  const limites = plano?.limites;
  const contadores = systemSummary?.contadores;

  const usedPassengers = contadores?.passageiros.ativos ?? 0;

  const currentUsed = currentPassengerCount !== undefined ? currentPassengerCount : usedPassengers;

  const franchiseLimit = limites?.franquia_cobranca_max ?? 0;
  const usedFranchise = contadores?.passageiros.com_automacao ?? 0;

  const remainingFranchise = limites?.franquia_cobranca_restante ?? Math.max(0, franchiseLimit - usedFranchise);

  const canEnableAutomaticBilling = remainingFranchise > 0;

  return {
    plano,
    profile: usuario,
    limits: {
      passengers: {
        limit: null,
        used: currentUsed,
        remaining: null,
      },
      franchise: {
        limit: franchiseLimit,
        used: usedFranchise,
        remaining: remainingFranchise,
        canEnable: canEnableAutomaticBilling,
        checkAvailability: (isAlreadyActive: boolean = false) => {
          if (isAlreadyActive) return true;
          return remainingFranchise > 0;
        }
      }
    },
    isLoading
  };
}
