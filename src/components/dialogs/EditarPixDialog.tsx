import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { TipoChavePix } from "@/types/pix";
import { pixKeySchemaRequired } from "@/schemas/pix";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { usuarioApi } from "@/services/api/usuario.api";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Loader2, Info } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditarPixDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormData = z.infer<typeof pixKeySchemaRequired>;

export default function EditarPixDialog({ isOpen, onClose }: EditarPixDialogProps) {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const originalTipoRef = React.useRef<TipoChavePix | null>(null);
  const originalChaveRef = React.useRef<string>("");
  const showWarningRef = React.useRef<boolean>(false);
  const initializedRef = React.useRef<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(pixKeySchemaRequired),
    defaultValues: { tipo_chave_pix: undefined as unknown as TipoChavePix, chave_pix: "" },
  });

  React.useEffect(() => {
    if (isOpen && profile) {
      if (!initializedRef.current) {
        showWarningRef.current = !profile.chave_pix;
        initializedRef.current = true;
      }

      const tipo = (profile.tipo_chave_pix as TipoChavePix) || null;
      let chave = profile.chave_pix || "";

      originalTipoRef.current = tipo;
      originalChaveRef.current = chave;

      if (tipo === TipoChavePix.CPF) chave = cpfMask(chave);
      else if (tipo === TipoChavePix.CNPJ) chave = cnpjMask(chave);
      else if (tipo === TipoChavePix.TELEFONE) chave = phoneMask(chave);
      else if (tipo === TipoChavePix.ALEATORIA) chave = evpMask(chave);

      form.reset({
        tipo_chave_pix: tipo,
        chave_pix: chave,
      });
    }

    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen, profile, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;
      const chave_pix = data.chave_pix || null;
      const tipo_chave_pix = data.tipo_chave_pix || null;

      await usuarioApi.atualizarPixUsuario(profile.id, {
        chave_pix,
        tipo_chave_pix,
      });

      toast.success("cadastro.sucesso.perfilAtualizado");

      onClose();
      refreshProfile();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error("cadastro.erro.atualizar", { description: errorMessage });
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Configurar Chave Pix" icon={<Key className="w-5 h-5" />} onClose={onClose} />
      <BaseDialog.Body>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-6 mt-1">
              {showWarningRef.current && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2 flex items-center gap-4 shadow-sm">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100/50 text-[#1a3a5c] shrink-0 border border-blue-200/50">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    A chave Pix cadastrada será utilizada nos lembretes e cobranças automáticas enviadas para os responsáveis via WhatsApp.
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="tipo_chave_pix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">Tipo de Chave</FormLabel>
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
                            const cpfCnpjLimpo = profile.cpfcnpj ? profile.cpfcnpj.replace(/\D/g, "") : "";

                            if (selecionado === TipoChavePix.CPF && cpfCnpjLimpo.length === 11) {
                              dadosCadastro = cpfMask(profile.cpfcnpj);
                            } else if (selecionado === TipoChavePix.CNPJ && cpfCnpjLimpo.length === 14) {
                              dadosCadastro = cnpjMask(profile.cpfcnpj);
                            } else if (selecionado === TipoChavePix.TELEFONE && profile.telefone) {
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
                      value={field.value || ""}
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
                      <FormLabel className="text-slate-700 font-semibold ml-1">Chave Pix</FormLabel>
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
            </form>
          </Form>
        )}
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful} />
        <BaseDialog.Action
          label="Salvar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
