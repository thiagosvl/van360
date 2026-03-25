import { 
    useBuscarResponsavel, 
    useCreatePassageiro, 
    useEscolasWithFilters, 
    useFinalizePreCadastro, 
    usePassageiroForm, 
    useUpdatePassageiro, 
    useVeiculosWithFilters 
} from "@/hooks";
import { PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { convertDateBrToISO } from "@/utils/formatters/date";
import { phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useRef } from "react";
import { PassageiroFormData } from "../form/usePassageiroForm";

interface UsePassageiroFormViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: PassageiroFormModes;
  prePassageiro?: PrePassageiro | null;
  onSuccess: (passageiro?: any) => void;
  profile: Usuario | null | undefined;
}

export function usePassageiroFormViewModel({
  isOpen,
  onClose,
  editingPassageiro,
  mode,
  prePassageiro,
  onSuccess,
  profile,
}: UsePassageiroFormViewModelProps) {
  const createPassageiro = useCreatePassageiro();
  const updatePassageiro = useUpdatePassageiro();
  const finalizePreCadastro = useFinalizePreCadastro();
  const { mutateAsync: lookupResponsavel, isPending: isSearchingResponsavel } = useBuscarResponsavel();
  
  const searchedCpfRef = useRef<string>("");

  // Determine include IDs for lists based on mode
  const includeEscolaId =
    mode === PassageiroFormModes.EDIT
      ? editingPassageiro?.escola_id
      : mode === PassageiroFormModes.FINALIZE
        ? prePassageiro?.escola_id
        : undefined;

  const includeVeiculoId =
    mode === PassageiroFormModes.EDIT
      ? editingPassageiro?.veiculo_id
      : mode === PassageiroFormModes.FINALIZE
        ? prePassageiro?.veiculo_id
        : undefined;

  // Fetch lists
  const { data: escolasData = [] } = useEscolasWithFilters(
    profile?.id,
    { ativo: "true", includeId: includeEscolaId || undefined },
    { enabled: isOpen && !!profile?.id }
  ) as { data: import("@/types/escola").Escola[] };

  const { data: veiculosData = [] } = useVeiculosWithFilters(
    profile?.id,
    { ativo: "true", includeId: includeVeiculoId || undefined },
    { enabled: isOpen && !!profile?.id }
  ) as { data: import("@/types/veiculo").Veiculo[] };

  const { form, refreshing, openAccordionItems, setOpenAccordionItems } =
    usePassageiroForm({
      isOpen,
      mode,
      editingPassageiro,
      prePassageiro,
    });

  // Search Responsável Logic
  const handleSearchResponsavel = useCallback(async (cpf: string) => {
    if (mode === PassageiroFormModes.EDIT || mode === PassageiroFormModes.FINALIZE) return;
    if (cpf.length !== 11 || !profile?.id) return;
    if (searchedCpfRef.current === cpf) return;

    try {
      searchedCpfRef.current = cpf;
      const responsavel = await lookupResponsavel({ cpf });

      if (responsavel) {
        form.setValue("nome_responsavel", responsavel.nome_responsavel || "");
        form.setValue("email_responsavel", responsavel.email_responsavel || "");
        form.setValue(
          "telefone_responsavel",
          phoneMask(responsavel.telefone_responsavel) || ""
        );
      }
    } catch (error) {
      // Silencioso
    }
  }, [mode, profile?.id, lookupResponsavel, form]);

  // Monitor CPF changes
  const cpfResponsavelValue = form.watch("cpf_responsavel");
  useEffect(() => {
    const pureCpf = cpfResponsavelValue?.replace(/\D/g, "");
    const { invalid } = form.getFieldState("cpf_responsavel", form.formState);
    
    if (pureCpf && pureCpf.length === 11 && !invalid) {
      handleSearchResponsavel(pureCpf);
    }
  }, [cpfResponsavelValue, handleSearchResponsavel, form.formState]);

  // Mock Filling
  const handleFillMock = useCallback(() => {
    const currentValues = form.getValues();

    let escolaId = currentValues.escola_id;
    if (!escolaId && escolasData.length > 0) {
      escolaId = escolasData[Math.floor(Math.random() * escolasData.length)].id;
    }

    let veiculoId = currentValues.veiculo_id;
    if (!veiculoId && veiculosData.length > 0) {
      veiculoId = veiculosData[Math.floor(Math.random() * veiculosData.length)].id;
    }

    const mockData = mockGenerator.passenger({
      escola_id: escolaId,
      veiculo_id: veiculoId,
    });

    form.reset(mockData);

    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  }, [form, escolasData, veiculosData, setOpenAccordionItems]);

  // Submission Logic
  const onFormError = useCallback(() => {
    toast.error("validacao.formularioComErros");
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  }, [setOpenAccordionItems]);

  const handleSubmit = useCallback(async (data: PassageiroFormData) => {
    if (!profile?.id) return;

    const purePayload = { ...data };

    if (purePayload.data_nascimento) {
      purePayload.data_nascimento = convertDateBrToISO(purePayload.data_nascimento);
    }
    if (purePayload.data_inicio_transporte) {
      purePayload.data_inicio_transporte = convertDateBrToISO(purePayload.data_inicio_transporte);
    }

    const commonOptions = {
      onSuccess: (data?: any) => {
        onSuccess(data);
        onClose();
      },
      onError: () => {
        // Handled globally or specifically if needed
      },
    };

    if (mode === PassageiroFormModes.FINALIZE && prePassageiro) {
      finalizePreCadastro.mutate(
        {
          prePassageiroId: prePassageiro.id,
          data: {
            ...purePayload,
            usuario_id: prePassageiro.usuario_id,
          },
        },
        commonOptions
      );
    } else if (editingPassageiro) {
      updatePassageiro.mutate(
        {
          id: editingPassageiro.id,
          data: purePayload,
        },
        {
          onSuccess: commonOptions.onSuccess,
        }
      );
    } else {
      createPassageiro.mutate(
        {
          ...purePayload,
          usuario_id: profile.id,
        },
        commonOptions
      );
    }
  }, [profile?.id, mode, prePassageiro, editingPassageiro, finalizePreCadastro, updatePassageiro, createPassageiro, onSuccess, onClose]);

  const isSubmitting =
    createPassageiro.isPending ||
    updatePassageiro.isPending ||
    finalizePreCadastro.isPending;

  return {
    form,
    refreshing,
    openAccordionItems,
    setOpenAccordionItems,
    escolas: escolasData,
    veiculos: veiculosData,
    isSubmitting,
    isSearchingResponsavel,
    handleFillMock,
    handleSubmit,
    onFormError,
  };
}
