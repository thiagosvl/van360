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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useMotoristaFinanceiroForm, MotoristaFinanceiroFormData } from "@/hooks/form/useMotoristaFinanceiroForm";
import { TipoChavePix } from "@/types/pix";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { Loader2, Save, Trash2, Sparkles, ArrowRightLeft, Receipt } from "lucide-react";
import { isUserInBaaSWhitelist } from "@/utils/featureFlagUtils";
import React, { useEffect, useState, useRef } from "react";

export interface PixConfiguracaoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  showDeleteButton?: boolean;
}

export const PixConfiguracaoForm = React.memo(function PixConfiguracaoForm({
  onSuccess,
  onCancel,
  showCancelButton = false,
  showDeleteButton = false,
}: PixConfiguracaoFormProps) {
  const { user } = useSession();
  const { profile, refreshProfile } = useProfile(user?.id);
  const { financeiro, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();

  const isWhitelisted = isUserInBaaSWhitelist({
    email: user?.email,
    telefone: profile?.telefone,
  });

  const [isRemoving, setIsRemoving] = useState(false);

  const originalTipoRef = useRef<TipoChavePix | null>(null);
  const originalChaveRef = useRef<string>("");

  const form = useMotoristaFinanceiroForm();

  useEffect(() => {
    if (profile || financeiro) {
      const tipo = (financeiro?.tipo_chave_pix || profile?.tipo_chave_pix || null) as TipoChavePix | null;
      let chave = financeiro?.chave_pix_repasse || profile?.chave_pix || "";

      originalTipoRef.current = tipo;
      originalChaveRef.current = chave;

      if (tipo === TipoChavePix.CPF) chave = cpfMask(chave);
      else if (tipo === TipoChavePix.CNPJ) chave = cnpjMask(chave);
      else if (tipo === TipoChavePix.TELEFONE) chave = phoneMask(chave);
      else if (tipo === TipoChavePix.ALEATORIA) chave = evpMask(chave);

      form.reset({
        cobranca_automatica_ativa: !!financeiro?.cobranca_automatica_ativa,
        enviar_recibo_automatico: financeiro?.enviar_recibo_automatico ?? true,
        tipo_chave_pix: tipo,
        chave_pix: chave,
        repassar_taxa_pais_padrao: !!financeiro?.repassar_taxa_pais_padrao,
      });
    }
  }, [profile, financeiro, form]);

  const handleSubmit = async (data: MotoristaFinanceiroFormData) => {
    try {
      let chave_pix = data.chave_pix?.trim() || null;
      let tipo_chave_pix = data.tipo_chave_pix || null;

      if (!chave_pix) {
        chave_pix = null;
        tipo_chave_pix = null;
      }

      await updateFinanceiro({
        cobranca_automatica_ativa: isWhitelisted ? data.cobranca_automatica_ativa : false,
        enviar_recibo_automatico: isWhitelisted ? data.enviar_recibo_automatico : false,
        chave_pix_repasse: chave_pix,
        tipo_chave_pix: tipo_chave_pix,
        repassar_taxa_pais_padrao: isWhitelisted ? data.repassar_taxa_pais_padrao : false,
      });

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
        cobranca_automatica_ativa: false,
        chave_pix_repasse: null,
        tipo_chave_pix: null,
      });
      form.reset({
        cobranca_automatica_ativa: false,
        enviar_recibo_automatico: true,
        tipo_chave_pix: null,
        chave_pix: "",
        repassar_taxa_pais_padrao: false,
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

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const taxaFormatada = formatCurrency(financeiro?.taxa_efetiva ?? 4.0);
  const cobrancaAtivaWatch = form.watch("cobranca_automatica_ativa");
  const repassarTaxaWatch = form.watch("repassar_taxa_pais_padrao");
  const temChavePix = Boolean(financeiro?.chave_pix_repasse || profile?.chave_pix);
  const isBusy = form.formState.isSubmitting || isUpdating || isRemoving;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo_chave_pix"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Tipo de Chave
                </FormLabel>
                <Select
                  onValueChange={(val) => {
                    const selecionado = (val || null) as TipoChavePix | null;
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
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Selecione o tipo" />
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
            render={({ field }) => {
              const tipoChave = form.watch("tipo_chave_pix");
              return (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Chave Pix
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua chave Pix"
                      {...field}
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
                      className="h-12 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {isWhitelisted && (
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-4">
            <FormField
              control={form.control}
              name="cobranca_automatica_ativa"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 space-y-0">
                  <div className="space-y-1">
                    <FormLabel className="text-slate-900 font-medium flex items-center gap-1.5 cursor-pointer">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Recebimento e Baixa Automática Pix
                    </FormLabel>
                    <p className="text-xs text-slate-500">
                      Identificação instantânea de pagamentos e repasse para sua chave Pix.
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

            {cobrancaAtivaWatch && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <Banner
                  variant="info"
                  title="Transparência de Custos"
                  description={`Taxa de ${taxaFormatada} por cobrança recebida via Pix. Cobrança exclusiva na liquidação, sem tarifas de emissão, cancelamento ou taxas fixas.`}
                />

                <FormField
                  control={form.control}
                  name="repassar_taxa_pais_padrao"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3 space-y-0 pt-2">
                      <div className="space-y-1">
                        <FormLabel className="text-slate-800 text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                          <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                          Repassar taxa aos responsáveis?
                        </FormLabel>
                        <p className="text-xs text-slate-500">
                          {repassarTaxaWatch
                            ? `O responsável pagará o valor da parcela com acréscimo de ${taxaFormatada}.`
                            : `A taxa de ${taxaFormatada} será descontada do valor da parcela.`}
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

                <FormField
                  control={form.control}
                  name="enviar_recibo_automatico"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3 space-y-0 pt-2 border-t border-slate-200/60">
                      <div className="space-y-1">
                        <FormLabel className="text-slate-800 text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                          <Receipt className="w-4 h-4 text-emerald-600" />
                          Enviar recibo automático no WhatsApp?
                        </FormLabel>
                        <p className="text-xs text-slate-500">
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
            )}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showDeleteButton && temChavePix && (
              <button
                type="button"
                onClick={handleRemoverPix}
                disabled={isBusy}
                className="h-11 px-4 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
                className="h-11 px-5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center w-full sm:w-auto"
              >
                Cancelar
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="h-11 px-6 bg-[#1a3a5c] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#1a3a5c]/90 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
      </form>
    </Form>
  );
});
