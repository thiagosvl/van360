import { useLayout } from "@/contexts/LayoutContext";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

interface UsePassageiroFormDadosCadastraisViewModelProps {
  escolas: Escola[];
  veiculos: Veiculo[];
}

export function usePassageiroFormDadosCadastraisViewModel({
  escolas,
  veiculos,
}: UsePassageiroFormDadosCadastraisViewModelProps) {
  const form = useFormContext();
  const { openEscolaFormDialog, openVeiculoFormDialog } = useLayout();

  const [newVeiculo, setNewVeiculo] = useState<Veiculo | null>(null);
  const [newEscola, setNewEscola] = useState<Escola | null>(null);

  const veiculosDisplay = useMemo(() => {
    if (!newVeiculo) return veiculos;
    const exists = veiculos.find((v) => v.id === newVeiculo.id);
    if (exists) return veiculos;
    return [...veiculos, newVeiculo];
  }, [veiculos, newVeiculo]);

  const escolasDisplay = useMemo(() => {
    if (!newEscola) return escolas;
    const exists = escolas.find((e) => e.id === newEscola.id);
    if (exists) return escolas;
    return [...escolas, newEscola];
  }, [escolas, newEscola]);

  // Sync new items with form values
  useEffect(() => {
    const currentId = form.getValues("veiculo_id");
    if (newVeiculo && newVeiculo.id && currentId !== newVeiculo.id) {
       form.setValue("veiculo_id", newVeiculo.id, { shouldValidate: true });
    }
  }, [newVeiculo, form]);

  useEffect(() => {
    const currentId = form.getValues("escola_id");
    if (newEscola && newEscola.id && currentId !== newEscola.id) {
       form.setValue("escola_id", newEscola.id, { shouldValidate: true });
    }
  }, [newEscola, form]);

  // Auto-select unique vehicle
  useEffect(() => {
    if (veiculos.length === 1 && !form.getValues("veiculo_id")) {
      form.setValue("veiculo_id", veiculos[0].id, { shouldValidate: true });
    }
  }, [veiculos, form]);

  const handleAddNewVehicle = useCallback(() => {
    openVeiculoFormDialog({
      onSuccess: (veiculo) => {
        setNewVeiculo(veiculo);
      },
    });
  }, [openVeiculoFormDialog]);

  const handleAddNewSchool = useCallback(() => {
    openEscolaFormDialog({
      allowBatchCreation: false,
      onSuccess: (escola) => {
        setNewEscola(escola);
      },
    });
  }, [openEscolaFormDialog]);

  return {
    form,
    veiculosDisplay,
    escolasDisplay,
    handleAddNewVehicle,
    handleAddNewSchool,
  };
}
