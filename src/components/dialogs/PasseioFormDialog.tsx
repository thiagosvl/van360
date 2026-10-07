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
import { MoneyInput } from "@/components/forms/MoneyInput";
import { useVeiculos, useSession, useProfile, safeCloseDialog } from "@/hooks";
import { useConfiguracoes } from "@/hooks/api/useConfiguracoes";
import {
  usePasseioForm,
  type PasseioFormData,
} from "@/hooks/form/usePasseioForm";
import {
  useCriarFretamentoMutation,
  useAtualizarFretamentoMutation,
} from "@/hooks/api/useFretamentosApi";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { Ticket, MapPin, Calendar, Users, QrCode, Car, FileText } from "lucide-react";
import { toast } from "sonner";

interface PasseioFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export function PasseioFormDialog({
  isOpen,
  onClose,
  editingItem = null,
  onSuccess,
}: PasseioFormDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id });
  const veiculos = veiculosData?.list || [];
  const { configuracoes } = useConfiguracoes();

  const defaultPixKey = configuracoes?.chave_pix || "";
  const form = usePasseioForm({ editingItem, defaultPixKey });
  const criarMutation = useCriarFretamentoMutation();
  const atualizarMutation = useAtualizarFretamentoMutation();

  const isEditing = !!editingItem;

  useEffect(() => {
    if (isOpen) {
      form.reset({
        titulo: editingItem?.titulo || "",
        destino: editingItem?.destino || "",
        origem: editingItem?.origem || "",
        data_inicio: editingItem?.data_inicio ? editingItem.data_inicio.slice(0, 16) : "",
        data_fim: editingItem?.data_fim ? editingItem.data_fim.slice(0, 16) : "",
        valor_por_pessoa: editingItem?.valor_por_pessoa ? moneyMask(Number(editingItem.valor_por_pessoa)) : "",
        vagas_totais: editingItem?.vagas_totais || null,
        chave_pix: editingItem?.chave_pix || defaultPixKey || "",
        observacoes: editingItem?.observacoes || "",
        veiculos_ids: editingItem?.veiculos?.map((v) => v.veiculo_id) || [],
      });
    }
  }, [isOpen, editingItem, defaultPixKey, form]);

  const onSubmit = async (values: PasseioFormData) => {
    try {
      const valorPorPessoa = moneyToNumber(values.valor_por_pessoa);

      if (isEditing && editingItem) {
        await atualizarMutation.mutateAsync({
          id: editingItem.id,
          payload: {
            titulo: values.titulo,
            origem: values.origem,
            destino: values.destino,
            data_inicio: new Date(values.data_inicio).toISOString(),
            data_fim: values.data_fim ? new Date(values.data_fim).toISOString() : null,
            valor_por_pessoa: valorPorPessoa,
            vagas_totais: values.vagas_totais,
            chave_pix: values.chave_pix,
            observacoes: values.observacoes,
            veiculos_ids: values.veiculos_ids,
          },
        });
        toast.success("Passeio atualizado com sucesso!");
      } else {
        await criarMutation.mutateAsync({
          tipo: "passeio",
          titulo: values.titulo,
          origem: values.origem,
          destino: values.destino,
          data_inicio: new Date(values.data_inicio).toISOString(),
          data_fim: values.data_fim ? new Date(values.data_fim).toISOString() : null,
          valor_por_pessoa: valorPorPessoa,
          vagas_totais: values.vagas_totais,
          chave_pix: values.chave_pix,
          observacoes: values.observacoes,
          veiculos_ids: values.veiculos_ids,
        });
        toast.success("Passeio criado com sucesso! Link de compartilhamento gerado.");
      }

      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao salvar passeio. Verifique os dados.");
    }
  };

  const isSubmitting = criarMutation.isPending || atualizarMutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="lg">
      <BaseDialog.Header
        title={isEditing ? "Editar Passeio / Evento" : "Novo Passeio / Evento"}
        subtitle="Cinema, teatro, excursões ou passeios por adesão de vagas"
        icon={<Ticket className="h-5 w-5 text-emerald-600" />}
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
                    Título do Passeio / Evento <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                      <Input
                        placeholder="Ex: Cinema Mario Bros ou Excursão Zooparque"
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
                          placeholder="Ex: Cinemark Shopping Center Norte"
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
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Ponto de Encontro / Saída</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                        <Input
                          placeholder="Ex: Portão principal da escola"
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
                name="valor_por_pessoa"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    label="Valor por Participante"
                    required
                    labelClassName="text-slate-700 font-semibold ml-1 text-sm"
                    inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base font-bold text-slate-800 transition-all"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="vagas_totais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Vagas Disponíveis (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                        <Input
                          type="number"
                          placeholder="Ex: 18"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
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
              name="chave_pix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Chave PIX para Pagamento dos Pais</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <QrCode className="absolute left-4 top-3.5 h-5 w-5 text-emerald-600 opacity-80 z-10" />
                      <Input
                        placeholder="Ex: CPF, Telefone, E-mail ou Chave Aleatória"
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

            {veiculos.length > 0 && (
              <div className="space-y-2 pt-1">
                <FormLabel className="text-slate-700 font-semibold ml-1 text-sm flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-slate-500" />
                  Vans / Veículos Alocados para o Evento
                </FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  {veiculos.map((v) => {
                    const currentSelected = form.watch("veiculos_ids") || [];
                    const isChecked = currentSelected.includes(v.id);
                    return (
                      <label
                        key={v.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-emerald-400 shadow-2xs transition-colors select-none"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              form.setValue("veiculos_ids", [...currentSelected, v.id]);
                            } else {
                              form.setValue(
                                "veiculos_ids",
                                currentSelected.filter((id) => id !== v.id)
                              );
                            }
                          }}
                          className="h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">{v.placa}</span>
                          {v.modelo ? <span className="text-slate-500 ml-1">({v.modelo})</span> : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Instruções aos Pais ou Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções sobre lanche, autorização ou horários especiais."
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
              label={isEditing ? "Salvar Alterações" : "Criar Passeio"}
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
