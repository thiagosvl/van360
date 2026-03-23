import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    handleCadastrarRapido,
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

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange} 
            className="w-full space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 md:h-12 w-full md:w-auto self-start">
                <TabsTrigger 
                  value={PassageiroTab.PASSAGEIROS} 
                  className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
                >
                  Passageiros
                  {countPassageiros != null && countPassageiros > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs">
                      {countPassageiros}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value={PassageiroTab.SOLICITACOES} 
                  className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
                >
                  Solicitações
                  {countPrePassageiros > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs">
                      {countPrePassageiros}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={PassageiroTab.PASSAGEIROS} className="space-y-6 mt-0">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0">
                  <div className="flex justify-end mb-4">
                    <Button onClick={handleCadastrarRapido} variant="outline" className="gap-2 text-uppercase w-full md:w-auto">
                      GERAR PASSAGEIRO FAKE
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="px-0">
                  <div className="mb-6">
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
                    />
                  </div>

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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={PassageiroTab.SOLICITACOES} className="mt-0">
              <PrePassageiros onFinalizeNewPrePassageiro={async () => {}} profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
