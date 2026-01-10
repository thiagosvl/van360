import { Passageiro } from "@/types/passageiro";
import { useCallback, useState } from "react";

interface ExcessoFranquiaState {
  isOpen: boolean;
  limiteAtual: number;
  limiteApos: number;
  passageiro: Passageiro | null;
}

export function usePassageiroDialogs() {
  const [excessoFranquia, setExcessoFranquia] = useState<ExcessoFranquiaState>({
    isOpen: false,
    limiteAtual: 0,
    limiteApos: 0,
    passageiro: null,
  });

  // --- Excesso Franquia Handlers ---

  const openExcessoFranquia = useCallback((
    limiteAtual: number,
    limiteApos: number,
    passageiro: Passageiro
  ) => {
    setExcessoFranquia({
      isOpen: true,
      limiteAtual,
      limiteApos,
      passageiro,
    });
  }, []);

  const closeExcessoFranquia = useCallback(() => {
    setExcessoFranquia((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    excessoFranquia: {
        ...excessoFranquia,
        onClose: closeExcessoFranquia,
        setOpen: (open: boolean) => setExcessoFranquia(prev => ({ ...prev, isOpen: open })) 
    },
    // Raw Actions
    actions: {
        openExcessoFranquia,
        closeExcessoFranquia
    }
  };
}
