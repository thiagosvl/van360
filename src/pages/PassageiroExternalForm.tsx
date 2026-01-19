import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/constants/routes";
import { useNavigate, useParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { MoneyInput } from "@/components/forms";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Services
import { supabase } from "@/integrations/supabase/client";
import { prePassageiroApi } from "@/services/api/pre-passageiro.api";

// Utils
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { cepSchema, cpfSchema, phoneSchema } from "@/schemas/common";
import { validatePrePassageiroAccess } from "@/utils/domain/motorista/accessValidation";
import { moneyToNumber } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";

// Icons
import { periodos } from "@/utils/formatters";
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  CreditCard,
  Loader2,
  School,
  Sun,
  User,
  Wand2,
} from "lucide-react";

import { PassageiroFormEndereco } from "@/components/features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormResponsavel } from "@/components/features/passageiro/form/PassageiroFormResponsavel";
import { useEscolasWithFilters } from "@/hooks";
import { mockGenerator } from "@/utils/mocks/generator";

const prePassageiroSchema = z.object({
  nome: z.string().min(2, "Campo obrigatório"),
  nome_responsavel: z.string().min(2, "Campo obrigatório"),
  email_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .email("E-mail inválido"),
  cpf_responsavel: cpfSchema,
  telefone_responsavel: phoneSchema,

  logradouro: z.string().min(1, "Campo obrigatório"),
  numero: z.string().min(1, "Campo obrigatório"),
  bairro: z.string().min(1, "Campo obrigatório"),
  cidade: z.string().min(1, "Campo obrigatório"),
  estado: z.string().min(1, "Campo obrigatório"),
  cep: cepSchema,
  referencia: z.string().optional(),
  observacoes: z.string().optional(),

  escola_id: z.string().optional(),
  periodo: z.string().optional(),

  valor_cobranca: z.string().optional(),
  dia_vencimento: z.string().optional(),
  emitir_cobranca_mes_atual: z.boolean().optional(),
  enviar_cobranca_automatica: z.boolean().optional(),
  ativo: z.boolean().optional(),
});

type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;

export default function PassageiroExternalForm() {
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
  const { data: escolasList = [] } = useEscolasWithFilters(
    motoristaId,
    { ativo: "true" },
    {
      enabled: !!motoristaId,
    }
  ) as { data: import("@/types/escola").Escola[] };

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
      emitir_cobranca_mes_atual: false,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const validateMotorista = async () => {
      if (!motoristaId) {
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select(
          `
          id, 
          nome, 
          apelido, 
          assinaturas_usuarios (
            *,
            planos (*, parent:parent_id (*))
          )
        `
        )
        .eq("id", motoristaId)
        .single();

      if (error || !data) {
        toast.error("sistema.erro.linkInvalido", {
          description: "sistema.erro.linkInvalidoDescricao",
        });
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      setMotoristaApelido((data as any).apelido);

      const accessValidation = validatePrePassageiroAccess(data);
      setHasAccess(accessValidation.hasAccess);
      setAccessReason(accessValidation.reason || null);

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

      await prePassageiroApi.createPrePassageiro({
        ...payload,
        escola_id: payload.escola_id === "none" ? null : payload.escola_id,
        usuario_id: motoristaId,
      });

      setSuccess(true);
    } catch (error: any) {
      toast.error("sistema.erro.enviarDados", {
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCadastro = () => {
    const currentValues = form.getValues();

    form.reset({
      nome_responsavel: currentValues.nome_responsavel,
      email_responsavel: currentValues.email_responsavel,
      cpf_responsavel: currentValues.cpf_responsavel,
      telefone_responsavel: currentValues.telefone_responsavel,

      cep: currentValues.cep,
      logradouro: currentValues.logradouro,
      numero: currentValues.numero,
      bairro: currentValues.bairro,
      cidade: currentValues.cidade,
      estado: currentValues.estado,
      referencia: currentValues.referencia,

      nome: "",
      escola_id: "",
      periodo: "",
      observacoes: "",

      valor_cobranca: "",
      dia_vencimento: "",

      emitir_cobranca_mes_atual: false,
      ativo: true,
      enviar_cobranca_automatica: false,
    });

    setSuccess(false);
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);

    window.scrollTo({ top: 0, behavior: "smooth" });

    toast.info("Dados mantidos!", {
      description:
        "Para agilizar, mantivemos os dados do responsável e endereço. Preencha apenas os dados do novo passageiro.",
      duration: 5000,
    });
  };

  const handleFillMock = () => {
    const currentValues = form.getValues();

    let escolaId = currentValues.escola_id;
    if ((!escolaId || escolaId === "none") && escolasList.length > 0) {
      escolaId = escolasList[Math.floor(Math.random() * escolasList.length)].id;
    }

    const mockData = mockGenerator.passenger({
      escola_id: escolaId,
      veiculo_id: undefined,
    });

    form.reset({
      ...mockData,
      emitir_cobranca_mes_atual: false,
    });

    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);

    toast.success("Campos preenchidos com dados de teste!");
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
      <div className="min-h-screen bg-gray-50/90 flex items-center justify-center p-4">
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
            onClick={handleNewCadastro}
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
    <div className="min-h-screen bg-gray-50 py-0 px-0 sm:py-8 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="shadow-2xl sm:rounded-3xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-blue-600 p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern.png')] opacity-10"></div>

            <div className="absolute right-4 top-4 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                onClick={handleFillMock}
                title="Preencher com dados fictícios"
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 transition-transform hover:scale-105 duration-500 ease-out">
                <img
                  src="/assets/logo-van360.png"
                  alt="Van360"
                  className="h-20 sm:h-24 w-auto drop-shadow-lg select-none filter brightness-0 invert opacity-90"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
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
                                Nome <span className="text-red-500">*</span>
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
                                  Escola
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
                                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                          fieldState.error && "border-red-500"
                                        )}
                                      >
                                        <SelectValue placeholder="Selecione a escola" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent>
                                    {escolasList?.map((escola) => (
                                      <SelectItem
                                        key={escola.id}
                                        value={escola.id}
                                      >
                                        {escola.nome}
                                      </SelectItem>
                                    ))}
                                    <SelectItem
                                      value="none"
                                      className="text-blue-600 font-semibold border-t border-blue-50 mt-1"
                                    >
                                      Nenhuma das opções acima
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                {field.value === "none" && (
                                  <Alert className="mt-4 bg-blue-50 border-blue-100 text-blue-900 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-xs text-blue-700 leading-relaxed font-medium">
                                      Escola não listada? Continue o cadastro. O
                                      motorista será avisado para ajustar
                                      depois.
                                    </AlertDescription>
                                  </Alert>
                                )}
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
                                  Período
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
                                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
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
                  <PassageiroFormResponsavel />

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

                  {/* ENDEREÇO E OBSERVAÇÕES */}
                  <PassageiroFormEndereco />
                </Accordion>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 border-t border-gray-200 backdrop-blur-sm z-50">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={form.handleSubmit(handleSubmit, onFormError)}
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
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
        </div>
      </div>
    </div>
  );
}
