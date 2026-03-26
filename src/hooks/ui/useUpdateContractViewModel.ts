import { useCallback, useState } from "react";
import { Passageiro } from "@/types/passageiro";
import { useCreateContrato, useSubstituirContrato } from "@/hooks/api/useContratos";

interface UpdateContractViewModelProps {
  passageiro: Passageiro;
  onClose: () => void;
}

export function useUpdateContractViewModel({ passageiro, onClose }: UpdateContractViewModelProps) {
  const [wantsContract, setWantsContract] = useState<boolean>(true);
  
  const createContrato = useCreateContrato();
  const substituirContrato = useSubstituirContrato();

  const handleConfirm = useCallback(async () => {
    if (!wantsContract) {
      onClose();
      return;
    }

    try {
      if (passageiro.contrato_id) {
        // Se já tem contrato, substitui pelo novo
        await substituirContrato.mutateAsync(passageiro.contrato_id);
      } else {
        // Se não tem, gera um novo do zero
        await createContrato.mutateAsync({ 
          passageiroId: passageiro.id!,
        });
      }
      onClose();
    } catch (error) {
      console.error("Falha ao atualizar contrato:", error);
    }
  }, [wantsContract, passageiro, createContrato, substituirContrato, onClose]);

  const isLoading = createContrato.isPending || substituirContrato.isPending;

  return {
    wantsContract,
    setWantsContract,
    handleConfirm,
    isLoading
  };
}
