import { useCreateCobranca, useUpdateCobranca } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { 
  calculateSafeDueDate, 
  getNowBR, 
  parseLocalDate, 
  toPersistenceString, 
  toISODateTimeBR,
  isBeforeNowBR
} from "@/utils/dateUtils";
import {
  parseCurrencyToNumber
} from "@/utils/formatters";
import {
  moneyMask
} from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// --- Schema Unificado ---
export const cobrancaSchema = z
  .object({
    // Campos comuns
    valor: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => parseCurrencyToNumber(val) >= 1, {
        message: "O valor deve ser no mínimo R$ 1,00",
      }),
    data_vencimento: z.date({
      required_error: "A data de vencimento é obrigatória.",
    }),
    
    // Status / Pagamento
    foi_pago: z.boolean().default(false),
    data_pagamento: z.date().optional(),
    tipo_pagamento: z.string().optional(),

    // Campos auxiliares para UI de Criação (Mês/Ano)
    mes: z.string().optional(),
    ano: z.string().optional(),
    
    // Controle de aviso
    is_future: z.boolean().optional(),
  })
  .refine(
    (data) => !data.foi_pago || (data.foi_pago && data.data_pagamento),
    {
      message: "Campo obrigatório",
      path: ["data_pagamento"],
    }
  )
  .refine(
    (data) => !data.foi_pago || (data.foi_pago && data.tipo_pagamento),
    {
      message: "Campo obrigatório",
      path: ["tipo_pagamento"],
    }
  )
  .refine(
    (data) => {
      // Validação de data de pagamento futura
       if (data.foi_pago && data.data_pagamento) {
           return !isBeforeNowBR(data.data_pagamento); // Se é ANTES do agora, é válido. Se for depois, falha.
           // Na verdade isBeforeNowBR retorna true se target < now.
           // Queremos: data_pagamento <= nowBR.
           // Vou usar a lógica manual aqui para ser mais preciso na validação de formulário.
           const now = getNowBR();
           return data.data_pagamento.getTime() <= now.getTime();
       }
       return true;
    },
    {
      message: "A data de pagamento não pode ser futura.",
      path: ["data_pagamento"],
    }
  )
  .refine(
    (data) => {
      // Validação: Mês Futuro exige pagamento (checkbox marcado)
      if (data.is_future) {
        return data.foi_pago === true;
      }
      return true;
    },
    {
      message: "Para meses futuros, é obrigatório indicar o pagamento.",
      path: ["foi_pago"],
    }
  );

export type CobrancaFormData = z.infer<typeof cobrancaSchema>;

interface UseCobrancaFormProps {
  mode: "create" | "edit";
  cobranca?: Cobranca; // Apenas para edit
  passageiroId?: string; // Apenas para create
  diaVencimento?: number; // Apenas para create
  valor?: number; // Apenas para create (default value)
  onSuccess?: () => void;
}

export function useCobrancaForm({
  mode,
  cobranca,
  passageiroId,
  diaVencimento = 10,
  valor,
  onSuccess,
}: UseCobrancaFormProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const createCobranca = useCreateCobranca();
  const updateCobranca = useUpdateCobranca();

  const isSubmitting = createCobranca.isPending || updateCobranca.isPending;

  // Defaults baseados no modo
  const defaultValues = useMemo<Partial<CobrancaFormData>>(() => {
    if (mode === "edit" && cobranca) {
      const isPago = cobranca.status === CobrancaStatus.PAGO;
      const valorCentavos = Math.round(Number(cobranca.valor) * 100);
      
      return {
        valor: moneyMask(String(valorCentavos)),
        data_vencimento: parseLocalDate(cobranca.data_vencimento),
        foi_pago: isPago,
        data_pagamento: cobranca.data_pagamento
          ? parseLocalDate(cobranca.data_pagamento)
          : undefined,
        tipo_pagamento: cobranca.tipo_pagamento || "",
        mes: undefined, 
        ano: undefined,
      };
    }

    // CREATE Mode
    const today = getNowBR();
    const currentMonth = (today.getMonth() + 1).toString();
    const currentYear = today.getFullYear().toString();

    const vencimentoInicial = calculateSafeDueDate(
        diaVencimento,
        today.getMonth(),
        today.getFullYear()
    );

    return {
      valor: valor ? moneyMask(String(Math.round(valor * 100))) : "",
      data_vencimento: vencimentoInicial,
      foi_pago: false,
      data_pagamento: undefined,
      tipo_pagamento: "",
      mes: currentMonth,
      ano: currentYear,
    };
  }, [mode, cobranca, diaVencimento, valor]);

  const form = useForm<CobrancaFormData>({
    resolver: zodResolver(cobrancaSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = async (data: CobrancaFormData) => {
    if (!profile?.id) {
       toast.error("sistema.erro.sessaoExpirada");
       return;
    }

    const valorNumerico = data.valor;
    
    // Persistência segura em Brasília
    const dataVencimentoStr = toPersistenceString(data.data_vencimento);
    const dataPagamentoStr = toISODateTimeBR(data.data_pagamento);

    if (mode === "create") {
      if (!passageiroId) return;

      const payload = {
        passageiro_id: passageiroId,
        mes: data.mes || (data.data_vencimento.getMonth() + 1).toString(),
        ano: data.ano || data.data_vencimento.getFullYear().toString(),
        valor: valorNumerico,
        data_vencimento: dataVencimentoStr,
        status: data.foi_pago ? CobrancaStatus.PAGO : CobrancaStatus.PENDENTE,
        data_pagamento: data.foi_pago ? dataPagamentoStr : null,
        tipo_pagamento: data.foi_pago ? data.tipo_pagamento : null,
        pagamento_manual: data.foi_pago,
        usuario_id: profile.id,
        origem: "manual",
      };

      createCobranca.mutate(payload as any, {
        onSuccess: () => {
          onSuccess?.();
          form.reset();
        },
      });

    } else if (mode === "edit" && cobranca) {
        const updatePayload: any = {
            valor: valorNumerico,
            data_vencimento: dataVencimentoStr,
            tipo_pagamento: data.foi_pago ? data.tipo_pagamento : undefined,
            status: data.foi_pago ? CobrancaStatus.PAGO : CobrancaStatus.PENDENTE,
            pagamento_manual: data.foi_pago,
        };

        if (data.foi_pago) {
            updatePayload.data_pagamento = dataPagamentoStr;
        } else {
            updatePayload.data_pagamento = null;
        }

        updateCobranca.mutate({
            id: cobranca.id,
            data: updatePayload,
            cobrancaOriginal: cobranca
        }, {
            onSuccess: () => {
                onSuccess?.();
                form.reset();
            }
        });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    isPaga: form.watch("foi_pago"),
    mesSelecionado: form.watch("mes"),
    anoSelecionado: form.watch("ano"),
  };
}
