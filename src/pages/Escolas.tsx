import ConfirmationDialog from "@/components/ConfirmationDialog";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cepMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Escola {
  id: string;
  nome: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const escolaSchema = z.object({
  nome: z.string().min(1, "Nome da escola é obrigatório"),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  referencia: z.string().optional(),
});

type EscolaFormData = z.infer<typeof escolaSchema>;

export default function Escolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [schoolToDelete, setSchoolToDelete] = useState<Escola | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<EscolaFormData>({
    resolver: zodResolver(escolaSchema),
    defaultValues: {
      nome: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
    },
  });

  useEffect(() => {
    fetchEscolas();
  }, []);

  const fetchEscolas = async () => {
    setLoadingPage(true);
    try {
      const { data, error } = await supabase
        .from("escolas")
        .select("*")
        .order("nome");

      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar escolas",
        variant: "destructive",
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSubmit = async (data: EscolaFormData) => {
    setLoading(true);

    try {
      if (editingEscola) {
        const { error } = await supabase
          .from("escolas")
          .update(data)
          .eq("id", editingEscola.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Escola atualizada com sucesso",
        });
      } else {
        const { error } = await supabase.from("escolas").insert([data]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Escola cadastrada com sucesso",
        });
      }

      await fetchEscolas();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar escola:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar escola",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (escola: Escola) => {
    setEditingEscola(escola);
    form.reset({
      nome: escola.nome,
      rua: escola.rua || "",
      numero: escola.numero || "",
      bairro: escola.bairro || "",
      cidade: escola.cidade || "",
      estado: escola.estado || "",
      cep: escola.cep || "",
      referencia: escola.referencia || "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleAtivo = async (escola: Escola) => {
    try {
      if (escola.ativo) {
        // Verificar se há passageiros vinculados
        const { data: passageiros } = await supabase
          .from("passageiros")
          .select("id")
          .eq("escola_id", escola.id);

        if (passageiros && passageiros.length > 0) {
          toast({
            title: "Aviso",
            description:
              "Não é possível desativar escola com passageiros vinculados",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("escolas")
        .update({ ativo: !escola.ativo })
        .eq("id", escola.id);

      if (error) throw error;

      await fetchEscolas();
      toast({
        title: "Sucesso",
        description: escola.ativo ? "Escola desativada" : "Escola ativada",
      });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da escola",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (escola: Escola) => {
    setSchoolToDelete(escola);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!schoolToDelete) return;

    try {
      // Verificar se há passageiros vinculados
      const { data: passageiros } = await supabase
        .from("passageiros")
        .select("id")
        .eq("escola_id", schoolToDelete.id);

      if (passageiros && passageiros.length > 0) {
        toast({
          title: "Erro",
          description:
            "Não é possível excluir escola com passageiros vinculados",
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setSchoolToDelete(null);
        return;
      }

      const { error } = await supabase
        .from("escolas")
        .delete()
        .eq("id", schoolToDelete.id);

      if (error) throw error;

      await fetchEscolas();
      toast({
        title: "Sucesso",
        description: "Escola excluída permanentemente",
      });
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir escola:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir escola",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
    }
  };

  const resetForm = () => {
    form.reset({
      nome: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
    });
    setEditingEscola(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Escolas
              </h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Escola
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingEscola ? "Editar Escola" : "Nova Escola"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Dados da Escola Section */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Building2 className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">
                            Dados da Escola
                          </h3>
                        </div>
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Escola *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o estado" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="AC">Acre</SelectItem>
                                      <SelectItem value="AL">Alagoas</SelectItem>
                                      <SelectItem value="AP">Amapá</SelectItem>
                                      <SelectItem value="AM">Amazonas</SelectItem>
                                      <SelectItem value="BA">Bahia</SelectItem>
                                      <SelectItem value="CE">Ceará</SelectItem>
                                      <SelectItem value="DF">Distrito Federal</SelectItem>
                                      <SelectItem value="ES">Espírito Santo</SelectItem>
                                      <SelectItem value="GO">Goiás</SelectItem>
                                      <SelectItem value="MA">Maranhão</SelectItem>
                                      <SelectItem value="MT">Mato Grosso</SelectItem>
                                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                      <SelectItem value="MG">Minas Gerais</SelectItem>
                                      <SelectItem value="PA">Pará</SelectItem>
                                      <SelectItem value="PB">Paraíba</SelectItem>
                                      <SelectItem value="PR">Paraná</SelectItem>
                                      <SelectItem value="PE">Pernambuco</SelectItem>
                                      <SelectItem value="PI">Piauí</SelectItem>
                                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
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
                              name="cep"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CEP</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      maxLength={9}
                                      onChange={(e) => {
                                        const maskedValue = cepMask(e.target.value);
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
                              : editingEscola
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lista de Escolas
                <span className="bg-foreground text-white text-sm px-2 py-0.5 rounded-full">
                  {escolas.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPage ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Carregando...
                </div>
              ) : escolas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma escola cadastrada
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
                        <th className="text-center p-3 text-sm font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {escolas.map((escola) => (
                        <tr
                          key={escola.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <span className="font-medium text-sm">
                              {escola.nome}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                escola.ativo
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {escola.ativo ? "Ativa" : "Inativa"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Editar"
                                onClick={() => handleEdit(escola)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                title={escola.ativo ? "Desativar" : "Reativar"}
                                variant={escola.ativo ? "outline" : "outline"}
                                onClick={() => handleToggleAtivo(escola)}
                              >
                                {escola.ativo ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              {!escola.ativo && (
                                <Button
                                  size="sm"
                                  title="Remover"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(escola)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

          <ConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Confirmar exclusão"
            description="Deseja excluir permanentemente esta escola? Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            confirmText="Confirmar"
            cancelText="Cancelar"
            variant="destructive"
          />
        </div>
      </div>
    </div>
  );
}
