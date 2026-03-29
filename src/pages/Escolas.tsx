import { GraduationCap } from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EscolasList } from "@/components/features/escola/EscolasList";
import { EscolasToolbar } from "@/components/features/escola/EscolasToolbar";
import { useEscolasViewModel } from "@/hooks";

export default function Escolas() {
  const {
    isLoading,
    isEscolasLoading,
    isActionLoading,
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
    openEscolaFormDialog,
    refetch,
    navigate,
    hasActiveFilters,
  } = useEscolasViewModel();

  const handleRefresh = async () => {
    await refetch();
  };

  const sectionCount = escolas.length;
  const countLabel = searchTerm || hasActiveFilters ? "ENCONTRADAS" : "ESCOLAS";

  return (
    <div className="space-y-6">
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="max-w-4xl mx-auto space-y-6">
          <EscolasToolbar
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
              Escolas
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {sectionCount} {countLabel}
            </span>
          </div>

          {isEscolasLoading ? (
            <ListSkeleton count={5} />
          ) : escolas.length === 0 ? (
            <UnifiedEmptyState
              icon={GraduationCap}
              title="Nenhuma escola encontrada"
              description={
                searchTerm || hasActiveFilters
                  ? `Não encontramos escolas com os filtros selecionados.`
                  : "Cadastre as escolas que você atende para organizar seus passageiros."
              }
              action={
                !searchTerm && !hasActiveFilters
                  ? {
                    label: "Cadastrar Escola",
                    onClick: () => {
                      openEscolaFormDialog();
                    },
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
    </div>
  );
}
