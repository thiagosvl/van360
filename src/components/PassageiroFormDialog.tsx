import EscolaFormDialog from "@/components/EscolaFormDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { passageiroService } from "@/services/passageiroService";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { currentMonthInText } from "@/utils/formatters";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, DollarSign, Loader2, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const passageiroSchema = z.object({
  escola_id: z.string().min(1, "Campo obrigatório"),
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  referencia: z.string().optional(),
  nome_responsavel: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  email_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .email("E-mail inválido"),
  cpf_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => isValidCPF(val), "CPF inválido"),
  telefone_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => {
      const cleaned = val.replace(/\D/g, "");
      return cleaned.length === 11;
    }, "O formato aceito é (00) 00000-0000"),
  valor_mensalidade: z.string().min(1, "Campo obrigatório"),
  dia_vencimento: z.string().min(1, "Campo obrigatório"),
  emitir_cobranca_mes_atual: z.boolean().optional(),
  ativo: z.boolean().optional(),
  asaas_customer_id: z.string().optional(),
  usuario_id: z.string().optional(),
});
type PassageiroFormData = z.infer<typeof passageiroSchema>;

interface PassengerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  onSuccess: () => void;
}

export default function PassengerFormDialog({
  isOpen,
  onClose,
  editingPassageiro,
  onSuccess,
}: PassengerFormDialogProps) {
  const [escolasModal, setEscolasModal] = useState<Escola[]>([]);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const { toast } = useToast();
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "passageiro",
    "responsavel",
    "mensalidade",
  ]);

  const form = useForm<PassageiroFormData>({
    resolver: zodResolver(passageiroSchema),
    defaultValues: {
      escola_id: "",
      nome: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      nome_responsavel: "",
      email_responsavel: "",
      telefone_responsavel: "",
      cpf_responsavel: "",
      valor_mensalidade: "",
      dia_vencimento: "",
      emitir_cobranca_mes_atual: false,
      ativo: true,
    },
  });

  const emitirCobranca = form.watch("emitir_cobranca_mes_atual");
  const diaVencimento = form.watch("dia_vencimento");

  const fetchEscolasModal = async (escolaId?: string) => {
    try {
      let query = supabase
        .from("escolas")
        .select("*")
        .eq("ativo", true)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("nome");
      if (escolaId) {
        query = supabase
          .from("escolas")
          .select("*")
          .or(`ativo.eq.true,id.eq.${escolaId}`)
          .order("nome");
      }
      const { data, error } = await query;
      if (error) throw error;
      setEscolasModal(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas (modal):", error);
    }
  };

  const handleEscolaCreated = (novaEscola: Escola) => {
    fetchEscolasModal(novaEscola.id);

    form.setValue("escola_id", novaEscola.id);
    form.trigger("escola_id"); 

    setIsCreatingEscola(false);
  };

  const onFormError = (errors: any) => {
    toast({
      title: "Campos inválidos",
      description: "Por favor, corrija os erros no formulário.",
      variant: "destructive",
    });
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "mensalidade",
      "endereco",
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      if (editingPassageiro) {
        fetchEscolasModal(editingPassageiro.escola_id || undefined);
        form.reset({
          nome: editingPassageiro.nome,
          rua: editingPassageiro.rua || "",
          numero: editingPassageiro.numero || "",
          bairro: editingPassageiro.bairro || "",
          cidade: editingPassageiro.cidade || "",
          estado: editingPassageiro.estado || "",
          cep: editingPassageiro.cep || "",
          referencia: editingPassageiro.referencia || "",
          nome_responsavel: editingPassageiro.nome_responsavel,
          telefone_responsavel: phoneMask(
            editingPassageiro.telefone_responsavel
          ),
          email_responsavel: editingPassageiro.email_responsavel,
          cpf_responsavel: editingPassageiro.cpf_responsavel,
          valor_mensalidade: moneyMask(
            (editingPassageiro.valor_mensalidade * 100).toString()
          ),
          dia_vencimento: editingPassageiro.dia_vencimento.toString(),
          escola_id: editingPassageiro.escola_id || "",
          ativo: editingPassageiro.ativo,
        });
        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "mensalidade",
          "endereco",
        ]);
      } else {
        fetchEscolasModal();
        form.reset({
          escola_id: "",
          nome: "",
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          referencia: "",
          nome_responsavel: "",
          email_responsavel: "",
          telefone_responsavel: "",
          cpf_responsavel: "",
          valor_mensalidade: "",
          dia_vencimento: "",
          emitir_cobranca_mes_atual: false,
          ativo: true,
        });
      }
    }
  }, [isOpen, editingPassageiro, form]);

  const handleSubmit = async (data: PassageiroFormData) => {
    try {
      if (editingPassageiro) {
        await passageiroService.updatePassageiroComTransacao(
          editingPassageiro.id,
          data,
          editingPassageiro
        );
        toast({ title: "Passageiro atualizado com sucesso." });
      } else {
        await passageiroService.createPassageiroComTransacao(data);
        toast({ title: "Passageiro cadastrado com sucesso." });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar passageiro:", error);
      toast({
        title: editingPassageiro
          ? "Erro ao atualizar passageiro."
          : "Erro ao cadastrar passageiro.",
        description:
          error.message || "As alterações foram desfeitas devido a um erro.",
        variant: "destructive",
      });
    }
  };

  if (isCreatingEscola) {
    return (
      <EscolaFormDialog
        isOpen={isOpen}
        onClose={() => setIsCreatingEscola(false)}
        onSuccess={handleEscolaCreated}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingPassageiro ? "Editar Passageiro" : "Novo Cadastro"}
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
              <AccordionItem value="passageiro">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-5 h-5 text-primary" />
                    Passageiro
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Passageiro *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="escola_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escola *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              if (value === "add-new-school") {
                                setIsCreatingEscola(true); // <--- ATIVA A TROCA DE TELA
                              } else {
                                field.onChange(value);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma escola" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {escolasModal.map((escola) => (
                                <SelectItem key={escola.id} value={escola.id}>
                                  {escola.nome}
                                </SelectItem>
                              ))}
                              <SelectItem
                                value="add-new-school"
                                className="font-semibold text-primary"
                              >
                                + Cadastrar Nova Escola
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {editingPassageiro && (
                    <div className="mt-2">
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
                              <FormLabel>Ativo</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="responsavel" className="mt-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-5 h-5 text-primary" />
                    Responsável
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Responsável *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="exemplo@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="(00) 00000-0000"
                              maxLength={15}
                              onChange={(e) => {
                                field.onChange(phoneMask(e.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                field.onChange(cpfMask(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="mensalidade" className="mt-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Mensalidade
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_mensalidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(moneyMask(e.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dia_vencimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia do Vencimento *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o dia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(
                                (day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    Dia {day}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {!editingPassageiro && (
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="emitir_cobranca_mes_atual"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Emitir cobrança de {currentMonthInText()}?
                              </FormLabel>
                              <FormDescription>
                                Se desmarcado, a primeira cobrança será gerada
                                apenas no próximo mês.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {(() => {
                        const diaInformado = Number(diaVencimento) || null;

                        if (
                          !editingPassageiro &&
                          emitirCobranca &&
                          diaInformado &&
                          Number(diaInformado) < new Date().getDate()
                        ) {
                          return (
                            <div className="mt-4">
                              <Alert
                                variant="destructive"
                                className="bg-yellow-50 border-yellow-200 text-yellow-900 [&>svg]:text-yellow-900"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="font-bold">
                                  Ajuste na Data de Vencimento
                                </AlertTitle>
                                <AlertDescription className="text-yellow-800">
                                  <ul className="list-disc pl-4 mt-2 space-y-1">
                                    <li>
                                      Como o dia <strong>{diaInformado}</strong>{" "}
                                      já passou, a primeira mensalidade{" "}
                                      <strong>vencerá hoje</strong>.
                                    </li>
                                    <li>
                                      As próximas mensalidades vencerão
                                      normalmente no{" "}
                                      <strong>dia {diaInformado}</strong> de
                                      cada mês.
                                    </li>
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="endereco" className="mt-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="w-5 h-5 text-primary" />
                    Endereço
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
                              {...field}
                              maxLength={9}
                              onChange={(e) => {
                                const maskedValue = cepMask(e.target.value);
                                field.onChange(maskedValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rua"
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
                        <FormItem className="md:col-span-3">
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
                            <SelectContent>
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
                        <FormItem className="md:col-span-5">
                          <FormLabel>Referência</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex gap-4 mt-8 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingPassageiro ? (
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
