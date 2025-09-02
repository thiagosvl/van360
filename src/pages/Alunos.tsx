import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Phone, MapPin, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";

const alunoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  nome_responsavel: z.string().min(2, "Nome do responsável deve ter pelo menos 2 caracteres"),
  telefone_responsavel: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  valor_mensalidade: z.number().min(0.01, "Valor deve ser maior que zero"),
  dia_vencimento: z.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31"),
});

type AlunoFormData = z.infer<typeof alunoSchema>;

interface Aluno {
  id: string;
  nome: string;
  endereco: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  valor_mensalidade: number;
  dia_vencimento: number;
}

const Alunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const { toast } = useToast();

  const form = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      nome: "",
      endereco: "",
      nome_responsavel: "",
      telefone_responsavel: "",
      valor_mensalidade: 0,
      dia_vencimento: 5,
    },
  });

  const fetchAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de alunos",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: AlunoFormData) => {
    try {
      if (editingAluno) {
        const { error } = await supabase
          .from("alunos")
          .update(data)
          .eq("id", editingAluno.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("alunos")
          .insert([data as any]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Aluno cadastrado com sucesso",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingAluno(null);
      fetchAlunos();
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar aluno",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    form.reset({
      nome: aluno.nome,
      endereco: aluno.endereco,
      nome_responsavel: aluno.nome_responsavel,
      telefone_responsavel: aluno.telefone_responsavel,
      valor_mensalidade: aluno.valor_mensalidade,
      dia_vencimento: aluno.dia_vencimento,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (alunoId: string, nomeAluno: string) => {
    // Verificar se existem cobranças para este aluno
    try {
      const { count } = await supabase
        .from("cobrancas")
        .select("*", { count: "exact", head: true })
        .eq("aluno_id", alunoId);

      if (count && count > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Este aluno possui cobranças geradas. Não é possível excluir.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("alunos")
        .delete()
        .eq("id", alunoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${nomeAluno} foi excluído com sucesso`,
      });

      fetchAlunos();
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir aluno",
        variant: "destructive",
      });
    }
  };

  const gerarCobranca = async (aluno: Aluno) => {
    try {
      const agora = new Date();
      const mes = agora.getMonth() + 1;
      const ano = agora.getFullYear();
      
      // Criar data de vencimento
      const dataVencimento = new Date(ano, mes - 1, aluno.dia_vencimento);
      
      // Verificar se já existe cobrança para este mês
      const { count } = await supabase
        .from("cobrancas")
        .select("*", { count: "exact", head: true })
        .eq("aluno_id", aluno.id)
        .eq("mes", mes)
        .eq("ano", ano);

      if (count && count > 0) {
        toast({
          title: "Cobrança já existe",
          description: "Já existe uma cobrança para este aluno neste mês",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("cobrancas")
        .insert([{
          aluno_id: aluno.id,
          mes,
          ano,
          valor: aluno.valor_mensalidade,
          status: "pendente",
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          enviado_em: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: "Cobrança enviada com sucesso",
        description: `Cobrança enviada para o responsável de ${aluno.nome}`,
      });
    } catch (error) {
      console.error("Erro ao gerar cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar cobrança",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAluno(null);
    form.reset();
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Alunos</h1>
            <p className="text-muted-foreground">Gerencie seus alunos e responsáveis</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAluno ? "Editar Aluno" : "Novo Aluno"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Aluno</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome do aluno" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o endereço completo" {...field} />
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
                  
                  <FormField
                    control={form.control}
                    name="telefone_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone do Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_mensalidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mensalidade (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                          <FormLabel>Dia Vencimento</FormLabel>
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
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={closeDialog} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingAluno ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Alunos */}
        <div className="grid gap-4 sm:gap-6">
          {alunos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  Nenhum aluno cadastrado ainda.
                  <br />
                  Clique em "Novo Aluno" para começar.
                </div>
              </CardContent>
            </Card>
          ) : (
            alunos.map((aluno) => (
              <Card key={aluno.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => gerarCobranca(aluno)}
                        className="flex-1 sm:flex-none"
                      >
                        Enviar Cobrança
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(aluno)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(aluno.id, aluno.nome)}
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
                        <span className="break-all">{aluno.endereco}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{aluno.telefone_responsavel}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>R$ {aluno.valor_mensalidade.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Vence dia {aluno.dia_vencimento}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Responsável:</strong> {aluno.nome_responsavel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Alunos;