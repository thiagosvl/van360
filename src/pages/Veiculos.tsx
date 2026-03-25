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

  const sectionCount = veiculos.length;
  const countLabel = searchTerm || hasActiveFilters ? "ENCONTRADOS" : "VEÍCULOS";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 bg-[#F8FAFB]">
        <p className="font-medium animate-pulse">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="max-w-4xl mx-auto space-y-6">
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

          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
              Veículos
            </h2>
            {sectionCount != null && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {sectionCount} {countLabel}
              </span>
            )}
          </div>

          {isVeiculosLoading ? (
            <ListSkeleton count={5} />
          ) : veiculos.length === 0 ? (
            <UnifiedEmptyState
              icon={Car}
              title="Nenhum veículo encontrado"
              description={
                searchTerm || hasActiveFilters
                  ? `Não encontramos veículos com os filtros selecionados.`
                  : "Comece cadastrando seu primeiro veículo para gerenciar a frota."
              }
              action={
                !searchTerm && !hasActiveFilters
                  ? {
                      label: "Cadastrar Veículo",
                      onClick: () => {
                        handleRegister();
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
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </div>
  );
}
