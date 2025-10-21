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
import { useToast } from "@/hooks/use-toast";
import { cepService } from "@/services/cepService";
import { escolaService } from "@/services/escolaService";
import { Escola } from "@/types/escola";
import { cepMask } from "@/utils/masks";
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
}

export default function EscolaFormDialog({
  isOpen,
  onClose,
  editingEscola = null,
  onSuccess,
}: EscolaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-escola",
    "endereco",
  ]);
  const { toast } = useToast();

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
    toast({
      title: "Corrija os erros no formulário.",
      variant: "destructive",
    });
    setOpenAccordionItems(["dados-escola", "endereco"]);
  };

  const handleSubmit = async (data: EscolaFormData) => {
    setLoading(true);
    try {
      const escolaSalva = await escolaService.saveEscola(data, editingEscola);

      toast({
        title: `Escola ${
          editingEscola ? "atualizada" : "cadastrada"
        } com sucesso.`,
      });

      onSuccess(escolaSalva);
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar escola:", error);

      if (error.message.includes("passageiros ativos")) {
        toast({
          title: "Não é possível desativar.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao salvar escola.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = async (value: string) => {
    form.setValue("cep", value);
    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const endereco = await cepService.buscarEndereco(cleanCep);
        if (endereco) {
          form.setValue("logradouro", endereco.logradouro);
          form.setValue("bairro", endereco.bairro);
          form.setValue("cidade", endereco.cidade);
          form.setValue("estado", endereco.estado);
        } else {
          toast({
            title: "CEP não encontrado na base de dados.",
            description: "Preencha o endereço manualmente.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Erro ao consultar CEP:", error);
        toast({
          title: "Erro ao consultar CEP.",
          description: error.message || "Não foi possível concluir a operação.",
          variant: "destructive",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return (
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
                        <FormLabel>Nome da Escola *</FormLabel>
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              {...field}
                              maxLength={9}
                              onChange={(e) => {
                                const masked = cepMask(e.target.value);
                                handleCepChange(masked);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logradouro"
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input disabled={loadingCep} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
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
                            <Input disabled={loadingCep} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input disabled={loadingCep} {...field} />
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
                            disabled={loadingCep}
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
                              <SelectItem value="ES">Espírito Santo</SelectItem>
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
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              <SelectItem value="RN">
                                Rio Grande do Norte
                              </SelectItem>
                              <SelectItem value="RS">
                                Rio Grande do Sul
                              </SelectItem>
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
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-5">
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
  );
}
