import { useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { useVeiculos, useSession, useProfile, safeCloseDialog } from "@/hooks";
import {
  useFretamentoForm,
  type FretamentoFormData,
} from "@/hooks/form/useFretamentoForm";
import {
  useCriarFretamentoMutation,
  useAtualizarFretamentoMutation,
} from "@/hooks/api/useFretamentosApi";
import type { FretamentoDetalhes, TipoPagamento } from "@/services/api/fretamento.api";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { toLocalDateString } from "@/utils/formatters";
import { Compass, MapPin, Calendar, Car, FileText, CreditCard, Wand2 } from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "sonner";

interface FretamentoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export function FretamentoFormDialog({
  isOpen,
  onClose,
  editingItem = null,
  onSuccess,
}: FretamentoFormDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id });
  const veiculos = veiculosData?.list || [];
  const form = useFretamentoForm({ editingItem });
  const criarMutation = useCriarFretamentoMutation();
  const atualizarMutation = useAtualizarFretamentoMutation();

  const isEditing = !!editingItem;
  const temSinal = form.watch("tem_sinal");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        titulo: editingItem?.titulo || "",
        origem: editingItem?.origem || "",
        destino: editingItem?.destino || "",
        data_inicio: editingItem?.data_inicio ? editingItem.data_inicio.split("T")[0] : "",
        veiculo_id: editingItem?.veiculos?.[0]?.veiculo_id || null,
        valor_total: editingItem?.valor_total ? moneyMask(Number(editingItem.valor_total)) : "",
        observacoes: editingItem?.observacoes || "",
        tem_sinal: false,
        valor_sinal: "",
        tipo_pagamento_sinal: "PIX",
        data_pagamento_sinal: toLocalDateString(new Date()),
      });
    }
  }, [isOpen, editingItem, form]);

  const handleFillMock = () => {
    const mock = mockGenerator.fretamento();
    const veiculoSorteado = veiculos.length > 0 ? veiculos[Math.floor(Math.random() * veiculos.length)].id : null;
    form.setValue("titulo", mock.titulo, { shouldValidate: true });
    form.setValue("origem", mock.origem, { shouldValidate: true });
    form.setValue("destino", mock.destino, { shouldValidate: true });
    form.setValue("data_inicio", mock.data_viagem, { shouldValidate: true });
    form.setValue("veiculo_id", veiculoSorteado, { shouldValidate: true });
    form.setValue("valor_total", moneyMask(Number(mock.valor_total)), { shouldValidate: true });
    form.setValue("tem_sinal", true, { shouldValidate: true });
    form.setValue("valor_sinal", moneyMask(Number(mock.sinal_valor)), { shouldValidate: true });
    form.setValue("tipo_pagamento_sinal", "PIX", { shouldValidate: true });
    form.setValue("observacoes", mock.observacoes, { shouldValidate: true });
  };

  const onSubmit = async (values: FretamentoFormData) => {
    try {
      const valorTotal = moneyToNumber(values.valor_total);
      const valorSinal = values.tem_sinal && values.valor_sinal ? moneyToNumber(values.valor_sinal) : undefined;
      const dataInicioIso = new Date(`${values.data_inicio}T12:00:00`).toISOString();

      if (isEditing && editingItem) {
        await atualizarMutation.mutateAsync({
          id: editingItem.id,
          payload: {
            titulo: values.titulo,
            origem: values.origem,
            destino: values.destino,
            data_inicio: dataInicioIso,
            data_fim: null,
            contratante_nome: null,
            contratante_telefone: null,
            valor_total: valorTotal,
            observacoes: values.observacoes,
            veiculos_ids: values.veiculo_id ? [values.veiculo_id] : [],
          },
        });
        toast.success("Fretamento atualizado com sucesso!");
      } else {
        await criarMutation.mutateAsync({
          tipo: "fretamento",
          titulo: values.titulo,
          origem: values.origem,
          destino: values.destino,
          data_inicio: dataInicioIso,
          data_fim: null,
          contratante_nome: null,
          contratante_telefone: null,
          valor_total: valorTotal,
          observacoes: values.observacoes,
          veiculos_ids: values.veiculo_id ? [values.veiculo_id] : [],
          sinal_inicial:
            values.tem_sinal && valorSinal && valorSinal > 0
              ? {
                valor: valorSinal,
                tipo_pagamento: values.tipo_pagamento_sinal as TipoPagamento,
                data_pagamento: values.data_pagamento_sinal || undefined,
              }
              : null,
        });
        toast.success("Fretamento cadastrado com sucesso!");
      }

      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao salvar fretamento. Verifique os dados.");
    }
  };

  const isSubmitting = criarMutation.isPending || atualizarMutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="lg">
      <BaseDialog.Header
        title={isEditing ? "Editar Fretamento" : "Novo Fretamento"}
        subtitle="Viagem particular, frete fechado ou evento avulso"
        icon={<Compass className="h-5 w-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 transition-all active:scale-95 shadow-2xs"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-3.5 p-5 sm:p-6 overflow-y-auto">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                    Título / Identificação da Viagem <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Input
                        placeholder="Ex: Casamento em Campinas, Transfer Aeroporto..."
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Local de Saída / Origem</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Ex: Terminal Barra Funda, Av. Paulista..."
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destino"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                      Destino <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Ex: Atibaia, Santos, Hopi Hari..."
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                      Data da Viagem <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          type="date"
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Van / Veículo Alocado</FormLabel>
                    <div className="relative">
                      <Car className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm text-left">
                            <SelectValue placeholder="Selecione a van..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {veiculos.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.placa} {v.modelo ? `- ${v.modelo}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="valor_total"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Valor Total do Fretamento"
                  required
                  labelClassName="text-slate-700 font-semibold ml-0.5 text-xs"
                  inputClassName="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm font-bold text-slate-800 transition-all"
                />
              )}
            />

            {!isEditing && (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                <FormField
                  control={form.control}
                  name="tem_sinal"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0 cursor-pointer select-none">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-4 w-4 rounded border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c]"
                        />
                      </FormControl>
                      <FormLabel className="text-xs font-semibold text-slate-700 cursor-pointer m-0">
                        Já recebi um sinal / adiantamento
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {temSinal && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 animate-in fade-in-50 duration-200">
                    <FormField
                      control={form.control}
                      name="valor_sinal"
                      render={({ field }) => (
                        <MoneyInput
                          field={field}
                          label="Valor do Sinal"
                          required
                          labelClassName="text-slate-700 font-semibold ml-0.5 text-[11px]"
                          inputClassName="pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] text-sm font-bold"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo_pagamento_sinal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-0.5 text-[11px]">Forma de Pagamento</FormLabel>
                          <div className="relative">
                            <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PIX">PIX</SelectItem>
                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="transferencia">Transferência</SelectItem>
                                <SelectItem value="cartao-credito">Cartão Crédito</SelectItem>
                                <SelectItem value="cartao-debito">Cartão Débito</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_pagamento_sinal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-0.5 text-[11px]">Data Recebimento</FormLabel>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                            <Input
                              type="date"
                              className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-sm"
                              {...field}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Observações Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anotações sobre a viagem, paradas combinadas, instruções especiais, etc."
                      className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm p-3 min-h-[85px] transition-all"
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
              disabled={isSubmitting}
            />
            <BaseDialog.Action
              label={isEditing ? "Salvar" : "Confirmar"}
              variant="primary"
              onClick={form.handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
