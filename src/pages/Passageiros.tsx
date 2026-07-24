import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrialContractLimitDialog } from "@/components/dialogs/TrialContractLimitDialog";
import { usePassageirosViewModel } from "@/hooks/ui/usePassageirosViewModel";
import { cn } from "@/lib/utils";
import { PassageiroTab } from "@/types/enums";
import { Users2 } from "lucide-react";

export default function Passageiros() {
  const {
    profile,
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
    handleOpenNewDialog,
    handleHistorico,
    handleEdit,
    handleToggleClick,
    handleDeleteClick,
    handleEnviarWhatsApp,
    handleGerarContrato,
    pullToRefreshReload,
    hasActiveFilters,
    isLimitDialogOpen,
    setIsLimitDialogOpen,
    handleGoToSubscription,
  } = usePassageirosViewModel();

  const isMainTab = activeTab === PassageiroTab.PASSAGEIROS;
  const sectionTitle = isMainTab ? "Passageiros" : "Solicitações";
  const sectionCount = isMainTab ? passageiros.length : countPrePassageiros;
  let countLabel = "";
  if (isMainTab) {
    const hasSearch = searchTerm || hasActiveFilters;
    countLabel = hasSearch 
      ? (sectionCount === 1 ? "ENCONTRADO" : "ENCONTRADOS")
      : (sectionCount === 1 ? "PASSAGEIRO" : "PASSAGEIROS");
  } else {
    const hasSearch = !!searchTerm;
    countLabel = hasSearch
      ? (sectionCount === 1 ? "ENCONTRADA" : "ENCONTRADAS")
      : (sectionCount === 1 ? "SOLICITAÇÃO" : "SOLICITAÇÕES");
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
              <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
                <TabsTrigger
                  value={PassageiroTab.PASSAGEIROS}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                >
                  Passageiros
                  <span className={cn(
                    "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                    activeTab === PassageiroTab.PASSAGEIROS ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                  )}>
                    {countPassageiros || 0}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value={PassageiroTab.SOLICITACOES}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                >
                  Solicitações
                  <span className={cn(
                    "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                    activeTab === PassageiroTab.SOLICITACOES ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                  )}>
                    {countPrePassageiros || 0}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="space-y-6 mt-0 transform-gpu will-change-transform">
              <div className="space-y-6">
                {(isMainTab ? countPassageiros < 10 : true) && (
                  <QuickRegistrationLink
                    profile={profile}
                    pendingCount={countPrePassageiros}
                  />
                )}

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
                  showRegister={isMainTab}
                  searchPlaceholder="Buscar por nome ou responsável..."
                />
              </div>

              <div className="flex items-center justify-between px-1">
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
                      action={(hasActiveFilters || searchTerm.length > 0) ? {
                        label: "Limpar Filtros",
                        onClick: clearFilters
                      } : {
                        label: "Cadastrar Passageiro",
                        onClick: handleOpenNewDialog
                      }}
                    />
                  ) : (
                    <PassageirosList
                      passageiros={passageiros}
                      onHistorico={handleHistorico}
                      onEdit={handleEdit}
                      onToggleClick={handleToggleClick}
                      onDeleteClick={handleDeleteClick}
                      onEnviarWhatsApp={handleEnviarWhatsApp}
                      onGerarContrato={handleGerarContrato}
                      usarContratos={!!profile?.config_contrato?.usar_contratos}
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

      <TrialContractLimitDialog
        isOpen={isLimitDialogOpen}
        onClose={() => setIsLimitDialogOpen(false)}
        onConfirm={handleGoToSubscription}
      />
    </>
  );
}
