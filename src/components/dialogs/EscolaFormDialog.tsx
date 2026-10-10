import { FormEnderecoFields } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { isDevEnv } from "@/utils/detectPlatform";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  useCreateEscola,
  useUpdateEscola,
} from "@/hooks/api/useEscolaMutations";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cepSchema } from "@/schemas/common";
import { Escola } from "@/types/escola";
import { Usuario } from "@/types/usuario";
import { safeCloseDialog } from "@/utils/dialogUtils";

import { toast } from "@/utils/notifications/toast";
import { validateEnderecoFields } from "@/utils/validators";
import { mockGenerator } from "@/utils/mocks/generator";
import { cepMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { escolaSchema, EscolaFormData } from "@/hooks/form/useEscolaForm";

interface EscolaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingEscola?: Escola | null;
  onSuccess: (escola: Escola, keepOpen?: boolean) => void;
  allowBatchCreation?: boolean;
  profile?: Usuario | null;
}

export default function EscolaFormDialog({
  isOpen,
  onClose,
  editingEscola = null,
  onSuccess,
  profile: profileProp,
  allowBatchCreation = false,
}: EscolaFormDialogProps) {
  const [keepOpen, setKeepOpen] = useState(false);
  const { user } = useSession();
  const { profile: profileFromHook } = useProfile(
    profileProp ? undefined : isOpen ? user?.id : undefined,
  );
  const profile = profileProp || profileFromHook;

  const createEscola = useCreateEscola();
  const updateEscola = useUpdateEscola();

  const isSaving = createEscola.isPending || updateEscola.isPending;

  const form = useForm<EscolaFormData>({
    resolver: zodResolver(escolaSchema),
    defaultValues: {
      nome: editingEscola?.nome || "",
      informarEndereco: Boolean(editingEscola?.logradouro || editingEscola?.cep),
      logradouro: editingEscola?.logradouro || "",
      numero: editingEscola?.numero || "",
      bairro: editingEscola?.bairro || "",
      cidade: editingEscola?.cidade || "",
      estado: editingEscola?.estado || "",
      cep: editingEscola?.cep ? cepMask(editingEscola.cep) : "",
      referencia: editingEscola?.referencia || "",
      complemento: editingEscola?.complemento || "",
      ativo: editingEscola?.ativo ?? true,
    },
  });

  const informarEndereco = form.watch("informarEndereco") ?? false;

  useEffect(() => {
    if (isOpen) {
      if (editingEscola) {
        const hasEndereco = Boolean(editingEscola.logradouro || editingEscola.cep);
        form.reset({
          nome: editingEscola.nome,
          informarEndereco: hasEndereco,
          logradouro: editingEscola.logradouro || "",
          numero: editingEscola.numero || "",
          bairro: editingEscola.bairro || "",
          cidade: editingEscola.cidade || "",
          estado: editingEscola.estado || "",
          cep: editingEscola.cep ? cepMask(editingEscola.cep) : "",
          referencia: editingEscola.referencia || "",
          complemento: editingEscola.complemento || "",
          ativo: editingEscola.ativo,
        });
      } else {
        if (!keepOpen) {
          form.reset({
            nome: "",
            informarEndereco: false,
            logradouro: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            referencia: "",
            complemento: "",
            ativo: true,
          });
        }
      }
    } else {
      setKeepOpen(false);
    }
  }, [isOpen, editingEscola]);

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleToggleInformarEndereco = (checked: boolean) => {
    form.setValue("informarEndereco", checked, { shouldValidate: true });
    if (!checked) {
      form.setValue("logradouro", "");
      form.setValue("numero", "");
      form.setValue("bairro", "");
      form.setValue("cidade", "");
      form.setValue("estado", "");
      form.setValue("cep", "");
      form.setValue("referencia", "");
      form.setValue("complemento", "");
      form.clearErrors([
        "logradouro",
        "numero",
        "bairro",
        "cidade",
        "estado",
        "cep",
        "referencia",
        "complemento",
      ]);
    }
  };

  const handleFillMock = () => {
    const mockData = mockGenerator.escola();
    form.reset({
      nome: mockData.nome,
      informarEndereco: true,
      logradouro: mockData.logradouro,
      numero: mockData.numero,
      bairro: mockData.bairro,
      cidade: mockData.cidade,
      estado: mockData.estado,
      cep: mockData.cep,
      referencia: mockData.referencia || "",
      complemento: mockData.complemento || "",
      ativo: mockData.ativo ?? true,
    });
  };

  const handleSubmit = async (data: EscolaFormData) => {
    if (!profile?.id) return;

    const payload = { ...data };
    if (!informarEndereco) {
      payload.logradouro = "";
      payload.numero = "";
      payload.bairro = "";
      payload.cidade = "";
      payload.estado = "";
      payload.cep = "";
      payload.referencia = "";
      payload.complemento = "";
    } else if (payload.cep) {
      payload.cep = payload.cep.replace(/\D/g, "");
    }

    if (
      editingEscola &&
      editingEscola.ativo &&
      payload.ativo === false &&
      editingEscola.passageiros_ativos_count > 0
    ) {
      toast.error("escola.erro.desativar", {
        description: "escola.erro.desativarComPassageiros",
      });
      return;
    }

    if (editingEscola == null) {
      createEscola.mutate(
        { usuarioId: profile.id, data: payload },
        {
          onSuccess: (escolaSalva) => {
            onSuccess(escolaSalva, keepOpen);

            if (keepOpen) {
              form.reset({
                nome: "",
                informarEndereco: false,
                logradouro: "",
                numero: "",
                bairro: "",
                cidade: "",
                estado: "",
                cep: "",
                referencia: "",
                complemento: "",
                ativo: true,
              });

              setTimeout(() => {
                form.setFocus("nome");
                setKeepOpen(false);
              }, 100);
            } else {
              safeCloseDialog(onClose);
            }
          },
          onError: (error: any) => {
            if (error.response?.status === 409) {
              form.setError("nome", {
                type: "manual",
                message: "escola.erro.nomeJaCadastrado",
              });
            } else {
              toast.error("escola.erro.criar", {
                description:
                  error?.response?.data?.error || "erro.generico",
              });
            }
          },
        },
      );
    } else {
      updateEscola.mutate(
        { id: editingEscola.id, data: payload },
        {
          onSuccess: (escolaSalvo) => {
            onSuccess(escolaSalvo);
            safeCloseDialog(onClose);
          },
          onError: (error: any) => {
            if (error.response?.status === 409) {
              form.setError("nome", {
                type: "manual",
                message: "escola.erro.nomeJaCadastrado",
              });
            } else {
              toast.error("escola.erro.atualizar", {
                description:
                  error?.response?.data?.error || "erro.generico",
              });
            }
          },
        },
      );
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSaving && safeCloseDialog(onClose)}
      lockClose={isSaving}
      maxWidth="2xl"
    >
      <BaseDialog.Header
        title={editingEscola ? "Editar Escola" : "Nova Escola"}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={isSaving}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#eeeeee] transition-all active:scale-95 shadow-none"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-4 pb-4"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs ml-0.5">
                      Nome da Escola <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                        <Input
                          {...field}
                          placeholder="Ex.: Santa Maria"
                          className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-[#737373] mt-1 ml-0.5">
                      Use o nome como você costuma chamar no dia a dia.
                    </p>
                    <FormMessage className="text-xs text-[#e7000b]" />
                  </FormItem>
                )}
              />
              {editingEscola && (
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5 sm:p-4">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer block">
                          Escola Ativa
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                          aria-label="Escola Ativa"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="pt-1">
              <div
                className="flex flex-row items-center justify-between rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] p-3.5 cursor-pointer select-none transition-all hover:bg-[#f0f0f0]"
                onClick={() => !isSaving && handleToggleInformarEndereco(!informarEndereco)}
              >
                <div className="space-y-0.5 pr-4">
                  <span className="text-[#0a0a0a] font-medium text-xs sm:text-sm block">
                    Informar endereço
                  </span>
                  <div className="text-xs text-[#737373] font-normal leading-relaxed">
                    É opcional o preenchimento do endereço
                  </div>
                </div>
                <Switch
                  checked={informarEndereco}
                  onCheckedChange={handleToggleInformarEndereco}
                  disabled={isSaving}
                  aria-label="Informar endereço da escola"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {informarEndereco && (
                <div className="mt-4 pt-1 space-y-4 animate-in fade-in-50 duration-200">
                  <FormEnderecoFields />
                </div>
              )}
            </div>

            {allowBatchCreation && !editingEscola && (
              <div className="flex items-center gap-3 p-3.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5]">
                <Checkbox
                  id="keepOpen"
                  checked={keepOpen}
                  onCheckedChange={(checked) =>
                    setKeepOpen(checked as boolean)
                  }
                  className="h-4 w-4 rounded-[6px] border-[#e5e5e5] data-[state=checked]:bg-[#0a0a0a] data-[state=checked]:border-[#0a0a0a]"
                />
                <label
                  htmlFor="keepOpen"
                  className="flex-1 cursor-pointer font-medium text-[#0a0a0a] m-0 text-xs sm:text-sm"
                >
                  Cadastrar outra em seguida
                </label>
              </div>
            )}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label={editingEscola ? "Atualizar" : "Salvar"}
          variant="primary"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
