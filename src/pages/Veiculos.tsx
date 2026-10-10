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

  const totalVeiculos = veiculos.length;
  const hasSearch = hasActiveFilters || !!searchTerm.trim();

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
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

        <div className="flex items-center justify-end px-1">
          <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
            {totalVeiculos}{" "}
            {hasSearch
              ? (totalVeiculos === 1 ? "ENCONTRADO" : "ENCONTRADOS")
              : (totalVeiculos === 1 ? "VEÍCULO" : "VEÍCULOS")}
          </span>
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
                ? "Não encontramos veículos com os filtros selecionados."
                : "Comece cadastrando seu primeiro veículo para gerenciar a frota."
            }
            action={
              searchTerm || hasActiveFilters
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
