import { useState, useMemo } from "react";
import { AdminUserPassengerItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { StatusFilter } from "@/types/enums";
import {
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  X,
} from "lucide-react";
import { phoneMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatShortName } from "@/utils/formatters/name";
import { openBrowserLink } from "@/utils/browser";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";

interface AdminUserPassengersTabProps {
  passageiros: AdminUserPassengerItem[];
}

export function AdminUserPassengersTab({ passageiros }: AdminUserPassengersTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(StatusFilter.ALL);

  const totalPassageiros = passageiros.length;
  const ativosCount = passageiros.filter((p) => p.ativo).length;
  const inativosCount = passageiros.filter((p) => !p.ativo).length;
  const semValorCount = passageiros.filter((p) => !p.valor_mensalidade || Number(p.valor_mensalidade) <= 0).length;

  const comValorList = passageiros.filter((p) => p.valor_mensalidade && Number(p.valor_mensalidade) > 0);
  const somaValores = comValorList.reduce((acc, p) => acc + Number(p.valor_mensalidade), 0);
  const mediaMensalidade = comValorList.length > 0 ? somaValores / comValorList.length : 0;

  const pctAtivos = totalPassageiros > 0 ? Math.round((ativosCount / totalPassageiros) * 100) : 0;
  const pctInativos = totalPassageiros > 0 ? Math.round((inativosCount / totalPassageiros) * 100) : 0;
  const pctIncompletos = totalPassageiros > 0 ? Math.round((semValorCount / totalPassageiros) * 100) : 0;

  const filtered = useMemo(() => {
    return passageiros.filter((p) => {
      const term = search.toLowerCase();
      const matchesSearch =
        p.nome.toLowerCase().includes(term) ||
        (p.nome_responsavel && p.nome_responsavel.toLowerCase().includes(term)) ||
        (p.escolas?.nome && p.escolas.nome.toLowerCase().includes(term)) ||
        (p.endereco && p.endereco.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (statusFilter === StatusFilter.ACTIVE) return p.ativo;
      if (statusFilter === StatusFilter.INACTIVE) return !p.ativo;
      if (statusFilter === StatusFilter.INCOMPLETE) return !p.valor_mensalidade || Number(p.valor_mensalidade) <= 0;

      return true;
    });
  }, [passageiros, search, statusFilter]);

  const handleOpenWhatsApp = (phone: string, nomeResp?: string | null, nomeAluno?: string | null) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return;
    const msg = `Olá${nomeResp ? ` ${nomeResp.split(" ")[0]}` : ""}! 👋 Entrei em contato sobre o cadastro do passageiro ${nomeAluno || ""}.`;
    const targetUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    openBrowserLink(targetUrl);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="PASSAGEIROS ATIVOS"
          value={ativosCount}
          subtext={`${pctAtivos}% dos passageiros`}
          cardBorder={`transition-all cursor-pointer ${statusFilter === StatusFilter.ACTIVE
              ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/20"
              : "border-emerald-500/40 shadow-emerald-500/10 hover:border-emerald-500/70"
            }`}
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<CheckCircle2 className="h-5 w-5" />}
          onClick={() => setStatusFilter(statusFilter === StatusFilter.ACTIVE ? StatusFilter.ALL : StatusFilter.ACTIVE)}
        />

        <AdminKpiCard
          title="PASSAGEIROS INATIVOS"
          value={inativosCount}
          subtext={`${pctInativos}% dos passageiros`}
          cardBorder={`transition-all cursor-pointer ${statusFilter === StatusFilter.INACTIVE
              ? "border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/20"
              : "border-rose-500/40 shadow-rose-500/10 hover:border-rose-500/70"
            }`}
          iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20"
          icon={<AlertTriangle className="h-5 w-5" />}
          onClick={() => setStatusFilter(statusFilter === StatusFilter.INACTIVE ? StatusFilter.ALL : StatusFilter.INACTIVE)}
        />

        <AdminKpiCard
          title="CADASTROS INCOMPLETOS"
          value={semValorCount}
          subtext={`${pctIncompletos}% sem valor de cobrança`}
          cardBorder={`transition-all cursor-pointer ${statusFilter === StatusFilter.INCOMPLETE
              ? "border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/20"
              : "border-amber-500/40 shadow-amber-500/10 hover:border-amber-500/70"
            }`}
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<AlertCircle className="h-5 w-5" />}
          onClick={() => setStatusFilter(statusFilter === StatusFilter.INCOMPLETE ? StatusFilter.ALL : StatusFilter.INCOMPLETE)}
        />

        <AdminKpiCard
          title="MÉDIA DA MENSALIDADE"
          value={formatCurrency(mediaMensalidade)}
          subtext={`${comValorList.length} com valor informado`}
          cardBorder="border-blue-500/40 shadow-blue-500/10"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <CardTitle className="text-xs font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Listagem de Passageiros ({filtered.length} de {totalPassageiros})
              </CardTitle>
              <p className="text-[11px] font-medium text-slate-400">
                Alunos vinculados às rotas deste motorista.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar por aluno, responsável, escola..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus-visible:ring-blue-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.ALL)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${statusFilter === StatusFilter.ALL
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              Todos ({totalPassageiros})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.ACTIVE)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${statusFilter === StatusFilter.ACTIVE
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              Ativos ({ativosCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.INACTIVE)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${statusFilter === StatusFilter.INACTIVE
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              Inativos ({inativosCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.INCOMPLETE)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${statusFilter === StatusFilter.INCOMPLETE
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              Incompletos ({semValorCount})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                icon={Users}
                title="Nenhum passageiro encontrado"
                description={
                  search || statusFilter !== StatusFilter.ALL
                    ? "Nenhum aluno corresponde à busca ou filtro selecionado."
                    : "O motorista ainda não possui alunos/passageiros cadastrados."
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/70 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3.5 px-6">Passageiro</th>
                      <th className="py-3.5 px-4">Responsável</th>
                      <th className="py-3.5 px-4">Escola / Turno</th>
                      <th className="py-3.5 px-4">Mensalidade</th>
                      <th className="py-3.5 px-4">Vencimento</th>
                      <th className="py-3.5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filtered.map((p) => {
                      const hasValor = p.valor_mensalidade && Number(p.valor_mensalidade) > 0;
                      const hasValidVencimento = hasValor && p.dia_vencimento && Number(p.dia_vencimento) > 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-black text-xs border border-blue-500/20 shrink-0">
                                {p.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-headline font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                                  {p.nome}
                                </p>
                                {(p.serie_ano || p.turma) && (
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {p.serie_ano ? `${p.serie_ano}` : ""}{p.turma ? ` — Turma ${p.turma}` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {p.nome_responsavel ? (
                              <div>
                                <p className="font-medium text-slate-300 truncate">
                                  {formatShortName(p.nome_responsavel, true)}
                                </p>
                                {p.telefone_responsavel && (
                                  <p className="text-[10px] text-slate-400 font-medium font-mono">
                                    {phoneMask(p.telefone_responsavel)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-slate-300 truncate">
                                {p.escolas?.nome || "Não informada"}
                              </p>
                              {p.turno && (
                                <p className="text-[10px] text-slate-400 font-medium">
                                  Turno: {p.turno}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {hasValor ? (
                              <span className="font-medium text-slate-300">
                                {formatCurrency(p.valor_mensalidade!)}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {hasValidVencimento ? (
                              <span className="font-medium text-slate-300">
                                Dia {p.dia_vencimento}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <ActiveStatusBadge active={p.ativo} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden p-4 space-y-3">
                {filtered.map((p) => {
                  const hasValor = p.valor_mensalidade && Number(p.valor_mensalidade) > 0;
                  const hasValidVencimento = hasValor && p.dia_vencimento && Number(p.dia_vencimento) > 0;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-3 text-left shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-black text-sm border border-blue-500/20 shrink-0">
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-headline font-bold text-slate-100 leading-tight">
                              {p.nome}
                            </h4>
                            {(p.serie_ano || p.turma) && (
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {p.serie_ano ? `${p.serie_ano}` : ""}{p.turma ? ` — Turma ${p.turma}` : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        <ActiveStatusBadge active={p.ativo} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                        {/* ESCOLA & TURNO */}
                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                            Escola / Turno
                          </span>
                          <span className="font-medium text-slate-300 block truncate">
                            {p.escolas?.nome || "Não informada"}
                            {p.turno ? ` — Turno ${p.turno}` : ""}
                          </span>
                        </div>

                        {/* MENSALIDADE E VENCIMENTO */}
                        <div className="space-y-0.5 col-span-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                              Mensalidade
                            </span>
                            {hasValor ? (
                              <span className="font-medium text-slate-300 text-xs">
                                {formatCurrency(p.valor_mensalidade!)}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[10px]">
                                —
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-right">
                              Vencimento
                            </span>
                            {hasValidVencimento ? (
                              <span className="text-[10px] text-slate-300 font-medium">
                                Dia {p.dia_vencimento}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[10px] block text-right">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
