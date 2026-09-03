import { useCreateCobranca, useUpdateCobranca } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus, CobrancaTipoPagamento } from "@/types/enums";
import { CreateCobrancaDTO, UpdateCobrancaDTO } from "@/types/dtos/cobranca.dto";
import {
  calculateSafeDueDate,
  getNowBR,
  parseLocalDate,
  toPersistenceString,
  toISODateTimeBR
} from "@/utils/dateUtils";
import {
  parseCurrencyToNumber
} from "@/utils/formatters";
import {
  moneyMask
} from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const cobrancaSchema = z
  .object({
    valor: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => parseCurrencyToNumber(val) >= 1, {
        message: "O valor deve ser no mínimo R$ 1,00",
      }),
    data_vencimento: z.date({
      required_error: "A data de vencimento é obrigatória.",
    }),

    foi_pago: z.boolean().default(false),
    data_pagamento: z.date().optional(),
    tipo_pagamento: z.string().optional(),
    enviar_recibo_whatsapp_manual: z.boolean().default(false).optional(),

    mes: z.union([z.string(), z.number()]).optional(),
    ano: z.union([z.string(), z.number()]).optional(),

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
      if (data.foi_pago && data.data_pagamento) {
        const pagDate = new Date(data.data_pagamento.getFullYear(), data.data_pagamento.getMonth(), data.data_pagamento.getDate());
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return pagDate.getTime() <= today.getTime();
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
      if (data.is_future) {
        return data.foi_pago === true;
      }
      return true;
    },
    {
      message: "Para meses futuros, é obrigatório informar o pagamento.",
      path: ["foi_pago"],
    }
  );

export type CobrancaFormData = z.infer<typeof cobrancaSchema>;

interface UseCobrancaFormProps {
  mode: "create" | "edit";
  cobranca?: Cobranca;
  passageiroId?: string;
  passageiroNome?: string;
  diaVencimento?: number;
  valor?: number;
  mes?: number;
  ano?: number;
  lockFoiPago?: boolean;
  onSuccess?: () => void;
}

