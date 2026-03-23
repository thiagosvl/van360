import { GraduationCap } from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
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
    handleCadastrarRapido,
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
                  GERAR ESCOLA FAKE
                </Button>
              </div>
              <div className="hidden md:flex justify-end mb-4">
                <Button
                  onClick={handleCadastrarRapido}
                  variant="outline"
                  className="gap-2 text-uppercase"
                >
                  GERAR ESCOLA FAKE
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-0">
              <div className="mb-6">
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
              </div>

              {isEscolasLoading ? (
                <ListSkeleton />
              ) : escolas.length === 0 ? (
                <UnifiedEmptyState
                  icon={GraduationCap}
                  title="Nenhuma escola encontrada"
                  description={
                    searchTerm
                      ? `Nenhuma escola encontrada para "${searchTerm}"`
                      : "Cadastre as escolas que você atende para organizar seus passageiros."
                  }
                  action={
                    !searchTerm
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
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="comum.aguarde" />
    </>
  );
}
