import { CepInput } from "@/components/forms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateEscola, useUpdateEscola } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Escola } from "@/types/escola";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const escolaSchema = z.object({
  nome: z.string().min(1, "Campo obrigatório"),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{5}-\d{3}$/.test(val), {
      message: "Formato inválido (00000-000)",
    }),
  referencia: z.string().optional(),
  ativo: z.boolean().optional(),
});
type EscolaFormData = z.infer<typeof escolaSchema>;

interface EscolaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingEscola?: Escola | null;
  onSuccess: (escola: Escola) => void;
  profile?: any; // Passar profile como prop para evitar chamadas duplicadas de useProfile
}

export default function EscolaFormDialog({
  isOpen,
  onClose,
  editingEscola = null,
  onSuccess,
  profile: profileProp,
}: EscolaFormDialogProps) {
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-escola",
  ]);
  const { user } = useSession();
  // Só chamar useProfile se não receber profile como prop e o dialog estiver aberto
  const { profile: profileFromHook } = useProfile(profileProp ? undefined : (isOpen ? user?.id : undefined));
  const profile = profileProp || profileFromHook;

  const createEscola = useCreateEscola();
  const updateEscola = useUpdateEscola();

  const loading = createEscola.isPending || updateEscola.isPending;


  useEffect(() => {
    if (editingEscola) {
      setOpenAccordionItems(["dados-escola", "endereco"]);
    }
  }, [editingEscola]);

  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen]);

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

  const onFormError = (errors: any) => {
    toast.error("validacao.formularioComErros");
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

    // Preparar rollback do QuickStart apenas para criações (não para edições)
    const shouldUpdateQuickStart = editingEscola == null;
    const quickStartRollback = shouldUpdateQuickStart
      ? updateQuickStartStepWithRollback("step_escolas")
      : null;

    if (editingEscola == null) {
      createEscola.mutate(
        { usuarioId: profile.id, data },
        {
          onSuccess: (escolaSalva) => {
            onSuccess(escolaSalva);
            onClose();
          },
          onError: (error: any) => {
            // Reverter QuickStart em caso de erro
            if (quickStartRollback) {
              quickStartRollback.restore();
            }

            if (error?.response?.data?.error?.includes("duplicate key value")) {
              toast.error("escola.erro.criar", {
                description: "Já existe uma escola cadastrada com esse nome.",
              });
            }
          },
        }
      );
    } else {
      updateEscola.mutate(
        { id: editingEscola.id, data },
        {
          onSuccess: (escolaSalva) => {
            onSuccess(escolaSalva);
            onClose();
          },
        }
      );
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-2xl max-h-[95vh] flex flex-col overflow-hidden bg-blue-600 rounded-3xl border-0 shadow-2xl p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton
        >
          <div className="bg-blue-600 p-6 text-center relative shrink-0">
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>
            
            <div className="mx-auto bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              {editingEscola ? "Editar Escola" : "Nova Escola"}
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm mt-1">
              Preencha os dados da escola abaixo
            </DialogDescription>
          </div>

          <div className="p-6 pt-2 bg-white flex-1 overflow-y-auto">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-6"
              >
                <Accordion
                  type="multiple"
                  value={openAccordionItems}
                  onValueChange={setOpenAccordionItems}
                  className="w-full"
                >
                  <AccordionItem value="dados-escola" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Dados da Escola
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium ml-1">
                              Nome da Escola{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
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
                                  className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <FormLabel 
                                  htmlFor="ativo"
                                  className="flex-1 cursor-pointer font-medium text-gray-700 m-0 mt-0"
                                >
                                  Escola Ativa
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="endereco" className="mt-2 border-b-0">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Endereço
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <div className="md:col-span-2">
                              <CepInput 
                                field={field} 
                                inputClassName="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                              />
                            </div>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="logradouro"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-4">
                              <FormLabel className="text-gray-700 font-medium ml-1">Logradouro</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                  aria-invalid={!!fieldState.error}
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
                              <FormLabel className="text-gray-700 font-medium ml-1">Número</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                              <FormLabel className="text-gray-700 font-medium ml-1">Bairro</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                  aria-invalid={!!fieldState.error}
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
                              <FormLabel className="text-gray-700 font-medium ml-1">Cidade</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                  aria-invalid={!!fieldState.error}
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
                              <FormLabel className="text-gray-700 font-medium ml-1">Estado</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger 
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  >
                                    <SelectValue placeholder="UF" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  <SelectItem value="AC">Acre</SelectItem>
                                  <SelectItem value="AL">Alagoas</SelectItem>
                                  <SelectItem value="AP">Amapá</SelectItem>
                                  <SelectItem value="AM">Amazonas</SelectItem>
                                  <SelectItem value="BA">Bahia</SelectItem>
                                  <SelectItem value="CE">Ceará</SelectItem>
                                  <SelectItem value="DF">
                                    Distrito Federal
                                  </SelectItem>
                                  <SelectItem value="ES">
                                    Espírito Santo
                                  </SelectItem>
                                  <SelectItem value="GO">Goiás</SelectItem>
                                  <SelectItem value="MA">Maranhão</SelectItem>
                                  <SelectItem value="MT">Mato Grosso</SelectItem>
                                  <SelectItem value="MS">
                                    Mato Grosso do Sul
                                  </SelectItem>
                                  <SelectItem value="MG">Minas Gerais</SelectItem>
                                  <SelectItem value="PA">Pará</SelectItem>
                                  <SelectItem value="PB">Paraíba</SelectItem>
                                  <SelectItem value="PR">Paraná</SelectItem>
                                  <SelectItem value="PE">Pernambuco</SelectItem>
                                  <SelectItem value="PI">Piauí</SelectItem>
                                  <SelectItem value="RJ">
                                    Rio de Janeiro
                                  </SelectItem>
                                  <SelectItem value="RN">
                                    Rio Grande do Norte
                                  </SelectItem>
                                  <SelectItem value="RS">
                                    Rio Grande do Sul
                                  </SelectItem>
                                  <SelectItem value="RO">Rondônia</SelectItem>
                                  <SelectItem value="RR">Roraima</SelectItem>
                                  <SelectItem value="SC">
                                    Santa Catarina
                                  </SelectItem>
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
                              <FormLabel className="text-gray-700 font-medium ml-1">Referência</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ex: próximo ao mercado"
                                  {...field}
                                  className="min-h-[80px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                  aria-invalid={!!fieldState.error}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvando...
                      </>
                    ) : editingEscola ? (
                      "Atualizar Escola"
                    ) : (
                      "Salvar Escola"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