export function useCobrancaForm({
  mode,
  cobranca,
  passageiroId,
  passageiroNome,
  diaVencimento = 10,
  valor,
  mes,
  ano,
  lockFoiPago,
  onSuccess,
}: UseCobrancaFormProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const createCobranca = useCreateCobranca();
  const updateCobranca = useUpdateCobranca();

  const isSubmitting = createCobranca.isPending || updateCobranca.isPending;

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
        enviar_recibo_whatsapp_manual: false,
        mes: cobranca.mes != null ? String(cobranca.mes) : undefined,
        ano: cobranca.ano != null ? String(cobranca.ano) : undefined,
      };
    }

    const today = getNowBR();
    const parsedMes = (typeof mes === "number" || typeof mes === "string") ? Number(mes) : NaN;
    const parsedAno = (typeof ano === "number" || typeof ano === "string") ? Number(ano) : NaN;

    const hasExplicitMes = !isNaN(parsedMes) && parsedMes >= 1 && parsedMes <= 12;
    const targetMonthNum = hasExplicitMes ? parsedMes : today.getMonth() + 1;
    const targetYearNum = !isNaN(parsedAno) && parsedAno >= 2020 ? parsedAno : today.getFullYear();

    const vencimentoInicial = calculateSafeDueDate(
      diaVencimento,
      targetMonthNum - 1,
      targetYearNum
    );

    return {
      valor: valor ? moneyMask(String(Math.round(valor * 100))) : "",
      data_vencimento: vencimentoInicial,
      foi_pago: lockFoiPago ? true : false,
      data_pagamento: lockFoiPago ? today : undefined,
      tipo_pagamento: "",
      enviar_recibo_whatsapp_manual: false,
      mes: hasExplicitMes ? targetMonthNum.toString() : "",
      ano: targetYearNum.toString(),
    };
  }, [mode, cobranca, diaVencimento, valor, mes, ano, lockFoiPago]);

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

    const valorNumerico = typeof data.valor === 'string' ? parseCurrencyToNumber(data.valor) : data.valor;

    const dataVencimentoStr = toPersistenceString(data.data_vencimento);
    const dataPagamentoStr = toISODateTimeBR(data.data_pagamento);

    if (mode === "create") {
      if (!passageiroId) return;

      const payload: CreateCobrancaDTO = {
        passageiro_id: passageiroId,
        mes: Number(data.mes || data.data_vencimento.getMonth() + 1),
        ano: Number(data.ano || data.data_vencimento.getFullYear()),
        valor: valorNumerico,
        data_vencimento: dataVencimentoStr,
        status: data.foi_pago ? CobrancaStatus.PAGO : CobrancaStatus.PENDENTE,
        data_pagamento: data.foi_pago ? dataPagamentoStr : undefined,
        tipo_pagamento: data.foi_pago ? (data.tipo_pagamento as CobrancaTipoPagamento) : undefined,
        pagamento_manual: data.foi_pago,
        usuario_id: profile.id,
      };

      createCobranca.mutate(payload, {
        onSuccess: async (createdCobranca?: Cobranca) => {
          const nomeAluno = passageiroNome || cobranca?.passageiro?.nome || createdCobranca?.passageiro?.nome || "";
          const shouldShare = data.foi_pago && data.enviar_recibo_whatsapp_manual && createdCobranca?.recibo_url;
          const reciboUrl = createdCobranca?.recibo_url;
          const cobrancaMes = createdCobranca?.mes;
          const cobrancaAno = createdCobranca?.ano;

          onSuccess?.();
          form.reset();

          if (shouldShare && reciboUrl) {
            await shareReceiptFile({
              url: reciboUrl,
              filename: `recibo-${cobrancaMes || ""}-${cobrancaAno || ""}.png`.toLowerCase(),
              title: "Recibo Van360",
              text: `Recibo de ${cobrancaMes}/${cobrancaAno} - ${nomeAluno}`.trim(),
            });
          }
        },
      });

    } else if (mode === "edit" && cobranca) {
      if (cobranca.isProjection) {
        const createPayload: CreateCobrancaDTO = {
          passageiro_id: cobranca.passageiro_id,
          usuario_id: cobranca.usuario_id || cobranca.passageiro?.usuario_id || profile.id,
          mes: Number(cobranca.mes),
          ano: Number(cobranca.ano),
          valor: valorNumerico,
          data_vencimento: dataVencimentoStr,
          status: data.foi_pago ? CobrancaStatus.PAGO : CobrancaStatus.PENDENTE,
          data_pagamento: data.foi_pago ? dataPagamentoStr : undefined,
          tipo_pagamento: data.foi_pago ? (data.tipo_pagamento as CobrancaTipoPagamento) : undefined,
          pagamento_manual: data.foi_pago,
          desativar_lembretes: cobranca.desativar_lembretes ?? false,
        };

        createCobranca.mutate(createPayload, {
          onSuccess: async (createdCobranca?: Cobranca) => {
            const nomeAluno = passageiroNome || cobranca?.passageiro?.nome || createdCobranca?.passageiro?.nome || "";
            const shouldShare = data.foi_pago && data.enviar_recibo_whatsapp_manual && createdCobranca?.recibo_url;
            const reciboUrl = createdCobranca?.recibo_url;
            const cobrancaMes = createdCobranca?.mes;
            const cobrancaAno = createdCobranca?.ano;

            onSuccess?.();
            form.reset();

            if (shouldShare && reciboUrl) {
              await shareReceiptFile({
                url: reciboUrl,
                filename: `recibo-${cobrancaMes || ""}-${cobrancaAno || ""}.png`.toLowerCase(),
                title: "Recibo Van360",
                text: `Recibo de ${cobrancaMes}/${cobrancaAno} - ${nomeAluno}`.trim(),
              });
            }
          },
        });
        return;
      }

      const updatePayload: UpdateCobrancaDTO = {
        valor: valorNumerico,
        data_vencimento: dataVencimentoStr,
        tipo_pagamento: data.foi_pago ? (data.tipo_pagamento as CobrancaTipoPagamento) : undefined,
        status: data.foi_pago ? CobrancaStatus.PAGO : CobrancaStatus.PENDENTE,
        data_pagamento: data.foi_pago ? dataPagamentoStr : undefined,
      };

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
