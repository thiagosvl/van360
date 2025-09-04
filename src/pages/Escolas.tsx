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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cepMask } from "@/utils/masks";
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

export default function Escolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    referencia: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [schoolToDelete, setSchoolToDelete] = useState<Escola | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEscola) {
        const { error } = await supabase
          .from("escolas")
          .update(formData)
          .eq("id", editingEscola.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Escola atualizada com sucesso",
        });
      } else {
        const { error } = await supabase.from("escolas").insert([formData]);

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
    setFormData({
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
    setFormData({
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

  const handleInputChange = (field: string, value: string) => {
    if (field === "cep") {
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados da Escola Section */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Dados da Escola
                        </h3>
                      </div>
                      <div>
                        <Label htmlFor="nome">Nome da Escola *</Label>
                        <Input
                          id="nome"
                          required
                          value={formData.nome}
                          onChange={(e) =>
                            handleInputChange("nome", e.target.value)
                          }
                        />
                      </div>

                      <hr className="mt-8 mb-6 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />

                      {/* Endereço Section */}
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
                            <Input
                              id="estado"
                              value={formData.estado}
                              onChange={(e) =>
                                handleInputChange("estado", e.target.value)
                              }
                            />
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
