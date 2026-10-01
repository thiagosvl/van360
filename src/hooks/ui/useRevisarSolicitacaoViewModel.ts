import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  revisarSolicitacaoSchema,
  RevisarSolicitacaoFormData,
} from "@/schemas/revisarSolicitacaoSchema";
import { PrePassageiro } from "@/types/prePassageiro";
import { Passageiro } from "@/types/passageiro";
import {
  ParentescoResponsavel,
  PassageiroGenero,
  PassageiroModalidade,
  PassageiroPeriodo,
} from "@/types/enums";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { useProfile } from "@/hooks/business/useProfile";
import { useEscolasWithFilters } from "@/hooks/api/useEscolasWithFilters";
import { useVeiculosWithFilters } from "@/hooks/api/useVeiculosWithFilters";
import { useFinalizePreCadastro } from "@/hooks/api/usePassageiroMutations";
import { useDeletePrePassageiro } from "@/hooks/api/usePrePassageiroMutations";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { getDefaultAnoLetivo } from "@/utils/domain";
import { getErrorMessage } from "@/utils/errorHandler";

interface UseRevisarSolicitacaoViewModelProps {
  isOpen: boolean;
  prePassageiro: PrePassageiro | null;
  onClose: () => void;
  onSuccess?: (passageiro: Passageiro) => void;
}

