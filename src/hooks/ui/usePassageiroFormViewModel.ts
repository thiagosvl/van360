import { 
    useBuscarResponsavel, 
    useCreatePassageiro, 
    useEscolasWithFilters, 
    useFinalizePreCadastro, 
    usePassageiro,
    usePassageiroForm, 
    useUpdatePassageiro, 
    useVeiculosWithFilters 
} from "@/hooks";
import { PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { convertDateBrToISO } from "@/utils/formatters/date";
import { phoneMask, cpfMask, cepMask } from "@/utils/masks";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { cleanString } from "@/utils/string";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useRef } from "react";
import { PassageiroFormData } from "../form/usePassageiroForm";
import { getErrorMessage } from "@/utils/errorHandler";

interface UsePassageiroFormViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: PassageiroFormModes;
  prePassageiro?: PrePassageiro | null;
  onSuccess: (passageiro?: Passageiro, options?: { formData?: Record<string, unknown>; hasCriticalContractChanges?: boolean }) => void;
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
  
  const searchedTermsSet = useRef<Set<string>>(new Set());
  const isFillingMockRef = useRef<boolean>(false);

  const { data: fullPassageiro, isLoading: isLoadingFullPassageiro } = usePassageiro(
    editingPassageiro?.id || "",
    { enabled: isOpen && mode === PassageiroFormModes.EDIT && !!editingPassageiro?.id }
  );

  const targetPassageiro = (fullPassageiro as Passageiro) || editingPassageiro;

  const includeEscolaId =
    mode === PassageiroFormModes.EDIT
      ? targetPassageiro?.escola_id
      : mode === PassageiroFormModes.FINALIZE
        ? prePassageiro?.escola_id
        : undefined;

  const includeVeiculoId =
    mode === PassageiroFormModes.EDIT
      ? targetPassageiro?.veiculo_id
      : mode === PassageiroFormModes.FINALIZE
        ? prePassageiro?.veiculo_id
        : undefined;

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
      editingPassageiro: targetPassageiro,
      prePassageiro,
    });

  useEffect(() => {
    if (!isOpen) {
      searchedTermsSet.current.clear();
    }
  }, [isOpen]);

  const handleSearchResponsavel = useCallback(async (term: string) => {
    if (mode === PassageiroFormModes.EDIT || mode === PassageiroFormModes.FINALIZE) return;
    const pureTerm = term.replace(/\D/g, "");
    if (pureTerm.length !== 11 || !profile?.id) return;
    if (searchedTermsSet.current.has(pureTerm)) return;

    try {
      searchedTermsSet.current.add(pureTerm);
      const responsavel = await lookupResponsavel({ term: pureTerm });

      if (responsavel) {
        if (responsavel.cpf) {
          searchedTermsSet.current.add(responsavel.cpf.replace(/\D/g, ""));
        }
        if (responsavel.telefone) {
          searchedTermsSet.current.add(responsavel.telefone.replace(/\D/g, ""));
        }

        if (responsavel.nome) {
          form.setValue("responsavel_principal.nome", responsavel.nome, { shouldValidate: true });
        }
        if (responsavel.telefone) {
          form.setValue("responsavel_principal.telefone", phoneMask(responsavel.telefone), { shouldValidate: true });
        }
        if (responsavel.cpf) {
          form.setValue("responsavel_principal.cpf", cpfMask(responsavel.cpf), { shouldValidate: true });
        }
        if (responsavel.email) {
          form.setValue("responsavel_principal.email", responsavel.email, { shouldValidate: true });
        }
        if (responsavel.parentesco) {
          form.setValue("responsavel_principal.parentesco", responsavel.parentesco, { shouldValidate: true });
        }
        if (responsavel.logradouro) {
          form.setValue("responsavel_principal.logradouro", responsavel.logradouro);
        }
        if (responsavel.numero) {
          form.setValue("responsavel_principal.numero", responsavel.numero);
        }
        if (responsavel.bairro) {
          form.setValue("responsavel_principal.bairro", responsavel.bairro);
        }
        if (responsavel.cidade) {
          form.setValue("responsavel_principal.cidade", responsavel.cidade);
        }
        if (responsavel.estado) {
          form.setValue("responsavel_principal.estado", responsavel.estado);
        }
        if (responsavel.cep) {
          form.setValue("responsavel_principal.cep", cepMask(responsavel.cep));
        }
        if (responsavel.referencia) {
          form.setValue("responsavel_principal.referencia", responsavel.referencia);
        }
        if (responsavel.complemento) {
          form.setValue("responsavel_principal.complemento", responsavel.complemento);
        }

        toast.info("Dados do responsável encontrados e preenchidos automaticamente!", {
          id: "lookup-responsavel-found"
        });
      }
    } catch {
    }
  }, [mode, profile?.id, lookupResponsavel, form]);

  const cpfResponsavelValue = form.watch("responsavel_principal.cpf");
  const telefoneResponsavelValue = form.watch("responsavel_principal.telefone");

  useEffect(() => {
    if (mode === PassageiroFormModes.EDIT || mode === PassageiroFormModes.FINALIZE) return;
    const pureCpf = cpfResponsavelValue?.replace(/\D/g, "");
    if (pureCpf && pureCpf.length === 11) {
      handleSearchResponsavel(pureCpf);
    }
  }, [cpfResponsavelValue, handleSearchResponsavel, mode]);

  useEffect(() => {
    if (mode === PassageiroFormModes.EDIT || mode === PassageiroFormModes.FINALIZE) return;
    const purePhone = telefoneResponsavelValue?.replace(/\D/g, "");
    if (purePhone && purePhone.length === 11) {
      handleSearchResponsavel(purePhone);
    }
  }, [telefoneResponsavelValue, handleSearchResponsavel, mode]);

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

    setTimeout(() => {
      isFillingMockRef.current = false;
    }, 400);

    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  }, [form, escolasData, veiculosData, setOpenAccordionItems]);

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

    const purePayload: Record<string, unknown> = { ...data };

    if (data.responsavel_principal) {
      purePayload.responsavel_principal = {
        nome: cleanString(data.responsavel_principal.nome),
        telefone: String(data.responsavel_principal.telefone || "").replace(/\D/g, ""),
        cpf: typeof data.responsavel_principal.cpf === "string" ? data.responsavel_principal.cpf.replace(/\D/g, "") || null : null,
        email: data.responsavel_principal.email || null,
        parentesco: data.responsavel_principal.parentesco || null,
        logradouro: data.responsavel_principal.logradouro || null,
        numero: data.responsavel_principal.numero || null,
        bairro: data.responsavel_principal.bairro || null,
        cidade: data.responsavel_principal.cidade || null,
        estado: data.responsavel_principal.estado || null,
        cep: typeof data.responsavel_principal.cep === "string" ? data.responsavel_principal.cep.replace(/\D/g, "") || null : null,
        referencia: data.responsavel_principal.referencia || null,
        complemento: data.responsavel_principal.complemento || null,
      };
    }

    purePayload.data_nascimento = typeof purePayload.data_nascimento === "string" && purePayload.data_nascimento
      ? convertDateBrToISO(purePayload.data_nascimento)
      : null;

    purePayload.data_inicio_transporte = typeof purePayload.data_inicio_transporte === "string" && purePayload.data_inicio_transporte
      ? convertDateBrToISO(purePayload.data_inicio_transporte)
      : null;

    purePayload.data_fim_transporte = typeof purePayload.data_fim_transporte === "string" && purePayload.data_fim_transporte
      ? convertDateBrToISO(purePayload.data_fim_transporte)
      : null;

    const anoLetivo = Number(data.ano_letivo) || new Date().getFullYear();

    purePayload.data_inicio_cobranca = data.mes_inicio_cobranca ? `${anoLetivo}-${String(data.mes_inicio_cobranca).padStart(2, '0')}-01` : null;
    purePayload.data_fim_cobranca = data.mes_fim_cobranca ? `${anoLetivo}-${String(data.mes_fim_cobranca).padStart(2, '0')}-01` : null;
    delete purePayload.mes_inicio_cobranca;
    delete purePayload.mes_fim_cobranca;

    if (mode === PassageiroFormModes.EDIT) {
      delete purePayload.ano_letivo;
    } else {
      purePayload.ano_letivo = anoLetivo;
    }

    purePayload.genero = purePayload.genero || null;
    purePayload.periodo = purePayload.periodo || null;
    purePayload.modalidade = purePayload.modalidade || null;

    purePayload.observacoes = purePayload.observacoes || null;

    if (typeof purePayload.valor_cobranca === "string") {
      purePayload.valor_cobranca = parseCurrencyToNumber(purePayload.valor_cobranca);
    }

    const commonOptions = {
      onSuccess: (responseData?: Passageiro) => {
        const isEdit = mode === PassageiroFormModes.EDIT;
        const isContractActive = !!profile?.config_contrato?.usar_contratos;
        let hasCriticalContractChanges = false;

        if (isEdit && editingPassageiro && isContractActive) {
          const normalizeForCompare = (val: unknown) => {
            if (val === null || val === undefined) return "";
            return String(val).trim().toLowerCase();
          };

          const checkStringChange = (formVal: unknown, dbVal: unknown) => {
            return normalizeForCompare(formVal) !== normalizeForCompare(dbVal);
          };

          const valorForm = parseCurrencyToNumber(purePayload.valor_cobranca as string | number | null | undefined);
          const vencimentoForm = Number(purePayload.dia_vencimento);
          
          const valorAtual = Number(editingPassageiro.valor_cobranca || 0);
          const vencimentoAtual = Number(editingPassageiro.dia_vencimento || 0);

          hasCriticalContractChanges =
            Math.abs(valorForm - valorAtual) > 0.01 ||
            vencimentoForm !== vencimentoAtual ||
            checkStringChange(purePayload.nome, editingPassageiro.nome) ||
            checkStringChange(data.responsavel_principal?.nome, editingPassageiro.responsavel_principal?.nome) ||
            checkStringChange(data.responsavel_principal?.parentesco, editingPassageiro.responsavel_principal?.parentesco) ||
            checkStringChange(data.responsavel_principal?.cpf, editingPassageiro.responsavel_principal?.cpf) ||
            checkStringChange(purePayload.escola_id, editingPassageiro.escola_id) ||
            checkStringChange(purePayload.periodo, editingPassageiro.periodo) ||
            checkStringChange(purePayload.modalidade, editingPassageiro.modalidade) ||
            checkStringChange(purePayload.turma, editingPassageiro.turma) ||
            checkStringChange(purePayload.nome_professor, editingPassageiro.nome_professor) ||
            checkStringChange(purePayload.data_inicio_transporte, editingPassageiro.data_inicio_transporte) ||
            checkStringChange(purePayload.data_fim_transporte, editingPassageiro.data_fim_transporte) ||
            checkStringChange(purePayload.data_inicio_cobranca, editingPassageiro.data_inicio_cobranca) ||
            checkStringChange(data.responsavel_principal?.logradouro, editingPassageiro.responsavel_principal?.logradouro) ||
            checkStringChange(data.responsavel_principal?.numero, editingPassageiro.responsavel_principal?.numero) ||
            checkStringChange(data.responsavel_principal?.bairro, editingPassageiro.responsavel_principal?.bairro) ||
            checkStringChange(data.responsavel_principal?.cidade, editingPassageiro.responsavel_principal?.cidade) ||
            checkStringChange(data.responsavel_principal?.estado, editingPassageiro.responsavel_principal?.estado) ||
            checkStringChange(data.responsavel_principal?.cep, editingPassageiro.responsavel_principal?.cep);
        }

        onSuccess(responseData, {
           formData: purePayload,
           hasCriticalContractChanges
        });
        onClose();
      },
      onError: (err: unknown) => {
        const msg = getErrorMessage(err);
        if (msg && msg.toLowerCase().includes("telefone")) {
          form.setError("responsavel_principal.telefone", {
            type: "manual",
            message: msg,
          });
          setOpenAccordionItems((prev) => Array.from(new Set([...prev, "responsavel"])));
        } else if (msg && msg.toLowerCase().includes("cpf")) {
          form.setError("responsavel_principal.cpf", {
            type: "manual",
            message: msg,
          });
          setOpenAccordionItems((prev) => Array.from(new Set([...prev, "responsavel"])));
        }
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
        {
          onSuccess: (res) => commonOptions.onSuccess(res.passageiro),
          onError: commonOptions.onError,
        }
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
    refreshing: refreshing || (mode === PassageiroFormModes.EDIT && isLoadingFullPassageiro && !fullPassageiro),
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
