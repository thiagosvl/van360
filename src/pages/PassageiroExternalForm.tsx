import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { cepMask, cpfMask, phoneMask } from "@/utils/masks";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, FileText, Loader2, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

const prePassageiroSchema = z.object({
  nome: z.string().min(2, "Campo obrigatório"),
  genero: z
    .enum(["Masculino", "Feminino"], {
      errorMap: () => ({ message: "Campo obrigatório" }),
    })
    .optional()
    .refine((val) => val && val.length > 0, { message: "Campo obrigatório" }),
  nome_responsavel: z.string().min(2, "Campo obrigatório"),
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
    .refine((val) => val.replace(/\D/g, "").length === 11, "Telefone inválido"),

  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  referencia: z.string().optional(),
  observacoes: z.string().optional(),
});

type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;

export default function PassageiroExternalForm() {
  const { motoristaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [motoristaNome, setMotoristaNome] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "passageiro",
    "responsavel",
    "endereco",
    "observacoes",
  ]);

  const form = useForm<PrePassageiroFormData>({
    resolver: zodResolver(prePassageiroSchema),
    defaultValues: {
      nome: "",
      genero: "",
      nome_responsavel: "",
      email_responsavel: "",
      cpf_responsavel: "",
      telefone_responsavel: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      observacoes: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const validateMotorista = async () => {
      if (!motoristaId) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, role")
        .eq("id", motoristaId)
        .single();

      if (error || !data || data.role !== "motorista") {
        toast({
          title: "Link inválido",
          description: "Este link de cadastro não é válido.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setMotoristaNome(data.nome);
      setLoading(false);
    };

    validateMotorista();
  }, [motoristaId, navigate, toast]);

  const onFormError = (errors: any) => {
    toast({
      title: "Por favor, corrija os erros no formulário.",
      variant: "destructive",
    });
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "endereco",
      "observacoes",
    ]);
  };

  const handleSubmit = async (data: PrePassageiroFormData) => {
    try {
      setSubmitting(true);

      const payload = {
        ...data,
        telefone_responsavel: data.telefone_responsavel.replace(/\D/g, ""),
        cpf_responsavel: data.cpf_responsavel.replace(/\D/g, ""),
      };

      const { error } = await supabase.from("pre_passageiros").insert([
        {
          ...payload,
          usuario_id: motoristaId,
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      form.reset();
    } catch (error: any) {
      console.error("Erro ao enviar cadastro:", error);
      toast({
        title: "Erro ao enviar dados",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white shadow-lg rounded-xl text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Cadastro realizado com sucesso!
        </h2>
        <p className="text-gray-700">
          O motorista será notificado que você concluiu o cadastro.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:py-10">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-7 sm:p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Cadastro de Passageiro
        </h1>
        <span className="text-center font-semibold text-primary block">
          {motoristaNome}
        </span>

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
              {/* DADOS DO PASSAGEIRO */}
              <AccordionItem value="passageiro">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-5 h-5 text-primary" />
                    Passageiro
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Nome do Passageiro *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: Maria da Silva"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genero"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Gênero</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o gênero" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Masculino">
                                Masculino
                              </SelectItem>
                              <SelectItem value="Feminino">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* DADOS DO RESPONSÁVEL */}
              <AccordionItem value="responsavel" className="mt-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-5 h-5 text-primary" />
                    Responsável
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <Alert
                    variant="default"
                    className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-500"
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <AlertTitle className="font-semibold text-sm">
                      Atenção!
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      Preencha com os dados do responsável financeiro e legal do
                      passageiro.
                    </AlertDescription>
                  </Alert>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telefone_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone (WhatsApp) *</FormLabel>
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
                              placeholder="000.000.000-00"
                              maxLength={14}
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

              {/* ENDEREÇO */}
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
                        <FormItem className="md:col-span-2">
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="00000-000"
                              maxLength={9}
                              onChange={(e) => {
                                field.onChange(cepMask(e.target.value));
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
                        <FormItem className="md:col-span-3">
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: Rua Comendador"
                            />
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

              {/* OBSERVAÇÕES */}
              <AccordionItem value="observacoes" className="mt-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <FileText className="w-5 h-5 text-primary" />
                    Observações (Opcional)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Alérgico a amendoim, entra pela porta lateral da escola, etc."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
