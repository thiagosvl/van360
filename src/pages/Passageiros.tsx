import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PassengerOnboardingDrawer } from "@/components/features/quickstart/PassengerOnboardingDrawer";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePassageirosViewModel } from "@/hooks/ui/usePassageirosViewModel";
import { cn } from "@/lib/utils";
import { PassageiroTab } from "@/types/enums";
import { Users2 } from "lucide-react";
import { useState } from "react";

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
    handleSubstituirContrato,
    handleExcluirContrato,
    handleReenviarNotificacaoContrato,
    pullToRefreshReload,
    hasActiveFilters,
  } = usePassageirosViewModel();

  const [isPassengerDrawerOpen, setIsPassengerDrawerOpen] = useState(false);

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
            <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
              <TabsList className="grid grid-cols-2 w-full h-[52px] bg-transparent p-0 gap-1 mt-0">
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

            <TabsContent value={activeTab} className="space-y-6 mt-0">
              <div className="space-y-6">
                {(isMainTab ? countPassageiros === 0 : true) && (
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
                  searchPlaceholder={isMainTab ? "Buscar por nome ou responsável..." : "Buscar solicitação..."}
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
                      action={searchTerm.length === 0 ? {
                        label: "Cadastrar Passageiro",
                        onClick: () => setIsPassengerDrawerOpen(true)
                      } : undefined}
                    />
                  ) : (
                    <PassageirosList
                      passageiros={passageiros}
                      onHistorico={handleHistorico}
                      onEdit={handleEdit}
                      onToggleClick={handleToggleClick}
                      onDeleteClick={handleDeleteClick}
                      onGenerateContract={handleGenerateContract}
                      onSubstituirContrato={handleSubstituirContrato}
                      onExcluirContrato={handleExcluirContrato}
                      onReenviarNotificacaoContrato={handleReenviarNotificacaoContrato}
                      usarContratos={profile?.config_contrato?.usar_contratos}
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

      <PassengerOnboardingDrawer
        open={isPassengerDrawerOpen}
        onOpenChange={setIsPassengerDrawerOpen}
        onManualRegistration={handleOpenNewDialog}
        profile={profile}
      />
    </>
  );
}
