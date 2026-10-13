import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { cpfMask, phoneMask, moneyMask } from "@/utils/masks";
import { parseLocalDate, getNowBR } from "@/utils/dateUtils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Passageiro } from "@/types/passageiro";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { safeCloseDialog } from "@/hooks";
import { toast } from "@/utils/notifications/toast";
import { ParentescoResponsavel, PassageiroPeriodo } from "@/types/enums";

export const gerarContratoValidadorSchema = z
  .object({
    nome_responsavel: z.string().optional(),
    telefone_responsavel: z.string().optional(),
    cpf_responsavel: z.string().optional(),
    parentesco_responsavel: z.string().optional(),
    valor_cobranca: z.union([z.number(), z.string()]).optional(),
    dia_vencimento: z.string().optional(),
    periodo: z.string().optional(),
    data_inicio_transporte: z.string().optional(),
    data_fim_transporte: z.string().optional(),
  });

export type ValidadorFormValues = z.infer<typeof gerarContratoValidadorSchema>;

export interface UseGerarContratoValidadorViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string | null;
  initialPassageiro?: Passageiro;
  onSuccess: (
    passageiroId: string,
    bypassed?: boolean,
    updatedValues?: { valorMensal?: number; diaVencimento?: number },
    updatedPassageiro?: Passageiro
  ) => void;
}

function getInitialFormValues(passageiro?: Passageiro): ValidadorFormValues {
  const resp = passageiro?.responsavel_principal;

  return {
    nome_responsavel: resp?.nome || "",
    telefone_responsavel: resp?.telefone ? phoneMask(resp.telefone) : "",
    cpf_responsavel: resp?.cpf ? cpfMask(resp.cpf) : "",
    parentesco_responsavel: resp?.parentesco || "",
    valor_cobranca: passageiro?.valor_cobranca ? moneyMask(passageiro.valor_cobranca) : "",
    dia_vencimento: passageiro?.dia_vencimento ? passageiro.dia_vencimento.toString() : "",
    periodo: (passageiro?.periodo as PassageiroPeriodo) || "",
    data_inicio_transporte: passageiro?.data_inicio_transporte
      ? formatDateToBR(passageiro.data_inicio_transporte)
      : "",
    data_fim_transporte: passageiro?.data_fim_transporte
      ? formatDateToBR(passageiro.data_fim_transporte)
      : "",
  };
}

