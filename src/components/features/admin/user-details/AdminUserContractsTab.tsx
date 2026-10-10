import { useState, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  PenTool,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminUserContractItem, AdminUserPassengerItem } from "@/services/api/admin.api";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatShortName } from "@/utils/formatters/name";
import { phoneMask } from "@/utils/masks";
import { ContratoProvider, ContratoStatus, DriverContractConfigStatus } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { obterUrlDocumentoContrato } from "@/utils/domain";
import { safeCloseDialog } from "@/hooks";

interface AdminUserContractsTabProps {
  user: {
    id: string;
    nome: string;
    assinatura_digital_url?: string | null;
    config_contrato?: Record<string, any> | null;
  };
  kpis?: {
    contratosCount?: number;
    contratosAssinadosCount?: number;
    contratosPendentesCount?: number;
    valorTotalContratos?: number;
    statusConfiguracaoContrato?: DriverContractConfigStatus;
  };
  passageiros: AdminUserPassengerItem[];
  contratos: AdminUserContractItem[];
}

export function AdminUserContractsTab({
  user,
  kpis,
  passageiros = [],
  contratos = [],
}: AdminUserContractsTabProps) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const totalContratos = kpis?.contratosCount ?? contratos.length;
  const totalAssinados = kpis?.contratosAssinadosCount ?? contratos.filter((c) => c.status === ContratoStatus.ASSINADO).length;
  const totalPendentes = kpis?.contratosPendentesCount ?? contratos.filter((c) => c.status === ContratoStatus.PENDENTE).length;

  const totalPassageiros = passageiros.length;
  const pctEmitidos = totalPassageiros > 0 ? Math.round((totalContratos / totalPassageiros) * 100) : 0;
  const pctAssinados = totalContratos > 0 ? Math.round((totalAssinados / totalContratos) * 100) : 0;
  const pctPendentes = totalContratos > 0 ? Math.round((totalPendentes / totalContratos) * 100) : 0;

  const contractByPassengerMap = useMemo(() => {
    const map = new Map<string, AdminUserContractItem>();
    for (const c of contratos) {
      if (c.passageiro_id && !map.has(c.passageiro_id)) {
        map.set(c.passageiro_id, c);
      }
    }
    return map;
  }, [contratos]);

  const filteredPassageiros = useMemo(() => {
    return passageiros.filter((p) => {
      const term = search.toLowerCase();
      const contrato = contractByPassengerMap.get(p.id);
      return (
        p.nome.toLowerCase().includes(term) ||
        (p.serie_ano && p.serie_ano.toLowerCase().includes(term)) ||
        (contrato && contrato.status.toLowerCase().includes(term))
      );
    });
  }, [passageiros, search, contractByPassengerMap]);

  const handleOpenContractDocument = (contrato: AdminUserContractItem) => {
    const url = obterUrlDocumentoContrato(contrato);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Documento do contrato indisponível no momento.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <AdminKpiCard
          title="Contratos emitidos"
          value={`${totalContratos}/${totalPassageiros}`}
          subtext={`${pctEmitidos}% dos alunos`}
          cardBorder="border-border hover:border-primary/50"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<FileText className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Contratos assinados"
          value={totalAssinados}
          subtext={`${pctAssinados}% assinados`}
          cardBorder="border-border hover:border-emerald-500/50"
          iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Contratos pendentes"
          value={totalPendentes}
          subtext={`${pctPendentes}% aguardando assinatura`}
          cardBorder="border-border hover:border-amber-500/50"
          iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardHeader className="p-6 border-b border-border bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Status dos contratos</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {search.trim() ? (
                    `(${filteredPassageiros.length} de ${passageiros.length})`
                  ) : (
                    `(${passageiros.length})`
                  )}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Acompanhamento individual dos contratos de transporte.
              </p>
            </div>

            {passageiros.length > 0 && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aluno..."
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
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPassageiros.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                icon={FileText}
                title="Nenhum contrato encontrado"
                description={
                  search
                    ? "Nenhum contrato corresponde à busca informada."
                    : "O motorista ainda não possui contratos emitidos para os alunos."
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                      <th className="py-3.5 px-6">Aluno</th>
                      <th className="py-3.5 px-4">Responsável</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-xs">
                    {filteredPassageiros.map((p) => {
                      const contrato = contractByPassengerMap.get(p.id);

                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                                {p.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-foreground block truncate">{p.nome}</span>
                                {p.serie_ano && (
                                  <span className="text-xs text-muted-foreground block font-medium">
                                    {p.serie_ano}{p.turma ? ` — Turma ${p.turma}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {p.responsavel_principal?.nome ? (
                              <div>
                                <p className="font-medium text-foreground truncate">
                                  {formatShortName(p.responsavel_principal.nome, true)}
                                </p>
                                {p.responsavel_principal.telefone && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {phoneMask(p.responsavel_principal.telefone)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {contrato ? (
                              contrato.status === ContratoStatus.ASSINADO ? (
                                contrato.provider === ContratoProvider.IMPORTADO ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/30">
                                    <CheckCircle2 className="h-3 w-3" /> Assinado (importado)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                    <CheckCircle2 className="h-3 w-3" /> Assinado
                                  </span>
                                )
                              ) : contrato.status === ContratoStatus.PENDENTE ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                  <Clock className="h-3 w-3" /> Pendente
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary text-foreground border border-border">
                                  {contrato.status}
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground bg-secondary/60 border border-border">
                                Sem contrato
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            {contrato ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenContractDocument(contrato)}
                                className="h-8 rounded-xl text-primary hover:bg-secondary hover:text-primary px-2.5 flex items-center gap-1.5 ml-auto font-semibold text-xs"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Ver contrato</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-4">
                {filteredPassageiros.map((p) => {
                  const contrato = contractByPassengerMap.get(p.id);

                  return (
                    <div key={p.id} className="p-4 bg-card rounded-2xl border border-border space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-foreground">{p.nome}</h5>
                            {p.serie_ano && (
                              <p className="text-xs text-muted-foreground">
                                {p.serie_ano}{p.turma ? ` — Turma ${p.turma}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        {contrato ? (
                          contrato.status === ContratoStatus.ASSINADO ? (
                            contrato.provider === ContratoProvider.IMPORTADO ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/30 shrink-0">
                                <CheckCircle2 className="h-3 w-3" /> Assinado (importado)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                                <CheckCircle2 className="h-3 w-3" /> Assinado
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                              <Clock className="h-3 w-3" /> Pendente
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground bg-secondary/60 border border-border shrink-0">
                            Sem contrato
                          </span>
                        )}
                      </div>

                      {contrato && (
                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                          <span className="font-mono font-semibold text-foreground">
                            {contrato.valor_total ? formatCurrency(Number(contrato.valor_total)) : "—"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenContractDocument(contrato)}
                            className="h-7 rounded-xl text-primary hover:bg-secondary px-2.5 text-xs font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Ver contrato
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isSignatureModalOpen && user.assinatura_digital_url && (
        <AdminBaseDialog
          open={isSignatureModalOpen}
          onOpenChange={(open) => {
            if (!open) safeCloseDialog(() => setIsSignatureModalOpen(false));
          }}
          maxWidth="md"
        >
          <AdminBaseDialog.Header
            title="Assinatura digital do motorista"
            subtitle={`Motorista: ${user.nome}`}
            icon={<PenTool className="w-5 h-5 text-primary" />}
            onClose={() => safeCloseDialog(() => setIsSignatureModalOpen(false))}
          />
          <AdminBaseDialog.Body>
            <div className="space-y-4 text-center py-4">
              <div className="p-6 bg-secondary/30 rounded-2xl border border-border flex items-center justify-center">
                <img
                  src={user.assinatura_digital_url}
                  alt="Assinatura Digital"
                  className="max-h-40 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esta é a assinatura digital cadastrada pelo motorista para chancela dos contratos emitidos.
              </p>
            </div>
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </div>
  );
}
