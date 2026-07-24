import { useMemo, useEffect } from "react";
import { useAdminStats, useAdminWhatsappInstances, useAdminLogs } from "@/hooks/api/adminHooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
import { phoneMask } from "@/utils/masks";
import { ROUTES } from "@/constants/routes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { CANAL_AQUISICAO_CONFIG } from "@/utils/acquisition-channel.utils";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import {
  Users,
  DollarSign,
  Loader2,
  FileText,
  Eye,
  Bus,
  Radio,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateTimeBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CustomAcquisitionTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a] text-slate-100 p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 text-left">
        <p className="font-bold flex items-center gap-2 text-white">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-slate-200 font-semibold">
          {data.quantidade} motorista{data.quantidade !== 1 ? "s" : ""} ({data.porcentagem}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const { data: stats, isLoading } = useAdminStats();
  const { data: instances, isLoading: isLoadingInstances } = useAdminWhatsappInstances();
  const { data: logsData, isLoading: isLoadingLogs } = useAdminLogs({ limit: 5 });

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  const canaisChartData = useMemo(() => {
    if (!stats?.canaisAquisicao) return [];
    const total = Object.values(stats.canaisAquisicao).reduce((acc, v) => acc + v, 0);

    return Object.entries(stats.canaisAquisicao)
      .map(([key, count]) => {
        const cfg = CANAL_AQUISICAO_CONFIG[key as keyof typeof CANAL_AQUISICAO_CONFIG] || { label: key, color: "#64748B" };
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          key,
          name: cfg.label,
          quantidade: count,
          porcentagem: pct,
          color: cfg.color,
        };
      })
      .filter((item) => item.quantidade > 0)
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [stats?.canaisAquisicao]);

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-bold text-slate-400">Carregando métricas do ecossistema...</p>
      </div>
    );
  }

  const logsList = (logsData?.data || []).slice(0, 5);
  const latestLog = logsList.length > 0 ? logsList[0] : null;
  const remainingLogs = logsList.slice(1);

  const subBreakdown = [
    { key: "active", label: "Ativas", value: stats.assinaturas.active || 0, color: "bg-emerald-500", textColor: "text-emerald-400" },
    { key: "trial", label: "Trial (Testes)", value: stats.assinaturas.trial || 0, color: "bg-sky-500", textColor: "text-sky-400" },
    { key: "vitalicio", label: "Vitalícios", value: stats.assinaturas.vitalicio || 0, color: "bg-purple-500", textColor: "text-purple-400" },
    { key: "past_due", label: "Em Atraso", value: stats.assinaturas.past_due || 0, color: "bg-amber-500", textColor: "text-amber-400" },
    { key: "expired", label: "Expiradas", value: stats.assinaturas.expired || 0, color: "bg-orange-500", textColor: "text-orange-400" },
    { key: "canceled", label: "Canceladas", value: stats.assinaturas.canceled || 0, color: "bg-red-500", textColor: "text-red-400" },
  ];

  const totalAssinaturas = subBreakdown.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="space-y-8 text-left">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-blue-500/40 shadow-lg shadow-blue-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                TOTAL DE MOTORISTAS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {stats.totalMotoristas.toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Motoristas cadastrados
              </p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Bus className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-emerald-500/40 shadow-lg shadow-emerald-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                PASSAGEIROS ATIVOS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {stats.totalPassageiros.toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Em rotas ativas
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-amber-500/40 shadow-lg shadow-amber-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                RECEITA ACUMULADA
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {formatCurrency(stats.receitaTotal)}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Faturamento acumulado
              </p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-purple-500/40 shadow-lg shadow-purple-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ASSINATURAS ATIVAS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {stats.assinaturas.active.toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Motoristas pagantes
              </p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. MIDDLE SECTION GRID (CANAIS DE AQUISIÇÃO + ÚLTIMAS ATIVIDADES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ORIGEM DOS USUÁRIOS */}
        <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
              ORIGEM DOS USUÁRIOS (CANAIS DE AQUISIÇÃO)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {canaisChartData.length === 0 ? (
              <p className="text-xs text-slate-400 py-16 text-center">Nenhum canal cadastrado.</p>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-full h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={canaisChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="quantidade"
                      >
                        {canaisChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#131b2e" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomAcquisitionTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-headline font-black text-white">
                      {stats.totalMotoristas}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      USUÁRIOS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-slate-800/80">
                  {canaisChartData.map((item) => (
                    <div key={item.key} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-slate-300 truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold ml-auto">{item.porcentagem}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ÚLTIMAS ATIVIDADES (5 ÚLTIMAS) */}
        <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                ÚLTIMAS ATIVIDADES
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY)}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
              >
                Ver Todas
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-3">
              {isLoadingLogs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              ) : !latestLog ? (
                <p className="text-xs text-slate-400 py-12 text-center">Nenhuma atividade recente.</p>
              ) : (
                <div className="space-y-3">
                  {/* ATIVIDADE MAIS RECENTE (DESTAQUE MÁXIMO) */}
                  <div className="p-4 rounded-2xl bg-blue-950/30 border-2 border-blue-500/60 shadow-lg shadow-blue-500/10 relative space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                          {latestLog.usuarios?.nome || latestLog.entidade_tipo}
                        </h4>
                        <p className="text-xs font-medium text-slate-300 mt-1">
                          {latestLog.descricao}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2.5 border-t border-blue-500/20">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs font-bold font-mono">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        {formatDateTimeBR(latestLog.created_at)}
                      </span>
                      {latestLog.meta && Object.keys(latestLog.meta).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY)}
                          className="h-7 px-3 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 rounded-xl shadow-md"
                        >
                          <Eye className="h-3 w-3 mr-1" /> INSPECIONAR
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* OUTRAS 4 ATIVIDADES SECUNDÁRIAS (DATA CENTRALIZADA VERTICALMENTE) */}
                  {remainingLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-slate-100 truncate">{log.usuarios?.nome || log.entidade_tipo}</h5>
                        <p className="text-xs text-slate-400 truncate">{log.descricao}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800/80 shrink-0 self-center">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatDateTimeBR(log.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* 3. LOWER SECTION GRID (NOVOS MOTORISTAS + INSTÂNCIAS WHATSAPP) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NOVOS MOTORISTAS */}
        <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
              NOVOS MOTORISTAS
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS)}
              className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
            >
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">Nenhum motorista cadastrado recentemente.</p>
            ) : (
              stats.recentUsers.slice(0, 4).map((user) => {
                const sub = user.assinaturas?.[0];

                return (
                  <div
                    key={user.id}
                    onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white">{user.nome}</h4>
                      <p className="text-[11px] font-semibold text-slate-400">
                        Registrado: {formatDateBR(user.created_at)}
                      </p>
                    </div>

                    <SubscriptionStatusBadge status={sub?.status} dataVencimento={sub?.data_vencimento} className="text-[10px] px-2.5 py-1" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* INSTÂNCIAS WHATSAPP */}
        <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
              INSTÂNCIAS WHATSAPP
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES)}
              className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
            >
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-3">
            {isLoadingInstances ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : !instances || instances.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">Nenhuma instância cadastrada.</p>
            ) : (
              instances.map((instance) => {
                const statusStr = (instance.evolution_status || "").toLowerCase();
                const isOnline = statusStr === "open" || statusStr === "connected" || statusStr === "connecting";
                const isAlert = statusStr === "connecting";

                return (
                  <div
                    key={instance.id}
                    onClick={() => navigate(ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES)}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${isOnline ? (isAlert ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20') : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <Radio className="h-4 w-4 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{instance.instance_name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          {isOnline ? (
                            <span className={isAlert ? "text-amber-400" : "text-emerald-400"}>
                              {isAlert ? "ALERTA" : "ONLINE"} - Taxa: {instance.rate_limit_max}/min
                            </span>
                          ) : (
                            <span className="text-red-400">OFFLINE - Taxa: 0/min</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. BOTTOM SECTION: STATUS DAS ASSINATURAS (TODOS OS STATUS) */}
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
            STATUS DAS ASSINATURAS (VISÃO COMPLETA)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-4">
          {subBreakdown.map((item) => {
            const pct = totalAssinaturas > 0 ? Math.round((item.value / totalAssinaturas) * 100) : 0;

            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className={`font-black ${item.textColor}`}>{pct}%</span>
                    <span className="font-bold text-white text-sm">{item.value}</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${item.color} transition-all duration-1000 rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
