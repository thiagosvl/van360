import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers, useAdminStats } from "@/hooks/api/adminHooks";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Loader2,
  Plus,
  Bus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Infinity as InfinityIcon,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { phoneMask } from "@/utils/masks";
import { useLayout } from "@/contexts/LayoutContext";
import { SubscriptionStatusBadge, SUBSCRIPTION_STATUS_DETAILS } from "@/components/ui/SubscriptionStatusBadge";
import { ROUTES } from "@/constants/routes";

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  ...Object.entries(SUBSCRIPTION_STATUS_DETAILS).map(([value, detail]) => ({
    value,
    label: detail.label,
  })),
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const { openAdminCreateUserDialog, setPageTitle } = useLayout();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search, 400);

  const { data: stats } = useAdminStats();
  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  useEffect(() => {
    setPageTitle("Usuários");
  }, [setPageTitle]);

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 text-left">
      {/* 1. KPIS SUPERIORES PADRONIZADOS DO DASHBOARD (6 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* TOTAL DE MOTORISTAS */}
        <Card className="border border-blue-500/40 shadow-lg shadow-blue-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                TOTAL DE MOTORISTAS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {(stats?.totalMotoristas ?? total).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Cadastrados
              </p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Bus className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* VITALÍCIOS */}
        <Card className="border border-purple-500/40 shadow-lg shadow-purple-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                VITALÍCIOS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {(stats?.assinaturas?.vitalicio ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Acesso ilimitado
              </p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <InfinityIcon className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* EM TESTES (TRIAL) */}
        <Card className="border border-sky-500/40 shadow-lg shadow-sky-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                TRIAL
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {(stats?.assinaturas?.trial ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Período de avaliação
              </p>
            </div>
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* ASSINATURAS ATIVAS */}
        <Card className="border border-emerald-500/40 shadow-lg shadow-emerald-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ASSINATURAS ATIVAS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {(stats?.assinaturas?.active ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Motoristas pagantes
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* EM ATRASO */}
        <Card className="border border-amber-500/40 shadow-lg shadow-amber-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                EM ATRASO
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {(stats?.assinaturas?.past_due ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Pendentes de cobrança
              </p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* CANCELADOS */}
        <Card className="border border-red-500/40 shadow-lg shadow-red-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                CANCELADOS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {(stats?.assinaturas?.canceled ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Assinaturas inativas
              </p>
            </div>
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* BARRA DE AÇÃO SUPERIOR */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-400">
          Listando {users.length} de {total} motorista{total !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={() => openAdminCreateUserDialog((userId) => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}`))}
          className="rounded-xl h-11 bg-blue-600 text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:bg-blue-500 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Motorista
        </Button>
      </div>

      {/* TABELA E FILTROS */}
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar por nome, telefone ou ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-11 h-11 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`rounded-xl text-xs font-bold whitespace-nowrap ${statusFilter === f.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <p className="text-sm font-semibold text-slate-400">
                Nenhum usuário encontrado.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80">
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Telefone</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Cadastro</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Plano</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const sub = Array.isArray(user.assinaturas) ? user.assinaturas[0] : null;

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-slate-800/40 hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                        >
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-100 truncate max-w-[200px]">
                                {user.nome}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                {user.apelido || "—"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 hidden md:table-cell">
                            <span className="text-xs text-slate-300">
                              {phoneMask(user.telefone || "") || "—"}
                            </span>
                          </td>
                          <td className="py-4 hidden lg:table-cell">
                            <span className="text-xs text-slate-400 block">
                              {new Date(user.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-bold text-slate-200">
                              {sub?.planos?.nome || "—"}
                            </span>
                          </td>
                          <td className="py-4">
                            <SubscriptionStatusBadge status={sub?.status} dataVencimento={sub?.data_vencimento} />
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4 mb-4">
                {users.map((user) => {
                  const sub = Array.isArray(user.assinaturas) ? user.assinaturas[0] : null;
                  const phoneFormatted = phoneMask(user.telefone || "");
                  const dateFormatted = new Date(user.created_at).toLocaleDateString("pt-BR");

                  return (
                    <div
                      key={user.id}
                      onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                      className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-left cursor-pointer hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-100 line-clamp-1">
                            {user.nome}
                          </h3>
                          {user.apelido && (
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {user.apelido}
                            </p>
                          )}
                        </div>
                        <SubscriptionStatusBadge status={sub?.status} dataVencimento={sub?.data_vencimento} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Telefone</span>
                          <span className="font-semibold text-slate-200">{phoneFormatted || "—"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Cadastro</span>
                          <span className="font-semibold text-slate-200">{dateFormatted}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Plano</span>
                          <span className="text-xs font-bold text-slate-200">{sub?.planos?.nome || "—"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-8 px-2.5 flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Ver Detalhes</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                      className="rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
