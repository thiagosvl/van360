import ConfirmationDialog from "@/components/ConfirmationDialog";
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
import { Escola } from "@/types/escola";
import { cepMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const escolaSchema = z.object({
  nome: z.string().min(1, "Campo obrigatório"),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  referencia: z.string().optional(),
  ativo: z.boolean().optional(),
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
      ativo: true,
    },
  });

  useEffect(() => {
    fetchEscolas();
  }, []);

  const fetchEscolas = async () => {
    setLoadingPage(true);
    try {
      let query = supabase.from("escolas").select("*").order("nome");

      const { data, error } = await query;

      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSubmit = async (data: EscolaFormData) => {
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast({
          title: "Erro de autenticação.",
          description: "Não foi possível obter os dados do usuário logado.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (editingEscola) {
        if (editingEscola.ativo && data.ativo === false) {
          const { data: passageirosAtivos, error: checkError } = await supabase
            .from("passageiros")
            .select("id")
            .eq("escola_id", editingEscola.id)
            .eq("ativo", true);

          if (checkError) throw checkError;

          if (passageirosAtivos && passageirosAtivos.length > 0) {
            toast({
              title: "Não é possível desativar.",
              description:
                'Existem passageiros ativos vinculados a esta escola. Mantenha a opção "Ativa" marcada.',
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }

        const { error } = await supabase
          .from("escolas")
          .update({ ...data, ativo: data.ativo ?? true })
          .eq("id", editingEscola.id);

        if (error) throw error;

        toast({
          title: "Escola atualizada com sucesso.",
        });
      } else {
        const authUid = session.user.id;

        const { data: usuario, error: usuarioError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("auth_uid", authUid)
          .single();

        if (usuarioError || !usuario) {
          toast({
            title: "Usuário não encontrado no sistema",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.from("escolas").insert([
          {
            nome: data.nome,
            rua: data.rua || null,
            numero: data.numero || null,
            bairro: data.bairro || null,
            cidade: data.cidade || null,
            estado: data.estado || null,
            cep: data.cep || null,
            referencia: data.referencia || null,
            ativo: true,
            usuario_id: usuario.id,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Escola cadastrada com sucesso.",
        });
      }

      await fetchEscolas();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar escola:", error);
      toast({
        title: "Erro ao salvar escola.",
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
      ativo: escola.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (escola: Escola) => {
    setSchoolToDelete(escola);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!schoolToDelete) return;

    try {
      const { data: passageiros } = await supabase
        .from("passageiros")
        .select("id")
        .eq("escola_id", schoolToDelete.id);

      if (passageiros && passageiros.length > 0) {
        toast({
          title: "Não é possível excluir escola com passageiros vinculados.",
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
        title: "Escola excluída permanentemente.",
      });
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir escola:", error);
      toast({
        title: "Erro ao excluir escola.",
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
    <div className="space-y-6">
      <div className="w-full">
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
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
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

                      {editingEscola && (
                        <div className="mt-4">
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
                                  <FormLabel>Ativa</FormLabel>
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
                                    <SelectItem value="PB">Paraíba</SelectItem>
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
                                    <SelectItem value="RO">Rondônia</SelectItem>
                                    <SelectItem value="RR">Roraima</SelectItem>
                                    <SelectItem value="SC">
                                      Santa Catarina
                                    </SelectItem>
                                    <SelectItem value="SP">
                                      São Paulo
                                    </SelectItem>
                                    <SelectItem value="SE">Sergipe</SelectItem>
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
                                    placeholder="00000-000"
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
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(escola)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              title="Remover"
                              variant="outline"
                              disabled={escola.ativo}
                              onClick={() => handleDeleteClick(escola)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
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
  );
}
