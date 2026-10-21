import { useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { VeiculoMultiSelect } from "@/components/ui/VeiculoMultiSelect";
import { useVeiculos, useSession, useProfile, safeCloseDialog } from "@/hooks";
import { useConfiguracoes } from "@/hooks/api/useConfiguracoes";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
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
import { Ticket, MapPin, Calendar, Users, Car, FileText, Wand2 } from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { mockGenerator } from "@/utils/mocks/generator";
import { TipoChavePix } from "@/types/pix";
import { PixKeyFields } from "@/components/features/pix/PixKeyFields";
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
  const { financeiro } = useMotoristaFinanceiroApi();

  const defaultPixKey = financeiro?.chave_pix_repasse || configuracoes?.chave_pix || "";
  const defaultPixType = (financeiro?.tipo_chave_pix as TipoChavePix) || (configuracoes?.tipo_chave_pix as TipoChavePix) || null;
  const form = usePasseioForm({ editingItem, defaultPixKey, defaultPixType });
  const criarMutation = useCriarFretamentoMutation();
  const atualizarMutation = useAtualizarFretamentoMutation();

  const isEditing = !!editingItem;
  const exibirPix = form.watch("exibir_pix");

  useEffect(() => {
    if (isOpen) {
      const hasPix = Boolean(editingItem?.chave_pix || defaultPixKey);
      form.reset({
        titulo: editingItem?.titulo || "",
        destino: editingItem?.destino || "",
        origem: editingItem?.origem || "",
        data_inicio: editingItem?.data_inicio ? editingItem.data_inicio.slice(0, 16) : "",
        data_fim: editingItem?.data_fim ? editingItem.data_fim.slice(0, 16) : "",
        valor_por_pessoa: editingItem?.valor_por_pessoa ? moneyMask(Number(editingItem.valor_por_pessoa)) : "",
        vagas_totais: editingItem?.vagas_totais || null,
        exibir_pix: hasPix,
        tipo_chave_pix: defaultPixType || TipoChavePix.TELEFONE,
        chave_pix: editingItem?.chave_pix || defaultPixKey || "",
        observacoes: editingItem?.observacoes || "",
        veiculos_ids: editingItem?.veiculos?.map((v) => v.veiculo_id) || [],
      });
    }
  }, [isOpen, editingItem, defaultPixKey, defaultPixType, form]);

  const handleFillMock = () => {
    const mock = mockGenerator.passeio();
    form.setValue("titulo", mock.titulo, { shouldValidate: true });
    form.setValue("destino", mock.destino, { shouldValidate: true });
    form.setValue("origem", "Saída da Escola / Portão Principal", { shouldValidate: true });
    form.setValue("data_inicio", `${mock.data_viagem}T07:30`, { shouldValidate: true });
    form.setValue("valor_por_pessoa", moneyMask(Number(mock.valor_por_pessoa)), { shouldValidate: true });
    form.setValue("vagas_totais", mock.vagas_totais, { shouldValidate: true });
    form.setValue("exibir_pix", true, { shouldValidate: true });
    form.setValue("tipo_chave_pix", TipoChavePix.TELEFONE, { shouldValidate: true });
    form.setValue("chave_pix", mock.chave_pix, { shouldValidate: true });
    form.setValue("observacoes", mock.observacoes, { shouldValidate: true });
    if (veiculos.length > 0) {
      form.setValue("veiculos_ids", [veiculos[0].id], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: PasseioFormData) => {
    try {
      const valorPorPessoa = moneyToNumber(values.valor_por_pessoa);
      const chavePixFinal = values.exibir_pix ? (values.chave_pix || null) : null;

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
            chave_pix: chavePixFinal,
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
          chave_pix: chavePixFinal,
          observacoes: values.observacoes,
          veiculos_ids: values.veiculos_ids,
        });
        toast.success("Passeio criado com sucesso! Link gerado.");
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
        title={isEditing ? "Editar Passeio" : "Novo Passeio"}
        subtitle="Excursões e passeios por vagas"
        icon={<Ticket className="h-5 w-5 text-[#0a0a0a]" />}
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
                    Título do Passeio <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        placeholder="Ex: Excursão Zooparque"
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
                          placeholder="Ex: Shopping Center Norte"
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
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Ponto de Encontro</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: Portão da escola"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Saída <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          type="datetime-local"
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
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Previsão de Retorno</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          type="datetime-local"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="valor_por_pessoa"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    label="Valor por Pessoa"
                    required
                    labelClassName="text-[#0a0a0a] font-medium text-xs"
                    inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="vagas_totais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Vagas Totais (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          type="number"
                          placeholder="Ex: 18"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm"
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

            <div className="p-3.5 sm:p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] space-y-3">
              <FormField
                control={form.control}
                name="exibir_pix"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none">
                    <div className="space-y-0.5 pr-4">
                      <FormLabel className="text-xs sm:text-sm font-medium text-[#0a0a0a] cursor-pointer m-0 block">
                        Disponibilizar Chave PIX para os pais
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked && !form.getValues("chave_pix") && financeiro?.chave_pix_repasse) {
                            form.setValue("chave_pix", financeiro.chave_pix_repasse);
                            if (financeiro.tipo_chave_pix) {
                              form.setValue("tipo_chave_pix", financeiro.tipo_chave_pix as TipoChavePix);
                            }
                          }
                        }}
                        className="data-[state=checked]:bg-primary"
                        aria-label="Disponibilizar Chave PIX para os pais"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {exibirPix && (
                <div className="pt-2.5 border-t border-[#e5e5e5]">
                  <PixKeyFields form={form} variant="card" gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-2.5" />
                </div>
              )}
            </div>

            {veiculos.length > 0 && (
              <FormField
                control={form.control}
                name="veiculos_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-[#737373]" />
                      Vans Alocadas (Opcional)
                    </FormLabel>
                    <FormControl>
                      <VeiculoMultiSelect
                        veiculos={veiculos}
                        selectedIds={field.value || []}
                        onChange={field.onChange}
                        placeholder="Selecionar vans (opcional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">Instruções aos Pais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações sobre lanche, autorização, etc."
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
              label={isEditing ? "Salvar" : "Salvar"}
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
