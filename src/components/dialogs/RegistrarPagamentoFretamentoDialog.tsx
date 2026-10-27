import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
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
import { Banner } from "@/components/ui/Banner";
import { safeCloseDialog } from "@/hooks";
import {
  useRegistrarPagamentoFretamentoForm,
  type RegistrarPagamentoFretamentoFormData,
} from "@/hooks/form/useRegistrarPagamentoFretamentoForm";
import {
  useFretamentoDetalhesQuery,
  useRegistrarPagamentoFretamentoMutation,
  useAtualizarPagamentoFretamentoMutation,
  useDeletarPagamentoFretamentoMutation,
} from "@/hooks/api/useFretamentosApi";
import type { FretamentoDetalhes, FretamentoPagamento } from "@/services/api/fretamento.api";
import { formatCurrency, toLocalDateString } from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { DollarSign, Calendar, FileText, CreditCard, Wand2, X, PlusCircle } from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { Button } from "@/components/ui/button";
import { FretamentoPagamentosList } from "./fretamento/FretamentoPagamentosList";
import { toast } from "sonner";

interface RegistrarPagamentoFretamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fretamento: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export function RegistrarPagamentoFretamentoDialog({
  isOpen,
  onClose,
  fretamento,
  onSuccess,
}: RegistrarPagamentoFretamentoDialogProps) {
  const [pagamentoEmEdicao, setPagamentoEmEdicao] = useState<FretamentoPagamento | null>(null);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const { data: fretamentoReal } = useFretamentoDetalhesQuery(fretamento?.id || "", isOpen && !!fretamento?.id);
  const itemAtual = fretamentoReal || fretamento;

  const registrarMutation = useRegistrarPagamentoFretamentoMutation();
  const atualizarMutation = useAtualizarPagamentoFretamentoMutation();
  const deletarMutation = useDeletarPagamentoFretamentoMutation();

  const saldoRestante = itemAtual ? Number(itemAtual.saldo_restante || 0) : 0;
  const pagamentos = itemAtual?.pagamentos || [];

  const form = useRegistrarPagamentoFretamentoForm({ saldoRestante });

  useEffect(() => {
    if (isOpen && itemAtual && !pagamentoEmEdicao) {
      form.reset({
        valor: saldoRestante > 0 ? moneyMask(saldoRestante) : "",
        tipo_pagamento: "PIX",
        data_pagamento: toLocalDateString(new Date()),
        descricao: "",
      });
    }
  }, [isOpen, itemAtual, saldoRestante, pagamentoEmEdicao, form]);

  useEffect(() => {
    if (!isOpen) {
      setPagamentoEmEdicao(null);
      setDeletandoId(null);
    }
  }, [isOpen]);

  if (!itemAtual) return null;

  const handleSelecionarEdicao = (pagamento: FretamentoPagamento) => {
    setPagamentoEmEdicao(pagamento);
    form.reset({
      valor: moneyMask(Number(pagamento.valor || 0)),
      tipo_pagamento: pagamento.tipo_pagamento,
      data_pagamento: pagamento.data_pagamento ? pagamento.data_pagamento.split("T")[0] : toLocalDateString(new Date()),
      descricao: pagamento.descricao || "",
    });
  };

  const handleCancelarEdicao = () => {
    setPagamentoEmEdicao(null);
    form.reset({
      valor: saldoRestante > 0 ? moneyMask(saldoRestante) : "",
      tipo_pagamento: "PIX",
      data_pagamento: toLocalDateString(new Date()),
      descricao: "",
    });
  };

  const handleExcluirPagamento = async (pagamento: FretamentoPagamento) => {
    try {
      setDeletandoId(pagamento.id);
      await deletarMutation.mutateAsync({
        fretamentoId: itemAtual.id,
        pagamentoId: pagamento.id,
      });

      if (pagamentoEmEdicao?.id === pagamento.id) {
        handleCancelarEdicao();
      }

      toast.success("Pagamento excluído com sucesso!");
      onSuccess?.();
    } catch {
      toast.error("Erro ao excluir pagamento. Tente novamente.");
    } finally {
      setDeletandoId(null);
    }
  };

  const handleFillMock = () => {
    const valorMock = saldoRestante > 0 ? (saldoRestante > 200 ? 200 : saldoRestante).toFixed(2) : "150.00";
    form.setValue("valor", moneyMask(Number(valorMock)), { shouldValidate: true });
    form.setValue("tipo_pagamento", "PIX", { shouldValidate: true });
    form.setValue("data_pagamento", toLocalDateString(new Date()), { shouldValidate: true });
    form.setValue("descricao", "Pagamento de parcela via PIX", { shouldValidate: true });
  };

  const onSubmit = async (values: RegistrarPagamentoFretamentoFormData) => {
    try {
      const valorNumerico = moneyToNumber(values.valor);

      if (pagamentoEmEdicao) {
        await atualizarMutation.mutateAsync({
          fretamentoId: itemAtual.id,
          pagamentoId: pagamentoEmEdicao.id,
          payload: {
            valor: valorNumerico,
            tipo_pagamento: values.tipo_pagamento,
            data_pagamento: values.data_pagamento,
            descricao: values.descricao,
          },
        });
        toast.success("Pagamento atualizado com sucesso!");
        setPagamentoEmEdicao(null);
      } else {
        await registrarMutation.mutateAsync({
          fretamentoId: itemAtual.id,
          payload: {
            valor: valorNumerico,
            tipo_pagamento: values.tipo_pagamento,
            data_pagamento: values.data_pagamento,
            descricao: values.descricao,
          },
        });
        toast.success("Pagamento registrado com sucesso!");
      }

      onSuccess?.();
      if (!pagamentoEmEdicao) {
        safeCloseDialog(onClose);
      }
    } catch {
      toast.error("Erro ao salvar pagamento. Tente novamente.");
    }
  };

  const isSubmitting = registrarMutation.isPending || atualizarMutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="lg">
      <BaseDialog.Header
        title="Gerenciar Pagamentos"
        subtitle={`Viagem: ${itemAtual.titulo}`}
        icon={<DollarSign className="h-5 w-5 text-[#0a0a0a]" />}
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

      <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Total do Frete</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">
            {formatCurrency(Number(itemAtual.valor_total || 0))}
          </span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Total Recebido</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">
            {formatCurrency(Number(itemAtual.total_pago || 0))}
          </span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Saldo Restante</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">
            {formatCurrency(saldoRestante)}
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-5 p-5 sm:p-6 overflow-y-auto bg-white">
            <FretamentoPagamentosList
              pagamentos={pagamentos}
              pagamentoEmEdicaoId={pagamentoEmEdicao?.id}
              onEditar={handleSelecionarEdicao}
              onExcluir={handleExcluirPagamento}
              isDeletingId={deletandoId}
            />

            {saldoRestante <= 0 && !pagamentoEmEdicao && (
              <Banner variant="success">
                Viagem quitada integralmente. Você pode editar ou excluir lançamentos acima para corrigir valores.
              </Banner>
            )}

            <div className="pt-3 border-t border-[#e5e5e5]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-[#0a0a0a] flex items-center gap-1.5">
                  {pagamentoEmEdicao ? (
                    <>Editar Pagamento Selecionado</>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 text-[#737373]" />
                      Adicionar Novo Recebimento
                    </>
                  )}
                </span>
                {pagamentoEmEdicao && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelarEdicao}
                    className="h-7 px-2.5 rounded-[18px] text-xs text-[#737373] hover:text-[#0a0a0a] gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar Edição
                  </Button>
                )}
              </div>

              <div className="space-y-3.5">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <MoneyInput
                      field={field}
                      label="Valor do Recebimento"
                      required
                      labelClassName="text-[#0a0a0a] font-medium text-xs"
                      inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                    />
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="tipo_pagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Forma de Pagamento <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value || ""}
                            onChange={field.onChange}
                            icon={<CreditCard className="h-4 w-4 text-[#737373]" />}
                          >
                            <option value="PIX">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao-credito">Cartão de Crédito</option>
                            <option value="cartao-debito">Cartão de Débito</option>
                            <option value="transferencia">Transferência Bancária</option>
                            <option value="boleto">Boleto</option>
                          </NativeSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_pagamento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Data do Recebimento <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
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
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                        Descrição / Observação
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                          <Input
                            placeholder="Ex: Sinal ou quitação na volta"
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
              </div>
            </div>
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Fechar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
              disabled={isSubmitting}
            />
            <BaseDialog.Action
              label={pagamentoEmEdicao ? "Salvar Alterações" : "Salvar Pagamento"}
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
