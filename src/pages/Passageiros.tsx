import Navigation from "@/components/Navigation";
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
import { supabase } from "@/integrations/supabase/client";
import { cepMask, moneyMask, moneyToNumber, phoneMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  DollarSign,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Search,
  User
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

interface Passageiro {
  id: string;
  nome: string;
  endereco: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  valor_mensalidade: number;
  dia_vencimento: number | string;
  escola_id?: string;
  created_at: string;
  updated_at: string;
  escolas?: { nome: string };
}

interface Escola {
  id: string;
  nome: string;
  ativo: boolean;
}

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
});

type PassageiroFormData = z.infer<typeof passageiroSchema>;

export default function Passageiros() {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(
    null
  );
  const [selectedEscola, setSelectedEscola] = useState<string>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPassageiro, setExpandedPassageiro] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      telefone_responsavel: "",
      valor_mensalidade: "",
      dia_vencimento: "",
      emitir_cobranca_mes_atual: false,
    },
  });

  // Debounce para busca
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
  }, [selectedEscola, searchTerm]);

  const fetchEscolas = async () => {
    try {
      const { data, error } = await supabase
        .from("escolas")
        .select("id, nome, ativo")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    }
  };

  const fetchPassageiros = async (search = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("passageiros")
        .select(`*, escolas(nome)`)
        .order("nome");

      if (selectedEscola !== "todas") {
        query = query.eq("escola_id", selectedEscola);
      }

      if (search.length >= 2) {
        query = query.ilike("nome", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPassageiros(data || []);
    } catch (error) {
      console.error("Erro ao buscar passageiros:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar passageiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSubmit = async (data: PassageiroFormData) => {
    setLoading(true);

    try {
      const passageiroData = {
        ...data,
        valor_mensalidade: moneyToNumber(data.valor_mensalidade),
        dia_vencimento: Number(data.dia_vencimento),
        endereco: `${data.rua}, ${data.numero}`, // Manter compatibilidade
        escola_id: data.escola_id || null,
      };

      if (editingPassageiro) {
        const { error } = await supabase
          .from("passageiros")
          .update(passageiroData)
          .eq("id", editingPassageiro.id);

        if (error) throw error;

        toast({
          title: "Passageiro atualizado com sucesso",
        });
      } else {
        const { data: newPassageiro, error } = await supabase
          .from("passageiros")
          .insert([passageiroData])
          .select()
          .single();

        if (error) throw error;

        // Criar cobrança do mês atual apenas se checkbox estiver marcado
        if (data.emitir_cobranca_mes_atual) {
          const currentDate = new Date();
          const mes = currentDate.getMonth() + 1;
          const ano = currentDate.getFullYear();
          const dataVencimento = new Date(
            ano,
            mes - 1,
            Number(data.dia_vencimento)
          );

          await supabase.from("cobrancas").insert({
            passageiro_id: newPassageiro.id,
            mes,
            ano,
            valor: moneyToNumber(data.valor_mensalidade),
            data_vencimento: dataVencimento.toISOString().split("T")[0],
            status: "pendente",
          });
        }

        toast({
          title: "Passageiro cadastrado com sucesso",
        });
      }

      await fetchPassageiros();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar passageiro:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar passageiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (passageiro: Passageiro) => {
    setEditingPassageiro(passageiro);
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
      valor_mensalidade: moneyMask(
        (passageiro.valor_mensalidade * 100).toString()
      ),
      dia_vencimento: passageiro.dia_vencimento.toString(),
      escola_id: passageiro.escola_id || "",
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
      telefone_responsavel: "",
      valor_mensalidade: "",
      dia_vencimento: "",
      emitir_cobranca_mes_atual: false,
    });
    setEditingPassageiro(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Passageiros
            </h1>

            {/* Modal Passageiro */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Passageiro
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
                          <h3 className="text-lg font-semibold">Informações</h3>
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
                          </div>

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
                              name="telefone_responsavel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Telefone do Responsável *
                                  </FormLabel>
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
                          </div>
                        </div>

                        <hr className="mt-8 mb-6 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

                        {/* Mensalidade Section */}
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">Mensalidade</h3>
                        </div>
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

                        {/* Checkbox para emitir cobrança apenas no cadastro */}
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
                                      Emitir cobrança para o mês atual
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
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
                                  <FormLabel>Rua</FormLabel>
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

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
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
              </div>
            </CardContent>
          </Card>

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
                              {passageiro.escolas?.nome || "Não informada"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Editar"
                                onClick={() => handleEdit(passageiro)}
                                className="gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Carteirinha"
                                onClick={() => handleHistorico(passageiro)}
                                className="gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
