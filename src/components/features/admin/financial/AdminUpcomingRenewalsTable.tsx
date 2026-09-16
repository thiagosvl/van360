import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, QrCode, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { openBrowserLink } from "@/utils/browser";
import { phoneMask } from "@/utils/masks";
import { formatDateToBR } from "@/utils/formatters";
import { CheckoutPaymentMethod } from "@/types/enums";
import type { ProximaRenovacaoItem } from "@/services/api/admin/admin-financial.api";

interface AdminUpcomingRenewalsTableProps {
  renewals: ProximaRenovacaoItem[];
}

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminUpcomingRenewalsTable({ renewals }: AdminUpcomingRenewalsTableProps) {
  const [windowFilter, setWindowFilter] = useState<number>(30);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

  const filterOptions = [
    { label: "7 dias", value: 7 },
    { label: "15 dias", value: 15 },
    { label: "30 dias", value: 30 },
    { label: "60 dias", value: 60 },
    { label: "90 dias", value: 90 },
    { label: "Todas", value: 0 },
  ];

  const filteredRenewals = useMemo(() => {
    const activePaying = renewals.filter((r) => !r.isVitalicio && r.dataVencimento);
    if (windowFilter === 0) return activePaying;

    const limit = new Date();
    limit.setDate(limit.getDate() + windowFilter);

    return activePaying.filter((r) => {
      const dt = new Date(r.dataVencimento!);
      return dt <= limit;
    });
  }, [renewals, windowFilter]);

  useEffect(() => {
    setPage(1);
  }, [windowFilter]);

  const totalPages = Math.ceil(filteredRenewals.length / pageSize) || 1;
  const paginatedRenewals = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRenewals.slice(start, start + pageSize);
  }, [filteredRenewals, page, pageSize]);

  const handleWhatsApp = (telefone: string, nome: string) => {
    if (!telefone) return;
    const cleanPhone = telefone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá ${nome}, tudo bem? Aqui é da equipe Van360.`);
    openBrowserLink(`https://wa.me/55${cleanPhone}?text=${msg}`);
  };

  return (
    <Card className="border border-slate-800/80 bg-[#131b2e] rounded-2xl shadow-xl overflow-hidden text-left">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span>Próximas Renovações de Assinatura</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Motoristas com assinaturas ativas com vencimento previsto na janela selecionada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setWindowFilter(opt.value)}
              className={`h-7 px-2.5 text-xs rounded-lg font-bold transition-all ${
                windowFilter === opt.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredRenewals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            Nenhuma renovação prevista para os próximos {windowFilter} dias.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3 px-4">Motorista</th>
                  <th className="py-3 px-3">Plano</th>
                  <th className="py-3 px-3">Vencimento</th>
                  <th className="py-3 px-3">Liquidação Caixa</th>
                  <th className="py-3 px-3">Valor</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-200">
                {paginatedRenewals.map((item) => {
                  const isYearly = item.tipoPlano === "YEARLY";
                  const isCartao = item.metodoPagamento === CheckoutPaymentMethod.CREDIT_CARD;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{item.motoristaNome}</p>
                            <p className="text-[11px] text-slate-400">{phoneMask(item.motoristaTelefone)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isYearly
                              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                              : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {isYearly ? "Anual" : "Mensal"}
                        </Badge>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.dataVencimento ? formatDateToBR(item.dataVencimento) : "-"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-semibold">
                          {isCartao ? (
                            <>
                              <CreditCard className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                              <span className="text-slate-200">{item.dataLiquidacaoPrevista ? formatDateToBR(item.dataLiquidacaoPrevista) : "-"}</span>
                              <span className="text-[10px] text-blue-300 bg-blue-500/20 px-1 py-0.2 rounded border border-blue-500/30 font-bold">Cartão (D+21)</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-slate-200">{item.dataLiquidacaoPrevista ? formatDateToBR(item.dataLiquidacaoPrevista) : "-"}</span>
                              <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-500/30 font-bold">Pix (D+0)</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-bold text-amber-400">
                        {formatCurrency(item.valor)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {item.motoristaTelefone && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWhatsApp(item.motoristaTelefone, item.motoristaNome)}
                            className="h-7 px-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg text-xs font-bold"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5 mr-1" />
                            WhatsApp
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, filteredRenewals.length)} de {filteredRenewals.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-7 px-2 text-xs text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="px-2 font-bold text-white">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-7 px-2 text-xs text-slate-300 disabled:opacity-40"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
