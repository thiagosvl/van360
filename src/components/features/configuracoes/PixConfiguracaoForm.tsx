import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useMotoristaFinanceiroForm, MotoristaFinanceiroFormData } from "@/hooks/form/useMotoristaFinanceiroForm";
import { TipoChavePix } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { pixKeySchema } from "@/schemas/pix";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { Loader2, Save, Trash2, Sparkles, Receipt } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import React, { useEffect, useState, useRef } from "react";

export interface PixConfiguracaoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  showDeleteButton?: boolean;
  hideActions?: boolean;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
  showAutoToggle?: boolean;
  showTaxOptions?: boolean;
}

export const PixConfiguracaoForm = React.memo(function PixConfiguracaoForm({
  onSuccess,
  onCancel,
  showCancelButton = false,
  showDeleteButton = false,
  hideActions = false,
  formId,
  onLoadingChange,
  showAutoToggle = true,
  showTaxOptions = true,
}: PixConfiguracaoFormProps) {
  const { user } = useSession();
  const { profile, refreshProfile } = useProfile(user?.id);
  const { financeiro, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const [isRemoving, setIsRemoving] = useState(false);

  const originalTipoRef = useRef<TipoChavePix | null>(null);
  const originalChaveRef = useRef<string>("");

  const form = useMotoristaFinanceiroForm();

  useEffect(() => {
    if (profile || financeiro) {
      const tipo = (financeiro?.tipo_chave_pix || profile?.tipo_chave_pix || undefined) as TipoChavePix | undefined;
      let chave = financeiro?.chave_pix_repasse || profile?.chave_pix || "";

      originalTipoRef.current = tipo || null;
      originalChaveRef.current = chave;

      if (tipo === TipoChavePix.CPF) chave = cpfMask(chave);
      else if (tipo === TipoChavePix.CNPJ) chave = cnpjMask(chave);
      else if (tipo === TipoChavePix.TELEFONE) chave = phoneMask(chave);
      else if (tipo === TipoChavePix.ALEATORIA) chave = evpMask(chave);

      form.reset({
        modo_cobranca: (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO,
        enviar_recibo_automatico: financeiro?.enviar_recibo_automatico ?? true,
        tipo_chave_pix: tipo,
        chave_pix: chave,
      });
    }
  }, [profile, financeiro, form]);

  const handleSubmit = async (data: MotoristaFinanceiroFormData) => {
    try {
      const chave_pix = data.chave_pix.trim();
      const tipo_chave_pix = data.tipo_chave_pix;

      const isChaveValida = Boolean(
        tipo_chave_pix &&
        chave_pix &&
        pixKeySchema.safeParse({ tipo_chave_pix, chave_pix }).success
      );

      const ativacaoPermitida = Boolean(isChaveValida && data.modo_cobranca === ModoCobrancaEnum.AUTOMATICA);

      const updatePayload: Record<string, unknown> = {
        chave_pix_repasse: chave_pix,
        tipo_chave_pix: tipo_chave_pix,
      };

      if (showAutoToggle) {
        updatePayload.modo_cobranca = ativacaoPermitida ? ModoCobrancaEnum.AUTOMATICA : ModoCobrancaEnum.LEMBRETES;
        updatePayload.enviar_recibo_automatico = ativacaoPermitida ? data.enviar_recibo_automatico : false;
      } else if (showTaxOptions) {
        updatePayload.enviar_recibo_automatico = data.enviar_recibo_automatico;
      }

      await updateFinanceiro(updatePayload);

      toast.success("cadastro.sucesso.perfilAtualizado");
      await refreshProfile();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error("cadastro.erro.atualizar", { description: errorMessage });
    }
  };

  const handleRemoverPix = async () => {
    try {
      setIsRemoving(true);
      await updateFinanceiro({
        modo_cobranca: ModoCobrancaEnum.DESATIVADO,
        chave_pix_repasse: null,
        tipo_chave_pix: null,
      });
      form.reset({
        modo_cobranca: ModoCobrancaEnum.DESATIVADO,
        enviar_recibo_automatico: true,
        tipo_chave_pix: null,
        chave_pix: "",
      });
      toast.success("cadastro.sucesso.perfilAtualizado");
      await refreshProfile();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao remover a chave Pix.";
      toast.error("cadastro.erro.atualizar", { description: errorMessage });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleConfirmarRemoverPix = () => {
    openConfirmationDialog({
      title: "Remover chave Pix?",
      description: "Ao remover sua chave Pix, o recebimento e a baixa automática serão desativados. Deseja realmente remover a chave Pix cadastrada?",
      confirmText: "Remover Chave",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await handleRemoverPix();
        } finally {
          closeConfirmationDialog();
        }
      },
    });
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const taxaFormatada = formatCurrency(financeiro?.taxa_efetiva ?? 4.0);
  const chavePixWatch = form.watch("chave_pix");
  const tipoChaveWatch = form.watch("tipo_chave_pix");
  const isChavePixValida = Boolean(
    tipoChaveWatch &&
    chavePixWatch &&
    chavePixWatch.trim().length > 0 &&
    pixKeySchema.safeParse({ tipo_chave_pix: tipoChaveWatch, chave_pix: chavePixWatch }).success
  );

  const cobrancaAtivaWatch = Boolean(form.watch("modo_cobranca") === ModoCobrancaEnum.AUTOMATICA && isChavePixValida);
  const temChavePix = Boolean(financeiro?.chave_pix_repasse || profile?.chave_pix);
  const isBusy = form.formState.isSubmitting || isUpdating || isRemoving;

  useEffect(() => {
    onLoadingChange?.(isBusy);
  }, [isBusy, onLoadingChange]);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit, onFormError)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo_chave_pix"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                  Tipo de Chave
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    value={field.value || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        field.onChange(undefined);
                        form.setValue("chave_pix", "");
                        return;
                      }

                      const selecionado = val as TipoChavePix;
                      field.onChange(selecionado);

                      if (selecionado === originalTipoRef.current) {
                        let chaveOriginal = originalChaveRef.current;
                        if (selecionado === TipoChavePix.CPF) chaveOriginal = cpfMask(chaveOriginal);
                        else if (selecionado === TipoChavePix.CNPJ) chaveOriginal = cnpjMask(chaveOriginal);
                        else if (selecionado === TipoChavePix.TELEFONE) chaveOriginal = phoneMask(chaveOriginal);
                        else if (selecionado === TipoChavePix.ALEATORIA) chaveOriginal = evpMask(chaveOriginal);

                        form.setValue("chave_pix", chaveOriginal);
                      } else {
                        let dadosCadastro = "";
                        if (profile) {
                          const cpfCnpjLimpo = profile.cpfcnpj
                            ? profile.cpfcnpj.replace(/\D/g, "")
                            : "";

                          if (selecionado === TipoChavePix.CPF && cpfCnpjLimpo.length === 11) {
                            dadosCadastro = cpfMask(profile.cpfcnpj);
                          } else if (
                            selecionado === TipoChavePix.CNPJ &&
                            cpfCnpjLimpo.length === 14
                          ) {
                            dadosCadastro = cnpjMask(profile.cpfcnpj);
                          } else if (
                            selecionado === TipoChavePix.TELEFONE &&
                            profile.telefone
                          ) {
                            dadosCadastro = phoneMask(profile.telefone);
                          } else if (selecionado === TipoChavePix.EMAIL && profile.email) {
                            dadosCadastro = profile.email;
                          } else if (selecionado === TipoChavePix.EMAIL && user?.email) {
                            dadosCadastro = user.email;
                          }
                        }
                        form.setValue("chave_pix", dadosCadastro);
                      }
                    }}
                  >
                    <option value="" disabled>Selecionar...</option>
                    <option value={TipoChavePix.CPF}>CPF</option>
                    <option value={TipoChavePix.CNPJ}>CNPJ</option>
                    <option value={TipoChavePix.EMAIL}>E-mail</option>
                    <option value={TipoChavePix.TELEFONE}>Telefone</option>
                    <option value={TipoChavePix.ALEATORIA}>Chave Aleatória</option>
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chave_pix"
            render={({ field }) => {
              const tipoChave = form.watch("tipo_chave_pix");
              return (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                    Chave Pix
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tipoChave ? "Digite sua chave Pix" : "Selecione o tipo de chave primeiro"}
                      {...field}
                      disabled={!tipoChave || isBusy}
                      value={field.value || ""}
                      type={tipoChave === TipoChavePix.TELEFONE ? "tel" : "text"}
                      inputMode={
                        tipoChave === TipoChavePix.CPF ||
                          tipoChave === TipoChavePix.CNPJ ||
                          tipoChave === TipoChavePix.TELEFONE
                          ? "numeric"
                          : "text"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        let maskedVal = val;
                        if (tipoChave === TipoChavePix.CPF) {
                          maskedVal = cpfMask(val);
                        } else if (tipoChave === TipoChavePix.CNPJ) {
                          maskedVal = cnpjMask(val);
                        } else if (tipoChave === TipoChavePix.TELEFONE) {
                          maskedVal = phoneMask(val);
                        } else if (tipoChave === TipoChavePix.ALEATORIA) {
                          maskedVal = evpMask(val);
                        }
                        field.onChange(maskedVal);
                      }}
                      className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {showAutoToggle && (
          <div className="rounded-[18px] border border-[#e5e5e5] p-4 sm:p-5 bg-[#fafafa] space-y-4">
            <FormField
              control={form.control}
              name="modo_cobranca"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium text-[#0a0a0a] flex items-center gap-2 cursor-pointer">
                        <Sparkles className="w-4 h-4 text-[#0a0a0a]" />
                        Recebimento e Baixa Automática Pix
                      </FormLabel>
                      <p className="text-xs text-[#737373] leading-relaxed">
                        Identificação instantânea de pagamentos e repasse para sua chave Pix.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value === ModoCobrancaEnum.AUTOMATICA && isChavePixValida)}
                        onCheckedChange={(checked) => {
                          if (isChavePixValida) {
                            field.onChange(checked ? ModoCobrancaEnum.AUTOMATICA : ModoCobrancaEnum.LEMBRETES);
                          }
                        }}
                        disabled={!isChavePixValida || isBusy}
                      />
                    </FormControl>
                  </div>

                  {!isChavePixValida && (
                    <Banner
                      variant="warning"
                      description="Para habilitar o recebimento e a baixa automática das parcelas, cadastre uma chave Pix válida acima."
                    />
                  )}
                </FormItem>
              )}
            />

            {cobrancaAtivaWatch && (
              <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
                <Banner
                  variant="info"
                  title="Transparência de Custos"
                  description={`Taxa de ${taxaFormatada} por cobrança recebida via Pix. Cobrança exclusiva na liquidação, sem tarifas de emissão, cancelamento ou taxas fixas.`}
                />

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="enviar_recibo_automatico"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4 pt-1">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs sm:text-sm font-medium text-[#0a0a0a] flex items-center gap-2 cursor-pointer">
                            <Receipt className="w-4 h-4 text-[#737373]" />
                            Enviar recibo automático no WhatsApp?
                          </FormLabel>
                          <p className="text-xs text-[#737373] leading-relaxed">
                            Envia a confirmação oficial e o comprovante para o responsável assim que o Pix for confirmado.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {!showAutoToggle && showTaxOptions && (
          <div className="rounded-[18px] border border-[#e5e5e5] p-4 sm:p-5 bg-[#fafafa] space-y-4">
            <Banner
              variant="info"
              title="Transparência de Custos"
              description={`Taxa de ${taxaFormatada} por cobrança recebida via Pix. Cobrança exclusiva na liquidação, sem tarifas de emissão, cancelamento ou taxas fixas.`}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="enviar_recibo_automatico"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 pt-1">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs sm:text-sm font-medium text-[#0a0a0a] flex items-center gap-2 cursor-pointer">
                        <Receipt className="w-4 h-4 text-[#737373]" />
                        Enviar recibo automático no WhatsApp?
                      </FormLabel>
                      <p className="text-xs text-[#737373] leading-relaxed">
                        Envia a confirmação oficial e o comprovante para o responsável assim que o Pix for confirmado.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {!hideActions && (
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e5e5e5]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showDeleteButton && temChavePix && (
                <button
                  type="button"
                  onClick={handleConfirmarRemoverPix}
                  disabled={isBusy}
                  className="h-11 px-4 text-[#e7000b] hover:bg-[#fafafa] text-xs sm:text-sm font-medium rounded-[18px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Remover Chave Pix
                </button>
              )}

              {showCancelButton && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isBusy}
                  className="h-11 px-5 border border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] text-xs sm:text-sm font-medium rounded-[18px] transition-all flex items-center justify-center w-full sm:w-auto"
                >
                  Cancelar
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="h-11 px-6 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-[18px] hover:bg-primary-hover transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </Form>
  );
});
