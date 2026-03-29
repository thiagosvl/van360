import { CepInput } from "@/components/forms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEscola,
  useUpdateEscola,
} from "@/hooks/api/useEscolaMutations";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import { cepSchema } from "@/schemas/common";
import { Escola } from "@/types/escola";
import { safeCloseDialog } from "@/utils/dialogUtils";

import { toast } from "@/utils/notifications/toast";
import { validateEnderecoFields } from "@/utils/validators";
import { mockGenerator } from "@/utils/mocks/generator";
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
  const [isCepLoading, setIsCepLoading] = useState(false);
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
      cep: editingEscola?.cep || "",
      referencia: editingEscola?.referencia || "",
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
          cep: editingEscola.cep || "",
          referencia: editingEscola.referencia || "",
          ativo: editingEscola.ativo,
        });
        setOpenAccordionItems(["dados-escola", "endereco"]);
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
      ativo: mockData.ativo ?? true,
    });
    setOpenAccordionItems(["dados-escola", "endereco"]);
  };

  const handleSubmit = async (data: EscolaFormData) => {
    if (!profile?.id) return;

    if (
      editingEscola &&
      editingEscola.ativo &&
      data.ativo === false &&
      editingEscola.passageiros_ativos_count > 0
    ) {
      toast.error("escola.erro.desativar", {
        description: "escola.erro.desativarComPassageiros",
      });
      return;
    }

    if (editingEscola == null) {
      createEscola.mutate(
        { usuarioId: profile.id, data },
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
        { id: editingEscola.id, data },
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
    <BaseDialog open={isOpen} onOpenChange={() => !isSaving && safeCloseDialog(onClose)} lockClose={isSaving}>
      <BaseDialog.Header
        title={editingEscola ? "Editar Escola" : "Nova Escola"}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={isSaving}
        leftAction={
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
        }
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-10 pb-6"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                Dados da Escola
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium ml-1">
                        Nome da Escola <span className="text-red-500">*</span>
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

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                Endereço
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <div className="md:col-span-2">
                        <CepInput
                          field={field}
                          inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                          onLoadingChange={setIsCepLoading}
                        />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field, fieldState }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Logradouro
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            aria-invalid={!!fieldState.error}
                            disabled={isCepLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field, fieldState }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Número
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field, fieldState }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Bairro
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            aria-invalid={!!fieldState.error}
                            disabled={isCepLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field, fieldState }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Cidade
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            aria-invalid={!!fieldState.error}
                            disabled={isCepLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field, fieldState }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Estado
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                "h-12 rounded-xl bg-gray-50 border-gray-200",
                                fieldState.error && "border-red-500",
                              )}
                              aria-invalid={!!fieldState.error}
                              disabled={isCepLoading}
                            >
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto rounded-2xl">
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1 md:col-span-6">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Referência
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: próximo ao mercado"
                            {...field}
                            className="min-h-[80px] rounded-xl bg-gray-50 border-gray-200 resize-none font-medium placeholder:text-slate-300 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {allowBatchCreation && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Checkbox
                  id="keepOpen"
                  checked={keepOpen}
                  onCheckedChange={(checked) =>
                    setKeepOpen(checked as boolean)
                  }
                  className="h-5 w-5 rounded-md border-slate-300"
                />
                <label
                  htmlFor="keepOpen"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer select-none"
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
