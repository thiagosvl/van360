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
import { parseCurrencyToNumber } from "@/utils/formatters";
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
  onSuccess: (passageiro?: any, formData?: any) => void;
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

    const purePayload: any = { ...data };

    purePayload.cep = purePayload.cep?.replace(/\D/g, "") || null;
    purePayload.cpf_responsavel = purePayload.cpf_responsavel?.replace(/\D/g, "") || null;

    purePayload.data_nascimento = purePayload.data_nascimento
      ? convertDateBrToISO(purePayload.data_nascimento)
      : null;

    purePayload.data_inicio_transporte = purePayload.data_inicio_transporte
      ? convertDateBrToISO(purePayload.data_inicio_transporte)
      : null;

    purePayload.data_fim_transporte = purePayload.data_fim_transporte
      ? convertDateBrToISO(purePayload.data_fim_transporte)
      : null;

    const currentYear = new Date().getFullYear();
    purePayload.data_inicio_cobranca = `${currentYear}-${String(data.mes_inicio_cobranca).padStart(2, '0')}-01`;
    purePayload.data_fim_cobranca = `${currentYear}-${String(data.mes_fim_cobranca).padStart(2, '0')}-01`;
    delete purePayload.mes_inicio_cobranca;
    delete purePayload.mes_fim_cobranca;

    purePayload.genero = purePayload.genero || null;
    purePayload.periodo = purePayload.periodo || null;
    purePayload.modalidade = purePayload.modalidade || null;
    purePayload.parentesco_responsavel = purePayload.parentesco_responsavel || null;

    purePayload.logradouro = purePayload.logradouro || null;
    purePayload.numero = purePayload.numero || null;
    purePayload.bairro = purePayload.bairro || null;
    purePayload.cidade = purePayload.cidade || null;
    purePayload.estado = purePayload.estado || null;
    purePayload.referencia = purePayload.referencia || null;
    purePayload.observacoes = purePayload.observacoes || null;

    if (typeof purePayload.valor_cobranca === "string") {
      purePayload.valor_cobranca = parseCurrencyToNumber(purePayload.valor_cobranca) as any;
    }

    const commonOptions = {
      onSuccess: (responseData?: any) => {
        // Business Logic: Detect if critical contract fields changed
        const isEdit = mode === PassageiroFormModes.EDIT;
        const isContractActive = !!profile?.config_contrato?.usar_contratos;
        let hasCriticalContractChanges = false;

        if (isEdit && editingPassageiro && isContractActive) {
          const moneyToNumber = (v: any) => {
            if (typeof v === 'number') return v;
            if (typeof v === 'string') return Number(v.replace(/\D/g, "")) / 100;
            return 0;
          };

          const cleanString = (val: any) => {
            if (val === null || val === undefined) return "";
            return String(val).trim().toLowerCase();
          };

          const checkStringChange = (formVal: any, dbVal: any) => {
            return cleanString(formVal) !== cleanString(dbVal);
          };

          const valorForm = moneyToNumber(purePayload.valor_cobranca);
          const vencimentoForm = Number(purePayload.dia_vencimento);
          
          const valorAtual = Number(editingPassageiro.valor_cobranca || 0);
          const vencimentoAtual = Number(editingPassageiro.dia_vencimento || 0);

          hasCriticalContractChanges =
            Math.abs(valorForm - valorAtual) > 0.01 ||
            vencimentoForm !== vencimentoAtual ||
            checkStringChange(purePayload.nome, editingPassageiro.nome) ||
            checkStringChange(purePayload.nome_responsavel, editingPassageiro.nome_responsavel) ||
            checkStringChange(purePayload.parentesco_responsavel, editingPassageiro.parentesco_responsavel) ||
            checkStringChange(purePayload.cpf_responsavel, editingPassageiro.cpf_responsavel) ||
            checkStringChange(purePayload.escola_id, editingPassageiro.escola_id) ||
            checkStringChange(purePayload.periodo, editingPassageiro.periodo) ||
            checkStringChange(purePayload.modalidade, editingPassageiro.modalidade) ||
            checkStringChange(purePayload.turma, editingPassageiro.turma) ||
            checkStringChange(purePayload.data_inicio_transporte, editingPassageiro.data_inicio_transporte) ||
            checkStringChange(purePayload.data_fim_transporte, editingPassageiro.data_fim_transporte) ||
            checkStringChange(purePayload.data_inicio_cobranca, editingPassageiro.data_inicio_cobranca) ||
            checkStringChange(purePayload.data_fim_cobranca, editingPassageiro.data_fim_cobranca) ||
            checkStringChange(purePayload.logradouro, editingPassageiro.logradouro) ||
            checkStringChange(purePayload.numero, editingPassageiro.numero) ||
            checkStringChange(purePayload.bairro, editingPassageiro.bairro) ||
            checkStringChange(purePayload.cidade, editingPassageiro.cidade) ||
            checkStringChange(purePayload.estado, editingPassageiro.estado) ||
            checkStringChange(purePayload.cep, editingPassageiro.cep);
        }

        onSuccess(responseData, {
           formData: purePayload,
           hasCriticalContractChanges
        });
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
