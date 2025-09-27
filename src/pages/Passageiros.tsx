import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { isValidCPF } from "@/utils/validators";
import { Trash2 } from "lucide-react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  DollarSign,
  MapPin,
  Pencil,
  Plus,
  Search,
  User,
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
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    passageiroId: string;
  }>({
    open: false,
    passageiroId: "",
  });

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

  const diaInformado = form.watch("dia_vencimento");
  const emitirCobranca = form.watch("emitir_cobranca_mes_atual");

  const debounceSearch = useCallback(() => {
    let timeoutId: NodeJS.Timeout;

    return (searchValue: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (searchValue.length >= 2 || searchValue.length === 0) {
          setSearching(true);
          fetchPassageiros(searchValue);
        }
      }, 500);
    };
  }, [selectedEscola]);

  useEffect(() => {
    fetchEscolas();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      debounceSearch()(searchTerm);
    } else if (searchTerm.length === 0) {
      fetchPassageiros();
    }
  }, [selectedEscola, selectedStatus, searchTerm]);

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, passageiroId: id });
  };

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

      if (passageiro?.asaas_customer_id) {
        await asaasService.deleteCustomer(passageiro.asaas_customer_id, apiKey);
      }

      const { error } = await supabase
        .from("passageiros")
        .delete()
        .eq("id", deleteDialog.passageiroId);

      if (error) throw error;

      toast({
        title: "Passageiro excluido com sucesso.",
      });

      fetchPassageiros();
    } catch (error) {
      console.error("Erro ao excluir passageiro:", error);
      toast({
        title: "Erro ao excluir passageiro.",
        variant: "destructive",
      });
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

  const fetchPassageiros = async (search = "") => {
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

      if (search.length >= 2) {
        query = query.ilike("nome", `%${search}%`);
      }

      if (selectedStatus !== "todos") {
        query = query.eq("ativo", selectedStatus === "ativo");
      }

      const { data, error } = await query;

      if (error) throw error;
      setPassageiros(data || []);
    } catch (error) {
      console.error("Erro ao buscar passageiros:", error);
      toast({
        title: "Erro ao carregar passageiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearching(false);
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
    setLoading(true);

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

      // ----- EDITAR PASSAGEIRO -----
      if (editingPassageiro) {
        let rollbackNeeded = false;

        // Busca snapshot ANTES do update
        const { data: oldPassageiro, error: fetchError } = await supabase
          .from("passageiros")
          .select("*")
          .eq("id", editingPassageiro.id)
          .single();

        if (fetchError) throw fetchError;
        const snapshotPassageiro = { ...oldPassageiro };

        try {
          const { error: updateError } = await supabase
            .from("passageiros")
            .update(passageiroData as PassageiroUpdate)
            .eq("id", editingPassageiro.id);

          if (updateError) throw updateError;

          const { data: ultimaCobranca, error: cobrancaError } = await supabase
            .from("cobrancas")
            .select("*")
            .eq("passageiro_id", editingPassageiro.id)
            .neq("status", "pago")
            .order("ano", { ascending: false })
            .order("mes", { ascending: false })
            .limit(1)
            .single();

          if (!cobrancaError && ultimaCobranca) {
            const valorMudou =
              passageiroData.valor_mensalidade !== ultimaCobranca.valor;

            const vencimentoMudou =
              passageiroData.dia_vencimento !==
              editingPassageiro.dia_vencimento;

            if (valorMudou || vencimentoMudou) {
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);

              const novaDataVencimento = new Date(
                ultimaCobranca.ano,
                ultimaCobranca.mes - 1,
                passageiroData.dia_vencimento
              );
              novaDataVencimento.setHours(0, 0, 0, 0);

              const podeAtualizarCobranca =
                valorMudou || (vencimentoMudou && novaDataVencimento >= hoje);

              if (podeAtualizarCobranca) {
                const updatePayload = {
                  value: passageiroData.valor_mensalidade,
                  dueDate: novaDataVencimento.toISOString().split("T")[0],
                  billingType: "UNDEFINED",
                };

                rollbackNeeded = true; // <-- adiciona aqui

                // Atualiza no Asaas se necessário
                await asaasService.updatePayment(
                  ultimaCobranca.asaas_payment_id,
                  updatePayload,
                  apiKey
                );

                // Atualiza também no Supabase
                const { error: updateCobrancaError } = await supabase
                  .from("cobrancas")
                  .update({
                    data_vencimento: vencimentoMudou
                      ? novaDataVencimento.toISOString().split("T")[0]
                      : ultimaCobranca.data_vencimento,
                    valor: valorMudou
                      ? passageiroData.valor_mensalidade
                      : ultimaCobranca.valor,
                    desativar_lembretes: !passageiroData.ativo,
                  })
                  .eq("id", ultimaCobranca.id);

                if (updateCobrancaError) {
                  rollbackNeeded = true;
                  throw updateCobrancaError;
                }
              }
            }
          }

          toast({ title: "Passageiro atualizado com sucesso." });
        } catch (err) {
          console.error("Erro ao editar passageiro:", err);

          if (rollbackNeeded) {
            try {
              // Reverte atualização usando os dados originais
              const { error: rollbackError } = await supabase
                .from("passageiros")
                .update(snapshotPassageiro)
                .eq("id", editingPassageiro.id);

              if (rollbackError) throw rollbackError;

              console.log("Rollback da edição realizado com sucesso.");
            } catch (rollbackErr) {
              console.error("Erro no rollback da edição:", rollbackErr);
            }
          }

          toast({
            title: "Erro ao atualizar passageiro.",
            description: "As alterações foram desfeitas.",
            variant: "destructive",
          });
        }
      }

      // ----- NOVO PASSAGEIRO -----
      else {
        let asaasCustomer: any = null;
        let newPassageiro: any = null;
        let payment: any = null;

        try {
          // 1. Cria cliente no Asaas
          asaasCustomer = await asaasService.createCustomer(
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
          newPassageiro = insertedPassageiro;

          if (emitir_cobranca_mes_atual) {
            const currentDate = new Date();
            const mes = currentDate.getMonth() + 1;
            const ano = currentDate.getFullYear();
            const diaInformado = Number(pureData.dia_vencimento);
            const hoje = currentDate.getDate();
            const vencimentoAjustado =
              diaInformado < hoje ? hoje : diaInformado;
            const dataVencimento = new Date(ano, mes - 1, vencimentoAjustado);

            payment = await asaasService.createPayment(
              {
                customer: newPassageiro.asaas_customer_id,
                billingType: "UNDEFINED",
                value: moneyToNumber(pureData.valor_mensalidade),
                dueDate: dataVencimento.toISOString().split("T")[0],
                description: `Mensalidade ${mes}/${ano}`,
                externalReference: newPassageiro.id,
              },
              apiKey
            );

            const { error: cobrancaError } = await supabase
              .from("cobrancas")
              .insert([
                {
                  passageiro_id: newPassageiro.id,
                  mes,
                  ano,
                  valor: moneyToNumber(pureData.valor_mensalidade),
                  data_vencimento: dataVencimento.toISOString().split("T")[0],
                  status: "pendente",
                  usuario_id: localStorage.getItem("app_user_id"),
                  origem: "automatica",
                  asaas_payment_id: payment.id,
                  asaas_invoice_url: payment.invoiceUrl,
                  asaas_bankslip_url: payment.bankSlipUrl,
                },
              ]);

            if (cobrancaError) throw cobrancaError;
          }

          toast({ title: "Passageiro cadastrado com sucesso." });
        } catch (err) {
          console.error("Erro ao cadastrar passageiro:", err);

          // Rollback em cascata
          try {
            if (payment?.id)
              await asaasService.deletePayment(payment.id, apiKey);
            if (newPassageiro?.id)
              await supabase
                .from("passageiros")
                .delete()
                .eq("id", newPassageiro.id);
            if (asaasCustomer?.id)
              await asaasService.deleteCustomer(asaasCustomer.id, apiKey);
          } catch (rollbackErr) {
            console.error("Erro durante rollback:", rollbackErr);
          }

          toast({
            title: "Erro ao salvar passageiro.",
            description: "Todas as alterações foram desfeitas.",
            variant: "destructive",
          });
        }
      }

      await fetchPassageiros();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro geral:", error);
      toast({
        title: "Erro ao salvar passageiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    });
    setEditingPassageiro(null);
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Passageiros
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={handleCadastrarRapido}
              variant="destructive"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Rápido
            </Button>
            {/* Modal Passageiro */}
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
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingPassageiro
                      ? "Editar Passageiro"
                      : "Novo Passageiro"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="p-6">
                        {/* Passageiro Section */}
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">Passageiro</h3>
                        </div>
                        <div className="space-y-4">
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
                        </div>

                        <hr className="mt-8 mb-6 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

                        {/* Responsável Section */}
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">Responsável</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="nome_responsavel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome *</FormLabel>
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
                                        const maskedValue = phoneMask(
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
                        </div>

                        <hr className="mt-8 mb-6 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

                        {/* Mensalidade Section */}
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">Mensalidade</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
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
                                        const maskedValue = moneyMask(
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
                              name="dia_vencimento"
                              render={({ field }) => {
                                return (
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
                                );
                              }}
                            />
                          </div>
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

                            {(() => {
                              const diaInformado =
                                Number(form.getValues("dia_vencimento")) ||
                                null;

                              if (
                                !editingPassageiro &&
                                emitirCobranca &&
                                diaInformado &&
                                Number(diaInformado) < new Date().getDate()
                              ) {
                                return (
                                  <div className="mt-4">
                                    <p className="text-sm text-yellow-600">
                                      ⚠️ O dia escolhido já passou neste mês.
                                      <br />
                                      👉 A mensalidade deste mês <b>vence hoje</b>.
                                      <br />
                                      📅 A partir do próximo mês, o vencimento{" "}
                                      <b>será sempre no dia {diaInformado}</b>.
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}

                        <hr className="mt-8 mb-6 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

                        {/* Endereço Section */}
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">Endereço</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="rua"
                              render={({ field }) => (
                                <FormItem>
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
                                <FormItem>
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
                                <FormItem>
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
                                <FormItem>
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
                                <FormItem>
                                  <FormLabel>Estado</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o estado" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="AC">Acre</SelectItem>
                                      <SelectItem value="AL">
                                        Alagoas
                                      </SelectItem>
                                      <SelectItem value="AP">Amapá</SelectItem>
                                      <SelectItem value="AM">
                                        Amazonas
                                      </SelectItem>
                                      <SelectItem value="BA">Bahia</SelectItem>
                                      <SelectItem value="CE">Ceará</SelectItem>
                                      <SelectItem value="DF">
                                        Distrito Federal
                                      </SelectItem>
                                      <SelectItem value="ES">
                                        Espírito Santo
                                      </SelectItem>
                                      <SelectItem value="GO">Goiás</SelectItem>
                                      <SelectItem value="MA">
                                        Maranhão
                                      </SelectItem>
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
                                      <SelectItem value="PB">
                                        Paraíba
                                      </SelectItem>
                                      <SelectItem value="PR">Paraná</SelectItem>
                                      <SelectItem value="PE">
                                        Pernambuco
                                      </SelectItem>
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
                                      <SelectItem value="RO">
                                        Rondônia
                                      </SelectItem>
                                      <SelectItem value="RR">
                                        Roraima
                                      </SelectItem>
                                      <SelectItem value="SC">
                                        Santa Catarina
                                      </SelectItem>
                                      <SelectItem value="SP">
                                        São Paulo
                                      </SelectItem>
                                      <SelectItem value="SE">
                                        Sergipe
                                      </SelectItem>
                                      <SelectItem value="TO">
                                        Tocantins
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cep"
                              render={({ field }) => (
                                <FormItem>
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
                          </div>
                          <FormField
                            control={form.control}
                            name="referencia"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Referência</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-8 pt-4">
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
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading
                              ? "Salvando..."
                              : editingPassageiro
                              ? "Atualizar"
                              : "Cadastrar"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabela de Passageiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lista de Passageiros
              <span className="bg-foreground text-white text-sm px-2 py-0.5 rounded-full">
                {passageiros.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium mb-2 block"
                >
                  Nome
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Digite 2 caracteres ou mais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="status-filter"
                  className="text-sm font-medium mb-2 block"
                >
                  Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="escola-filter"
                  className="text-sm font-medium mb-2 block"
                >
                  Escola
                </Label>
                <Select
                  value={selectedEscola}
                  onValueChange={setSelectedEscola}
                >
                  <SelectTrigger>
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
              {loading || searching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  {searching ? "Buscando passageiros..." : "Carregando..."}
                </div>
              ) : passageiros.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm.length > 0 && searchTerm.length < 2
                    ? "Digite pelo menos 2 caracteres para buscar"
                    : searchTerm.length >= 2
                    ? "Nenhum passageiro encontrado com este nome"
                    : "Nenhum passageiro encontrado"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">
                          Nome
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Status
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Escola
                        </th>
                        <th className="text-center p-3 text-sm font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {passageiros.map((passageiro) => (
                        <tr
                          key={passageiro.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <span className="font-medium text-sm">
                              {passageiro.nome}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {passageiro.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {passageiro.escolas?.nome || "Não informada"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Carteirinha"
                                onClick={() => handleHistorico(passageiro)}
                                className="h-8 w-8 p-0"
                              >
                                <CreditCard className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Editar"
                                onClick={() => handleEdit(passageiro)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Excluir"
                                onClick={() => handleDeleteClick(passageiro.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
