import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { MiniKPI } from "@/components/features/home/MiniKPI";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { ROUTES } from "@/constants/routes";
import { useDashboardViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { getMesNome } from "@/utils/formatters";
import {
  Copy,
  CopyCheck,
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  TrendingDown,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { PassageiroTab } from "@/types/enums";

const Home = () => {
  const {
    profile,
    isLoading,
    financeiro,
    contadores,
    onboarding,
    dateContext,
    isCopied,
    handlePullToRefresh,
    handleCopyLink,
    handleOpenPassageiroDialog,
    handleOpenGastoDialog,
    handleOpenVeiculoDialog,
    handleOpenEscolaDialog,
    navigateTo,
  } = useDashboardViewModel();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]"></div>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className="space-y-6">
          {/* Header Contextual */}
          <div className="px-1">
            <p className="font-headline font-bold text-[#1a3a5c] text-sm capitalize">
              {dateContext}
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
              {financeiro.countAtrasos > 0
                ? `${financeiro.countAtrasos} passageiros em atraso`
                : "Tudo em dia por aqui!"}
            </p>
          </div>

          {/* Notificação de Solicitações Pendentes */}
          {contadores.passageirosSolicitacoes > 0 && (
            <section className="mb-4">
              <DashboardStatusCard
                type="info"
                title="Solicitações Pendentes"
                description={
                  contadores.passageirosSolicitacoes === 1
                    ? "Você tem 1 solicitação de novo passageiro aguardando aprovação."
                    : `Você tem ${contadores.passageirosSolicitacoes} solicitações de novos passageiros aguardando aprovação.`
                }
                actionLabel="Ver Solicitações"
                onAction={() =>
                  navigateTo(
                    `${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`,
                  )
                }
              />
            </section>
          )}

          {/* Onboarding - Primeiros Passos */}
          {onboarding.showOnboarding && (
            <section>
              <QuickStartCard
                onOpenVeiculoDialog={handleOpenVeiculoDialog}
                onOpenEscolaDialog={handleOpenEscolaDialog}
                onOpenPassageiroDialog={handleOpenPassageiroDialog}
              />
            </section>
          )}

          {/* Notificação de Mensalidades pendentes / em dia */}
          {!onboarding.showOnboarding && financeiro.recebido > 0 && (
            <section>
              {financeiro.countAtrasos > 0 ? (
                <DashboardStatusCard
                  type="pending"
                  title="Passageiros em Atraso"
                  description={`Você tem ${formatCurrency(
                    financeiro.totalEmAtraso,
                  )} em atraso de ${financeiro.countAtrasos} passageiro${
                    financeiro.countAtrasos != 1 ? "s" : ""
                  } referente ao mês de ${getMesNome(new Date().getMonth() + 1)}.`}
                  actionLabel="Ver Mensalidades"
                  onAction={() => navigateTo(ROUTES.PRIVATE.MOTORISTA.BILLING)}
                />
              ) : (
                <DashboardStatusCard
                  type="success"
                  title={`Mensalidades de ${getMesNome(new Date().getMonth() + 1)} em dia!`}
                  description={`Todas as mensalidades vencidas do mês foram pagas.`}
                />
              )}
            </section>
          )}

          {/* Mini KPIs */}
          <div
            className={cn(
              "grid gap-4",
              onboarding.showOnboarding
                ? "grid-cols-1"
                : "grid-cols-2 sm:grid-cols-3",
            )}
          >
            {!onboarding.showOnboarding && (
              <>
                <MiniKPI
                  label="Recebido"
                  value={formatCurrency(financeiro.recebido)}
                  icon={DollarSign}
                />
                <MiniKPI
                  label="A receber"
                  value={formatCurrency(financeiro.aReceber)}
                  icon={Wallet}
                />
              </>
            )}

            <MiniKPI
              className={cn(!onboarding.showOnboarding && "col-span-2 sm:col-span-1")}
              label="Passageiros Ativos"
              value={contadores.passageirosAtivos}
              icon={Users}
              subtext={`${contadores.passageirosInativos} inativo${
                contadores.passageirosInativos !== 1 ? "s" : ""
              }`}
            />
          </div>

          {/* Acessos Rápidos */}
          <section>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              <ShortcutCard
                onClick={handleOpenPassageiroDialog}
                icon={Plus}
                label="Cadastrar Passageiro"
              />
              <ShortcutCard
                onClick={handleOpenGastoDialog}
                icon={Plus}
                label="Registrar Gasto"
              />
              <div
                onClick={handleCopyLink}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100/30 shadow-diff-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-26 w-full cursor-pointer group select-none",
                  isCopied && "border-emerald-100 bg-emerald-50/50",
                )}
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-[1.2rem] flex items-center justify-center mb-2.5 shrink-0 border border-slate-100/50 transition-all duration-300",
                    isCopied
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                      : "bg-slate-50/80 text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white group-hover:border-[#1a3a5c] group-hover:shadow-lg group-hover:shadow-slate-100",
                  )}
                >
                  {isCopied ? (
                    <CopyCheck className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-[0.15em] text-center leading-tight transition-colors duration-200 px-1",
                    isCopied
                      ? "text-emerald-600"
                      : "text-slate-400 group-hover:text-[#1a3a5c]",
                  )}
                >
                  {isCopied ? "Copiado!" : "Link de Cadastro"}
                </span>
              </div>
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.PASSENGERS}
                icon={Users}
                label="Passageiros"
              />
              <ShortcutCard
                to={`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`}
                icon={UserCheck}
                label="Solicitações"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.EXPENSES}
                icon={TrendingDown}
                label="Controle de Gastos"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.REPORTS}
                icon={FileText}
                label="Relatórios"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.BILLING}
                icon={CreditCard}
                label="Mensalidades"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.CONTRACTS}
                icon={FileText}
                label="Contratos"
              />
            </div>
          </section>
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Home;
