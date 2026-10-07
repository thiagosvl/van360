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
import { moneyMask, moneyToNumber, pixMask } from "@/utils/masks";
import { Ticket, MapPin, Calendar, Users, QrCode, Car, FileText, Wand2, Sparkles } from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { mockGenerator } from "@/utils/mocks/generator";
import { TipoChavePix } from "@/types/pix";
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

  const defaultPixKey = configuracoes?.chave_pix || profile?.chave_pix || "";
  const defaultPixType = (profile?.tipo_chave_pix as TipoChavePix) || null;
  const form = usePasseioForm({ editingItem, defaultPixKey, defaultPixType });
  const criarMutation = useCriarFretamentoMutation();
  const atualizarMutation = useAtualizarFretamentoMutation();

  const isEditing = !!editingItem;
  const exibirPix = form.watch("exibir_pix");
  const tipoChave = form.watch("tipo_chave_pix");

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
        icon={<Ticket className="h-5 w-5 text-[#1a3a5c]" />}
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
                    Título do Passeio / Evento <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Input
                        placeholder="Ex: Excursão Zooparque"
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
                name="destino"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                      Local de Destino <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Ex: Shopping Center Norte"
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
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Ponto de Encontro / Saída</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Ex: Portão principal da escola"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                      Data e Hora de Saída <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          type="datetime-local"
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
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Previsão de Retorno</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          type="datetime-local"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="valor_por_pessoa"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    label="Valor por Participante"
                    required
                    labelClassName="text-slate-700 font-semibold ml-0.5 text-xs"
                    inputClassName="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm font-bold text-slate-800 transition-all"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="vagas_totais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Vagas Disponíveis (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          type="number"
                          placeholder="Ex: 18"
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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

            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
              <FormField
                control={form.control}
                name="exibir_pix"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 cursor-pointer select-none">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked && !form.getValues("chave_pix") && profile?.chave_pix) {
                            form.setValue("chave_pix", profile.chave_pix);
                            if (profile.tipo_chave_pix) {
                              form.setValue("tipo_chave_pix", profile.tipo_chave_pix as TipoChavePix);
                            }
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c]"
                      />
                    </FormControl>
                    <div className="flex-1">
                      <FormLabel className="text-xs font-semibold text-slate-700 cursor-pointer m-0">
                        Disponibilizar Chave Pix para pagamento dos pais/responsáveis?
                      </FormLabel>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        A chave será exibida com botão de copiar na página pública de confirmação.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {exibirPix && (
                <div className="space-y-3 pt-1 animate-in fade-in-50 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="tipo_chave_pix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-0.5 text-[11px]">Tipo de Chave</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              const tipo = val as TipoChavePix;
                              field.onChange(tipo);
                              const currentVal = form.getValues("chave_pix") || "";
                              if (currentVal) {
                                form.setValue("chave_pix", pixMask(currentVal, tipo));
                              } else if (profile) {
                                if (tipo === TipoChavePix.CPF && profile.cpfcnpj) {
                                  form.setValue("chave_pix", pixMask(profile.cpfcnpj, TipoChavePix.CPF));
                                } else if (tipo === TipoChavePix.CNPJ && profile.cpfcnpj) {
                                  form.setValue("chave_pix", pixMask(profile.cpfcnpj, TipoChavePix.CNPJ));
                                } else if (tipo === TipoChavePix.TELEFONE && profile.telefone) {
                                  form.setValue("chave_pix", pixMask(profile.telefone, TipoChavePix.TELEFONE));
                                } else if (tipo === TipoChavePix.EMAIL && (profile.email || user?.email)) {
                                  form.setValue("chave_pix", profile.email || user?.email || "");
                                }
                              }
                            }}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 text-sm">
                                <SelectValue placeholder="Selecione o tipo..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={TipoChavePix.CPF}>CPF</SelectItem>
                              <SelectItem value={TipoChavePix.CNPJ}>CNPJ</SelectItem>
                              <SelectItem value={TipoChavePix.EMAIL}>E-mail</SelectItem>
                              <SelectItem value={TipoChavePix.TELEFONE}>Telefone</SelectItem>
                              <SelectItem value={TipoChavePix.ALEATORIA}>Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chave_pix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-0.5 text-[11px]">Chave Pix</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <QrCode className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                              <Input
                                placeholder={
                                  tipoChave === TipoChavePix.CPF
                                    ? "000.000.000-00"
                                    : tipoChave === TipoChavePix.CNPJ
                                    ? "00.000.000/0000-00"
                                    : tipoChave === TipoChavePix.TELEFONE
                                    ? "(11) 90000-0000"
                                    : tipoChave === TipoChavePix.EMAIL
                                    ? "seuemail@exemplo.com"
                                    : "Digite a chave Pix..."
                                }
                                className="pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] text-sm font-medium"
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(pixMask(e.target.value, tipoChave));
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {profile?.chave_pix && form.watch("chave_pix") !== profile.chave_pix && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        form.setValue("chave_pix", profile.chave_pix || "");
                        if (profile.tipo_chave_pix) {
                          form.setValue("tipo_chave_pix", profile.tipo_chave_pix as TipoChavePix);
                        }
                      }}
                      className="text-xs text-slate-700 hover:text-[#1a3a5c] hover:bg-slate-100 h-8 px-2.5 rounded-lg gap-1.5 font-medium"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                      Usar Chave Pix cadastrada no perfil ({profile.chave_pix})
                    </Button>
                  )}
                </div>
              )}
            </div>

            {veiculos.length > 0 && (
              <div className="space-y-2 pt-1">
                <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-slate-400" />
                  Vans / Veículos Alocados para o Evento
                </FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                  {veiculos.map((v) => {
                    const currentSelected = form.watch("veiculos_ids") || [];
                    const isChecked = currentSelected.includes(v.id);
                    return (
                      <label
                        key={v.id}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-slate-300 shadow-2xs transition-colors select-none"
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
                          className="h-4 w-4 rounded border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c]"
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
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Instruções aos Pais ou Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções sobre lanche, autorização ou horários especiais."
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
