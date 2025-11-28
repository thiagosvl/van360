import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancas } from "@/hooks/api/useCobrancas";
import { useEscolas } from "@/hooks/api/useEscolas";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

import {
  PASSAGEIRO_COBRANCA_STATUS_PAGO,
  PLANO_COMPLETO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";
import { cn } from "@/lib/utils";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { toast } from "@/utils/notifications/toast";

// --- Internal Components ---

const MiniKPI = ({
  label,
  value,
  subtext,
  icon: Icon,
  colorClass = "text-gray-600",
  bgClass = "bg-gray-50",
  loading = false,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: any;
  colorClass?: string;
  bgClass?: string;
  loading?: boolean;
}) => (
  <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden relative">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-7 w-24 mb-1" />
        ) : (
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
            {value}
          </h3>
        )}
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center",
          bgClass,
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

const ShortcutCard = ({
  to,
  icon: Icon,
  label,
  colorClass = "text-blue-600",
  bgClass = "bg-blue-50",
}: {
  to: string;
  icon: any;
  label: string;
  colorClass?: string;
  bgClass?: string;
}) => (
  <NavLink to={to} className="group">
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md h-24 w-full">
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
          bgClass,
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-blue-700">
        {label}
      </span>
    </div>
  </NavLink>
);

const StatusCard = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  progress,
}: {
  type: "pending" | "success" | "onboarding";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  progress?: { current: number; total: number };
}) => {
  const styles = {
    pending: {
      bg: "bg-orange-50",
      border: "border-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      titleColor: "text-orange-900",
      descColor: "text-orange-700",
      btnVariant: "default" as const,
      btnClass: "bg-orange-500 hover:bg-orange-600 text-white border-none",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-700",
      btnVariant: "outline" as const,
      btnClass: "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    },
    onboarding: {
      bg: "bg-white",
      border: "border-indigo-100",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      titleColor: "text-gray-900",
      descColor: "text-gray-500",
      btnVariant: "default" as const,
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
  };

  const style = styles[type];

  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl overflow-hidden",
        style.bg,
        style.border
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              style.iconBg,
              style.iconColor
            )}
          >
            {type === "pending" && <Wallet className="h-5 w-5" />}
            {type === "success" && <CheckCircle2 className="h-5 w-5" />}
            {type === "onboarding" && <Zap className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "font-bold text-lg leading-tight",
                style.titleColor
              )}
            >
              {title}
            </h3>
            <p className={cn("text-sm mt-1 mb-3", style.descColor)}>
              {description}
            </p>

            {type === "onboarding" && progress && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                  <span>Progresso</span>
                  <span>
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(progress.current / progress.total) * 100}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-indigo-600"
                />
              </div>
            )}

            {actionLabel && (
              <Button
                size="sm"
                variant={style.btnVariant}
                className={cn(
                  "h-9 px-4 rounded-xl font-semibold",
                  style.btnClass
                )}
                onClick={onAction}
              >
                {actionLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Component ---

const Home = () => {
  const { setPageTitle } = useLayout();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading, plano } = useProfile(user?.id);
  const navigate = useNavigate();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Queries
  const { data: cobrancasData, refetch: refetchCobrancas } = useCobrancas(
    { usuarioId: profile?.id, mes: mesAtual, ano: anoAtual },
    { enabled: !!profile?.id }
  );

  const { data: passageirosData, refetch: refetchPassageiros } = usePassageiros(
    { usuarioId: profile?.id },
    { enabled: !!profile?.id }
  );

  const { data: escolasData, refetch: refetchEscolas } = useEscolas(
    profile?.id,
    {
      enabled: !!profile?.id,
    }
  );

  const { data: veiculosData, refetch: refetchVeiculos } = useVeiculos(
    profile?.id,
    {
      enabled: !!profile?.id,
    }
  );

  // Derived Data
  const cobrancas = cobrancasData?.all || [];
  const passageirosList = passageirosData?.list || [];
  const activePassengers = passageirosList.filter((p) => p.ativo).length;

  const escolasCount =
    (escolasData as { total?: number } | undefined)?.total ?? 0;
  const veiculosCount =
    (veiculosData as { total?: number } | undefined)?.total ?? 0;
  const passageirosCount = passageirosList.length;

  // Financial KPIs
  const receitaPrevista = cobrancas.reduce(
    (acc, c) => acc + Number(c.valor || 0),
    0
  );

  const cobrancasPendentes = cobrancas.filter(
    (c) => c.status !== PASSAGEIRO_COBRANCA_STATUS_PAGO
  );

  const aReceber = cobrancasPendentes.reduce(
    (acc, c) => acc + Number(c.valor || 0),
    0
  );

  // Status Logic
  const latePayments = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.filter((c) => {
      if (c.status === PASSAGEIRO_COBRANCA_STATUS_PAGO) return false;
      const vencimento = new Date(c.data_vencimento);
      return vencimento < hoje;
    });
  }, [cobrancas]);

  const totalEmAtraso = latePayments.reduce(
    (acc, c) => acc + Number(c.valor || 0),
    0
  );

  // Onboarding Logic
  const onboardingSteps = [
    { id: 1, done: escolasCount > 0, label: "Cadastrar escola" },
    { id: 2, done: veiculosCount > 0, label: "Cadastrar veículo" },
    { id: 3, done: passageirosCount > 0, label: "Cadastrar passageiro" },
  ];
  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const showOnboarding = completedSteps < 3;

  // Date Context
  const dateContext = useMemo(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return now.toLocaleDateString("pt-BR", options);
  }, []);

  // Formatter Helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Effects
  useEffect(() => {
    if (profile?.apelido) {
      setPageTitle(`Olá, ${profile.apelido}`);
    } else {
      setPageTitle("Olá, Motorista");
    }
  }, [profile?.apelido, setPageTitle]);

  const handlePullToRefresh = async () => {
    await Promise.all([
      refetchCobrancas(),
      refetchPassageiros(),
      refetchEscolas(),
      refetchVeiculos(),
    ]);
  };

  const handleCopyLink = () => {
    if (!profile?.id) return;

    if (plano?.slug === PLANO_GRATUITO) {
      toast.error("Você não tem permissão para acessar este recurso.");
      return;
    } else {
      try {
        navigator.clipboard.writeText(buildPrepassageiroLink(profile?.id));
        toast.success("Link copiado!", {
          description: "Envie para os responsáveis.",
        });
      } catch (error) {
        toast.error("Erro ao copiar link");
      }
    }
  };

  // Obter slug principal do plano (usa parent se existir)
  const getMainPlanSlug = () => {
    if (!plano?.planoCompleto) return null;
    return (
      plano.planoCompleto.parent?.slug ??
      plano.planoCompleto.slug ??
      plano?.slug ??
      null
    );
  };

  const getPlanMessage = (planSlug?: string) => {
    const slug = planSlug?.toLowerCase() || "";

    if (slug === PLANO_GRATUITO) {
      return "Cadastre quantos passageiros quiser, cobre automaticamente e veja seus gastos e lucros em tempo real.";
    }

    if (slug === PLANO_ESSENCIAL) {
      return "Foque só em dirigir! Nós cobramos, recebemos, damos baixa e enviamos os recibos automaticamente.";
    }

    if (slug === PLANO_COMPLETO) {
      return "Adicione mais passageiros com cobrança automática e ganhe tempo para focar no que realmente importa.";
    }

    return "Desbloqueie recursos avançados e automação completa para seu negócio.";
  };

  const getPlanCTA = (planSlug?: string) => {
    const slug = planSlug?.toLowerCase() || "";

    if (slug === PLANO_GRATUITO) {
      return "Quero mais recursos →";
    }

    if (slug === PLANO_ESSENCIAL) {
      return "Quero automação total →";
    }

    if (slug === PLANO_COMPLETO) {
      return "Quero automatizar mais →";
    }

    return "Ver Planos →";
  };

  const getPlanTitle = (planSlug?: string) => {
    const slug = planSlug?.toLowerCase() || "";

    if (slug === PLANO_GRATUITO) {
      return "Potencialize seu negócio 🚀";
    }

    if (slug === PLANO_ESSENCIAL) {
      return "Automatize tudo 🚀";
    }

    if (slug === PLANO_COMPLETO) {
      return "Automatize ainda mais 🎯";
    }

    return "Seja Premium 🚀";
  };

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
      <div className="space-y-6 pb-20">
        {/* Header Contextual */}
        <div className="px-1">
          <p className="text-sm text-gray-500 capitalize font-medium">
            {dateContext}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {latePayments.length > 0
              ? `${latePayments.length} cobrança${
                  latePayments.length != 1 ? "s" : ""
                } em atraso`
              : "Nenhuma pendência hoje"}
          </p>
        </div>

        {/* Onboarding - Primeiros Passos */}
        {showOnboarding && (
          <section>
            <StatusCard
              type="onboarding"
              title="Primeiros Passos"
              description="Complete seu cadastro para aproveitar o máximo do sistema."
              actionLabel="Continuar Cadastro"
              onAction={() => {
                const nextStep = onboardingSteps.find((s) => !s.done);
                if (nextStep?.id === 1) navigate("/escolas?openModal=true");
                else if (nextStep?.id === 2)
                  navigate("/veiculos?openModal=true");
                else navigate("/passageiros?openModal=true");
              }}
              progress={{ current: completedSteps, total: 3 }}
            />
          </section>
        )}

        {/* Mini KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MiniKPI
            label="Receita Prevista"
            value={formatCurrency(receitaPrevista)}
            icon={DollarSign}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
            loading={isProfileLoading}
          />
          <MiniKPI
            label="A Receber"
            value={formatCurrency(aReceber)}
            icon={Wallet}
            colorClass={aReceber > 0 ? "text-orange-600" : "text-gray-400"}
            bgClass={aReceber > 0 ? "bg-orange-50" : "bg-gray-50"}
            loading={isProfileLoading}
          />
          <MiniKPI
            label="Passageiros Ativos"
            value={activePassengers}
            icon={Users}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            loading={isProfileLoading}
          />
        </div>

        {/* Status Operacional */}
        <section>
          {latePayments.length > 0 ? (
            <StatusCard
              type="pending"
              title="Atenção às Cobranças"
              description={`Você tem ${formatCurrency(
                totalEmAtraso
              )} em atraso de ${latePayments.length} passageiros.`}
              actionLabel="Ver Cobranças"
              onAction={() => navigate("/cobrancas")}
            />
          ) : (
            <StatusCard
              type="success"
              title="Tudo em dia!"
              description={`Parabéns! Todas as cobranças vencidas foram pagas. Receita prevista: ${formatCurrency(
                receitaPrevista
              )}.`}
            />
          )}
        </section>

        {/* Acessos Rápidos */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
            <ShortcutCard
              to="/passageiros?openModal=true"
              icon={Plus}
              label="Novo Passageiro"
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
            />
            <div
              onClick={handleCopyLink}
              className="cursor-pointer group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md h-24 w-full"
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-2 bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-blue-700">
                Link de Cadastro
              </span>
            </div>
            <ShortcutCard
              to="/cobrancas"
              icon={CreditCard}
              label="Cobranças"
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            <ShortcutCard
              to="/gastos"
              icon={TrendingUp}
              label="Gastos"
              colorClass="text-red-600"
              bgClass="bg-red-50"
            />
            <ShortcutCard
              to="/relatorios"
              icon={FileText}
              label="Relatórios"
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
            />
            <ShortcutCard
              to="/passageiros"
              icon={Users}
              label="Passageiros"
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            />
          </div>
        </section>

        {/* Marketing / Upsell (Discreto) */}
        <section className="pt-2">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">
                  {getPlanTitle(plano?.slug)}
                </h3>
                <p className="text-indigo-100 text-sm mt-1 max-w-md">
                  {getPlanMessage(plano?.slug)}
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none shadow-sm shrink-0"
                onClick={() => {
                  const mainSlug = getMainPlanSlug();
                  const url = mainSlug
                    ? `/planos?plano=${mainSlug}`
                    : "/planos";
                  navigate(url);
                }}
              >
                {getPlanCTA(plano?.slug)}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PullToRefreshWrapper>
  );
};

export default Home;
