import { useAdminStats, useAdminWhatsappInstances, useAdminLogs } from "@/hooks/api/adminHooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { WhatsappStatusBadge } from "@/components/ui/WhatsappStatusBadge";
import { phoneMask } from "@/utils/masks";
import { formatWhatsappPurpose } from "@/utils/whatsapp";
import { ROUTES } from "@/constants/routes";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";
import {
  Users,
  DollarSign,
  Activity,
  Loader2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Infinity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const { data: stats, isLoading } = useAdminStats();
  const { data: instances, isLoading: isLoadingInstances } = useAdminWhatsappInstances();
  const { data: logsData, isLoading: isLoadingLogs } = useAdminLogs({ limit: 10 });

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  if (!stats) return null;

  const kpis = [
    {
      title: "Total de Motoristas",
      value: stats.totalMotoristas.toLocaleString("pt-BR"),
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Passageiros Ativos",
      value: stats.totalPassageiros.toLocaleString("pt-BR"),
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Receita Acumulada",
      value: formatCurrency(stats.receitaTotal),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Assinaturas Ativas",
      value: stats.assinaturas.active.toLocaleString("pt-BR"),
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  const subBreakdown = [
    { label: "Vitalícios", value: stats.assinaturas.vitalicio || 0, icon: Infinity, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Trial", value: stats.assinaturas.trial, icon: Clock, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Ativos", value: stats.assinaturas.active, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Atrasados", value: stats.assinaturas.past_due, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Expirados", value: stats.assinaturas.expired, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Cancelados", value: stats.assinaturas.canceled, icon: XCircle, color: "text-slate-500", bg: "bg-slate-50" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
              Dashboard
            </h1>
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Visão macro do ecossistema Van360.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((stat, i) => (
          <Card
            key={i}
            className="border-0 shadow-diff-shadow rounded-2xl sm:rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 sm:p-3.5 rounded-xl sm:rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", stat.color)} />
                </div>
              </div>
              <div className="mt-4 sm:mt-6 flex flex-col items-start">
                <h3 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                  {stat.title}
                </h3>
                <p className="text-xl sm:text-3xl font-headline font-black text-[#1a3a5c] tracking-tighter">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Últimas Atividades */}
        <Card className="lg:col-span-3 border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white p-2">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1 text-left flex-1">
              <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                Últimas Atividades
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400">
                Histórico recente do sistema
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-8 px-3 rounded-xl hidden sm:flex"
              >
                Ver Todas
              </Button>
              <Activity className="h-5 w-5 text-slate-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6 flex flex-col gap-3 overflow-hidden">
            <ActivityLogsList logs={logsData?.data || []} isLoading={isLoadingLogs} />
          </CardContent>
        </Card>

        {/* 2. Assinaturas por Status */}
        <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white p-2">
          <CardHeader className="p-6">
            <div className="space-y-1 text-left">
              <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                Assinaturas por Status
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400">
                Distribuição atual de assinaturas
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 flex flex-col gap-3">
            {subBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", item.bg)}>
                    <item.icon className={cn("h-4 w-4", item.color)} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                </div>
                <span className="text-lg font-headline font-black text-[#1a3a5c]">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Instâncias WhatsApp */}
        <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white p-2">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1 text-left flex-1">
              <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                Instâncias WhatsApp
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400">
                Status das conexões
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-8 px-3 rounded-xl hidden sm:flex"
              >
                Ver Todas
              </Button>
              <MessageSquare className="h-5 w-5 text-slate-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6 flex flex-col gap-3">
            {isLoadingInstances ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#1a3a5c]" />
              </div>
            ) : !instances || instances.length === 0 ? (
              <p className="text-xs text-slate-400 text-center">Nenhuma instância cadastrada.</p>
            ) : (
              instances.map((instance) => (
                <div
                  key={instance.id}
                  onClick={() => navigate(ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-700 truncate">{instance.instance_name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{formatWhatsappPurpose(instance.purpose)}</span>
                  </div>
                  <WhatsappStatusBadge status={instance.evolution_status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 4. Novos Usuários */}
        <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white p-2">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1 text-left flex-1">
              <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                Novos Usuários
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400">
                Usuários mais recentes
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-8 px-3 rounded-xl hidden sm:flex"
              >
                Ver Todos
              </Button>
              <Users className="h-5 w-5 text-slate-300" />
            </div>
          </CardHeader>
          <CardContent className="px-6 flex flex-col gap-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Nenhum cadastro encontrado.
              </p>
            ) : (
              stats.recentUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                  className="flex items-center gap-2 sm:gap-4 group cursor-pointer hover:bg-slate-50 p-2 sm:p-3 rounded-2xl transition-all"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#1a3a5c]/10 flex items-center justify-center rounded-lg sm:rounded-xl text-[#1a3a5c] font-black text-xs sm:text-sm shrink-0">
                    {user.nome?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate leading-tight">
                      {user.nome}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                      {phoneMask(user.telefone || "") || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:inline">
                      {formatDate(user.created_at)}
                    </span>
                    <SubscriptionStatusBadge status={user.assinaturas?.[0]?.status} dataVencimento={user.assinaturas?.[0]?.data_vencimento} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2.5 sm:py-1" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
