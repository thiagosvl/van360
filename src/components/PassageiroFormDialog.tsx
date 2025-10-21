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
import { cepService } from "@/services/cepService";
import { passageiroService } from "@/services/passageiroService";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { currentMonthInText } from "@/utils/formatters";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  User,
} from "lucide-react";
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

  genero: z.enum(["Masculino", "Feminino"], {
    required_error: "Campo obrigatório",
  }),

  logradouro: z.string().min(1, "Campo obrigatório"),
  numero: z.string().min(1, "Campo obrigatório"),
  bairro: z.string().min(1, "Campo obrigatório"),
  cidade: z.string().min(1, "Campo obrigatório"),
  estado: z.string().min(1, "Campo obrigatório"),
  cep: z.string().min(1, "Campo obrigatório"),
  referencia: z.string().optional(),

  observacoes: z.string().optional(),

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

  valor_cobranca: z.string().min(1, "Campo obrigatório"),
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
  mode?: "create" | "edit" | "finalize";
  prePassageiro?: PrePassageiro | null;
  onSuccess: () => void;
  onCreateEscola?: () => void;
  novaEscolaId?: string | null;
}

export default function PassengerFormDialog({
  isOpen,
  onClose,
  editingPassageiro,
  mode,
  prePassageiro,
  onSuccess,
  onCreateEscola,
  novaEscolaId,
}: PassengerFormDialogProps) {
  const [selectedEscola, setSelectedEscola] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [escolasModal, setEscolasModal] = useState<Escola[]>([]);
  const { toast } = useToast();
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "passageiro",
    "responsavel",
    "cobranca",
    "endereco",
  ]);

  const form = useForm<PassageiroFormData>({
    resolver: zodResolver(passageiroSchema),
    defaultValues: {
      escola_id: "",
      nome: "",

      genero: undefined,
      observacoes: "",

      logradouro: "",
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
      valor_cobranca: "",
      dia_vencimento: "",
      emitir_cobranca_mes_atual: false,
      ativo: true,
    },
  });

  const emitirCobranca = form.watch("emitir_cobranca_mes_atual");
  const diaVencimento = form.watch("dia_vencimento");

  useEffect(() => {
    if (novaEscolaId) {
      fetchEscolas(novaEscolaId).then((_) => {
        setTimeout(() => {
          form.setValue("escola_id", novaEscolaId, { shouldValidate: true });
          setSelectedEscola(novaEscolaId);
        }, 20);
      });
    }
  }, [novaEscolaId]);

  useEffect(() => {
    if (isOpen) {
      const isFinalizeMode = mode === "finalize" && prePassageiro;

      if (editingPassageiro && mode === "edit") {
        fetchEscolas(editingPassageiro.escola_id || undefined);
        form.reset({
          nome: editingPassageiro.nome,
          genero: (editingPassageiro.genero as any) || undefined,
          nome_responsavel: editingPassageiro.nome_responsavel,
          email_responsavel: editingPassageiro.email_responsavel,
          cpf_responsavel: editingPassageiro.cpf_responsavel,
          telefone_responsavel: phoneMask(
            editingPassageiro.telefone_responsavel
          ),
          valor_cobranca: editingPassageiro.valor_cobranca
            ? moneyMask((editingPassageiro.valor_cobranca * 100).toString())
            : "",
          dia_vencimento: editingPassageiro.dia_vencimento?.toString() || "",
          observacoes: editingPassageiro.observacoes || "",
          logradouro: editingPassageiro.logradouro || "",
          numero: editingPassageiro.numero || "",
          bairro: editingPassageiro.bairro || "",
          cidade: editingPassageiro.cidade || "",
          estado: editingPassageiro.estado || "",
          cep: editingPassageiro.cep ? cepMask(editingPassageiro.cep) : "",
          referencia: editingPassageiro.referencia || "",
          escola_id: editingPassageiro.escola_id || "",
          emitir_cobranca_mes_atual: false,
          ativo: editingPassageiro.ativo,
        });
        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
      } else if (isFinalizeMode) {
        fetchEscolas();
        form.reset({
          nome: prePassageiro.nome,
          genero: (prePassageiro.genero as any) || undefined,
          nome_responsavel: prePassageiro.nome_responsavel,
          email_responsavel: prePassageiro.email_responsavel,
          cpf_responsavel: prePassageiro.cpf_responsavel,
          telefone_responsavel: phoneMask(prePassageiro.telefone_responsavel),

          logradouro: prePassageiro.logradouro || "",
          numero: prePassageiro.numero || "",
          bairro: prePassageiro.bairro || "",
          cidade: prePassageiro.cidade || "",
          estado: prePassageiro.estado || "",
          cep: prePassageiro.cep || "",
          referencia: prePassageiro.referencia || "",
          observacoes: prePassageiro.observacoes || "",

          escola_id: prePassageiro.escola_id || "",
          valor_cobranca: prePassageiro.valor_cobranca
            ? moneyMask((prePassageiro.valor_cobranca * 100).toString())
            : "",
          dia_vencimento: prePassageiro.dia_vencimento?.toString() || "",

          emitir_cobranca_mes_atual: false,
          ativo: true,
        });

        form.trigger([
          "escola_id",
          "valor_cobranca",
          "dia_vencimento",
          "nome",
          "nome_responsavel",
          "email_responsavel",
          "cpf_responsavel",
          "telefone_responsavel",
        ]);

        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
      } else {
        fetchEscolas();
        form.reset({
          escola_id: "",
          nome: "",
          genero: undefined,
          observacoes: "",
          logradouro: "",
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
          valor_cobranca: "",
          dia_vencimento: "",
          emitir_cobranca_mes_atual: false,
          ativo: true,
        });
      }
    }
  }, [isOpen, editingPassageiro, form, prePassageiro, mode]);

  const fetchEscolas = async (escolaId?: string) => {
    const userId = localStorage.getItem("app_user_id");

    try {
      let query = supabase
        .from("escolas")
        .select("*")
        .eq("usuario_id", userId)
        .order("nome");

      if (escolaId) {
        query = query.or(`ativo.eq.true,id.eq.${escolaId}`);
      } else {
        query = query.eq("ativo", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      setEscolasModal(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas (modal):", error);
      setEscolasModal([]);
    }
  };

  const onFormError = (errors: any) => {
    toast({
      title: "Corrija os erros no formulário.",
      variant: "destructive",
    });
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
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

  const handleSubmit = async (data: PassageiroFormData) => {
    const { emitir_cobranca_mes_atual, ...purePayload } = data;

    try {
      if (mode === "finalize" && prePassageiro) {
        await passageiroService.finalizePreCadastro(
          prePassageiro.id,
          purePayload,
          prePassageiro.usuario_id,
          emitir_cobranca_mes_atual
        );
        toast({ title: "Passageiro finalizado e cadastrado com sucesso." });
      } else if (editingPassageiro) {
        await passageiroService.updatePassageiroComTransacao(
          editingPassageiro.id,
          purePayload
        );
        toast({ title: "Cadastro atualizado com sucesso." });
      } else {
        await passageiroService.createPassageiroComTransacao({
          ...purePayload,
          emitir_cobranca_mes_atual,
        });
        toast({ title: "Passageiro cadastrado com sucesso." });
      }

      onSuccess();
      onClose();
    } catch (error: any) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "finalize"
              ? "Continuar Cadastro"
              : mode === "edit"
              ? "Editar Passageiro"
              : "Novo Cadastro"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-6"
          >
            {mode === "finalize" && prePassageiro && (
              <div className="mb-6">
                <Alert
                  variant="default"
                  className="bg-orange-50 border-orange-200 text-orange-900 [&>svg]:text-orange-600 mb-6"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <AlertTitle className="font-semibold text-sm">
                    Atenção!
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    Para concluir o cadastro, preencha os campos destacados em
                    vermelho.
                  </AlertDescription>
                </Alert>
              </div>
            )}

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
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome do Passageiro *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="escola_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escola *</FormLabel>
                          <Select
                            value={selectedEscola || field.value}
                            onValueChange={(value) => {
                              if (value === "add-new-school") {
                                setTimeout(() => onCreateEscola(), 50);
                                return;
                              }
                              field.onChange(value);
                              setSelectedEscola(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma escola" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {escolasModal.map((escola) => (
                                <SelectItem key={escola.id} value={escola.id}>
                                  {escola.nome}
                                </SelectItem>
                              ))}
                              <SelectItem
                                value="add-new-school"
                                className="font-semibold text-primary cursor-pointer"
                              >
                                + Cadastrar Nova Escola
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero *</FormLabel>
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
              <AccordionItem value="cobranca" className="mt-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Cobrança
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_cobranca"
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
                            <SelectContent className="max-h-60 overflow-y-auto">
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
                                      já passou, a primeira cobrança{" "}
                                      <strong>vencerá hoje</strong>.
                                    </li>
                                    <li>
                                      As próximas cobranças vencerão normalmente
                                      no <strong>dia {diaInformado}</strong> de
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
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>CEP *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                placeholder="00000-000"
                                maxLength={9}
                                className="pr-8"
                                onChange={(e) => {
                                  const masked = cepMask(e.target.value);
                                  handleCepChange(masked);
                                }}
                              />
                              {loadingCep && (
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                              )}
                            </div>
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
                          <FormLabel>Logradouro *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={loadingCep}
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
                        <FormItem className="md:col-span-2">
                          <FormLabel>Número *</FormLabel>
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
                          <FormLabel>Bairro *</FormLabel>
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
                        <FormItem className="md:col-span-4">
                          <FormLabel>Cidade *</FormLabel>
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
                          <FormLabel>Estado *</FormLabel>
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
                        <FormItem className="md:col-span-6">
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
