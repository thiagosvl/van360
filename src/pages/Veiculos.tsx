// React
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Components - Dialogs



// Components - Features
import { VeiculosList } from "@/components/features/veiculo/VeiculosList";
import { VeiculosToolbar } from "@/components/features/veiculo/VeiculosToolbar";

// Components - Empty & Skeletons
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateVeiculo,
    useDeleteVeiculo,
    useFilters,
    useToggleAtivoVeiculo,
    useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Utils
import { limparPlaca } from "@/utils/domain/veiculo/placaUtils";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";

// Types
import { Veiculo } from "@/types/veiculo";

// Icons
import { Car } from "lucide-react";

export default function Veiculos() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openVeiculoFormDialog } = useLayout();
  const [searchParams, setSearchParams] = useSearchParams();

  const deleteVeiculo = useDeleteVeiculo();
  const toggleAtivoVeiculo = useToggleAtivoVeiculo();

  const isActionLoading =
    deleteVeiculo.isPending || toggleAtivoVeiculo.isPending;




  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    hasActiveFilters,
    setFilters,
  } = useFilters();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const createVeiculo = useCreateVeiculo();

  const handleCadastrarRapido = useCallback(async () => {
    if (!profile?.id) return;
    
    // Create new object to avoid reference issues
    const fakeVeiculo = { ...mockGenerator.veiculo() };
    // Mutate plate to be unique-ish ONLY if needed. 
    // The user requested "Use mock records". 
    // But Vehicles MUST have unique plates usually. 
    // I will keep the mutation for plate because otherwise I can't create more than 2 vehicles total.
    const oldPlate = fakeVeiculo.placa;
    const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    // Replace last 2 chars
    fakeVeiculo.placa = oldPlate.substring(0, oldPlate.length - 2) + suffix;

    try {
        await createVeiculo.mutateAsync({
            usuarioId: profile.id,
            data: {
                ...fakeVeiculo,
                ativo: true
            }
        });
        toast.success("Veículo fake criado com sucesso!");
    } catch (error) {
        console.error("Failed to create fake vehicle", error);
    }
  }, [profile?.id, createVeiculo]);

  const {
    data: veiculosData,
    isLoading: isVeiculosLoading,
    refetch: refetchVeiculos,
  } = useVeiculos(profile?.id, {
    enabled: !!profile?.id,
    onError: () => toast.error("veiculo.erro.carregar"),
  });

  const veiculos = useMemo(
    () =>
      (
        veiculosData as
          | {
              list?: (Veiculo & { passageiros_ativos_count?: number })[];
              ativas?: number;
            }
          | undefined
      )?.list ?? ([] as (Veiculo & { passageiros_ativos_count?: number })[]),
    [veiculosData]
  );

  useEffect(() => {
    setPageTitle("Veículos");
  }, [setPageTitle]);

  const veiculosFiltrados = useMemo(() => {
    let filtered = veiculos;

    if (selectedStatus !== "todos") {
      const status = selectedStatus === "ativo";
      filtered = filtered.filter((veiculo) => veiculo.ativo === status);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const cleanSearch = limparPlaca(searchTerm).toLowerCase();
      
      filtered = filtered.filter((veiculo) => {
        const placaMatch = limparPlaca(veiculo.placa)
          .toLowerCase()
          .includes(cleanSearch);
        const marcaMatch = veiculo.marca.toLowerCase().includes(lowerCaseSearch);
        const modeloMatch = veiculo.modelo.toLowerCase().includes(lowerCaseSearch);
        
        return placaMatch || marcaMatch || modeloMatch;
      });
    }

    return filtered;
  }, [veiculos, selectedStatus, searchTerm]);

  // Check for openModal param on mount
  useEffect(() => {
     const openModal = searchParams.get("openModal");
     if (openModal === "true") {
         openVeiculoFormDialog({
            onSuccess: () => {
                 navigate("/inicio", { replace: true });
            }
         });
     }
  }, [searchParams, openVeiculoFormDialog, navigate]);

  const handleEdit = useCallback((veiculo: Veiculo) => {
    openVeiculoFormDialog({
        editingVeiculo: veiculo
    });
  }, [openVeiculoFormDialog]);

  const handleDeleteClick = useCallback((veiculo: Veiculo) => {
    if (veiculo.passageiros_ativos_count > 0) {
      toast.error("veiculo.erro.excluir", {
        description: "veiculo.erro.excluirComPassageiros",
      });
      return;
    }
    
    openConfirmationDialog({
      title: "Excluir veículo?",
      description: "Tem certeza que deseja excluir este veículo? Essa ação não poderá ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
         try {
           await deleteVeiculo.mutateAsync(veiculo.id);
           closeConfirmationDialog();
         } catch (error) {
           closeConfirmationDialog();
         }
      }
    });
  }, [deleteVeiculo, openConfirmationDialog, closeConfirmationDialog]);

  const handleToggleAtivo = useCallback(
    async (veiculo: Veiculo) => {
      if (!profile?.id) return;

      const novoStatus = !veiculo.ativo;

      if (!novoStatus && veiculo.passageiros_ativos_count > 0) {
        toast.error("veiculo.erro.desativar", {
          description: "veiculo.erro.desativarComPassageiros",
        });
        return;
      }

      const action = novoStatus ? "Ativar" : "Desativar";
      openConfirmationDialog({
        title: `${action} veículo?`,
        description: novoStatus 
          ? "O veículo voltará a aparecer nas listagens ativas."
          : "O veículo deixará de aparecer nas listagens ativas. Você poderá reativá-lo depois.",
        confirmText: action,
        variant: novoStatus ? "success" : "warning",
        onConfirm: async () => {
          try {
            await toggleAtivoVeiculo.mutateAsync({ id: veiculo.id, novoStatus });
            closeConfirmationDialog();
          } catch (error) {
            console.error(error);
            closeConfirmationDialog();
          }
        },
      });
    },
    [profile?.id, toggleAtivoVeiculo, openConfirmationDialog, closeConfirmationDialog]
  );

  const pullToRefreshReload = useCallback(async () => {
    await refetchVeiculos();
  }, [refetchVeiculos]);

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0">
                <div className="flex justify-end mb-4 md:hidden">
                  <Button
                    onClick={handleCadastrarRapido}
                    variant="outline"
                    className="gap-2 text-uppercase w-full"
                  >
                    GERAR VEÍCULO FAKE
                  </Button>
                </div>
                <div className="hidden md:flex justify-end mb-4">
                  <Button
                    onClick={handleCadastrarRapido}
                    variant="outline"
                    className="gap-2 text-uppercase"
                  >
                    GERAR VEÍCULO FAKE
                  </Button>
                </div>
            </CardHeader>

            <CardContent className="px-0">
              <div className="mb-6">
                <VeiculosToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  onApplyFilters={setFilters}
                  onRegister={() => openVeiculoFormDialog({ allowBatchCreation: true })}
                />
              </div>

              {isVeiculosLoading ? (
                <ListSkeleton />
              ) : veiculosFiltrados.length === 0 ? (
                <UnifiedEmptyState
                  icon={Car}
                  title="Nenhum veículo encontrado"
                  description={
                    searchTerm
                      ? `Nenhum veículo encontrado para "${searchTerm}"`
                      : "Cadastre seus veículos para vincular aos passageiros."
                  }
                  action={
                    !searchTerm
                      ? {
                          label: "Novo Veículo",
                          onClick: () => openVeiculoFormDialog(),
                        }
                      : undefined
                  }
                />
              ) : (
                <VeiculosList
                  veiculos={veiculosFiltrados}
                  navigate={navigate}
                  onEdit={handleEdit}
                  onToggleAtivo={handleToggleAtivo}
                  onDelete={handleDeleteClick}
                />
              )}
            </CardContent>
          </Card>




        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
}
