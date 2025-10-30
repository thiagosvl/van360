import ConfirmationDialog from "@/components/ConfirmationDialog";
import { LoadingOverlay } from "@/components/LoadingOverlay";
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
import VeiculoFormDialog from "@/components/VeiculoFormDialog";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { veiculoService } from "@/services/veiculoService";
import { Veiculo } from "@/types/veiculo";
import { safeCloseDialog } from "@/utils/dialogCallback";
import { formatarPlacaExibicao, limparPlaca } from "@/utils/placaUtils";
import {
  Car,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
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

export default function Veiculos() {
  const { setPageTitle, setPageSubtitle } = useLayout();
  const [veiculos, setVeiculos] = useState<
    (Veiculo & { passageiros_ativos_count?: number })[]
  >([]);
  const [countVeiculosAtivos, setCountVeiculosAtivos] = useState<number>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<Veiculo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const { toast } = useToast();

  const fetchVeiculos = useCallback(
    async (isRefresh = false) => {
      if (!profile?.id) return;

      try {
        if (!isRefresh) setLoading(true);
        else setRefreshing(true);

        const data = await veiculoService.fetchVeiculosComContagemAtivos(
          profile.id
        );
        setVeiculos(data || []);
        setCountVeiculosAtivos(data.filter((e) => e.ativo).length);
      } catch (error) {
        console.error("Erro ao buscar veiculos:", error);
        toast({ title: "Erro ao carregar veiculos.", variant: "destructive" });
      } finally {
        if (!isRefresh) setLoading(false);
        else setRefreshing(false);
      }
    },
    [toast, profile?.id]
  );

  useEffect(() => {
    if (!profile?.id) return;
    fetchVeiculos();
  }, [profile?.id]);

  useEffect(() => {
    let subTitle = "";
    if (countVeiculosAtivos != null) {
      subTitle = `${
        countVeiculosAtivos === 1
          ? "1 veiculo ativo"
          : `${countVeiculosAtivos} veiculos ativos`
      }`;
    } else {
      subTitle = "Carregando...";
    }

    setPageTitle("Veículos");
    setPageSubtitle(subTitle);
  }, [veiculos, setPageTitle, setPageSubtitle]);

  const veiculosFiltrados = useMemo(() => {
    let filtered = veiculos;

    if (selectedStatus !== "todos") {
      const status = selectedStatus === "ativo";
      filtered = filtered.filter((veiculo) => veiculo.ativo === status);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((veiculo) =>
        limparPlaca(veiculo.placa)
          .toLowerCase()
          .includes(limparPlaca(searchTerm).toLowerCase())
      );
    }

    return filtered;
  }, [veiculos, selectedStatus, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {}, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSuccessSave = (veiculoCriado: Veiculo) => {
    safeCloseDialog(() => {
      fetchVeiculos(true);
      setEditingVeiculo(null);
      setIsDialogOpen(false);
    });
  };

  const handleEdit = (veiculo: Veiculo) => {
    safeCloseDialog(() => {
      setEditingVeiculo(veiculo);
      setIsDialogOpen(true);
    });
  };

  const handleDeleteClick = (veiculo: Veiculo) => {
    if (veiculo.passageiros_ativos_count > 0) {
      toast({
        title: "Não é possível excluir.",
        description: "O veículo está vinculado a passageiros ativos.",
        variant: "destructive",
      });
    } else {
      setSchoolToDelete(veiculo);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!profile?.id) return;
    if (!schoolToDelete) return;

    setRefreshing(true);
    try {
      await veiculoService.deleteVeiculo(schoolToDelete.id, profile.id);

      await fetchVeiculos(true);
      toast({ title: "Veiculo excluído permanentemente." });
    } catch (error: any) {
      console.error("Erro ao excluir veiculo:", error);

      if (error.message.includes("passageiros vinculados")) {
        toast({
          title: "Erro ao excluir veiculo.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao excluir veiculo.", variant: "destructive" });
      }
    } finally {
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
      setRefreshing(false);
    }
  };

  const handleToggleAtivo = async (veiculo: Veiculo) => {
    if (!profile?.id) return;

    setRefreshing(true);
    try {
      const novoStatus = await veiculoService.toggleAtivo(veiculo, profile.id);

      toast({
        title: `Veiculo ${novoStatus ? "ativado" : "desativado"} com sucesso.`,
      });

      fetchVeiculos(true);
    } catch (error: any) {
      console.error("Erro ao alternar status:", error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const pullToRefreshReload = async () => {
    fetchVeiculos();
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <div className="w-full">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className={`md:hidden`}
                      title={
                        showMobileFilters
                          ? "Esconder Filtros"
                          : "Mostrar Filtros"
                      }
                    >
                      <Filter
                        className={`h-4 w-4 ${
                          showMobileFilters
                            ? "text-blue-600 border-primary"
                            : ""
                        }`}
                      />
                      <span className={showMobileFilters ? "text-primary" : ""}>
                        Filtros
                      </span>
                    </Button>
                  </CardTitle>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Novo Veiculo</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showMobileFilters ? "max-h-[500px]" : "max-h-0"
                  } md:max-h-full`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="search">Buscar por Placa</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder=""
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
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="desativado">Desativado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <SchoolListSkeleton />
                ) : veiculosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                    <Car className="w-12 h-12 mb-4 text-gray-300" />
                    <p>
                      {searchTerm
                        ? `Nenhum veículo encontrado com a placa "${searchTerm}"`
                        : "Nenhum veículo encontrado"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Placa
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Passageiros Ativos
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Status
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Marca
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Modelo
                            </th>
                            <th className="p-3 text-center text-xs font-medium text-gray-600">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {veiculosFiltrados.map((veiculo) => (
                            <tr
                              key={veiculo.id}
                              onClick={() => handleEdit(veiculo)}
                              className="hover:bg-muted/50 cursor-pointer"
                            >
                              <td className="p-3 align-top">
                                <div className="font-medium text-sm text-gray-900">
                                  {formatarPlacaExibicao(veiculo.placa)}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users2 className="w-4 h-4" />
                                  {veiculo.passageiros_ativos_count}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <span
                                  className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                                    veiculo.ativo
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {veiculo.ativo ? "Ativo" : "Desativado"}
                                </span>
                              </td>
                              <td className="p-3 align-top">
                                <div className="font-medium text-sm text-gray-900">
                                  {veiculo.marca}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="font-medium text-sm text-gray-900">
                                  {veiculo.modelo}
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
                                        handleEdit(veiculo);
                                      }}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleAtivo(veiculo);
                                      }}
                                    >
                                      {veiculo.ativo ? (
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
                                        handleDeleteClick(veiculo);
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
                      {veiculosFiltrados.map((veiculo) => (
                        <div
                          key={veiculo.id}
                          onClick={() => handleEdit(veiculo)}
                          className="flex items-center py-4 px-0 active:bg-muted/50"
                        >
                          <div className="flex-1 pr-4">
                            <div className="font-semibold text-gray-800">
                              {formatarPlacaExibicao(veiculo.placa)}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({veiculo.marca} {veiculo.modelo}
                                {veiculo.ano_modelo
                                  ? `/${veiculo.ano_modelo}`
                                  : ""}
                                )
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3">
                              <span
                                className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                                  veiculo.ativo
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {veiculo.ativo ? "Ativo" : "Desativado"}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users2 className="w-4 h-4" />
                                {veiculo.passageiros_ativos_count} ativos
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
                                  handleEdit(veiculo);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAtivo(veiculo);
                                }}
                              >
                                {veiculo.ativo ? (
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
                                  handleDeleteClick(veiculo);
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
            description="Deseja excluir permanentemente este veiculo?"
            onConfirm={handleDelete}
            confirmText="Confirmar"
            variant="destructive"
          />

          {isDialogOpen && (
            <VeiculoFormDialog
              isOpen={isDialogOpen}
              onClose={() => {
                safeCloseDialog(() => {
                  setIsDialogOpen(false);
                  setEditingVeiculo(null);
                });
              }}
              editingVeiculo={editingVeiculo}
              onSuccess={handleSuccessSave}
            />
          )}
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
