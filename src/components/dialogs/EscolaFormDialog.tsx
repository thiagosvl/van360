import { FormEnderecoFields } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  useCreateEscola,
  useUpdateEscola,
} from "@/hooks/api/useEscolaMutations";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cepSchema } from "@/schemas/common";
import { Escola } from "@/types/escola";
import { safeCloseDialog } from "@/utils/dialogUtils";

import { toast } from "@/utils/notifications/toast";
import { validateEnderecoFields } from "@/utils/validators";
import { mockGenerator } from "@/utils/mocks/generator";
import { cepMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const escolaSchema = z
  .object({
    nome: z.string().min(1, "Campo obrigatório"),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: cepSchema.or(z.literal("")).optional(),
    referencia: z.string().optional(),
    complemento: z.string().optional(),
    ativo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const validation = validateEnderecoFields(
      data.cep || "",
      data.logradouro,
      data.numero,
    );

    if (validation.errors.cep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.cep,
        path: ["cep"],
      });
    }
    if (validation.errors.logradouro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.logradouro,
        path: ["logradouro"],
      });
    }
    if (validation.errors.numero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.numero,
        path: ["numero"],
      });
    }
  });

type EscolaFormData = z.infer<typeof escolaSchema>;

interface EscolaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingEscola?: Escola | null;
  onSuccess: (escola: Escola, keepOpen?: boolean) => void;
  allowBatchCreation?: boolean;
  profile?: any;
}

export default function EscolaFormDialog({
  isOpen,
  onClose,
  editingEscola = null,
  onSuccess,
  profile: profileProp,
  allowBatchCreation = false,
}: EscolaFormDialogProps) {
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-escola",
  ]);
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

  const cep = form.watch("cep");
  const logradouro = form.watch("logradouro");
  const numero = form.watch("numero");

  useEffect(() => {
    if (isOpen) {
      form.trigger(["cep", "logradouro", "numero"]);
    }
  }, [cep, logradouro, numero, isOpen, form]);

  useEffect(() => {
    if (isOpen) {
      if (editingEscola) {
        form.reset({
          nome: editingEscola.nome,
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
        if (editingEscola.logradouro || editingEscola.cep) {
          setOpenAccordionItems(["dados-escola", "endereco"]);
        } else {
          setOpenAccordionItems(["dados-escola"]);
        }
      } else {
        if (!keepOpen) {
          form.reset({
            nome: "",
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
          setOpenAccordionItems(["dados-escola"]);
        }
      }
    } else {
      setKeepOpen(false);
    }
  }, [isOpen, editingEscola, form]);

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
    setOpenAccordionItems(["dados-escola", "endereco"]);
  };

  const handleFillMock = () => {
    const mockData = mockGenerator.escola();
    form.reset({
      nome: mockData.nome,
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
    setOpenAccordionItems(["dados-escola", "endereco"]);
  };

  const handleSubmit = async (data: EscolaFormData) => {
    if (!profile?.id) return;

    const payload = { ...data };
    if (payload.cep) {
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
    <BaseDialog open={isOpen} onOpenChange={() => !isSaving && safeCloseDialog(onClose)} lockClose={isSaving} maxWidth="xl">
      <BaseDialog.Header
        title={editingEscola ? "Editar Escola" : "Nova Escola"}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={isSaving}
        leftAction={import.meta.env.DEV && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-10 pb-6"
          >
            <div className="space-y-6">
              <div className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Nome da Escola <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            placeholder="Ex: Escola Municipal..."
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editingEscola && (
                  <div className="pt-2">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                          <Checkbox
                            id="ativo"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5"
                          />
                          <FormLabel
                            htmlFor="ativo"
                            className="flex-1 cursor-pointer font-medium text-slate-700 m-0"
                          >
                            Escola Ativa
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <Accordion
              type="multiple"
              value={openAccordionItems}
              onValueChange={setOpenAccordionItems}
              className="w-full"
            >
              <AccordionItem value="endereco" className="border-none">
                <AccordionTrigger className="hover:no-underline px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 hover:bg-slate-100/50 hover:border-slate-300 transition-all data-[state=open]:border-solid data-[state=open]:border-slate-100 data-[state=open]:bg-white data-[state=open]:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <span className="font-semibold text-slate-700 text-[15px] leading-tight">
                        Adicionar Endereço
                      </span>
                      <span className="font-medium text-slate-400 text-[12px] mt-0.5">
                        Opcional
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-1 pt-6 pb-2">
                  <FormEnderecoFields />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {allowBatchCreation && !editingEscola && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Checkbox
                  id="keepOpen"
                  checked={keepOpen}
                  onCheckedChange={(checked) =>
                    setKeepOpen(checked as boolean)
                  }
                  className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="keepOpen"
                  className="flex-1 cursor-pointer font-medium text-slate-700 m-0"
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