export function useRevisarSolicitacaoViewModel({
  isOpen,
  prePassageiro,
  onClose,
  onSuccess,
}: UseRevisarSolicitacaoViewModelProps) {
  const { profile } = useProfile();
  const defaultAnoLetivo = getDefaultAnoLetivo();
  const {
    openEscolaFormDialog,
    openVeiculoFormDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const { data: escolasList = [], isLoading: isLoadingEscolas } = useEscolasWithFilters(
    profile?.id,
    { ativo: "true", includeId: prePassageiro?.escola_id || undefined },
    { enabled: isOpen && !!profile?.id }
  ) as { data: Escola[]; isLoading: boolean };

  const { data: veiculosList = [], isLoading: isLoadingVeiculos } = useVeiculosWithFilters(
    profile?.id,
    { ativo: "true", includeId: prePassageiro?.veiculo_id || undefined },
    { enabled: isOpen && !!profile?.id }
  ) as { data: Veiculo[]; isLoading: boolean };

  const form = useForm<RevisarSolicitacaoFormData>({
    resolver: zodResolver(revisarSolicitacaoSchema),
    defaultValues: {
      veiculo_id: "",
      escola_id: "",
      periodo: "",
      ano_letivo: defaultAnoLetivo,
      isento: false,
      valor_cobranca: "",
      dia_vencimento: "",
      mes_inicio_cobranca: defaultAnoLetivo && Number(defaultAnoLetivo) > new Date().getFullYear() ? "" : String(new Date().getMonth() + 1),
      ano_inicio_cobranca: defaultAnoLetivo || new Date().getFullYear().toString(),
      mes_fim_cobranca: defaultAnoLetivo && Number(defaultAnoLetivo) > new Date().getFullYear() ? "" : "12",
      ano_fim_cobranca: defaultAnoLetivo || new Date().getFullYear().toString(),
      nome: "",
      data_nascimento: "",
      genero: "",
      observacoes: "",
      nome_responsavel: "",
      parentesco_responsavel: "",
      telefone_responsavel: "",
      cpf_responsavel: "",
      email_responsavel: "",
      notificacoes_rota_habilitadas: true,
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
      referencia: "",
      modalidade: "",
      horario_entrada: "",
      horario_saida: "",
      turma: "",
      sala: "",
      nome_professor: "",
      data_inicio_transporte: "",
      data_fim_transporte: "",
    },
  });

  const anoLetivoValue = form.watch("ano_letivo");
  const prevAnoLetivoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anoLetivoValue) return;

    if (prevAnoLetivoRef.current === null) {
      prevAnoLetivoRef.current = anoLetivoValue;
      return;
    }
    if (prevAnoLetivoRef.current === anoLetivoValue) {
      return;
    }

    prevAnoLetivoRef.current = anoLetivoValue;
    const currentYear = new Date().getFullYear();
    const selectedAno = anoLetivoValue;
    form.setValue("ano_inicio_cobranca", selectedAno);
    form.setValue("ano_fim_cobranca", selectedAno);

    if (parseInt(selectedAno, 10) > currentYear) {
      form.setValue("mes_inicio_cobranca", "");
      form.setValue("mes_fim_cobranca", "");
    }
  }, [anoLetivoValue, form]);

  useEffect(() => {
    if (isOpen && prePassageiro) {
      const currentYear = new Date().getFullYear();
      const anoLetivoVal = prePassageiro.ano_letivo
        ? prePassageiro.ano_letivo.toString()
        : defaultAnoLetivo;

      const isFutureYear = anoLetivoVal ? Number(anoLetivoVal) > currentYear : false;
      const initialMesInicio = isFutureYear ? "" : String(currentYear === new Date().getFullYear() ? new Date().getMonth() + 1 : 1);
      const initialMesFim = isFutureYear ? "" : "12";

      form.reset({
        veiculo_id: prePassageiro.veiculo_id || "",
        escola_id: prePassageiro.escola_id || "",
        periodo: prePassageiro.periodo || "",
        ano_letivo: anoLetivoVal,
        isento: false,
        valor_cobranca: prePassageiro.valor_cobranca
          ? moneyMask(String(Math.round(Number(prePassageiro.valor_cobranca) * 100)))
          : "",
        dia_vencimento: prePassageiro.dia_vencimento
          ? prePassageiro.dia_vencimento.toString()
          : "",
        mes_inicio_cobranca: initialMesInicio,
        ano_inicio_cobranca: anoLetivoVal || currentYear.toString(),
        mes_fim_cobranca: initialMesFim,
        ano_fim_cobranca: anoLetivoVal || currentYear.toString(),
        nome: prePassageiro.nome || "",
        data_nascimento: prePassageiro.data_nascimento
          ? formatDateToBR(prePassageiro.data_nascimento)
          : "",
        genero: prePassageiro.genero || "",
        observacoes: prePassageiro.observacoes || "",
        nome_responsavel: prePassageiro.nome_responsavel || "",
        parentesco_responsavel: prePassageiro.parentesco_responsavel || "",
        telefone_responsavel: prePassageiro.telefone_responsavel
          ? phoneMask(prePassageiro.telefone_responsavel)
          : "",
        cpf_responsavel: prePassageiro.cpf_responsavel
          ? cpfMask(prePassageiro.cpf_responsavel)
          : "",
        email_responsavel: prePassageiro.email_responsavel || "",
        notificacoes_rota_habilitadas: true,
        cep: prePassageiro.cep ? cepMask(prePassageiro.cep) : "",
        logradouro: prePassageiro.logradouro || "",
        numero: prePassageiro.numero || "",
        bairro: prePassageiro.bairro || "",
        cidade: prePassageiro.cidade || "",
        estado: prePassageiro.estado || "",
        complemento: prePassageiro.complemento || "",
        referencia: prePassageiro.referencia || "",
        modalidade: prePassageiro.modalidade || "",
        horario_entrada: prePassageiro.horario_entrada || "",
        horario_saida: prePassageiro.horario_saida || "",
        turma: prePassageiro.turma || "",
        sala: prePassageiro.sala || "",
        nome_professor: prePassageiro.nome_professor || "",
        data_inicio_transporte: prePassageiro.data_inicio_transporte
          ? formatDateToBR(prePassageiro.data_inicio_transporte)
          : "",
        data_fim_transporte: prePassageiro.data_fim_transporte
          ? formatDateToBR(prePassageiro.data_fim_transporte)
          : "",
      });
      prevAnoLetivoRef.current = anoLetivoVal;
    }
  }, [isOpen, prePassageiro, defaultAnoLetivo, form]);

  useEffect(() => {
    if (isOpen && veiculosList.length === 1 && !form.getValues("veiculo_id")) {
      form.setValue("veiculo_id", veiculosList[0].id, { shouldValidate: true });
    }
  }, [isOpen, veiculosList, form]);

  const finalizeMutation = useFinalizePreCadastro();
  const deleteMutation = useDeletePrePassageiro();

  const handleAddNewSchool = useCallback(() => {
    openEscolaFormDialog({
      allowBatchCreation: false,
      onSuccess: (escolaCriada: Escola) => {
        if (escolaCriada?.id) {
          form.setValue("escola_id", escolaCriada.id, { shouldValidate: true });
        }
      },
    });
  }, [openEscolaFormDialog, form]);

  const handleAddNewVehicle = useCallback(() => {
    openVeiculoFormDialog({
      onSuccess: (veiculoCriado: Veiculo) => {
        if (veiculoCriado?.id) {
          form.setValue("veiculo_id", veiculoCriado.id, { shouldValidate: true });
        }
      },
    });
  }, [openVeiculoFormDialog, form]);

  const handleRecusar = useCallback(() => {
    if (!prePassageiro?.id) return;

    openConfirmationDialog({
      title: "Recusar Solicitação",
      description: `Tem certeza que deseja recusar a solicitação de ${prePassageiro.nome}? Esta ação não pode ser desfeita.`,
      variant: "destructive",
      confirmText: "Sim, Recusar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(prePassageiro.id);
          safeCloseDialog(closeConfirmationDialog);
          safeCloseDialog(onClose);
        } catch {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  }, [prePassageiro, openConfirmationDialog, closeConfirmationDialog, deleteMutation, onClose]);

  const onSubmit = useCallback(
    async (values: RevisarSolicitacaoFormData) => {
      if (!prePassageiro?.id || !profile?.id) return;

      const anoIni = values.ano_inicio_cobranca || defaultAnoLetivo;
      const anoTerm = values.ano_fim_cobranca || anoIni;

      const payload: Partial<Passageiro> & {
        usuario_id: string;
        responsavel_principal: {
          nome: string;
          parentesco: string;
          telefone: string;
          cpf: string | null;
          email: string | null;
          notificacoes_rota_habilitadas: boolean;
          logradouro: string;
          numero: string;
          bairro: string;
          cidade: string;
          estado: string;
          cep: string;
          complemento: string | null;
          referencia: string | null;
        };
      } = {
        usuario_id: profile.id,
        nome: values.nome.trim(),
        veiculo_id: values.veiculo_id,
        escola_id: values.escola_id,
        periodo: values.periodo.toLowerCase() as PassageiroPeriodo,
        ano_letivo: parseInt(values.ano_letivo, 10),
        data_nascimento: convertDateBrToISO(values.data_nascimento),
        genero: values.genero as PassageiroGenero,
        observacoes: values.observacoes?.trim() || null,
        modalidade: values.modalidade as PassageiroModalidade,
        horario_entrada: values.horario_entrada?.trim() || null,
        horario_saida: values.horario_saida?.trim() || null,
        turma: values.turma?.trim() || null,
        sala: values.sala?.trim() || null,
        nome_professor: values.nome_professor?.trim() || null,
        data_inicio_transporte: values.data_inicio_transporte
          ? convertDateBrToISO(values.data_inicio_transporte)
          : null,
        data_fim_transporte: values.data_fim_transporte
          ? convertDateBrToISO(values.data_fim_transporte)
          : null,
        isento: values.isento,
        valor_cobranca: values.isento ? null : (values.valor_cobranca ? parseCurrencyToNumber(values.valor_cobranca) : null),
        dia_vencimento: values.isento ? null : (values.dia_vencimento ? Number(values.dia_vencimento) : null),
        data_inicio_cobranca: values.isento || !values.mes_inicio_cobranca
          ? null
          : `${anoIni}-${String(values.mes_inicio_cobranca).padStart(2, "0")}-01`,
        data_fim_cobranca: values.isento || !values.mes_fim_cobranca
          ? null
          : `${anoTerm}-${String(values.mes_fim_cobranca).padStart(2, "0")}-01`,
        responsavel_principal: {
          nome: values.nome_responsavel.trim(),
          parentesco: values.parentesco_responsavel as ParentescoResponsavel,
          telefone: values.telefone_responsavel.replace(/\D/g, ""),
          cpf: values.cpf_responsavel ? values.cpf_responsavel.replace(/\D/g, "") : null,
          email: values.email_responsavel?.trim() || null,
          notificacoes_rota_habilitadas: values.notificacoes_rota_habilitadas,
          logradouro: values.logradouro.trim(),
          numero: values.numero.trim(),
          bairro: values.bairro.trim(),
          cidade: values.cidade.trim(),
          estado: values.estado,
          cep: values.cep.replace(/\D/g, ""),
          complemento: values.complemento?.trim() || null,
          referencia: values.referencia?.trim() || null,
        },
      };

      try {
        const response = await finalizeMutation.mutateAsync({
          prePassageiroId: prePassageiro.id,
          data: payload,
        });

        const novoPassageiro = (response as { passageiro?: Passageiro })?.passageiro ?? (response as unknown as Passageiro);
        safeCloseDialog(onClose);
        if (onSuccess && novoPassageiro) {
          onSuccess(novoPassageiro);
        }
      } catch (error) {
        const msg = getErrorMessage(error);
        toast.error("Erro ao aprovar solicitação", {
          description: msg || "Verifique os dados informados e tente novamente.",
        });
      }
    },
    [prePassageiro, profile?.id, defaultAnoLetivo, finalizeMutation, onClose, onSuccess]
  );

  const handleFillMock = useCallback(() => {
    form.setValue("isento", false, { shouldValidate: true, shouldDirty: true });
    form.setValue("valor_cobranca", moneyMask(350), { shouldValidate: true, shouldDirty: true });
    form.setValue("dia_vencimento", "10", { shouldValidate: true, shouldDirty: true });
  }, [form]);

  const onFormError = useCallback(() => {
    toast.error("Por favor, verifique os campos destacados em vermelho.");
  }, []);

  return {
    form,
    escolasList,
    veiculosList,
    isLoadingEscolas,
    isLoadingVeiculos,
    isSubmitting: finalizeMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleAddNewSchool,
    handleAddNewVehicle,
    handleRecusar,
    handleFillMock,
    onFormError,
    onSubmit,
  };
}
