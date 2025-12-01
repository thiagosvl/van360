// React
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate, useParams } from "react-router-dom";

// Third-party
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Components - Forms
import { CepInput, MoneyInput, PhoneInput } from "@/components/forms";

// Components - UI
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

// Services
import { supabase } from "@/integrations/supabase/client";

// Utils
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { validatePrePassageiroAccess } from "@/utils/domain/motorista/accessValidation";
import { cpfMask, moneyToNumber } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cepSchema, cpfSchema, phoneSchema } from "@/utils/validators";

// Icons
import { periodos } from "@/utils/formatters";
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  Contact,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  School,
  Sun,
  User,
} from "lucide-react";

const prePassageiroSchema = z.object({
  nome: z.string().min(2, "Campo obrigatório"),
  nome_responsavel: z.string().min(2, "Campo obrigatório"),
  email_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .email("E-mail inválido"),
  cpf_responsavel: cpfSchema(true),
  telefone_responsavel: phoneSchema(true),

  logradouro: z.string().min(1, "Campo obrigatório"),
  numero: z.string().min(1, "Campo obrigatório"),
  bairro: z.string().min(1, "Campo obrigatório"),
  cidade: z.string().min(1, "Campo obrigatório"),
  estado: z.string().min(1, "Campo obrigatório"),
  cep: cepSchema(true),
  referencia: z.string().optional(),
  observacoes: z.string().optional(),

  escola_id: z.string().min(1, "Campo obrigatório"),
  periodo: z.string().min(1, "Campo obrigatório"),

  valor_cobranca: z.string().optional(),
  dia_vencimento: z.string().optional(),
});

type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;

