import { Car } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { VeiculosList } from "@/components/features/veiculo/VeiculosList";
import { VeiculosToolbar } from "@/components/features/veiculo/VeiculosToolbar";
import { useVeiculosViewModel } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";

export default function Veiculos() {
  const { can } = usePermissions();
  const {
    isVeiculosLoading,
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
    refetch,
    navigate,
  } = useVeiculosViewModel();

  if (!can("veiculos.gerenciar")) {
    return <AccessRestrictedState moduleName="Veículos e Frota" />;
  }

  const handleRefresh = async () => {
    await refetch();
  };

  const sectionCount = veiculos.length;
  const hasSearch = hasActiveFilters || !!searchTerm.trim();
  const countLabel = hasSearch
    ? (sectionCount === 1 ? "ENCONTRADO" : "ENCONTRADOS")
    : (sectionCount === 1 ? "CADASTRADO" : "CADASTRADOS");

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
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
            {/* Veículos */}
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
            title={
              searchTerm || hasActiveFilters
                ? "Nenhum veículo encontrado"
                : "Nenhum veículo cadastrado"
            }
            description={
              searchTerm || hasActiveFilters
                ? `Não encontramos veículos com os filtros selecionados.`
                : "Comece cadastrando seu primeiro veículo para gerenciar a frota."
            }
            action={
              (searchTerm || hasActiveFilters)
                ? {
                  label: "Limpar Filtros",
                  onClick: clearFilters,
                }
                : {
                  label: "Cadastrar Veículo",
                  onClick: handleRegister,
                }
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
  );
}
