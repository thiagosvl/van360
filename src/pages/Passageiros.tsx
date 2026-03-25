import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePassageirosViewModel } from "@/hooks/ui/usePassageirosViewModel";
import { PassageiroTab } from "@/types/enums";
import { Users2 } from "lucide-react";

export default function Passageiros() {
  const {
    profile,
    isProfileLoading,
    activeTab,
    handleTabChange,
    countPassageiros,
    countPrePassageiros,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedEscola,
    setSelectedEscola,
    selectedVeiculo,
    setSelectedVeiculo,
    selectedPeriodo,
    setSelectedPeriodo,
    escolas,
    veiculos,
    clearFilters,
    setFilters,
    isPassageirosLoading,
    passageiros,
    isActionLoading,
    handleOpenNewDialog,
    handleHistorico,
    handleEdit,
    handleToggleClick,
    handleDeleteClick,
    handleGenerateContract,
    pullToRefreshReload,
    hasActiveFilters,
  } = usePassageirosViewModel();

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  const isMainTab = activeTab === PassageiroTab.PASSAGEIROS;
  const sectionTitle = isMainTab ? "Passageiros" : "Solicitações";
  const sectionCount = isMainTab ? passageiros.length : countPrePassageiros;
  const countLabel = isMainTab ? (searchTerm || hasActiveFilters ? "ENCONTRADOS" : "PASSAGEIROS") : "SOLICITAÇÕES";

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <div className="bg-gray-100/40 p-1 rounded-2xl">
              <TabsList className="grid grid-cols-2 w-full h-11 bg-transparent p-0 gap-1 mt-0">
                <TabsTrigger
                  value={PassageiroTab.PASSAGEIROS}
                  className="rounded-xl h-full font-headline font-bold text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400"
                >
                  Passageiros
                </TabsTrigger>
                <TabsTrigger
                  value={PassageiroTab.SOLICITACOES}
                  className="rounded-xl h-full font-headline font-bold text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400"
                >
                  Solicitações
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="space-y-6 mt-0">
              <div className="space-y-6">
                <PassageirosToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedEscola={selectedEscola}
                  onEscolaChange={setSelectedEscola}
                  selectedVeiculo={selectedVeiculo}
                  onVeiculoChange={setSelectedVeiculo}
                  selectedPeriodo={selectedPeriodo}
                  onPeriodoChange={setSelectedPeriodo}
                  escolas={escolas}
                  veiculos={veiculos}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  onApplyFilters={setFilters}
                  onRegister={handleOpenNewDialog}
                  showAdvancedFilters={isMainTab}
                  searchPlaceholder={isMainTab ? "Buscar por nome ou responsável..." : "Buscar solicitação..."}
                />

                <QuickRegistrationLink
                  profile={profile}
                  pendingCount={countPrePassageiros}
                />
              </div>

              <div className="flex items-center justify-between mb-2 mt-4 px-1">
                <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
                  {sectionTitle}
                </h2>
                {sectionCount != null && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {sectionCount} {countLabel}
                  </span>
                )}
              </div>

              {isMainTab ? (
                <>
                  {isPassageirosLoading ? (
                    <ListSkeleton count={5} />
                  ) : passageiros.length === 0 ? (
                    <UnifiedEmptyState
                      icon={Users2}
                      title="Nenhum passageiro encontrado"
                      description={searchTerm.length > 0 ? "Não encontramos passageiros com os filtros selecionados." : "Comece cadastrando seu primeiro passageiro para gerenciar o transporte."}
                      action={searchTerm.length === 0 ? { label: "Cadastrar Passageiro", onClick: handleOpenNewDialog } : undefined}
                    />
                  ) : (
                    <PassageirosList
                      passageiros={passageiros}
                      onHistorico={handleHistorico}
                      onEdit={handleEdit}
                      onToggleClick={handleToggleClick}
                      onDeleteClick={handleDeleteClick}
                      onGenerateContract={handleGenerateContract}
                    />
                  )}
                </>
              ) : (
                <PrePassageiros
                  onFinalizeNewPrePassageiro={async () => { }}
                  profile={profile}
                  searchTerm={searchTerm}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
