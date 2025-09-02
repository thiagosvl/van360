import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Phone, MapPin, DollarSign, Calendar, CreditCard, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";
import { phoneMask, moneyMask, moneyToNumber, cepMask } from "@/utils/masks";

const passageiroSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  nome_responsavel: z.string().min(2, "Nome do responsável deve ter pelo menos 2 caracteres"),
  telefone_responsavel: z.string().min(14, "Telefone deve estar no formato (11) 99999-9999"),
  rua: z.string().min(3, "Rua deve ter pelo menos 3 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  cep: z.string().min(9, "CEP deve estar no formato 99999-999"),
  referencia: z.string().optional(),
  valor_mensalidade: z.number().min(0.01, "Valor deve ser maior que zero"),
  dia_vencimento: z.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31"),
});

type PassageiroFormData = z.infer<typeof passageiroSchema>;

interface Passageiro {
  id: string;
  nome: string;
  endereco?: string; // Manter para compatibilidade
  nome_responsavel: string;
  telefone_responsavel: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
  valor_mensalidade: number;
  dia_vencimento: number;
}

interface Cobranca {
  id: string;
  aluno_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: string;
}

const Passageiros = () => {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(null);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(null);
  const [paymentType, setPaymentType] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<PassageiroFormData>({
    resolver: zodResolver(passageiroSchema),
    defaultValues: {
      nome: "",
      nome_responsavel: "",
      telefone_responsavel: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      valor_mensalidade: 0,
      dia_vencimento: 5,
    },
  });

  const fetchPassageiros = async () => {
    try {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setPassageiros(data || []);
    } catch (error) {
      console.error("Erro ao buscar passageiros:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de passageiros",
        variant: "destructive",
      });
    }
  };

  const fetchCobrancas = async () => {
    try {
      const { data, error } = await supabase
        .from("cobrancas")
        .select("*")
        .in("status", ["pendente", "atrasado"])
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar cobranças:", error);
    }
  };

  const handleSubmit = async (data: PassageiroFormData) => {
    try {
      const formattedData = {
        ...data,
        valor_mensalidade: typeof data.valor_mensalidade === 'string' 
          ? moneyToNumber(data.valor_mensalidade) 
          : data.valor_mensalidade,
        telefone_responsavel: data.telefone_responsavel.replace(/\D/g, ''),
        cep: data.cep.replace(/\D/g, ''),
      };

      if (editingPassageiro) {
        const { error } = await supabase
          .from("alunos")
          .update(formattedData)
          .eq("id", editingPassageiro.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Passageiro atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("alunos")
          .insert([formattedData as any]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Passageiro cadastrado com sucesso",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingPassageiro(null);
      fetchPassageiros();
    } catch (error) {
      console.error("Erro ao salvar passageiro:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar passageiro",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (passageiro: Passageiro) => {
    setEditingPassageiro(passageiro);
    form.reset({
      nome: passageiro.nome,
      nome_responsavel: passageiro.nome_responsavel,
      telefone_responsavel: phoneMask(passageiro.telefone_responsavel),
      rua: passageiro.rua || "",
      numero: passageiro.numero || "",
      bairro: passageiro.bairro || "",
      cidade: passageiro.cidade || "",
      estado: passageiro.estado || "",
      cep: passageiro.cep ? cepMask(passageiro.cep) : "",
      referencia: passageiro.referencia || "",
      valor_mensalidade: passageiro.valor_mensalidade,
      dia_vencimento: passageiro.dia_vencimento,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (passageiroId: string, nomePassageiro: string) => {
    try {
      const { count } = await supabase
        .from("cobrancas")
        .select("*", { count: "exact", head: true })
        .eq("aluno_id", passageiroId);

      if (count && count > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Este passageiro possui cobranças geradas. Não é possível excluir.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("alunos")
        .delete()
        .eq("id", passageiroId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${nomePassageiro} foi excluído com sucesso`,
      });

      fetchPassageiros();
    } catch (error) {
      console.error("Erro ao excluir passageiro:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir passageiro",
        variant: "destructive",
      });
    }
  };

  const reenviarCobranca = async (passageiro: Passageiro) => {
    try {
      const agora = new Date();
      const mes = agora.getMonth() + 1;
      const ano = agora.getFullYear();
      
      const dataVencimento = new Date(ano, mes - 1, passageiro.dia_vencimento);
      
      // Verificar se já existe cobrança para este mês
      const { data: existingCobranca } = await supabase
        .from("cobrancas")
        .select("*")
        .eq("aluno_id", passageiro.id)
        .eq("mes", mes)
        .eq("ano", ano)
        .single();

      if (existingCobranca) {
        // Atualizar a cobrança existente
        await supabase
          .from("cobrancas")
          .update({ enviado_em: new Date().toISOString() })
          .eq("id", existingCobranca.id);
      } else {
        // Criar nova cobrança
        await supabase
          .from("cobrancas")
          .insert([{
            aluno_id: passageiro.id,
            mes,
            ano,
            valor: passageiro.valor_mensalidade,
            status: "pendente",
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            enviado_em: new Date().toISOString(),
          }]);
      }

      toast({
        title: "Cobrança reenviada com sucesso para o responsável",
      });
      
      fetchCobrancas();
    } catch (error) {
      console.error("Erro ao reenviar cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar cobrança",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setIsPaymentDialogOpen(true);
  };

  const confirmPayment = async () => {
    if (!selectedCobranca || !paymentType) return;

    try {
      const { error } = await supabase
        .from("cobrancas")
        .update({
          status: "em_dia",
          data_pagamento: new Date().toISOString().split('T')[0],
          tipo_pagamento: paymentType,
        })
        .eq("id", selectedCobranca.id);

      if (error) throw error;

      toast({
        title: "Pagamento registrado",
        description: `Pagamento via ${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} confirmado`,
      });

      setIsPaymentDialogOpen(false);
      setSelectedCobranca(null);
      setPaymentType("");
      fetchCobrancas();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPassageiro(null);
    form.reset();
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedCobranca(null);
    setPaymentType("");
  };

  const formatEnderecoCompleto = (passageiro: Passageiro): string => {
    if (passageiro.rua) {
      const partes = [
        passageiro.rua,
        passageiro.numero,
        passageiro.bairro,
        passageiro.cidade,
        passageiro.estado,
      ].filter(Boolean);
      return partes.join(', ');
    }
    return passageiro.endereco || '';
  };

  useEffect(() => {
    fetchPassageiros();
    fetchCobrancas();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Passageiros</h1>
            <p className="text-muted-foreground">Gerencie seus passageiros e responsáveis</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Passageiro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPassageiro ? "Editar Passageiro" : "Novo Passageiro"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* PASSAGEIRO */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">PASSAGEIRO</h3>
                    
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Passageiro</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome do passageiro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome do responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* ENDEREÇO DO PASSAGEIRO */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">ENDEREÇO DO PASSAGEIRO</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="rua"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Rua</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da rua" {...field} />
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
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do bairro" {...field} />
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
                              <Input placeholder="Nome da cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" {...field} />
                            </FormControl>
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
                                placeholder="99999-999" 
                                {...field}
                                onChange={(e) => field.onChange(cepMask(e.target.value))}
                                maxLength={9}
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
                          <FormLabel>Referência (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Próximo ao mercado..." {...field} />
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
                          <FormLabel>Telefone do Responsável</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(11) 99999-9999" 
                              {...field}
                              onChange={(e) => field.onChange(phoneMask(e.target.value))}
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* MENSALIDADE */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">MENSALIDADE</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="valor_mensalidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="R$ 0,00"
                                {...field}
                                onChange={(e) => {
                                  const masked = moneyMask(e.target.value);
                                  field.onChange(moneyToNumber(masked));
                                }}
                                value={field.value ? moneyMask(field.value.toString()) : ''}
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
                            <FormLabel>Dia do Vencimento</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="31" 
                                placeholder="5"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={closeDialog} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingPassageiro ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Passageiros */}
        <div className="grid gap-4 sm:gap-6">
          {passageiros.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  Nenhum passageiro cadastrado ainda.
                  <br />
                  Clique em "Novo Passageiro" para começar.
                </div>
              </CardContent>
            </Card>
          ) : (
            passageiros.map((passageiro) => (
              <Card key={passageiro.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <CardTitle className="text-lg">{passageiro.nome}</CardTitle>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reenviarCobranca(passageiro)}
                        className="flex-1 sm:flex-none"
                      >
                        Reenviar Cobrança
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(passageiro)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(passageiro.id, passageiro.nome)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="break-all">{formatEnderecoCompleto(passageiro)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{phoneMask(passageiro.telefone_responsavel)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>R$ {passageiro.valor_mensalidade.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Vence dia {passageiro.dia_vencimento}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Responsável:</strong> {passageiro.nome_responsavel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Cobranças Pendentes/Atrasadas */}
        {cobrancas.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Cobranças Pendentes/Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cobrancas.map((cobranca) => {
                  const passageiro = passageiros.find(p => p.id === cobranca.aluno_id);
                  if (!passageiro) return null;
                  
                  return (
                    <div
                      key={cobranca.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{passageiro.nome}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {passageiro.nome_responsavel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Venc: {new Date(cobranca.data_vencimento).toLocaleDateString()} - 
                          <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                            cobranca.status === 'atrasado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cobranca.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="font-medium">R$ {Number(cobranca.valor).toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handlePayment(cobranca)}
                          className="w-full sm:w-auto"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Pago
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
         )}
        </div>
      </div>

      {/* Dialog de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          
          {selectedCobranca && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  Valor: R$ {Number(selectedCobranca.valor).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencimento: {new Date(selectedCobranca.data_vencimento).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Tipo de Pagamento</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closePaymentDialog} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmPayment}
                  disabled={!paymentType}
                  className="flex-1"
                >
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Passageiros;