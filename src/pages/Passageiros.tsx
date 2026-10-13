import { useState } from "react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { usePassageirosViewModel } from "@/hooks/ui/usePassageirosViewModel";
import { cn } from "@/lib/utils";
import { PassageiroTab } from "@/types/enums";
import { AnoLetivoSelect } from "@/components/common/AnoLetivoSelect";
import { Banner } from "@/components/ui/Banner";
import { Users2, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { PassageirosPagination } from "@/components/features/passageiro/PassageirosPagination";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useSession } from "@/hooks/business/useSession";
import { useTutorialsConfig } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";

export default function Passageiros() {
  const { user } = useSession();
  const { isSubConta, can } = usePermissions();
  const { isTrial } = useSubscriptionAccess();
  const { config: tutorialConfig, shouldShowTutorial } = useTutorialsConfig("alunos");

  const [isDismissedAlunos, setIsDismissedAlunos] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.DISMISS_QUICK_REGISTRATION_ALUNOS) === "true";
  });

  const handleDismissAlunos = () => {
    setIsDismissedAlunos(true);
    localStorage.setItem(STORAGE_KEYS.DISMISS_QUICK_REGISTRATION_ALUNOS, "true");
  };
  const {
    profile,
    activeTab,
    handleTabChange,
    countPassageiros,
    countPrePassageiros,
    prePassageiros,
    isPrePassageirosLoading: isPrePassageirosListLoading,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedEscola,
    setSelectedEscola,
    selectedVeiculo,
    setSelectedVeiculo,
    selectedPeriodo,
    setSelectedPeriodo,
    selectedAnoLetivo,
    setSelectedAnoLetivo,
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
    pullToRefreshReload,
    hasActiveFilters,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,
  } = usePassageirosViewModel();

  if (!can("passageiros.visualizar")) {
    return <AccessRestrictedState moduleName="Alunos" />;
  }

  const isMainTab = activeTab === PassageiroTab.ALUNOS;
  const sectionTitle = isMainTab ? "Alunos" : "Solicitações";
  const sectionCount = isMainTab
    ? (totalItems || passageiros.length)
    : (debouncedSearchTerm.trim() || searchTerm.trim() ? prePassageiros.length : countPrePassageiros);
  let countLabel = "";

  if (isMainTab) {
    const hasSearch = hasActiveFilters || !!debouncedSearchTerm || !!searchTerm.trim();
    countLabel = hasSearch
      ? (sectionCount === 1 ? "ENCONTRADO" : "ENCONTRADOS")
      : (sectionCount === 1 ? "ALUNO" : "ALUNOS");
  } else {
    const hasSearch = !!debouncedSearchTerm || !!searchTerm.trim();
    countLabel = hasSearch
      ? (sectionCount === 1 ? "ENCONTRADA" : "ENCONTRADAS")
      : (sectionCount === 1 ? "SOLICITAÇÃO" : "SOLICITAÇÕES");
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
          {!isSubConta ? (
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <AppTabNav
                  activeTab={activeTab}
                  items={[
                    {
                      value: PassageiroTab.ALUNOS,
                      label: "Alunos",
                    },
                    {
                      value: PassageiroTab.SOLICITACOES,
                      label: "Solicitações",
                      badge: countPrePassageiros || 0,
                    },
                  ]}
                />

                {isMainTab && (
                  <AnoLetivoSelect
                    ano={selectedAnoLetivo}
                    onChangeAno={setSelectedAnoLetivo}
                    className="self-end sm:self-center h-10 sm:h-11"
                  />
                )}
              </div>

              <TabsContent value={activeTab} className="space-y-4 sm:space-y-6 mt-0 transform-gpu will-change-transform">
                <div className="space-y-4 sm:space-y-6">
                  {isMainTab && selectedAnoLetivo !== new Date().getFullYear() && (
                    <Banner
                      variant="info"
                      description={`Visualizando o Ano Letivo ${selectedAnoLetivo}. Alunos históricos e promovidos são preservados para consulta deste período.`}
                    />
                  )}
                  {can("passageiros.gerenciar") && (
                    isMainTab ? (
                      (isTrial || !isDismissedAlunos) && (
                        <QuickRegistrationLink
                          profile={profile}
                          pendingCount={countPrePassageiros}
                          onDismiss={isTrial ? undefined : handleDismissAlunos}
                        />
                      )
                    ) : (
                      <QuickRegistrationLink
                        profile={profile}
                        pendingCount={countPrePassageiros}
                      />
                    )
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
                    showRegister={isMainTab && can("passageiros.gerenciar")}
                    searchPlaceholder="Buscar aluno ou responsável..."
                  />
                </div>

                <div className="flex items-center justify-between px-0.5">
                  {isMainTab && can("passageiros.gerenciar") ? (
                    <Link
                      to="/alunos/atualizacao-rapida"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer group py-1"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
                      <span>Edição em lote</span>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {(isMainTab ? passageiros.length > 0 : prePassageiros.length > 0) && (
                    <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
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
                        title="Nenhum aluno encontrado"
                        description={debouncedSearchTerm.length > 0 || hasActiveFilters ? "Não encontramos alunos com os filtros selecionados." : "Não encontramos nenhum aluno cadastrado em sua frota."}
                        action={(hasActiveFilters || debouncedSearchTerm.length > 0) ? {
                          label: "Limpar Filtros",
                          onClick: clearFilters
                        } : (can("passageiros.gerenciar") ? {
                          label: "Cadastrar Aluno",
                          onClick: handleOpenNewDialog
                        } : undefined)}
                      />
                    ) : (
                      <>
                        <PassageirosList
                          passageiros={passageiros}
                          onHistorico={handleHistorico}
                          onEdit={handleEdit}
                          onToggleClick={handleToggleClick}
                          onDeleteClick={handleDeleteClick}
                          onEnviarWhatsApp={handleEnviarWhatsApp}
                          usarContratos={!!profile?.config_contrato?.usar_contratos}
                        />
                        <PassageirosPagination
                          currentPage={page}
                          totalPages={totalPages}
                          totalItems={totalItems}
                          limit={limit}
                          onPageChange={setPage}
                          onLimitChange={setLimit}
                          className="mt-4"
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <PrePassageiros
                      onFinalizeNewPrePassageiro={async () => { }}
                      profile={profile}
                      searchTerm={debouncedSearchTerm}
                      prePassageiros={prePassageiros}
                      countPassageiros={countPassageiros}
                      isLoading={isPrePassageirosListLoading}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 sm:space-y-6">
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
                showAdvancedFilters={true}
                showRegister={can("passageiros.gerenciar")}
                searchPlaceholder="Buscar por nome..."
              />

              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-sm font-semibold text-[#0a0a0a]">
                  Alunos
                </h2>
                {passageiros.length > 0 && (
                  <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                    {sectionCount} {countLabel}
                  </span>
                )}
              </div>

              {isPassageirosLoading ? (
                <ListSkeleton count={5} />
              ) : passageiros.length === 0 ? (
                <UnifiedEmptyState
                  icon={Users2}
                  title="Nenhum aluno encontrado"
                  description={debouncedSearchTerm.length > 0 || hasActiveFilters ? "Não encontramos alunos com os filtros selecionados." : "Nenhum aluno cadastrado nesta frota."}
                  action={(hasActiveFilters || debouncedSearchTerm.length > 0) ? {
                    label: "Limpar Filtros",
                    onClick: clearFilters
                  } : (can("passageiros.gerenciar") ? {
                    label: "Cadastrar Aluno",
                    onClick: handleOpenNewDialog
                  } : undefined)}
                />
              ) : (
                <>
                  <PassageirosList
                    passageiros={passageiros}
                    onHistorico={handleHistorico}
                    onEdit={handleEdit}
                    onToggleClick={handleToggleClick}
                    onDeleteClick={handleDeleteClick}
                    onEnviarWhatsApp={handleEnviarWhatsApp}
                    usarContratos={false}
                  />
                  <PassageirosPagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    className="mt-4"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </PullToRefreshWrapper>

      {/* {shouldShowTutorial && (
        <VideoCommerce
          screenName="alunos"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          ctaText={tutorialConfig.ctaText}
          onCtaClick={handleOpenNewDialog}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_PASSAGEIROS_DISMISSED}
        />
      )} */}
    </>
  );
}