export function useGerarContratoValidadorViewModel({
  isOpen,
  onClose,
  passageiroId,
  initialPassageiro,
  onSuccess,
}: UseGerarContratoValidadorViewModelProps) {
  const {
    data: passageiro,
    isLoading: isLoadingPassageiro,
    isFetching: isFetchingPassageiro,
  } = usePassageiro(passageiroId || "", {
    enabled: isOpen && !!passageiroId,
    initialData: initialPassageiro,
  });

  const [openCalendarInicio, setOpenCalendarInicio] = useState(false);
  const [openCalendarFim, setOpenCalendarFim] = useState(false);
  const updatePassageiro = useUpdatePassageiro();
  const isSubmitting = updatePassageiro.isPending;

  const needsNomeResp = useMemo(() => {
    return !passageiro?.responsavel_principal?.nome || passageiro.responsavel_principal.nome.trim() === "";
  }, [passageiro?.responsavel_principal?.nome]);

  const needsTelefoneResp = useMemo(() => {
    return !passageiro?.responsavel_principal?.telefone || passageiro.responsavel_principal.telefone.trim() === "";
  }, [passageiro?.responsavel_principal?.telefone]);

  const needsCpfResp = useMemo(() => {
    const rawCpf = passageiro?.responsavel_principal?.cpf;
    if (!rawCpf || rawCpf.trim() === "") return true;
    const digits = rawCpf.replace(/\D/g, "");
    return digits.length !== 11;
  }, [passageiro?.responsavel_principal?.cpf]);

  const needsParentesco = useMemo(() => {
    return !passageiro?.responsavel_principal?.parentesco;
  }, [passageiro?.responsavel_principal?.parentesco]);

  const needsResponsavelGroup = needsNomeResp || needsTelefoneResp || needsCpfResp || needsParentesco;

  const needsValor = useMemo(() => {
    return !passageiro?.isento && (!passageiro?.valor_cobranca || Number(passageiro.valor_cobranca) <= 0);
  }, [passageiro?.isento, passageiro?.valor_cobranca]);

  const needsVencimento = useMemo(() => {
    return !passageiro?.isento && !passageiro?.dia_vencimento;
  }, [passageiro?.isento, passageiro?.dia_vencimento]);

  const needsFinanceiroGroup = needsValor || needsVencimento;

  const needsDataInicio = useMemo(() => {
    return !passageiro?.data_inicio_transporte || passageiro.data_inicio_transporte.trim() === "";
  }, [passageiro?.data_inicio_transporte]);

  const needsDataFim = useMemo(() => {
    return !passageiro?.data_fim_transporte || passageiro.data_fim_transporte.trim() === "";
  }, [passageiro?.data_fim_transporte]);

  const needsPeriodo = useMemo(() => {
    return !passageiro?.periodo || passageiro.periodo.trim() === "";
  }, [passageiro?.periodo]);

  const needsTransporteGroup = needsDataInicio || needsDataFim || needsPeriodo;

  const dynamicSchema = useMemo(() => {
    return gerarContratoValidadorSchema.superRefine((data, ctx) => {
      if (needsNomeResp) {
        if (!data.nome_responsavel || data.nome_responsavel.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o nome do responsável",
            path: ["nome_responsavel"],
          });
        }
      }

      if (needsTelefoneResp) {
        const digits = data.telefone_responsavel ? data.telefone_responsavel.replace(/\D/g, "") : "";
        if (digits.length < 10 || digits.length > 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe um WhatsApp válido com DDD",
            path: ["telefone_responsavel"],
          });
        }
      }

      if (needsCpfResp) {
        const digits = data.cpf_responsavel ? data.cpf_responsavel.replace(/\D/g, "") : "";
        if (digits.length !== 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF deve conter 11 dígitos",
            path: ["cpf_responsavel"],
          });
        }
      }

      if (needsParentesco) {
        if (!data.parentesco_responsavel || data.parentesco_responsavel.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selecione o parentesco",
            path: ["parentesco_responsavel"],
          });
        }
      }

      if (needsValor) {
        const valNum = parseCurrencyToNumber(data.valor_cobranca);
        if (!data.valor_cobranca || valNum <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o valor da parcela",
            path: ["valor_cobranca"],
          });
        }
      }

      if (needsVencimento) {
        if (!data.dia_vencimento || data.dia_vencimento.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o dia do vencimento",
            path: ["dia_vencimento"],
          });
        }
      }

      if (needsPeriodo) {
        if (!data.periodo || data.periodo.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selecione o período escolar",
            path: ["periodo"],
          });
        }
      }

      if (needsDataInicio) {
        if (!data.data_inicio_transporte || data.data_inicio_transporte.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Data de início é obrigatória",
            path: ["data_inicio_transporte"],
          });
        }
      }

      if (needsDataFim) {
        if (!data.data_fim_transporte || data.data_fim_transporte.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Data de término é obrigatória",
            path: ["data_fim_transporte"],
          });
        }
      }

      const inicioStr = data.data_inicio_transporte || (passageiro?.data_inicio_transporte ? formatDateToBR(passageiro.data_inicio_transporte) : "");
      const fimStr = data.data_fim_transporte || (passageiro?.data_fim_transporte ? formatDateToBR(passageiro.data_fim_transporte) : "");

      if (inicioStr && fimStr) {
        try {
          const start = parseLocalDate(convertDateBrToISO(inicioStr)!);
          const end = parseLocalDate(convertDateBrToISO(fimStr)!);
          if (end <= start) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Término deve ser maior que o Início",
              path: ["data_fim_transporte"],
            });
          }
        } catch {
        }
      }
    });
  }, [
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
    needsParentesco,
    needsValor,
    needsVencimento,
    needsPeriodo,
    needsDataInicio,
    needsDataFim,
    passageiro?.data_inicio_transporte,
    passageiro?.data_fim_transporte,
  ]);

  const form = useForm<ValidadorFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: getInitialFormValues(initialPassageiro),
  });

  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  const lastLoadedPassengerIdRef = useRef<string | null>(null);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
  }, [onSuccess, onClose]);

  useEffect(() => {
    if (!isOpen || !passageiro) return;

    if (lastLoadedPassengerIdRef.current !== passageiro.id) {
      lastLoadedPassengerIdRef.current = passageiro.id;
      form.reset(getInitialFormValues(passageiro));

      if (!needsResponsavelGroup && !needsFinanceiroGroup && !needsTransporteGroup) {
        onCloseRef.current();
        onSuccessRef.current(passageiro.id, true, undefined, passageiro);
      }
    }
  }, [
    isOpen,
    passageiro,
    form,
    needsResponsavelGroup,
    needsFinanceiroGroup,
    needsTransporteGroup,
  ]);

  useEffect(() => {
    if (!isOpen) {
      lastLoadedPassengerIdRef.current = null;
    }
  }, [isOpen]);

  const handleSubmit = async (data: ValidadorFormValues) => {
    if (!passageiroId || !passageiro) return;

    try {
      const payload: Record<string, unknown> = {};

      if (needsResponsavelGroup) {
        payload.responsavel_principal = {
          nome: (needsNomeResp ? data.nome_responsavel?.trim() : passageiro.responsavel_principal?.nome) || "",
          telefone: (needsTelefoneResp ? data.telefone_responsavel?.replace(/\D/g, "") : passageiro.responsavel_principal?.telefone?.replace(/\D/g, "")) || "",
          cpf: (needsCpfResp ? data.cpf_responsavel?.replace(/\D/g, "") : passageiro.responsavel_principal?.cpf?.replace(/\D/g, "")) || null,
          parentesco: (needsParentesco ? data.parentesco_responsavel : passageiro.responsavel_principal?.parentesco) || ParentescoResponsavel.MAE,
        };
      }

      if (needsValor && data.valor_cobranca) {
        payload.valor_cobranca = parseCurrencyToNumber(data.valor_cobranca);
      }

      if (needsVencimento && data.dia_vencimento) {
        payload.dia_vencimento = Number(data.dia_vencimento);
      }

      if (needsPeriodo && data.periodo) {
        payload.periodo = data.periodo;
      }

      if (needsDataInicio && data.data_inicio_transporte) {
        payload.data_inicio_transporte = convertDateBrToISO(data.data_inicio_transporte);
      }

      if (needsDataFim && data.data_fim_transporte) {
        payload.data_fim_transporte = convertDateBrToISO(data.data_fim_transporte);
      }

      if (!passageiro.data_inicio_cobranca && payload.data_inicio_transporte) {
        payload.data_inicio_cobranca = payload.data_inicio_transporte;
      }

      if (!passageiro.data_fim_cobranca && payload.data_fim_transporte) {
        payload.data_fim_cobranca = payload.data_fim_transporte;
      }

      const res = await updatePassageiro.mutateAsync({
        id: passageiroId,
        data: payload,
        showToast: false,
        skipContratosInvalidation: true,
      });

      const finalPassageiro = res || passageiro;

      const updatedValues = {
        valorMensal: (needsValor && data.valor_cobranca)
          ? parseCurrencyToNumber(data.valor_cobranca)
          : Number(finalPassageiro?.valor_cobranca) || undefined,
        diaVencimento: (needsVencimento && data.dia_vencimento)
          ? Number(data.dia_vencimento)
          : Number(finalPassageiro?.dia_vencimento) || undefined,
      };

      safeCloseDialog(onClose);
      onSuccess(passageiroId, false, updatedValues, finalPassageiro);
    } catch {
      toast.error("Erro ao atualizar aluno", {
        description: "Verifique os dados informados e tente novamente.",
      });
    }
  };

  const handleFillMock = () => {
    const today = getNowBR();
    const endOfYear = new Date(today.getFullYear(), 11, 20);

    const start = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const end = endOfYear.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    form.reset({
      nome_responsavel: "Fernanda Cristina Silva",
      telefone_responsavel: "(11) 98765-4321",
      cpf_responsavel: "395.423.918-38",
      parentesco_responsavel: ParentescoResponsavel.MAE,
      valor_cobranca: 350,
      dia_vencimento: "10",
      periodo: PassageiroPeriodo.MANHA,
      data_inicio_transporte: start,
      data_fim_transporte: end,
    });
  };

  const onFormError = () => {
    toast.error("Preencha todos os campos obrigatórios para gerar o contrato.");
  };

  return {
    form,
    passageiro,
    isLoadingPassageiro,
    isSubmitting,
    handleSubmit,
    openCalendarInicio,
    setOpenCalendarInicio,
    openCalendarFim,
    setOpenCalendarFim,
    handleFillMock,
    onFormError,
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
    needsParentesco,
    needsResponsavelGroup,
    needsValor,
    needsVencimento,
    needsFinanceiroGroup,
    needsDataInicio,
    needsDataFim,
    needsPeriodo,
    needsTransporteGroup,
  };
}
