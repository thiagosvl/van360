import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { cobrancaService } from "@/services/cobrancaService";
import { Cobranca } from "@/types/cobranca";
import { seForPago } from "@/utils/disableActions";
import {
  checkCobrancaJaVenceu,
  formatDate,
  formatDateToBR,
  getStatusColor,
  getStatusText,
  tiposPagamento,
  toLocalDateString,
} from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  endOfMonth,
  format,
  isBefore,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BadgeCheck,
  CalendarIcon,
  Contact,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface CobrancaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobranca: Cobranca;
  onCobrancaUpdated: () => void;
}

const cobrancaEditSchema = z
  .object({
    valor: z.string().min(1, "Campo obrigatório"),
    data_vencimento: z.date({
      required_error: "A data de vencimento é obrigatória.",
    }),
    tipo_pagamento: z.string().optional(),
    is_paga: z.boolean(),
    has_asaas: z.boolean(),
    cobranca_mes_ano: z.date(),
  })
  .refine(
    (data) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (data.is_paga) return true;

      if (
        data.has_asaas &&
        data.data_vencimento.getTime() !== data.cobranca_mes_ano.getTime()
      ) {
        return data.data_vencimento >= hoje;
      }

      return true;
    },
    {
      message:
        "O novo vencimento deve ser igual ou posterior à data de hoje (exigência do provedor de pagamento).",
      path: ["data_vencimento"],
    }
  );
type CobrancaEditFormData = z.infer<typeof cobrancaEditSchema>;

export default function CobrancaEditDialog({
  isOpen,
  onClose,
  cobranca,
  onCobrancaUpdated,
}: CobrancaEditDialogProps) {
  const { toast } = useToast();
  const [openCalendar, setOpenCalendar] = useState(false);

  const isPaga = seForPago(cobranca);
  const hasAsaasId = !!cobranca.asaas_payment_id;
  const isPagamentoManual = cobranca.pagamento_manual;

  const cobrancaMesAnoDate = new Date(cobranca.data_vencimento);

  const shouldDisableValueDate = isPaga && !isPagamentoManual;
  const isCobrancaMonthPast = isBefore(
    cobrancaMesAnoDate,
    startOfMonth(new Date())
  );

  const shouldDisableDueDateField =
    isPaga || (hasAsaasId && isCobrancaMonthPast);

  const shouldShowTipoPagamentoEdit = isPaga && isPagamentoManual;

  const local_moneyToNumber = moneyToNumber;
  const local_onCobrancaUpdated = onCobrancaUpdated;

  const form = useForm<CobrancaEditFormData>({
    resolver: zodResolver(cobrancaEditSchema),
    defaultValues: {
      valor: "",
      data_vencimento: cobrancaMesAnoDate,
      tipo_pagamento: isPaga ? cobranca.tipo_pagamento || "" : undefined,
      is_paga: isPaga,
      has_asaas: hasAsaasId,
      cobranca_mes_ano: cobrancaMesAnoDate,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (isOpen && cobranca?.id) {
      const valorEmCentavos = Math.round(Number(cobranca.valor) * 100);

      form.reset({
        valor: moneyMask(String(valorEmCentavos)),
        data_vencimento: formatDate(cobranca.data_vencimento),
        tipo_pagamento: cobranca.tipo_pagamento || "",
        is_paga: isPaga,
        has_asaas: hasAsaasId,
        cobranca_mes_ano: cobrancaMesAnoDate,
      });
      form.clearErrors();
      form.setValue("is_paga", isPaga);
      form.setValue("has_asaas", hasAsaasId);
    }
  }, [isOpen, cobranca?.id]);

  const handleSubmit = async (data: CobrancaEditFormData) => {
    try {
      const valorAlterado =
        local_moneyToNumber(data.valor) !== Number(cobranca.valor);
      const vencimentoAlterado =
        format(data.data_vencimento, "yyyy-MM-dd") !== cobranca.data_vencimento;
      const tipoPagamentoAlterado =
        (data.tipo_pagamento || "") !== (cobranca.tipo_pagamento || "");

      const houveAlteracao =
        valorAlterado || vencimentoAlterado || tipoPagamentoAlterado;

      if (!houveAlteracao) {
        toast({ title: "Nenhuma alteração detectada.", variant: "default" });
        onClose();
        return;
      }

      const updatePayload = {
        valor: local_moneyToNumber(data.valor),
        data_vencimento: toLocalDateString(data.data_vencimento),
        tipo_pagamento: shouldShowTipoPagamentoEdit
          ? data.tipo_pagamento
          : undefined,
      };

      await cobrancaService.editarCobrancaComTransacao(
        cobranca.id,
        updatePayload,
        cobranca
      );

      toast({ title: "Mensalidade atualizada com sucesso." });
      local_onCobrancaUpdated();
      onClose();
    } catch (error: any) {
      console.error("Erro ao editar mensalidade:", error);
      toast({
        title: "Erro ao editar mensalidade.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    }
  };

  const disableCalendarDate = (date: Date) => {
    if (!isSameMonth(date, cobrancaMesAnoDate)) {
      return true;
    }

    if (!isPaga) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (hasAsaasId) {
        return isBefore(date, hoje);
      }

      return false;
    }

    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edição de Mensalidade</DialogTitle>
        </DialogHeader>

        <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Passageiro</span>
          </div>
          <p className="font-semibold">{cobranca.passageiros.nome}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Contact className="w-4 h-4" />
            <span>Responsável</span>
          </div>
          <p className="font-semibold">
            {cobranca.passageiros.nome_responsavel}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {(() => {
              if (seForPago(cobranca)) {
                return <BadgeCheck className="w-4 h-4" />;
              } else if (checkCobrancaJaVenceu(cobranca.data_vencimento)) {
                return <XCircle className="w-4 h-4" />;
              } else {
                return <CalendarIcon className="w-4 h-4" />;
              }
            })()}

            <span>Status</span>
          </div>
          <p className="font-semibold">
            <span
              className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${getStatusColor(
                cobranca.status,
                cobranca.data_vencimento
              )}`}
            >
              {cobranca.status === "pago"
                ? `Paga em ${formatDateToBR(cobranca.data_pagamento)}`
                : getStatusText(cobranca.status, cobranca.data_vencimento)}
            </span>
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Controller
              control={form.control}
              name="valor"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      placeholder="R$ 0,00"
                      disabled={shouldDisableValueDate}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, "");
                        field.onChange(moneyMask(cleanValue));
                      }}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="data_vencimento"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Vencimento *</FormLabel>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            fieldState.error && "border-red-500 ring-red-500"
                          )}
                          disabled={shouldDisableDueDateField}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span className="text-black">Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            setOpenCalendar(false);
                          }
                        }}
                        defaultMonth={cobrancaMesAnoDate}
                        fromMonth={startOfMonth(cobrancaMesAnoDate)}
                        toMonth={endOfMonth(cobrancaMesAnoDate)}
                        disabled={disableCalendarDate}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            {shouldShowTipoPagamentoEdit && (
              <FormField
                control={form.control}
                name="tipo_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {tiposPagamento.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
