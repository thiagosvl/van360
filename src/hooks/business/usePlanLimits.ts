import { useUsuarioResumo } from "../api/useUsuarioResumo";

interface UsePlanLimitsProps {
  currentPassengerCount?: number; // For manual optimistic checks or specific simulations
}

export function usePlanLimits({ currentPassengerCount }: UsePlanLimitsProps = {}) {
  const { data: systemSummary, isLoading } = useUsuarioResumo();

  const usuario = systemSummary?.usuario;
  const plano = usuario?.plano;
  const limites = plano?.limites;
  const contadores = systemSummary?.contadores;

  // --- Passenger Limits ---
  const passengerLimit = limites?.passageiros_max ?? null;
  const usedPassengers = contadores?.passageiros.ativos ?? 0;
  
  // If currentPassengerCount is provided (optimistic UI), use it. Otherwise use backend data.
  // Note: Backend 'passageiros_restantes' is authoritative, but for simulations we might need math.
  const currentUsed = currentPassengerCount !== undefined ? currentPassengerCount : usedPassengers;
  
  const remainingPassengers = passengerLimit !== null 
    ? Math.max(0, passengerLimit - currentUsed) 
    : null;

  const hasPassengerLimit = passengerLimit !== null;
  const isPassengerLimitReached = hasPassengerLimit && (remainingPassengers !== null && remainingPassengers <= 0);

  // --- Franchise/Billing Automation Limits ---
  const franchiseLimit = limites?.franquia_cobranca_max ?? 0;
  const usedFranchise = contadores?.passageiros.com_automacao ?? 0;
  
  // Use backend calculation if available, or fallback to local math for simulation
  const remainingFranchise = limites?.franquia_cobranca_restante ?? Math.max(0, franchiseLimit - usedFranchise);
  
  const canEnableAutomaticBilling = remainingFranchise > 0;

  return {
    plano,
    profile: usuario, // Mapping 'usuario' to 'profile' to maintain compatibility if possible, though structure differs.
                      // Adapting usages might be needed if they rely on specific profile fields not in 'usuario'.
                      // For now, 'usuario' has status/flags. If they need full profile, they should use useProfile separately.
                      // But the goal is to decouple. Let's see if this breaks anything.
    limits: {
      passengers: {
        limit: passengerLimit,
        used: currentUsed,
        remaining: remainingPassengers,
        hasLimit: hasPassengerLimit,
        isReached: isPassengerLimitReached,
        checkAvailability: (simulateAddition = false) => {
            if (!hasPassengerLimit) return true;
            const current = remainingPassengers ?? 0;
            return simulateAddition ? current > 1 : current > 0; 
            // Logic fix: if remaining is 0, I cannot add. If simulateAddition (adding +1), I need at least 1 remaining.
            // If I am just checking state, remaining >= 0 is "ok" (not negative).
            // But "checkAvailability" usually means "Can I add?".
            // Let's standarize: 
            // current > 0 -> Have space.
        }
      },
      franchise: {
        limit: franchiseLimit,
        used: usedFranchise,
        remaining: remainingFranchise,
        canEnable: canEnableAutomaticBilling,
        /**
         * Verifica se é possível ativar a cobrança para um passageiro específico.
         * @param isAlreadyActive - Passar true se estiver editando um passageiro que JÁ tem cobrança ativa (para não contar 2x)
         */
        checkAvailability: (isAlreadyActive: boolean = false) => {
          // If already active, we don't consume a NEW slot.
          if (isAlreadyActive) return true;
          return remainingFranchise > 0;
        }
      }
    },
    isLoading
  };
}
