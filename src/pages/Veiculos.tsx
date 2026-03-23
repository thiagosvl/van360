import { Car } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VeiculosList } from "@/components/features/veiculo/VeiculosList";
import { VeiculosToolbar } from "@/components/features/veiculo/VeiculosToolbar";
import { useVeiculosViewModel } from "@/hooks";

export default function Veiculos() {
  const {
    isLoading,
    isVeiculosLoading,
    isActionLoading,
    veiculos,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    hasActiveFilters,
    setFilters,
    handleCadastrarRapido,
    handleEdit,
    handleDeleteClick,
    handleToggleAtivo,
    handleRegister,
    openVeiculoFormDialog,
    refetch,
    navigate,
  } = useVeiculosViewModel();

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
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
                  onRegister={handleRegister}
                />
              </div>

              {isVeiculosLoading ? (
                <ListSkeleton />
              ) : veiculos.length === 0 ? (
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
                          onClick: () => {
                            openVeiculoFormDialog();
                          },
                        }
                      : undefined
                  }
                />
              ) : (
                <VeiculosList
                  veiculos={veiculos}
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
      <LoadingOverlay active={isActionLoading} text="comum.aguarde" />
    </>
  );
}
