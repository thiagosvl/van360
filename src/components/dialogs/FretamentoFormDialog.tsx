import { useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
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
        subtitle="Viagens e fretes fechados"
        icon={<Compass className="h-5 w-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-white transition-all"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-4 p-5 sm:p-6 overflow-y-auto bg-white">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Título da Viagem <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        placeholder="Ex: Casamento em Campinas"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Origem / Ponto de Saída</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: Terminal Barra Funda"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm"
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
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Destino <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: Atibaia"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Data da Viagem <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          type="date"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm"
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
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Van Alocada</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        icon={<Car className="h-4 w-4 text-[#737373]" />}
                      >
                        <option value="">Selecionar</option>
                        {veiculos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.placa} {v.modelo ? `- ${v.modelo}` : ""}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
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
                  label="Valor Total"
                  required
                  labelClassName="text-[#0a0a0a] font-medium text-xs"
                  inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                />
              )}
            />

            {!isEditing && (
              <div className="p-3.5 sm:p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] space-y-3">
                <FormField
                  control={form.control}
                  name="tem_sinal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-xs sm:text-sm font-medium text-[#0a0a0a] cursor-pointer m-0 block">
                          Recebi sinal de entrada
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                          aria-label="Recebi sinal de entrada"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {temSinal && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#e5e5e5]">
                    <FormField
                      control={form.control}
                      name="valor_sinal"
                      render={({ field }) => (
                        <MoneyInput
                          field={field}
                          label="Valor do Sinal"
                          required
                          labelClassName="text-[#0a0a0a] font-medium text-[11px]"
                          inputClassName="pl-10 h-10 rounded-[18px] bg-white border-[#e5e5e5] focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo_pagamento_sinal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0a0a0a] font-medium text-[11px]">Pagamento</FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || ""}
                              onChange={field.onChange}
                              icon={<CreditCard className="h-4 w-4 text-[#737373]" />}
                              className="bg-white"
                            >
                              <option value="PIX">PIX</option>
                              <option value="dinheiro">Dinheiro</option>
                              <option value="transferencia">Transferência</option>
                              <option value="cartao-credito">Cartão Crédito</option>
                              <option value="cartao-debito">Cartão Débito</option>
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_pagamento_sinal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0a0a0a] font-medium text-[11px]">Data</FormLabel>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                            <Input
                              type="date"
                              className="pl-10 h-10 rounded-[18px] bg-white border-[#e5e5e5] text-sm"
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
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções especiais, paradas combinadas, etc."
                      className="rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm p-3 min-h-[70px]"
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
              label={isEditing ? "Salvar" : "Cadastrar"}
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
