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
import { Label } from "@/components/ui/label";
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
import { escolaService } from "@/services/escolaService";
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
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [escolas, setEscolas] = useState<
    (Escola & { passageiros_ativos_count?: number })[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [schoolToDelete, setSchoolToDelete] = useState<Escola | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-escola",
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
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

  const fetchEscolas = useCallback(async () => {
    setLoadingPage(true);
    try {
      const data = await escolaService.fetchEscolasComContagemAtivos();
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      toast({ title: "Erro ao carregar escolas.", variant: "destructive" });
    } finally {
      setLoadingPage(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEscolas();
  }, []);

  const escolasFiltradas = useMemo(() => {
    let filtered = escolas;

    if (selectedStatus !== "todos") {
      const status = selectedStatus === "ativa";
      filtered = filtered.filter((escola) => escola.ativo === status);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((escola) =>
        escola.nome.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return filtered;
  }, [escolas, selectedStatus, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {}, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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
      await escolaService.saveEscola(data, editingEscola);

      toast({
        title: `Escola ${
          editingEscola ? "atualizada" : "cadastrada"
        } com sucesso.`,
      });

      await fetchEscolas();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar escola:", error);

      if (error.message.includes("passageiros ativos")) {
        toast({
          title: "Não é possível desativar.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao salvar escola.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (escola: Escola) => {
    setEditingEscola(escola);
    setOpenAccordionItems(["dados-escola", "endereco"]);
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
      await escolaService.deleteEscola(schoolToDelete.id);

      await fetchEscolas();
      toast({ title: "Escola excluída permanentemente." });
    } catch (error: any) {
      console.error("Erro ao excluir escola:", error);

      if (error.message.includes("passageiros vinculados")) {
        toast({
          title: "Erro ao excluir escola.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao excluir escola.", variant: "destructive" });
      }
    } finally {
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
    }
  };

  const handleToggleAtivo = async (escola: Escola) => {
    try {
      const novoStatus = await escolaService.toggleAtivo(escola);

      toast({
        title: `Escola ${novoStatus ? "ativada" : "desativada"} com sucesso.`,
      });

      fetchEscolas();
    } catch (error: any) {
      console.error("Erro ao alternar status:", error);
      toast({
        title: "Erro ao alternar status.",
        description: error.message,
        variant: "destructive",
      });
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
                  className="space-y-6"
                >
                  <Accordion
                    type="multiple"
                    value={openAccordionItems}
                    onValueChange={setOpenAccordionItems}
                    className="w-full"
                  >
                    <AccordionItem value="dados-escola">
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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                              <FormItem className="md:col-span-4">
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
                              <FormItem className="md:col-span-4">
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
                              <FormItem className="md:col-span-2">
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
                              <FormItem className="col-span-1 md:col-span-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar por Nome</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nome da escola..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="desativada">Desativada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingPage ? (
              <SchoolListSkeleton />
            ) : escolasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                <School className="w-12 h-12 mb-4 text-gray-300" />
                <p>
                  {searchTerm
                    ? `Nenhuma escola encontrada para "${searchTerm}"`
                    : "Nenhuma escola cadastrada."}
                </p>
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
                          Passageiros Ativos
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
                      {escolasFiltradas.map((escola) => (
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
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users2 className="w-4 h-4" />
                              {escola.passageiros_ativos_count}
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
                              {escola.ativo ? "Ativa" : "Desativada"}
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
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAtivo(escola);
                                  }}
                                >
                                  {escola.ativo ? (
                                    <>
                                      <ToggleLeft className="w-4 h-4 mr-2" />
                                      Desativar
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="w-4 h-4 mr-2" />
                                      Reativar
                                    </>
                                  )}
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
                  {escolasFiltradas.map((escola) => (
                    <div
                      key={escola.id}
                      onClick={() => handleEdit(escola)}
                      className="flex items-center p-4 active:bg-muted/50"
                    >
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-gray-800">
                          {escola.nome}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span
                            className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                              escola.ativo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {escola.ativo ? "Ativa" : "Desativada"}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users2 className="w-4 h-4" />
                            {escola.passageiros_ativos_count} ativos
                          </div>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAtivo(escola);
                            }}
                          >
                            {escola.ativo ? (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 mr-2" />
                                Reativar
                              </>
                            )}
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
