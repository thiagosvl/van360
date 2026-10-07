import { useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PhoneInput } from "@/components/forms/PhoneInput";
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
import { Compass, MapPin, User, Calendar, Car, FileText, CreditCard } from "lucide-react";
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
        data_inicio: editingItem?.data_inicio ? editingItem.data_inicio.slice(0, 16) : "",
        data_fim: editingItem?.data_fim ? editingItem.data_fim.slice(0, 16) : "",
        contratante_nome: editingItem?.contratante_nome || "",
        contratante_telefone: editingItem?.contratante_telefone || "",
        veiculo_id: editingItem?.veiculos?.[0]?.veiculo_id || null,
        valor_total: editingItem?.valor_total ? moneyMask(Number(editingItem.valor_total)) : "",
        observacoes: editingItem?.observacoes || "",
        tem_sinal: false,
        valor_sinal: "",
        tipo_pagamento_sinal: "PIX",
        data_pagamento_sinal: new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen, editingItem, form]);

  const onSubmit = async (values: FretamentoFormData) => {
    try {
      const valorTotal = moneyToNumber(values.valor_total);
      const valorSinal = values.tem_sinal && values.valor_sinal ? moneyToNumber(values.valor_sinal) : undefined;

      if (isEditing && editingItem) {
        await atualizarMutation.mutateAsync({
          id: editingItem.id,
          payload: {
            titulo: values.titulo,
            origem: values.origem,
            destino: values.destino,
            data_inicio: new Date(values.data_inicio).toISOString(),
            data_fim: values.data_fim ? new Date(values.data_fim).toISOString() : null,
            contratante_nome: values.contratante_nome,
            contratante_telefone: values.contratante_telefone,
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
          data_inicio: new Date(values.data_inicio).toISOString(),
          data_fim: values.data_fim ? new Date(values.data_fim).toISOString() : null,
          contratante_nome: values.contratante_nome,
          contratante_telefone: values.contratante_telefone,
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
        subtitle="Viagem particular, transporte avulso ou evento fechado"
        icon={<Compass className="h-5 w-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-4 p-5 sm:p-6 overflow-y-auto">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">
                    Título / Descrição do Frete <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                      <Input
                        placeholder="Ex: Passeio Cinema"
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Local de Saída / Origem</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                        <Input
                          placeholder="Ex: Av. Paulista, 1000"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
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
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">
                      Local de Destino <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-emerald-600 opacity-80 z-10" />
                        <Input
                          placeholder="Ex: Praia Grande"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">
                      Data e Hora de Saída <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                        <Input
                          type="datetime-local"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
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
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Previsão de Retorno</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                        <Input
                          type="datetime-local"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contratante_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Nome do Contratante</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                        <Input
                          placeholder="Ex: Roberto Carlos"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
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
                name="contratante_telefone"
                render={({ field }) => (
                  <PhoneInput
                    field={field}
                    label="Telefone (WhatsApp)"
                    labelClassName="text-slate-700 font-semibold ml-1 text-sm"
                    inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Veículo Utilizado</FormLabel>
                    <div className="relative">
                      <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10 pointer-events-none" />
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left">
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

              <FormField
                control={form.control}
                name="valor_total"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    label="Valor Total do Frete"
                    required
                    labelClassName="text-slate-700 font-semibold ml-1 text-sm"
                    inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base font-bold text-slate-800 transition-all"
                  />
                )}
              />
            </div>

            {!isEditing && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <FormField
                  control={form.control}
                  name="tem_sinal"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0 cursor-pointer select-none">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-semibold text-slate-700 cursor-pointer m-0">
                        Já recebi um sinal / entrada adiantada
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {temSinal && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 animate-in fade-in-50 duration-200">
                    <FormField
                      control={form.control}
                      name="valor_sinal"
                      render={({ field }) => (
                        <MoneyInput
                          field={field}
                          label="Valor do Sinal"
                          required
                          labelClassName="text-slate-700 font-semibold ml-1 text-xs"
                          inputClassName="pl-12 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] text-sm font-bold"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo_pagamento_sinal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1 text-xs">Forma do Sinal</FormLabel>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400 opacity-60 z-10 pointer-events-none" />
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="pl-9 h-11 rounded-xl bg-white border-slate-200 text-sm">
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
                          <FormLabel className="text-slate-700 font-semibold ml-1 text-xs">Data Recebimento</FormLabel>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 opacity-60 z-10" />
                            <Input
                              type="date"
                              className="pl-9 h-11 rounded-xl bg-white border-slate-200 text-sm"
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
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Observações Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anotações sobre a viagem, paradas combinadas, instruções especiais, etc."
                      className="rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm p-3.5 min-h-[90px] transition-all"
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
              label={isEditing ? "Salvar Alterações" : "Cadastrar Fretamento"}
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
