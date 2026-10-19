import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { cpfMask, phoneMask, moneyMask } from "@/utils/masks";
import { useEffect, useMemo, useRef } from "react";
import { Passageiro } from "@/types/passageiro";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { safeCloseDialog } from "@/hooks";
import { toast } from "@/utils/notifications/toast";
import { ParentescoResponsavel } from "@/types/enums";
import { avaliarPendenciasContrato } from "@/utils/domain";

export const gerarContratoValidadorSchema = z
  .object({
    nome_responsavel: z.string().optional(),
    telefone_responsavel: z.string().optional(),
    cpf_responsavel: z.string().optional(),
    parentesco_responsavel: z.string().optional(),
    valor_cobranca: z.union([z.number(), z.string()]).optional(),
    dia_vencimento: z.string().optional(),
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

  const updatePassageiro = useUpdatePassageiro();
  const isSubmitting = updatePassageiro.isPending;

  const {
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
    needsParentesco,
    needsResponsavelGroup,
    needsValor,
    needsVencimento,
    needsFinanceiroGroup,
  } = useMemo(() => avaliarPendenciasContrato(passageiro), [passageiro]);

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
    });
  }, [
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
    needsParentesco,
    needsValor,
    needsVencimento,
  ]);

  const form = useForm<ValidadorFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: getInitialFormValues(initialPassageiro),
  });

  const lastLoadedPassengerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      lastLoadedPassengerIdRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !passageiro) return;

    if (lastLoadedPassengerIdRef.current !== passageiro.id) {
      lastLoadedPassengerIdRef.current = passageiro.id;
      form.reset(getInitialFormValues(passageiro));
    } else if (!form.formState.isDirty) {
      form.reset(getInitialFormValues(passageiro));
    }
  }, [isOpen, passageiro, form]);

  const handleSubmit = async (data: ValidadorFormValues) => {
    if (!passageiroId || !passageiro || isSubmitting) return;

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
    form.reset({
      nome_responsavel: "Fernanda Cristina Silva",
      telefone_responsavel: "(11) 95118-6951",
      cpf_responsavel: "395.423.918-38",
      parentesco_responsavel: ParentescoResponsavel.MAE,
      valor_cobranca: 350,
      dia_vencimento: "10",
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
  };
}
