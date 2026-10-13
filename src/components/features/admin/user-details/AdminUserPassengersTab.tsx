import { useState, useMemo } from "react";
import { AdminUserPassengerItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminDriverVencimentosTabela } from "@/components/features/admin/user-details/AdminDriverVencimentosTabela";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { StatusFilter } from "@/types/enums";
import { useLayout } from "@/contexts/LayoutContext";
import {
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  X,
  Bell,
  Send,
} from "lucide-react";
import { phoneMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatShortName } from "@/utils/formatters/name";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminUserPassengersTabProps {
  passageiros: AdminUserPassengerItem[];
  userId?: string;
  motoristaNome?: string;
}

const getValorMensalidade = (p: AdminUserPassengerItem) => {
  const val = p.valor_cobranca;
  return val ? Number(val) : 0;
};

const getMotivosBloqueio = (p: AdminUserPassengerItem): string[] => {
  const motivos: string[] = [];

  if (!p.ativo) {
    motivos.push("Aluno inativo");
  }
  if (p.enviar_notificacoes === false) {
    motivos.push("Notificações desativadas para o aluno");
  }
  const resp = p.responsavel_principal;
  if (!resp) {
    motivos.push("Sem responsável cadastrado");
  } else if (!resp.telefone && !resp.email) {
    motivos.push("Responsável sem contato cadastrado");
  }
  const valor = getValorMensalidade(p);
  if (valor <= 0) {
    motivos.push("Valor da mensalidade não informado");
  }
  if (!p.dia_vencimento || Number(p.dia_vencimento) <= 0) {
    motivos.push("Dia de vencimento não informado");
  }
  if (!p.cobranca_mes_atual) {
    motivos.push("Parcela do mês atual não gerada");
  } else if (p.cobranca_mes_atual.status === "PAGO") {
    motivos.push("Parcela do mês já foi paga");
  } else if (p.cobranca_mes_atual.status === "CANCELADA") {
    motivos.push("Parcela do mês cancelada");
  }

  if (p.motivo_bloqueio) {
    const backendMotivos = p.motivo_bloqueio.split(" • ").map((m) => m.trim());
    for (const m of backendMotivos) {
      if (m && !motivos.includes(m)) {
        motivos.push(m);
      }
    }
  }

  if (motivos.length === 0 && !p.pode_cobrar) {
    motivos.push("Lembrete indisponível para este aluno");
  }

  return motivos;
};

