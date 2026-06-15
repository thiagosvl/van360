import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "@/hooks/api/adminHooks";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const { openAdminCreateUserDialog } = useLayout();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
            Usuários
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            {total} motorista{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => openAdminCreateUserDialog((userId) => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}`))}
          className="rounded-xl h-11 bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Motorista
        </Button>
      </div>

      <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
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
                    ? "bg-[#1a3a5c] text-white"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-sm font-semibold text-slate-400">
                Nenhum usuário encontrado.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
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
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                        >
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                                {user.nome}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                {user.apelido || "—"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 hidden md:table-cell">
                            <span className="text-xs text-slate-500">
                              {phoneMask(user.telefone || "") || "—"}
                            </span>
                          </td>
                          <td className="py-4 hidden lg:table-cell">
                            <span className="text-xs text-slate-500 block">
                              {new Date(user.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-bold text-slate-600">
                              {sub?.planos?.nome || "—"}
                            </span>
                          </td>
                          <td className="py-4">
                            <SubscriptionStatusBadge status={sub?.status} />
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10"
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
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left cursor-pointer hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                            {user.nome}
                          </h3>
                          {user.apelido && (
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {user.apelido}
                            </p>
                          )}
                        </div>
                        <SubscriptionStatusBadge status={sub?.status} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Telefone</span>
                          <span className="font-semibold text-slate-600">{phoneFormatted || "—"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Cadastro</span>
                          <span className="font-semibold text-slate-600">{dateFormatted}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Plano</span>
                          <span className="text-xs font-bold text-slate-700">{sub?.planos?.nome || "—"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-8 px-2.5 flex items-center gap-1"
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
                      className="rounded-xl border-slate-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="rounded-xl border-slate-200"
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
