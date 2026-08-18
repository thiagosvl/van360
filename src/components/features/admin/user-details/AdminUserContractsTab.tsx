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
          title="CONTRATOS EMITIDOS"
          value={`${totalContratos}/${totalPassageiros}`}
          subtext={`${pctEmitidos}% dos passageiros`}
          cardBorder="border-sky-500/40 shadow-sky-500/10"
          iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
          icon={<FileText className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="CONTRATOS ASSINADOS"
          value={totalAssinados}
          subtext={`${pctAssinados}% assinados`}
          cardBorder="border-emerald-500/40 shadow-emerald-500/10"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="CONTRATOS PENDENTES"
          value={totalPendentes}
          subtext={`${pctPendentes}% aguardando assinatura`}
          cardBorder="border-amber-500/40 shadow-amber-500/10"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100">
        <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <CardTitle className="text-xs font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Status dos Contratos
                {search.trim() ? (
                  <span>({filteredPassageiros.length} de {passageiros.length})</span>
                ) : (
                  <span>({passageiros.length})</span>
                )}
              </CardTitle>
              <p className="text-[11px] font-medium text-slate-400">
                Acompanhamento individual dos contratos de transporte.
              </p>
            </div>

            {passageiros.length > 0 && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por passageiro..."
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
                    : "O motorista ainda não possui contratos emitidos para os passageiros."
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3.5 px-6">Passageiro</th>
                      <th className="py-3.5 px-4">Responsável</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {filteredPassageiros.map((p) => {
                      const contrato = contractByPassengerMap.get(p.id);

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-black text-xs border border-blue-500/20 shrink-0">
                                {p.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-100 block truncate">{p.nome}</span>
                                {p.serie_ano && (
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    {p.serie_ano}{p.turma ? ` — Turma ${p.turma}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {p.responsavel_principal?.nome ? (
                              <div>
                                <p className="font-medium text-slate-300 truncate">
                                  {formatShortName(p.responsavel_principal.nome, true)}
                                </p>
                                {p.responsavel_principal.telefone && (
                                  <p className="text-[10px] text-slate-400 font-medium font-mono">
                                    {phoneMask(p.responsavel_principal.telefone)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {contrato ? (
                              contrato.status === ContratoStatus.ASSINADO ? (
                                contrato.provider === ContratoProvider.IMPORTADO ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                    <CheckCircle2 className="h-3 w-3" /> IMPORTADO
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="h-3 w-3" /> ASSINADO
                                  </span>
                                )
                              ) : contrato.status === ContratoStatus.PENDENTE ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <Clock className="h-3 w-3" /> PENDENTE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80">
                                  {contrato.status}
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800">
                                SEM CONTRATO
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            {contrato ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenContractDocument(contrato)}
                                className="h-8 rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300 px-2.5 flex items-center gap-1.5 ml-auto"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Ver Contrato</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {passageiros.map((p) => {
                  const contrato = contractByPassengerMap.get(p.id);

                  return (
                    <div key={p.id} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-black text-xs border border-blue-500/20 shrink-0">
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-100">{p.nome}</h5>
                            {p.serie_ano && (
                              <p className="text-[10px] font-medium text-slate-400">
                                {p.serie_ano}{p.turma ? ` — Turma ${p.turma}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        {contrato ? (
                          contrato.status === ContratoStatus.ASSINADO ? (
                            contrato.provider === ContratoProvider.IMPORTADO ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                                <CheckCircle2 className="h-3 w-3" /> IMPORTADO
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                <CheckCircle2 className="h-3 w-3" /> ASSINADO
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                              <Clock className="h-3 w-3" /> PENDENTE
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500 bg-slate-900 border border-slate-800 shrink-0">
                            SEM CONTRATO
                          </span>
                        )}
                      </div>

                      {contrato && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <span className="font-mono font-bold text-blue-400">
                            {contrato.valor_total ? formatCurrency(Number(contrato.valor_total)) : "—"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenContractDocument(contrato)}
                            className="h-7 rounded-xl text-blue-400 hover:bg-slate-800 px-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Ver Contrato
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
          onOpenChange={(open) => !open && setIsSignatureModalOpen(false)}
          maxWidth="md"
        >
          <AdminBaseDialog.Header
            title="Assinatura Digital do Motorista"
            subtitle={`Motorista: ${user.nome}`}
            icon={<PenTool className="w-5 h-5 text-blue-400" />}
            onClose={() => setIsSignatureModalOpen(false)}
          />
          <AdminBaseDialog.Body>
            <div className="space-y-4 text-center py-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-700 flex items-center justify-center">
                <img
                  src={user.assinatura_digital_url}
                  alt="Assinatura Digital"
                  className="max-h-40 object-contain"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Esta é a assinatura digital cadastrada pelo motorista para chancela dos contratos emitidos.
              </p>
            </div>
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </div>
  );
}
