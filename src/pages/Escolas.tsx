import ConfirmationDialog from "@/components/ConfirmationDialog";
import EscolaFormDialog from "@/components/EscolaFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useToast } from "@/hooks/use-toast";
import { escolaService } from "@/services/escolaService";
import { Escola } from "@/types/escola";
import { safeCloseDialog } from "@/utils/dialogCallback";
import {
  MoreVertical,
  Pencil,
  Plus,
  School,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const { setPageTitle, setPageSubtitle } = useLayout();
  const [escolas, setEscolas] = useState<
    (Escola & { passageiros_ativos_count?: number })[]
  >([]);
  const [countEscolasAtivas, setCountEscolasAtivas] = useState<number>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [schoolToDelete, setSchoolToDelete] = useState<Escola | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const { toast } = useToast();

  const fetchEscolas = useCallback(async () => {
    setLoadingPage(true);
    try {
      const data = await escolaService.fetchEscolasComContagemAtivos();
      setEscolas(data || []);
      setCountEscolasAtivas(data.filter((e) => e.ativo).length);
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

  useEffect(() => {
    let subTitle = "";
    if (countEscolasAtivas != null) {
      subTitle = `${
        countEscolasAtivas === 1
          ? "1 escola ativa"
          : `${countEscolasAtivas} escolas ativas`
      }`;
    } else {
      subTitle = "Carregando...";
    }

    setPageTitle("Escolas");
    setPageSubtitle(subTitle);
  }, [escolas, setPageTitle, setPageSubtitle]);

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

  const handleSuccessSave = (escolaCriada: Escola) => {
    safeCloseDialog(() => {
      fetchEscolas();
      setEditingEscola(null);
      setIsDialogOpen(false);
    });
  };

  const handleEdit = (escola: Escola) => {
    safeCloseDialog(() => {
      setEditingEscola(escola);
      setIsDialogOpen(true);
    });
  };

  const handleDeleteClick = (escola: Escola) => {
    if (escola.passageiros_ativos_count > 0) {
      toast({
        title: "Não é possível excluir.",
        description: "A escola está vinculada a passageiros ativos.",
        variant: "destructive",
      });
    } else {
      setSchoolToDelete(escola);
      setIsDeleteDialogOpen(true);
    }
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
        title: error.message,
        variant: "destructive",
      });
    }
  };

  const pullToRefreshReload = async () => {
    fetchEscolas();
  };

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-6">
        <div className="w-full">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <span>Escolas</span>
                  {countEscolasAtivas > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                      {countEscolasAtivas}
                    </span>
                  )}
                </CardTitle>

                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Escola</span>
                </Button>
              </div>
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
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
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
                      : "Nenhuma escola cadastrada"}
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
                            Status
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-600">
                            Passageiros Ativos
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
                            <td className="p-3 align-top">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users2 className="w-4 h-4" />
                                {escola.passageiros_ativos_count}
                              </div>
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

                  <div className="md:hidden divide-y divide-gray-100">
                    {escolasFiltradas.map((escola) => (
                      <div
                        key={escola.id}
                        onClick={() => handleEdit(escola)}
                        className="flex items-center py-4 px-0 active:bg-muted/50"
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
                              className="shrink-0 w-2"
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

        {isDialogOpen && (
          <EscolaFormDialog
            isOpen={isDialogOpen}
            onClose={() => {
              safeCloseDialog(() => {
                setIsDialogOpen(false);
                setEditingEscola(null);
              });
            }}
            editingEscola={editingEscola}
            onSuccess={handleSuccessSave}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
