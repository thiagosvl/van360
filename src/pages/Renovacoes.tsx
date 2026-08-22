import { useState, useMemo, useEffect } from "react";
import { useRenovacoesViewModel } from "@/hooks/ui/useRenovacoesViewModel";
import { useEscolasWithFilters, useProfile } from "@/hooks";
import { RenovacaoKPICard } from "@/components/features/renovacao/RenovacaoKPICard";
import { RenovacaoStatusPills } from "@/components/features/renovacao/RenovacaoStatusPills";
import { RenovacaoToolbar } from "@/components/features/renovacao/RenovacaoToolbar";
import { RenovacaoPassengerCard } from "@/components/features/renovacao/RenovacaoPassengerCard";
import { PassageirosPagination } from "@/components/features/passageiro/PassageirosPagination";
import { ReajusteLoteDialog } from "@/components/dialogs/ReajusteLoteDialog";
import { ConfirmarViradaAnoDialog } from "@/components/dialogs/ConfirmarViradaAnoDialog";
import { EditarReservaDialog } from "@/components/dialogs/EditarReservaDialog";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Rocket, RefreshCw, Users } from "lucide-react";
import { Escola } from "@/types/escola";
import { useSEO } from "@/hooks/useSEO";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

export default function Renovacoes() {
  useSEO({
    title: "Renovação de Ano Letivo",
    description: "Gerencie as reservas de vaga, reajustes e virada de ano letivo da sua van.",
  });

  const { can } = usePermissions();
  const canManage = can("renovacoes.gerenciar");

  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };

  const {
    anoDestino,
    statusFilter,
    setStatusFilter,
    escolaFilter,
    setEscolaFilter,
    periodoFilter,
    setPeriodoFilter,
    searchTerm,
    setSearchTerm,
    kpis,
    passageiros,
    isLoading,
    refetch,
    handleConfirmarManual,
    handleRegistrarSaida,
    isUpdating,
  } = useRenovacoesViewModel();

  const [isReajusteOpen, setIsReajusteOpen] = useState(false);
  const [isViradaOpen, setIsViradaOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<RenovacaoPassageiroItem | null>(null);

  // Paginação padrão da plataforma
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [statusFilter, escolaFilter, periodoFilter, searchTerm]);

  const totalPages = Math.ceil((passageiros.length || 0) / limit);

  const paginatedPassageiros = useMemo(() => {
    const from = (page - 1) * limit;
    return passageiros.slice(from, from + limit);
  }, [passageiros, page, limit]);

  if (!canManage) {
    return <AccessRestrictedState moduleName="Renovação de Ano Letivo" />;
  }

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-36">
        {/* Card Superior com Faturamento Projetado e Progresso */}
        <RenovacaoKPICard kpis={kpis} anoDestino={anoDestino} />

        {/* Filtros de Pílulas com Scroll Suave */}
        <div className="space-y-2.5">
          <RenovacaoStatusPills
            kpis={kpis}
            activeStatus={statusFilter}
            onSelectStatus={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
          />

          {/* Barra de Busca, Filtros e Ajustes em Lote */}
          <RenovacaoToolbar
            searchTerm={searchTerm}
            onSearchChange={(term) => {
              setSearchTerm(term);
              setPage(1);
            }}
            escolaFilter={escolaFilter}
            onEscolaChange={(e) => {
              setEscolaFilter(e);
              setPage(1);
            }}
            periodoFilter={periodoFilter}
            onPeriodoChange={(p) => {
              setPeriodoFilter(p);
              setPage(1);
            }}
            escolas={escolasList}
            onOpenAjustesLote={() => setIsReajusteOpen(true)}
          />
        </div>

        {/* Lista de Cards de Passageiros */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#1a3a5c]" />
              <p className="text-sm font-medium">Carregando passageiros...</p>
            </div>
          ) : passageiros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Nenhum passageiro encontrado</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Não encontramos nenhum passageiro correspondente aos filtros selecionados.
              </p>
            </div>
          ) : (
            <>
              {paginatedPassageiros.map((item) => (
                <RenovacaoPassengerCard
                  key={item.passageiro_id}
                  item={item}
                  anoDestino={anoDestino}
                  onConfirmarManual={handleConfirmarManual}
                  onRegistrarSaida={handleRegistrarSaida}
                  onOpenEditarReserva={setEditingPassageiro}
                  isUpdating={isUpdating}
                />
              ))}

              {/* Paginação Oficial do Sistema */}
              <PassageirosPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={passageiros.length}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                options={[30, 50, 100, 250]}
                className="mt-4"
              />
            </>
          )}
        </div>

        {/* Barra Flutuante Acima do BottomNavbar */}
        <div className="fixed bottom-[calc(4.2rem+env(safe-area-inset-bottom,0px))] left-0 right-0 p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/80 backdrop-blur-md z-30 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <Button
              type="button"
              onClick={() => setIsViradaOpen(true)}
              disabled={isLoading || kpis.contadores.confirmados === 0}
              className="w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-[#142e4a] to-[#1a3a5c] hover:from-[#0d1e30] hover:to-[#142e4a] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#1a3a5c]/20 hover:shadow-[#1a3a5c]/30 transition-all active:scale-[0.99] gap-2"
            >
              <Rocket className="w-4 h-4 text-amber-400" />
              <span>Iniciar Ano Letivo {anoDestino} (Aplicar Virada)</span>
            </Button>
          </div>
        </div>

        {/* Diálogos */}
        <ReajusteLoteDialog
          isOpen={isReajusteOpen}
          onClose={() => setIsReajusteOpen(false)}
          anoDestino={anoDestino}
        />

        <EditarReservaDialog
          isOpen={Boolean(editingPassageiro)}
          onClose={() => setEditingPassageiro(null)}
          passageiro={editingPassageiro}
          anoDestino={anoDestino}
          onSuccess={() => refetch()}
        />

        <ConfirmarViradaAnoDialog
          isOpen={isViradaOpen}
          onClose={() => setIsViradaOpen(false)}
          anoDestino={anoDestino}
          kpis={kpis}
          onSuccess={() => refetch()}
          onRevisarPendentes={() => {
            setStatusFilter(RenovacaoStatus.PENDENTE);
            setPage(1);
          }}
        />
      </div>
    </PullToRefreshWrapper>
  );
}
