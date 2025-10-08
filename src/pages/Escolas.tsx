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
import { supabase } from "@/integrations/supabase/client";
import { Escola } from "@/types/escola";
import { cepMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  School,
  Trash2,
} from "lucide-react";
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

const SchoolListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-4 border rounded-lg"
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
);

export default function Escolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [schoolToDelete, setSchoolToDelete] = useState<Escola | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-escola",
  ]);
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
      const { data, error } = await supabase
        .from("escolas")
        .select("*")
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("nome");
      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    } finally {
      setLoadingPage(false);
    }
  };

  const onFormError = (errors: any) => {
    toast({
      title: "Campos inválidos",
      description: "Por favor, corrija os erros no formulário.",
      variant: "destructive",
    });
    setOpenAccordionItems(["dados-escola", "endereco"]);
  };

  const handleSubmit = async (data: EscolaFormData) => {
    setLoading(true);
    try {
      if (editingEscola) {
        if (editingEscola.ativo && data.ativo === false) {
          const { data: passageirosAtivos, error: checkError } = await supabase
            .from("passageiros")
            .select("id")
            .eq("escola_id", editingEscola.id)
            .eq("usuario_id", localStorage.getItem("app_user_id"))
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
        toast({ title: "Escola atualizada com sucesso." });
      } else {
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
            usuario_id: localStorage.getItem("app_user_id"),
          },
        ]);
        if (error) throw error;
        toast({ title: "Escola cadastrada com sucesso." });
      }
      await fetchEscolas();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar escola:", error);
      toast({ title: "Erro ao salvar escola.", variant: "destructive" });
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
      toast({ title: "Escola excluída permanentemente." });
    } catch (error) {
      console.error("Erro ao excluir escola:", error);
      toast({ title: "Erro ao excluir escola.", variant: "destructive" });
    } finally {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Escolas
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Escola
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingEscola ? "Editar Escola" : "Nova Escola"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                  className="space-y-6 pt-4"
                >
                  <Accordion
                    type="multiple"
                    value={openAccordionItems}
                    onValueChange={setOpenAccordionItems}
                    className="w-full"
                  >
                    <AccordionItem value="dados-escola" className="mt-4">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <Building2 className="w-5 h-5 text-primary" />
                          Dados da Escola
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
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
                          <div className="pt-2">
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
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="endereco" className="mt-4">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <MapPin className="w-5 h-5 text-primary" />
                          Endereço
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="cep"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="00000-000"
                                    {...field}
                                    maxLength={9}
                                    onChange={(e) => {
                                      field.onChange(cepMask(e.target.value));
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
                            name="referencia"
                            render={({ field }) => (
                              <FormItem className="col-span-1 md:col-span-4">
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
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : editingEscola ? (
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lista de Escolas
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                {escolas.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPage ? (
              <SchoolListSkeleton />
            ) : escolas.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                <School className="w-12 h-12 mb-4 text-gray-300" />
                <p>Nenhuma escola cadastrada.</p>
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
                        <th className="p-3 text-center text-xs font-medium text-gray-600">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {escolas.map((escola) => (
                        <tr
                          key={escola.id}
                          onClick={() => handleEdit(escola)}
                          className="hover:bg-muted/50 cursor-pointer"
                        >
                          <td className="p-3 align-top">
                            <div className="font-medium text-sm text-gray-900">
                              {escola.nome}
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <span
                              className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                                escola.ativo
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {escola.ativo ? "Ativa" : "Inativa"}
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
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(escola);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={escola.ativo}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(escola);
                                  }}
                                  className="cursor-pointer text-red-600"
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
                  {escolas.map((escola) => (
                    <div
                      key={escola.id}
                      onClick={() => handleEdit(escola)}
                      className="flex items-center p-4 active:bg-muted/50"
                    >
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-gray-800">
                          {escola.nome}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                              escola.ativo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {escola.ativo ? "Ativa" : "Inativa"}
                          </span>
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
                              handleEdit(escola);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={escola.ativo}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(escola);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Confirmar exclusão"
        description="Deseja excluir permanentemente esta escola?"
        onConfirm={handleDelete}
        confirmText="Confirmar"
        variant="destructive"
      />
    </div>
  );
}
