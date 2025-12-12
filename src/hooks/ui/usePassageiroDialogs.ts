import { Passageiro } from "@/types/passageiro";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { useCallback, useState } from "react";

interface PassageiroFormState {
  isOpen: boolean;
  mode: "create" | "edit" | "finalize";
  editingPassageiro: Passageiro | null;

}

interface ExcessoFranquiaState {
  isOpen: boolean;
  limiteAtual: number;
  limiteApos: number;
  passageiro: Passageiro | null;
}

export function usePassageiroDialogs() {
  const [passageiroForm, setPassageiroForm] = useState<PassageiroFormState>({
    isOpen: false,
    mode: "create",
    editingPassageiro: null,

  });



  const [excessoFranquia, setExcessoFranquia] = useState<ExcessoFranquiaState>({
    isOpen: false,
    limiteAtual: 0,
    limiteApos: 0,
    passageiro: null,
  });

  // --- Passageiro Form Handlers ---

  const openNewPassageiro = useCallback(() => {
    safeCloseDialog(() => {
      setPassageiroForm({
        isOpen: true,
        mode: "create",
        editingPassageiro: null,

      });
    });
  }, []);

  const openEditPassageiro = useCallback((passageiro: Passageiro) => {
    safeCloseDialog(() => {
      setPassageiroForm({
        isOpen: true,
        mode: "edit",
        editingPassageiro: passageiro,

      });
    });
  }, []);

  const closePassageiroForm = useCallback(() => {
    safeCloseDialog(() => {
      setPassageiroForm((prev) => ({
        ...prev,
        isOpen: false,

      }));
    });
  }, []);

  const handleSuccessPassageiroForm = useCallback(() => {
     setPassageiroForm((prev) => ({
        ...prev,

     }));
  }, []);



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
    // States exposed as convenient objects or raw
    passageiroForm: {
      ...passageiroForm,
      onClose: closePassageiroForm,
      onSuccess: handleSuccessPassageiroForm,

    },

    excessoFranquia: {
        ...excessoFranquia,
        onClose: closeExcessoFranquia,
        setOpen: (open: boolean) => setExcessoFranquia(prev => ({ ...prev, isOpen: open })) // Exposing setter for flexibility if needed
    },
    // Raw Actions
    actions: {
        openNewPassageiro,
        openEditPassageiro,
        openExcessoFranquia,
        closeExcessoFranquia
    }
  };
}