export default function PassageiroExternalForm() {
  // Bloquear indexação da página de cadastro externo de passageiro
  useSEO({
    noindex: true,
  });

  const { motoristaId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [motoristaApelido, setMotoristaApelido] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState<string | null>(null);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "passageiro",
    "responsavel",
    "cobranca",
    "endereco",
    "observacoes",
  ]);
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([]);

  const form = useForm<PrePassageiroFormData>({
    resolver: zodResolver(prePassageiroSchema),
    defaultValues: {
      nome: "",
      nome_responsavel: "",
      email_responsavel: "",
      cpf_responsavel: "",
      telefone_responsavel: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      observacoes: "",
      valor_cobranca: "",
      dia_vencimento: "",
      escola_id: "",
      periodo: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const validateMotorista = async () => {
      if (!motoristaId) {
        navigate("/");
        return;
      }

      // Buscar dados completos do motorista incluindo assinatura e plano
      const { data, error } = await supabase
        .from("usuarios")
        .select(
          `
          id, 
          nome, 
          apelido, 
          role,
          assinaturas_usuarios (
            *,
            planos (*, parent:parent_id (*))
          )
        `
        )
        .eq("id", motoristaId)
        .single();

      if (error || !data || (data as any).role !== "motorista") {
        toast.error("sistema.erro.linkInvalido", {
          description: "sistema.erro.linkInvalidoDescricao",
        });
        navigate("/");
        return;
      }

      setMotoristaApelido((data as any).apelido);

      // Validar acesso à funcionalidade
      const accessValidation = validatePrePassageiroAccess(data);
      setHasAccess(accessValidation.hasAccess);
      setAccessReason(accessValidation.reason || null);

      // Buscar escolas do motorista
      const { data: escolasData } = await supabase
        .from("escolas")
        .select("id, nome")
        .eq("usuario_id", motoristaId)
        .eq("ativo", true)
        .order("nome");

      setEscolas(escolasData || []);

      setLoading(false);
    };

    validateMotorista();
  }, [motoristaId, navigate]);

  const onFormError = (errors: any) => {
    toast.error("validacao.formularioComErros");
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  const handleSubmit = async (data: PrePassageiroFormData) => {
    try {
      setSubmitting(true);

      const payload = {
        ...data,
        telefone_responsavel: String(data.telefone_responsavel || "").replace(
          /\D/g,
          ""
        ),
        cpf_responsavel: String(data.cpf_responsavel || "").replace(/\D/g, ""),
        valor_cobranca: data.valor_cobranca
          ? moneyToNumber(String(data.valor_cobranca))
          : null,
        dia_vencimento: data.dia_vencimento
          ? parseInt(String(data.dia_vencimento))
          : null,
      };

      const { error } = await supabase.from("pre_passageiros" as any).insert([
        {
          ...payload,
          usuario_id: motoristaId,
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      form.reset();
    } catch (error: any) {
      toast.error("sistema.erro.enviarDados", {
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center border border-gray-100">
          <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cadastro realizado!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            O condutor{" "}
            <span className="font-semibold text-gray-900">
              {motoristaApelido}
            </span>{" "}
            será notificado que você concluiu o cadastro.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
          >
            Novo Cadastro
          </Button>
        </div>
      </div>
    );
  }

  // Exibir aviso se não tiver acesso
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center border border-gray-100">
          <div className="mx-auto bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Funcionalidade Indisponível
          </h2>
          <p className="text-gray-600 mb-6 text-base leading-relaxed">
            {accessReason ||
              "O motorista não possui acesso a esta funcionalidade."}
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-orange-800 font-medium">
              <strong>O que fazer?</strong>
            </p>
            <p className="text-sm text-orange-700 mt-2">
              Entre em contato com o condutor{" "}
              <span className="font-semibold">{motoristaApelido}</span> e
              informe que ele precisa contratar ou regularizar a assinatura para
              disponibilizar esta funcionalidade.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-blue-600 p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern.png')] opacity-10"></div>
            <div className="relative z-10">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Cadastro de Passageiro
              </h1>
              <div className="inline-flex items-center gap-2 bg-blue-700/50 px-4 py-1.5 rounded-full text-blue-100 text-sm font-medium backdrop-blur-sm border border-blue-500/30">
                <Car className="w-4 h-4" />
                <span>Condutor: {motoristaApelido}</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-8"
              >
                <Accordion
                  type="multiple"
                  value={openAccordionItems}
                  onValueChange={setOpenAccordionItems}
                  className="w-full space-y-4"
                >
                  {/* DADOS DO PASSAGEIRO */}
                  <AccordionItem
                    value="passageiro"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        Passageiro
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Nome{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="Digite o nome do passageiro"
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="escola_id"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                  Escola <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <div className="relative">
                                      <School className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                      <SelectTrigger
                                        className={cn(
                                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                          fieldState.error && "border-red-500"
                                        )}
                                      >
                                        <SelectValue placeholder="Selecione a escola" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent>
                                    {escolas.map((escola) => (
                                      <SelectItem
                                        key={escola.id}
                                        value={escola.id}
                                      >
                                        {escola.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="periodo"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                  Período{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <div className="relative">
                                      <Sun className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                      <SelectTrigger
                                        className={cn(
                                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                          fieldState.error && "border-red-500"
                                        )}
                                      >
                                        <SelectValue placeholder="Selecione o período" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent>
                                    {periodos.map((periodo) => (
                                      <SelectItem
                                        key={periodo.value}
                                        value={periodo.value}
                                      >
                                        {periodo.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* DADOS DO RESPONSÁVEL */}
                  <AccordionItem
                    value="responsavel"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Contact className="w-5 h-5" />
                        </div>
                        Responsável
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                      <Alert
                        variant="default"
                        className="bg-blue-50 border-blue-200 text-blue-900 rounded-xl"
                      >
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <div className="ml-2">
                          <AlertTitle className="font-bold text-blue-800">
                            Atenção
                          </AlertTitle>
                          <AlertDescription className="text-blue-700">
                            Preencha com os dados do responsável financeiro e
                            legal do passageiro.
                          </AlertDescription>
                        </div>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="nome_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Nome do Responsável{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                E-mail <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    {...field}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="telefone_responsavel"
                          render={({ field }) => (
                            <PhoneInput
                              field={field}
                              label="WhatsApp"
                              required
                              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cpf_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                CPF <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    onChange={(e) =>
                                      field.onChange(cpfMask(e.target.value))
                                    }
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* COBRANÇA */}
                  <AccordionItem
                    value="cobranca"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        Cobrança
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="valor_cobranca"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Valor da Mensalidade"
                              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dia_vencimento"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Dia do Vencimento
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o dia" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  {Array.from(
                                    { length: 31 },
                                    (_, i) => i + 1
                                  ).map((dia) => (
                                    <SelectItem key={dia} value={String(dia)}>
                                      Dia {dia}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* ENDEREÇO */}
                  <AccordionItem
                    value="endereco"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        Endereço
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <CepInput
                              field={field}
                              label="CEP"
                              required
                              className="md:col-span-2"
                              inputClassName="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="logradouro"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-4">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Logradouro{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: Rua Comendador"
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
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Número <span className="text-red-500">*</span>
                              </FormLabel>
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
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Bairro <span className="text-red-500">*</span>
                              </FormLabel>
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
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Cidade <span className="text-red-500">*</span>
                              </FormLabel>
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
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Estado <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      "h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                      fieldState.error && "border-red-500"
                                    )}
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
                                  <SelectItem value="MT">
                                    Mato Grosso
                                  </SelectItem>
                                  <SelectItem value="MS">
                                    Mato Grosso do Sul
                                  </SelectItem>
                                  <SelectItem value="MG">
                                    Minas Gerais
                                  </SelectItem>
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
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Referência
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ex: próximo ao mercado"
                                  {...field}
                                  className="min-h-[80px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* OBSERVAÇÕES */}
                  <AccordionItem
                    value="observacoes"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        Observações
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
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
                                className="min-h-[120px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Enviando Cadastro...
                    </>
                  ) : (
                    "Enviar Cadastro"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Van Control. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
