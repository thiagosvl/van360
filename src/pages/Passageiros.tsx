import { useState, useEffect } from "react";
import { Plus, Pencil, Send, History, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { phoneMask, moneyMask, moneyToNumber, cepMask } from "@/utils/masks";
import PassageiroHistorico from "@/components/PassageiroHistorico";
import Navigation from "@/components/Navigation";

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
  dia_vencimento: number;
  escola_id?: string;
  created_at: string;
  updated_at: string;
}

interface Escola {
  id: string;
  nome: string;
  ativo: boolean;
}

interface Cobranca {
  id: string;
  passageiro_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: string;
}

export default function Passageiros() {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(null);
  const [selectedEscola, setSelectedEscola] = useState<string>("todas");
  const [expandedPassageiro, setExpandedPassageiro] = useState<string | null>(null);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [selectedPassageiroHistorico, setSelectedPassageiroHistorico] = useState<{ id: string; nome: string } | null>(null);
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
    dia_vencimento: 10,
    escola_id: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEscolas();
    fetchPassageiros();
    fetchCobrancas();
  }, []);

  useEffect(() => {
    fetchPassageiros();
  }, [selectedEscola]);

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

  const fetchPassageiros = async () => {
    try {
      let query = supabase
        .from("passageiros")
        .select(`
          *,
          escolas(nome)
        `)
        .order("nome");

      if (selectedEscola !== "todas") {
        query = query.eq("escola_id", selectedEscola);
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
    }
  };

  const fetchCobrancas = async () => {
    try {
      const currentDate = new Date();
      const { data, error } = await supabase
        .from("cobrancas")
        .select("*")
        .eq("mes", currentDate.getMonth() + 1)
        .eq("ano", currentDate.getFullYear());

      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar cobranças:", error);
    }
  };

  const getPassageiroStatus = (passageiroId: string) => {
    const cobranca = cobrancas.find(c => c.passageiro_id === passageiroId);
    if (!cobranca) return { status: "sem_cobranca", color: "bg-gray-100 text-gray-800" };
    
    if (cobranca.status === 'pago') {
      return { status: "pago", color: "bg-green-100 text-green-800" };
    }
    
    const vencimento = new Date(cobranca.data_vencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (vencimento < hoje) {
      return { status: "em_atraso", color: "bg-red-100 text-red-800" };
    }
    
    return { status: "pendente", color: "bg-yellow-100 text-yellow-800" };
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pago": return "Pago";
      case "em_atraso": return "Em atraso";
      case "pendente": return "Pendente";
      case "sem_cobranca": return "Sem cobrança";
      default: return "Desconhecido";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const passageiroData = {
        ...formData,
        valor_mensalidade: moneyToNumber(formData.valor_mensalidade),
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
          title: "Sucesso",
          description: "Passageiro atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("passageiros")
          .insert([passageiroData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Passageiro cadastrado com sucesso",
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
      telefone_responsavel: passageiro.telefone_responsavel,
      valor_mensalidade: moneyMask((passageiro.valor_mensalidade * 100).toString()),
      dia_vencimento: passageiro.dia_vencimento,
      escola_id: passageiro.escola_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleReenviarCobranca = async (passageiroId: string) => {
    try {
      const currentDate = new Date();
      const mes = currentDate.getMonth() + 1;
      const ano = currentDate.getFullYear();
      
      const passageiro = passageiros.find(p => p.id === passageiroId);
      if (!passageiro) return;

      const dataVencimento = new Date(ano, mes - 1, passageiro.dia_vencimento);
      
      const { error } = await supabase
        .from("cobrancas")
        .upsert({
          passageiro_id: passageiroId,
          mes,
          ano,
          valor: passageiro.valor_mensalidade,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'pendente',
          enviado_em: new Date().toISOString(),
        }, {
          onConflict: 'passageiro_id,mes,ano'
        });

      if (error) throw error;

      await fetchCobrancas();
      toast({
        title: "Sucesso",
        description: "Cobrança reenviada com sucesso para o responsável",
      });
    } catch (error) {
      console.error("Erro ao reenviar cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar cobrança",
        variant: "destructive",
      });
    }
  };

  const handleHistorico = (passageiro: Passageiro) => {
    setSelectedPassageiroHistorico({ id: passageiro.id, nome: passageiro.nome });
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
      dia_vencimento: 10,
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Passageiros</h1>
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
                    {editingPassageiro ? "Editar Passageiro" : "Novo Passageiro"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ESCOLA</h3>
                    <div>
                      <Label htmlFor="escola">Escola</Label>
                      <Select
                        value={formData.escola_id}
                        onValueChange={(value) => setFormData({ ...formData, escola_id: value })}
                      >
                        <SelectTrigger>
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">PASSAGEIRO</h3>
                    <div>
                      <Label htmlFor="nome">Nome do Passageiro *</Label>
                      <Input
                        id="nome"
                        required
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                      <Input
                        id="nome_responsavel"
                        required
                        value={formData.nome_responsavel}
                        onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone_responsavel">Telefone do Responsável *</Label>
                      <Input
                        id="telefone_responsavel"
                        required
                        value={formData.telefone_responsavel}
                        onChange={(e) => handleInputChange("telefone_responsavel", e.target.value)}
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ENDEREÇO DO PASSAGEIRO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rua">Rua</Label>
                        <Input
                          id="rua"
                          value={formData.rua}
                          onChange={(e) => handleInputChange("rua", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => handleInputChange("numero", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={formData.bairro}
                          onChange={(e) => handleInputChange("bairro", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={formData.cidade}
                          onChange={(e) => handleInputChange("cidade", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => handleInputChange("estado", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => handleInputChange("cep", e.target.value)}
                          maxLength={9}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="referencia">Referência (opcional)</Label>
                      <Textarea
                        id="referencia"
                        value={formData.referencia}
                        onChange={(e) => handleInputChange("referencia", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">MENSALIDADE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valor_mensalidade">Valor da Mensalidade *</Label>
                        <Input
                          id="valor_mensalidade"
                          required
                          value={formData.valor_mensalidade}
                          onChange={(e) => handleInputChange("valor_mensalidade", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dia_vencimento">Dia do Vencimento *</Label>
                        <select
                          id="dia_vencimento"
                          required
                          value={formData.dia_vencimento}
                          onChange={(e) => setFormData({ ...formData, dia_vencimento: Number(e.target.value) })}
                          className="w-full p-2 border border-input bg-background rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Salvando..." : editingPassageiro ? "Atualizar" : "Cadastrar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtro por escola */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div>
                <Label htmlFor="escola-filter" className="text-sm font-medium">
                  Filtrar por Escola
                </Label>
                <Select value={selectedEscola} onValueChange={setSelectedEscola}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
            </CardContent>
          </Card>

          {/* Lista de passageiros */}
          <div className="space-y-3">
            {passageiros.map((passageiro) => {
              const status = getPassageiroStatus(passageiro.id);
              const isExpanded = expandedPassageiro === passageiro.id;

              return (
                <Card key={passageiro.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Linha principal - sempre visível */}
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedPassageiro(isExpanded ? null : passageiro.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{passageiro.nome}</h3>
                              <p className="text-sm text-muted-foreground">
                                {passageiro.nome_responsavel}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                              {getStatusText(status.status)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20 p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Telefone:</strong> {passageiro.telefone_responsavel}
                          </div>
                          <div>
                            <strong>Mensalidade:</strong> {passageiro.valor_mensalidade.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </div>
                          <div>
                            <strong>Vencimento:</strong> Dia {passageiro.dia_vencimento}
                          </div>
                          {passageiro.escola_id && (
                            <div>
                              <strong>Escola:</strong> {(passageiro as any).escolas?.nome || 'N/A'}
                            </div>
                          )}
                        </div>
                        
                        {(passageiro.rua || passageiro.endereco) && (
                          <div className="text-sm">
                            <strong>Endereço:</strong>
                            <div className="text-muted-foreground">
                              {passageiro.rua ? (
                                <>
                                  {passageiro.rua}
                                  {passageiro.numero && `, ${passageiro.numero}`}
                                  {passageiro.bairro && ` - ${passageiro.bairro}`}
                                  {passageiro.cidade && passageiro.estado && (
                                    <br />
                                  )}
                                  {passageiro.cidade && `${passageiro.cidade}`}
                                  {passageiro.estado && ` - ${passageiro.estado}`}
                                  {passageiro.cep && (
                                    <br />
                                  )}
                                  {passageiro.cep && `CEP: ${passageiro.cep}`}
                                </>
                              ) : (
                                passageiro.endereco
                              )}
                              {passageiro.referencia && (
                                <>
                                  <br />
                                  <span className="text-xs">Ref: {passageiro.referencia}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(passageiro);
                            }}
                            className="gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReenviarCobranca(passageiro.id);
                            }}
                            className="gap-1"
                          >
                            <Send className="h-3 w-3" />
                            Reenviar Cobrança
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHistorico(passageiro);
                            }}
                            className="gap-1"
                          >
                            <History className="h-3 w-3" />
                            Histórico
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {passageiros.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {selectedEscola === "todas" 
                ? "Nenhum passageiro cadastrado" 
                : "Nenhum passageiro encontrado para esta escola"
              }
            </div>
          )}

          {/* Modal de histórico */}
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