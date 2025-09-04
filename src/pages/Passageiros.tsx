import Navigation from "@/components/Navigation";
import PassageiroHistorico from "@/components/PassageiroHistorico";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DollarSign,
  Filter,
  GraduationCap,
  History,
  MapPin,
  Pencil,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [selectedPassageiroHistorico, setSelectedPassageiroHistorico] =
    useState<{ id: string; nome: string } | null>(null);
  const [formData, setFormData] = useState({
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
    escola_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const passageiroData = {
        ...formData,
        valor_mensalidade: moneyToNumber(formData.valor_mensalidade),
        dia_vencimento: Number(formData.dia_vencimento),
        endereco: `${formData.rua}, ${formData.numero}`, // Manter compatibilidade
        escola_id: formData.escola_id || null,
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

        // Criar cobrança do mês atual automaticamente
        const currentDate = new Date();
        const mes = currentDate.getMonth() + 1;
        const ano = currentDate.getFullYear();
        const dataVencimento = new Date(
          ano,
          mes - 1,
          Number(formData.dia_vencimento)
        );

        await supabase.from("cobrancas").insert({
          passageiro_id: newPassageiro.id,
          mes,
          ano,
          valor: moneyToNumber(formData.valor_mensalidade),
          data_vencimento: dataVencimento.toISOString().split("T")[0],
          status: "pendente",
        });

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
    setFormData({
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
    setSelectedPassageiroHistorico({
      id: passageiro.id,
      nome: passageiro.nome,
    });
    setHistoricoOpen(true);
  };

  const resetForm = () => {
    setFormData({
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
      escola_id: "",
    });
    setEditingPassageiro(null);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "telefone_responsavel") {
      value = phoneMask(value);
    } else if (field === "valor_mensalidade") {
      value = moneyMask(value);
    } else if (field === "cep") {
      value = cepMask(value);
    }
    setFormData({ ...formData, [field]: value });
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPassageiro
                      ? "Editar Passageiro"
                      : "Novo Passageiro"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Escola Section */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Escola</h3>
                      </div>
                      <div>
                        <Label htmlFor="escola">Escola</Label>
                        <Select
                          value={formData.escola_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, escola_id: value })
                          }
                        >
                          <SelectTrigger autoFocus={false}>
                            <SelectValue placeholder="Selecione uma escola" />
                          </SelectTrigger>
                          <SelectContent>
                            {escolas.map((escola) => (
                              <SelectItem key={escola.id} value={escola.id}>
                                {escola.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Passageiro Section */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Informações do Passageiro
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome do Passageiro *</Label>
                          <Input
                            id="nome"
                            required
                            value={formData.nome}
                            onChange={(e) =>
                              handleInputChange("nome", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="nome_responsavel">
                            Nome do Responsável *
                          </Label>
                          <Input
                            id="nome_responsavel"
                            required
                            value={formData.nome_responsavel}
                            onChange={(e) =>
                              handleInputChange(
                                "nome_responsavel",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefone_responsavel">
                            Telefone do Responsável *
                          </Label>
                          <Input
                            id="telefone_responsavel"
                            required
                            value={formData.telefone_responsavel}
                            onChange={(e) =>
                              handleInputChange(
                                "telefone_responsavel",
                                e.target.value
                              )
                            }
                            maxLength={15}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Endereço Section */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Endereço</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rua">Rua</Label>
                            <Input
                              id="rua"
                              value={formData.rua}
                              onChange={(e) =>
                                handleInputChange("rua", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="numero">Número</Label>
                            <Input
                              id="numero"
                              value={formData.numero}
                              onChange={(e) =>
                                handleInputChange("numero", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                              id="bairro"
                              value={formData.bairro}
                              onChange={(e) =>
                                handleInputChange("bairro", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              value={formData.cidade}
                              onChange={(e) =>
                                handleInputChange("cidade", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="estado">Estado</Label>
                            <Select
                              value={formData.estado}
                              onValueChange={(value) =>
                                handleInputChange("estado", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
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
                          </div>
                          <div>
                            <Label htmlFor="cep">CEP</Label>
                            <Input
                              id="cep"
                              value={formData.cep}
                              onChange={(e) =>
                                handleInputChange("cep", e.target.value)
                              }
                              maxLength={9}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="referencia">
                            Referência (opcional)
                          </Label>
                          <Textarea
                            id="referencia"
                            value={formData.referencia}
                            onChange={(e) =>
                              handleInputChange("referencia", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mensalidade Section */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Mensalidade</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="valor_mensalidade">
                            Valor da Mensalidade *
                          </Label>
                          <Input
                            id="valor_mensalidade"
                            required
                            value={formData.valor_mensalidade}
                            onChange={(e) =>
                              handleInputChange(
                                "valor_mensalidade",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="dia_vencimento">
                            Dia do Vencimento *
                          </Label>
                          <select
                            id="dia_vencimento"
                            required
                            value={formData.dia_vencimento}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dia_vencimento: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-input bg-background rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="" disabled>
                              Selecione o dia
                            </option>
                            {Array.from({ length: 28 }, (_, i) => i + 1).map(
                              (day) => (
                                <option key={day} value={day}>
                                  Dia {day}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading
                        ? "Salvando..."
                        : editingPassageiro
                        ? "Atualizar"
                        : "Cadastrar"}
                    </Button>
                  </div>
                </form>
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
                  {passageiros.length} passageiros
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
                                <History className="w-3 h-3" />
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

          {/* Modal de Histórico */}
          {selectedPassageiroHistorico && (
            <PassageiroHistorico
              passageiroId={selectedPassageiroHistorico.id}
              passageiroNome={selectedPassageiroHistorico.nome}
              isOpen={historicoOpen}
              onClose={() => {
                setHistoricoOpen(false);
                setSelectedPassageiroHistorico(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
