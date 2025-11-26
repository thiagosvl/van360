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
  DialogContent,
  DialogHeader,
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
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { toast } from "@/utils/notifications/toast";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useCreateEscola, useUpdateEscola } from "@/hooks";
import { CepInput } from "@/components/forms";
import { Escola } from "@/types/escola";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, MapPin } from "lucide-react";
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
  cep: z.string().optional(),
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
          className="max-w-2xl max-h-[95vh] overflow-y-auto bg-white"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingEscola ? "Editar Escola" : "Nova Escola"}
            </DialogTitle>
          </DialogHeader>
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
                <AccordionItem value="dados-escola">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Building2 className="w-5 h-5 text-primary" />
                      Dados da Escola
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nome da Escola{" "}
                            <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Ativa</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="endereco" className="mt-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="w-5 h-5 text-primary" />
                      Endereço (Opcional)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <CepInput field={field} className="md:col-span-2" />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logradouro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Logradouro</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Estado</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
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
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-6">
                            <FormLabel>Referência</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ex: próximo ao mercado"
                                {...field}
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
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : editingEscola ? (
                    "Atualizar"
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
