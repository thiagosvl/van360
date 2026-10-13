import { GraduationCap } from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EscolasList } from "@/components/features/escola/EscolasList";
import { EscolasToolbar } from "@/components/features/escola/EscolasToolbar";
import { useEscolasViewModel } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";

export default function Escolas() {
  const { can } = usePermissions();
  const {
    isEscolasLoading,
    escolas,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    setFilters,
    handleEdit,
    handleDeleteClick,
    handleToggleAtivo,
    handleRegister,
    refetch,
    navigate,
    hasActiveFilters,
  } = useEscolasViewModel();

  if (!can("escolas.visualizar")) {
    return <AccessRestrictedState moduleName="Escolas" />;
  }

  const handleRefresh = async () => {
    await refetch();
  };

  const totalEscolas = escolas.length;
  const hasSearch = hasActiveFilters || !!searchTerm.trim();

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
        <EscolasToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          onApplyFilters={setFilters}
          onRegister={can("escolas.gerenciar") ? handleRegister : () => {}}
          isRegisterDisabled={!can("escolas.gerenciar")}
        />

        <div className="flex items-center justify-end px-1">
          <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
            {totalEscolas}{" "}
            {hasSearch
              ? (totalEscolas === 1 ? "ENCONTRADA" : "ENCONTRADAS")
              : (totalEscolas === 1 ? "ESCOLA" : "ESCOLAS")}
          </span>
        </div>

        {isEscolasLoading ? (
          <ListSkeleton count={5} />
        ) : escolas.length === 0 ? (
          <UnifiedEmptyState
            icon={GraduationCap}
            title={
              searchTerm || hasActiveFilters
                ? "Nenhuma escola encontrada"
                : "Nenhuma escola cadastrada"
            }
            description={
              searchTerm || hasActiveFilters
                ? "Não encontramos escolas com os filtros selecionados."
                : "Cadastre as escolas que você atende para organizar seus alunos."
            }
            action={
              searchTerm || hasActiveFilters
                ? {
                    label: "Limpar Filtros",
                    onClick: clearFilters,
                  }
                : can("escolas.gerenciar")
                ? {
                    label: "Cadastrar Escola",
                    onClick: handleRegister,
                  }
                : undefined
            }
          />
        ) : (
          <EscolasList
            escolas={escolas}
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
