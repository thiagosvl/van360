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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { TipoChavePix } from "@/types/pix";
import { pixKeySchema } from "@/schemas/pix";
import { usuarioApi } from "@/services/api/usuario.api";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Info, Loader2, Save, Percent } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormData = z.infer<typeof pixKeySchema>;

export const PagamentosTab = React.memo(function PagamentosTab() {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const [naoUsarPix, setNaoUsarPix] = useState(false);

  const originalTipoRef = React.useRef<TipoChavePix | null>(null);
  const originalChaveRef = React.useRef<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(pixKeySchema),
    defaultValues: {
      tipo_chave_pix: undefined,
      chave_pix: "",
    },
  });

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (profile) {
      const tipo = (profile.tipo_chave_pix as TipoChavePix) || null;
      let chave = profile.chave_pix || "";

      originalTipoRef.current = tipo;
      originalChaveRef.current = chave;

      setNaoUsarPix(false);

      if (tipo === TipoChavePix.CPF) chave = cpfMask(chave);
      else if (tipo === TipoChavePix.CNPJ) chave = cnpjMask(chave);
      else if (tipo === TipoChavePix.TELEFONE) chave = phoneMask(chave);
      else if (tipo === TipoChavePix.ALEATORIA) chave = evpMask(chave);

      form.reset({
        tipo_chave_pix: tipo || undefined,
        chave_pix: chave,
      });
    }
  }, [profile, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;

      let chave_pix: string | null = data.chave_pix || null;
      let tipo_chave_pix: TipoChavePix | null = data.tipo_chave_pix || null;

      // Se o checkbox de desativar estiver marcado ou se a chave estiver em branco
      if (naoUsarPix || !chave_pix || chave_pix.trim() === "") {
        chave_pix = null;
        tipo_chave_pix = null;
      }

      await usuarioApi.atualizarPixUsuario(profile.id, {
        chave_pix,
        tipo_chave_pix,
      });

      toast.success("cadastro.sucesso.perfilAtualizado");
      await refreshProfile();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error("cadastro.erro.atualizar", { description: errorMessage });
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Configuração de Chave PIX */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Pagamentos & PIX
            </h2>
            <p className="text-xs text-slate-500">
              Configure a chave PIX utilizada no recebimento das parcelas e nos lembretes de cobrança.
            </p>
          </div>
        </div>

        {!profile?.chave_pix && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100/50 text-[#1a3a5c] shrink-0 border border-blue-200/50">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              A chave PIX cadastrada será exibida nos lembretes automáticos de cobrança e na carteirinha digital enviada aos responsáveis via WhatsApp.
            </p>
          </div>
        )}

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
                      disabled={naoUsarPix}
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
                        Chave PIX
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite sua chave PIX"
                          {...field}
                          disabled={naoUsarPix}
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

            {/* Checkbox para desativar chave PIX caso o motorista ja tenha cadastrado */}
            {profile?.chave_pix && (
              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="nao-usar-pix"
                  checked={naoUsarPix}
                  onCheckedChange={(checked) => setNaoUsarPix(Boolean(checked))}
                  className="bg-white shadow-sm rounded-[4px] w-5 h-5 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] flex-shrink-0 border-slate-300"
                />
                <Label
                  htmlFor="nao-usar-pix"
                  className="text-[13px] sm:text-[14px] text-slate-600 cursor-pointer select-none leading-relaxed font-medium"
                >
                  Não utilizar chave PIX nos lembretes enviados
                </Label>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-11 px-6 bg-[#1a3a5c] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#1a3a5c]/90 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {form.formState.isSubmitting ? (
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
      </div>

      {/* Card 2: Previa Informativa (Em breve - Multa e Juros) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 mt-0.5">
              <Percent className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-bold text-[#1a3a5c]">
                Multa e Juros por Atraso
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Defina a taxa de multa percentual e os juros diários para o cálculo de parcelas atrasadas.
              </p>
              {/* Badge Em breve no Mobile (abaixo da descrição) */}
              <div className="pt-1 sm:hidden">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 inline-block">
                  Em breve
                </span>
              </div>
            </div>
          </div>

          {/* Badge Em breve no Desktop (à direita no topo) */}
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
            Em breve
          </span>
        </div>
      </div>
    </div>
  );
});
