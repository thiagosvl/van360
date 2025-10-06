import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { asaasService } from "@/integrations/asaasService";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import {
  cepMask,
  cpfMask,
  moneyMask,
  moneyToNumber,
  phoneMask,
} from "@/utils/masks";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Users2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const apiKey = localStorage.getItem("asaas_api_key");

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

type PassageiroUpdate = Database["public"]["Tables"]["passageiros"]["Update"];
type PassageiroInsert = Database["public"]["Tables"]["passageiros"]["Insert"];
type PassageiroFormData = z.infer<typeof passageiroSchema>;

const PassengerListSkeleton = () => (
  <div className="space-y-3 mt-8">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-3 border rounded-lg"
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
);

export default function Passageiros() {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [escolasModal, setEscolasModal] = useState<Escola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(
    null
  );
  const [selectedEscola, setSelectedEscola] = useState<string>("todas");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    passageiroId: string;
  }>({ open: false, passageiroId: "" });

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

  const fetchPassageiros = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("passageiros")
        .select(`*, escolas(nome)`)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("nome");
      if (selectedEscola !== "todas") {
        query = query.eq("escola_id", selectedEscola);
      }
      if (searchTerm.length >= 2) {
        query = query.or(
          `nome.ilike.%${searchTerm}%,nome_responsavel.ilike.%${searchTerm}%`
        );
      }
      if (selectedStatus !== "todos") {
        query = query.eq("ativo", selectedStatus === "ativo");
      }
      const { data, error } = await query;
      if (error) throw error;
      setPassageiros(data || []);
    } catch (error) {
      console.error("Erro ao buscar passageiros:", error);
      toast({ title: "Erro ao carregar passageiros.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedEscola, selectedStatus, toast]);

  useEffect(() => {
    fetchEscolas();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPassageiros();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchPassageiros]);

  const handleDelete = async () => {
    try {
      const { data: cobrancas, error: checkError } = await supabase
        .from("cobrancas")
        .select("id")
        .eq("passageiro_id", deleteDialog.passageiroId);
      if (checkError) throw checkError;
      if (cobrancas && cobrancas.length > 0) {
        toast({
          title: "Não foi possível excluir.",
          description:
            "Este passageiro possui mensalidades em seu histórico. Exclua as mensalidades antes de excluir o passageiro.",
          variant: "destructive",
        });
        setDeleteDialog({ open: false, passageiroId: "" });
        return;
      }
      const { data: passageiro, error: passageiroError } = await supabase
        .from("passageiros")
        .select("asaas_customer_id")
        .eq("id", deleteDialog.passageiroId)
        .single();
      if (passageiroError) throw passageiroError;
      if (passageiro?.asaas_customer_id && apiKey) {
        await asaasService.deleteCustomer(passageiro.asaas_customer_id, apiKey);
      }
      const { error } = await supabase
        .from("passageiros")
        .delete()
        .eq("id", deleteDialog.passageiroId);
      if (error) throw error;
      toast({ title: "Passageiro excluido com sucesso." });
      fetchPassageiros();
    } catch (error) {
      console.error("Erro ao excluir passageiro:", error);
      toast({ title: "Erro ao excluir passageiro.", variant: "destructive" });
    } finally {
      setDeleteDialog({ open: false, passageiroId: "" });
    }
  };

  const fetchEscolas = async () => {
    try {
      const { data, error } = await supabase
        .from("escolas")
        .select("*")
        .eq("ativo", true)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("nome");
      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    }
  };

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

  const handleCadastrarRapido = async () => {
    const hoje = new Date();
    const fakeData = {
      nome: "Passag. Teste " + Math.floor(Math.random() * 1000),
      nome_responsavel: "Resp. Teste",
      email_responsavel: "abiliodasvendas@gmail.com",
      telefone_responsavel: "11951186951",
      cpf_responsavel: "39542391838",
      valor_mensalidade: (
        Math.floor(Math.random() * (200 - 100 + 1)) + 100
      ).toString(),
      dia_vencimento: hoje.getDate().toString(),
      escola_id: escolas[0]?.id || "",
      ativo: true,
      emitir_cobranca_mes_atual: true,
    };
    await handleSubmit(fakeData as any);
  };

  const handleSubmit = async (data: PassageiroFormData) => {
    try {
      const { emitir_cobranca_mes_atual, ...pureData } = data;
      const passageiroData = {
        ...pureData,
        valor_mensalidade: moneyToNumber(pureData.valor_mensalidade),
        dia_vencimento: Number(pureData.dia_vencimento),
        escola_id: pureData.escola_id || null,
        ativo: pureData.ativo ?? true,
        usuario_id: localStorage.getItem("app_user_id"),
      };
      if (editingPassageiro) {
        const { data: oldPassageiro, error: fetchError } = await supabase
          .from("passageiros")
          .select("*")
          .eq("id", editingPassageiro.id)
          .single();
        if (fetchError) throw fetchError;
        const { error: updateError } = await supabase
          .from("passageiros")
          .update(passageiroData as PassageiroUpdate)
          .eq("id", editingPassageiro.id);
        if (updateError) throw updateError;
        toast({ title: "Passageiro atualizado com sucesso." });
      } else {
        const asaasCustomer = await asaasService.createCustomer(
          {
            name: passageiroData.nome,
            cpfCnpj: passageiroData.cpf_responsavel,
            mobilePhone: passageiroData.telefone_responsavel,
            notificationDisabled: true,
          },
          apiKey
        );
        passageiroData.asaas_customer_id = asaasCustomer.id;
        const { data: insertedPassageiro, error: insertPassageiroError } =
          await supabase
            .from("passageiros")
            .insert([passageiroData as PassageiroInsert])
            .select()
            .single();
        if (insertPassageiroError) throw insertPassageiroError;
        if (emitir_cobranca_mes_atual) {
          // Lógica para criar cobrança no Asaas e Supabase
        }
        toast({ title: "Passageiro cadastrado com sucesso." });
      }
      await fetchPassageiros();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro geral:", error);
      toast({ title: "Erro ao salvar passageiro.", variant: "destructive" });
    }
  };

  const handleEdit = async (passageiro: Passageiro) => {
    setEditingPassageiro(passageiro);
    await fetchEscolasModal(passageiro.escola_id || undefined);
    form.reset({
      nome: passageiro.nome,
      rua: passageiro.rua || "",
      numero: passageiro.numero || "",
      bairro: passageiro.bairro || "",
      cidade: passageiro.cidade || "",
      estado: passageiro.estado || "",
      cep: passageiro.cep || "",
      referencia: passageiro.referencia || "",
      nome_responsavel: passageiro.nome_responsavel,
      telefone_responsavel: phoneMask(passageiro.telefone_responsavel),
      email_responsavel: passageiro.email_responsavel,
      cpf_responsavel: passageiro.cpf_responsavel,
      valor_mensalidade: moneyMask(
        (passageiro.valor_mensalidade * 100).toString()
      ),
      dia_vencimento: passageiro.dia_vencimento.toString(),
      escola_id: passageiro.escola_id || "",
      ativo: passageiro.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleHistorico = (passageiro: Passageiro) => {
    navigate(`/passageiros/${passageiro.id}`);
  };

  const resetForm = () => {
    form.reset();
    setEditingPassageiro(null);
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        <Button
          onClick={handleCadastrarRapido}
          variant="secondary"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Rápido
        </Button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Passageiros
          </h1>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    fetchEscolasModal();
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Cadastro
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingPassageiro ? "Edição" : "Cadastro"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    <Accordion
                      type="multiple"
                      defaultValue={[
                        "passageiro",
                        "responsavel",
                        "mensalidade",
                      ]}
                      className="w-full"
                    >
                      <AccordionItem value="passageiro">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <User className="w-5 h-5 text-primary" />
                            Passageiro
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-6 space-y-4">
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
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma escola" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {escolasModal.map((escola) => (
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
                      <AccordionItem value="responsavel">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <User className="w-5 h-5 text-primary" />
                            Responsável
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-6 space-y-4">
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
                                        field.onChange(
                                          phoneMask(e.target.value)
                                        );
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
                      <AccordionItem value="mensalidade">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Mensalidade
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-6 space-y-4">
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
                                        field.onChange(
                                          moneyMask(e.target.value)
                                        );
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
                                      {Array.from(
                                        { length: 31 },
                                        (_, i) => i + 1
                                      ).map((day) => (
                                        <SelectItem
                                          key={day}
                                          value={day.toString()}
                                        >
                                          Dia {day}
                                        </SelectItem>
                                      ))}
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
                                        Emitir mensalidade para o mês atual
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="endereco">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <MapPin className="w-5 h-5 text-primary" />
                            Endereço
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Linha 1: CEP (1/4) e Logradouro (3/4) */}
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
                                        const maskedValue = cepMask(
                                          e.target.value
                                        );
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
                                <FormItem className="md:col-span-3">
                                  <FormLabel>Logradouro</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Linha 2: Número (1/4) e Bairro (3/4) */}
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
                                <FormItem className="md:col-span-3">
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Linha 3: Cidade (3/4) e Estado (1/4) */}
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
                                <FormItem className="md:col-span-1">
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
                                      {/* Lista de Estados */}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Linha 4: Referência (Largura Total) */}
                            <FormField
                              control={form.control}
                              name="referencia"
                              render={({ field }) => (
                                <FormItem className="md:col-span-4">
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
                        onClick={() => setIsDialogOpen(false)}
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
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lista de Passageiros
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                {passageiros.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* AJUSTE: Seção de filtros com labels explícitas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar por Nome</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nome do passageiro ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="escola-filter">Escola</Label>
                <Select
                  value={selectedEscola}
                  onValueChange={setSelectedEscola}
                >
                  <SelectTrigger id="escola-filter">
                    <SelectValue placeholder="Todas as escolas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as escolas</SelectItem>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <PassengerListSkeleton />
              ) : passageiros.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                  <Users2 className="w-12 h-12 mb-4 text-gray-300" />
                  <p>
                    {searchTerm
                      ? `Nenhum passageiro encontrado para "${searchTerm}"`
                      : "Nenhum passageiro cadastrado."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left text-xs font-medium text-gray-600">
                            Nome
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600">
                            Status
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600">
                            Escola
                          </th>
                          <th className="p-3 text-center text-xs font-medium text-gray-600">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {passageiros.map((passageiro) => (
                          <tr
                            key={passageiro.id}
                            onClick={() => handleHistorico(passageiro)}
                            className="hover:bg-muted/50 cursor-pointer"
                          >
                            <td className="p-3 align-top">
                              <div className="font-medium text-sm text-gray-900">
                                {passageiro.nome}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <span
                                className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                                  passageiro.ativo
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {passageiro.ativo ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                            <td className="p-3 align-top">
                              <span className="text-sm text-muted-foreground">
                                {passageiro.escolas?.nome || "Não informada"}
                              </span>
                            </td>
                            <td className="p-3 text-center align-top">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleHistorico(passageiro);
                                    }}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Ver Carteirinha
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(passageiro);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteDialog({
                                        open: true,
                                        passageiroId: passageiro.id,
                                      });
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden divide-y divide-gray-200">
                    {passageiros.map((passageiro) => (
                      <div
                        key={passageiro.id}
                        onClick={() => handleHistorico(passageiro)}
                        className="p-4 active:bg-muted/50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="pr-2">
                            <div className="font-semibold text-gray-800">
                              {passageiro.nome}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {passageiro.escolas?.nome || "Sem escola"}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHistorico(passageiro);
                                }}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Ver Carteirinha
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(passageiro);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({
                                    open: true,
                                    passageiroId: passageiro.id,
                                  });
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                              passageiro.ativo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {passageiro.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, passageiroId: "" })}
        title="Excluir Passageiro"
        description="Deseja excluir permanentemente este passageiro? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