export function AdminUserPassengersTab({ passageiros, userId, motoristaNome }: AdminUserPassengersTabProps) {
  const { openAdminPassengerNotificationsDialog, openAdminPassengerSendCobrancaDialog } = useLayout();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(StatusFilter.ALL);

  const totalPassageiros = passageiros.length;
  const ativosCount = passageiros.filter((p) => p.ativo).length;
  const inativosCount = passageiros.filter((p) => !p.ativo).length;
  const semValorCount = passageiros.filter((p) => getValorMensalidade(p) <= 0).length;

  const comValorList = passageiros.filter((p) => getValorMensalidade(p) > 0);
  const somaValores = comValorList.reduce((acc, p) => acc + getValorMensalidade(p), 0);
  const mediaMensalidade = comValorList.length > 0 ? somaValores / comValorList.length : 0;

  const pctIncompletos = totalPassageiros > 0 ? Math.round((semValorCount / totalPassageiros) * 100) : 0;

  const filtered = useMemo(() => {
    return passageiros.filter((p) => {
      const term = search.toLowerCase();
      const matchesSearch =
        p.nome.toLowerCase().includes(term) ||
        (p.responsavel_principal?.nome && p.responsavel_principal.nome.toLowerCase().includes(term)) ||
        (p.escolas?.nome && p.escolas.nome.toLowerCase().includes(term)) ||
        (p.endereco && p.endereco.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (statusFilter === StatusFilter.ACTIVE) return p.ativo;
      if (statusFilter === StatusFilter.INACTIVE) return !p.ativo;
      if (statusFilter === StatusFilter.INCOMPLETE) return getValorMensalidade(p) <= 0;

      return true;
    });
  }, [passageiros, search, statusFilter]);

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <AdminKpiCard
          title="Alunos ativos"
          value={ativosCount}
          subtext={`${inativosCount} ${inativosCount === 1 ? "inativo" : "inativos"}`}
          cardBorder={`transition-all cursor-pointer ${
            statusFilter === StatusFilter.ACTIVE
              ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/20"
              : "border-border hover:border-emerald-500/60"
          }`}
          iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          icon={<CheckCircle2 className="h-5 w-5" />}
          onClick={() => setStatusFilter(statusFilter === StatusFilter.ACTIVE ? StatusFilter.ALL : StatusFilter.ACTIVE)}
        />

        <AdminKpiCard
          title="Cadastros incompletos"
          value={semValorCount}
          subtext={`${pctIncompletos}% sem valor de cobrança`}
          cardBorder={`transition-all cursor-pointer ${
            statusFilter === StatusFilter.INCOMPLETE
              ? "border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/20"
              : "border-border hover:border-amber-500/60"
          }`}
          iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
          icon={<AlertCircle className="h-5 w-5" />}
          onClick={() => setStatusFilter(statusFilter === StatusFilter.INCOMPLETE ? StatusFilter.ALL : StatusFilter.INCOMPLETE)}
        />

        <AdminKpiCard
          title="Média da mensalidade"
          value={formatCurrency(mediaMensalidade)}
          subtext={`${comValorList.length} com valor informado`}
          cardBorder="border-border hover:border-primary/50"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <AdminDriverVencimentosTabela passageiros={passageiros} />

      <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardHeader className="p-6 border-b border-border bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Listagem de alunos</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {search.trim() || statusFilter !== StatusFilter.ALL ? (
                    `(${filtered.length} de ${totalPassageiros})`
                  ) : (
                    `(${totalPassageiros})`
                  )}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Alunos vinculados às rotas deste motorista.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno, responsável, escola..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 rounded-xl bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground text-xs focus-visible:ring-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
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
              className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap ${
                statusFilter === StatusFilter.ALL
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              Todos ({totalPassageiros})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.ACTIVE)}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap ${
                statusFilter === StatusFilter.ACTIVE
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              Ativos ({ativosCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.INACTIVE)}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap ${
                statusFilter === StatusFilter.INACTIVE
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              Inativos ({inativosCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(StatusFilter.INCOMPLETE)}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap ${
                statusFilter === StatusFilter.INCOMPLETE
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                title="Nenhum aluno encontrado"
                description={
                  search || statusFilter !== StatusFilter.ALL
                    ? "Nenhum aluno corresponde à busca ou filtro selecionado."
                    : "O motorista ainda não possui alunos cadastrados."
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                      <th className="py-3.5 px-6">Aluno / Responsável</th>
                      <th className="py-3.5 px-4">Escola / Turno</th>
                      <th className="py-3.5 px-4">Mensalidade</th>
                      <th className="py-3.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-xs">
                    {filtered.map((p) => {
                      const valor = getValorMensalidade(p);
                      const hasValor = valor > 0;
                      const hasValidVencimento = hasValor && p.dia_vencimento && Number(p.dia_vencimento) > 0;
                      const motivosBloqueio = !p.pode_cobrar ? getMotivosBloqueio(p) : [];

                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                title={p.ativo ? "Aluno ativo" : "Aluno inativo"}
                                className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                  p.ativo
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                }`}
                              >
                                {p.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {p.nome}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                                  {p.responsavel_principal?.nome ? (
                                    <span>
                                      Resp: <strong className="text-foreground font-medium">{formatShortName(p.responsavel_principal.nome, true)}</strong>
                                      {p.responsavel_principal.telefone ? ` (${phoneMask(p.responsavel_principal.telefone)})` : ""}
                                    </span>
                                  ) : (
                                    <span className="italic text-muted-foreground/80">Sem responsável cadastrado</span>
                                  )}
                                  {(p.serie_ano || p.turma) && (
                                    <>
                                      <span>•</span>
                                      <span>{p.serie_ano ? `${p.serie_ano}` : ""}{p.turma ? ` — Turma ${p.turma}` : ""}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-foreground truncate">
                                {p.escolas?.nome || "Não informada"}
                              </p>
                              {p.turno && (
                                <p className="text-xs text-muted-foreground">
                                  Turno: {p.turno}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              {hasValor ? (
                                <span className="font-semibold text-foreground block">
                                  {formatCurrency(valor)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic text-xs block">—</span>
                              )}
                              {hasValidVencimento && (
                                <span className="text-xs text-muted-foreground block">
                                  Vencimento dia {p.dia_vencimento}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="flex items-center justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      className={`inline-flex ${!p.pode_cobrar ? "cursor-not-allowed" : ""}`}
                                    >
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={!p.pode_cobrar}
                                        onClick={() =>
                                          openAdminPassengerSendCobrancaDialog({
                                            userId: userId || "",
                                            passageiro: p,
                                            motoristaNome,
                                          })
                                        }
                                        className={`h-8 rounded-xl border text-xs font-semibold flex items-center gap-1.5 px-3 transition-all ${
                                          p.pode_cobrar
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                                            : "bg-secondary/40 border-border text-muted-foreground opacity-50"
                                        }`}
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Lembrete</span>
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="bg-popover border-border text-popover-foreground text-xs py-1.5 px-3 max-w-xs shadow-xl flex items-center gap-1.5 z-50"
                                  >
                                    {!p.pode_cobrar && (
                                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    )}
                                    <span>
                                      {!p.pode_cobrar
                                        ? `Lembrete indisponível: ${motivosBloqueio.join(" • ")}`
                                        : "Forçar envio do lembrete de cobrança para o responsável"}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAdminPassengerNotificationsDialog({ passageiroId: p.id, passageiroNome: p.nome })}
                                  title="Ver histórico de notificações"
                                  className="h-8 rounded-xl bg-secondary/50 border border-border text-foreground hover:text-primary hover:border-primary/40 hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 px-3 transition-all"
                                >
                                  <Bell className="h-3.5 w-3.5 text-primary" />
                                  <span className="hidden sm:inline">Notificações</span>
                                </Button>
                              </div>

                              {!p.pode_cobrar && motivosBloqueio.length > 0 && (
                                <div className="flex items-center gap-1 text-[11px] text-amber-500 text-right max-w-xs justify-end">
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  <span>
                                    <strong className="font-semibold text-muted-foreground">Desabilitado por:</strong>{" "}
                                    {motivosBloqueio.join(" • ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden p-4 space-y-3">
                {filtered.map((p) => {
                  const valor = getValorMensalidade(p);
                  const hasValor = valor > 0;
                  const hasValidVencimento = hasValor && p.dia_vencimento && Number(p.dia_vencimento) > 0;
                  const motivosBloqueio = !p.pode_cobrar ? getMotivosBloqueio(p) : [];

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-card border border-border space-y-3 text-left shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              p.ativo
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}
                          >
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground leading-tight">
                              {p.nome}
                            </h4>
                            {p.responsavel_principal?.nome && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Resp: {formatShortName(p.responsavel_principal.nome, true)}
                              </p>
                            )}
                            {(p.serie_ano || p.turma) && (
                              <p className="text-xs text-muted-foreground/80 mt-0.5">
                                {p.serie_ano ? `${p.serie_ano}` : ""}{p.turma ? ` — Turma ${p.turma}` : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        <ActiveStatusBadge active={p.ativo} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                            Escola / Turno
                          </span>
                          <span className="font-medium text-foreground block truncate">
                            {p.escolas?.nome || "Não informada"}
                            {p.turno ? ` — Turno ${p.turno}` : ""}
                          </span>
                        </div>

                        <div className="space-y-0.5 col-span-2 pt-2 border-t border-border/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                              Mensalidade
                            </span>
                            {hasValor ? (
                              <span className="font-semibold text-foreground text-xs">
                                {formatCurrency(valor)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">
                                —
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block text-right">
                              Vencimento
                            </span>
                            {hasValidVencimento ? (
                              <span className="text-xs text-foreground font-medium">
                                Dia {p.dia_vencimento}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-xs block text-right">—</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/60 col-span-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`w-full inline-flex ${!p.pode_cobrar ? "cursor-not-allowed" : ""}`}
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={!p.pode_cobrar}
                                    onClick={() =>
                                      openAdminPassengerSendCobrancaDialog({
                                        userId: userId || "",
                                        passageiro: p,
                                        motoristaNome,
                                      })
                                    }
                                    className={`w-full h-8 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                      p.pode_cobrar
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                        : "bg-secondary/40 border-border text-muted-foreground opacity-50"
                                    }`}
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Lembrete</span>
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-popover border-border text-popover-foreground text-xs py-1.5 px-3 max-w-xs shadow-xl flex items-center gap-1.5 z-50"
                              >
                                {!p.pode_cobrar && (
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                )}
                                <span>
                                  {!p.pode_cobrar
                                    ? `Lembrete indisponível: ${motivosBloqueio.join(" • ")}`
                                    : "Forçar envio do lembrete de cobrança para o responsável"}
                                </span>
                              </TooltipContent>
                            </Tooltip>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openAdminPassengerNotificationsDialog({ passageiroId: p.id, passageiroNome: p.nome })}
                              className="w-full h-8 rounded-xl bg-secondary/60 border border-border text-foreground hover:text-primary hover:bg-secondary text-xs font-semibold flex items-center justify-center gap-1.5"
                            >
                              <Bell className="h-3.5 w-3.5 text-primary" />
                              <span>Notificações</span>
                            </Button>
                          </div>

                          {!p.pode_cobrar && motivosBloqueio.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 leading-tight">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-foreground">Desabilitado por:</span>{" "}
                                <span>{motivosBloqueio.join(" • ")}</span>
                              </div>
                            </div>
                          )}
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
