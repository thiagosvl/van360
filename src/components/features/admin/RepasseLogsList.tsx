import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Eye,
  Loader2,
  RotateCcw,
  Clock,
  Copy,
  Check,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
} from "lucide-react";
import { AdminRepasseItem, RepasseFiltersState, StatusRepasse } from "@/types/admin-repasse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { toast } from "sonner";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { formatDateTimeToBR, formatRelativeTime } from "@/utils/formatters/date";
import { formatCurrency } from "@/utils/formatters/currency";
import { phoneMask } from "@/utils/masks";
import { ROUTES } from "@/constants/routes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RepasseLogsListProps {
  repasses: AdminRepasseItem[];
  isLoading?: boolean;
  filters?: RepasseFiltersState;
  onFiltersChange?: (newFilters: RepasseFiltersState) => void;
  hideDriverColumn?: boolean;
  onRetry?: (id: string) => void;
  isRetryingId?: string | null;
}

function renderStatusBadge(status: StatusRepasse, ultimoErro?: string | null) {
  switch (status) {
    case "SUCESSO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>Sucesso</span>
        </span>
      );
    case "PROCESSANDO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm animate-pulse">
          <Loader2 className="h-3 w-3 text-blue-400 animate-spin shrink-0" />
          <span>Processando</span>
        </span>
      );
    case "PENDENTE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">
          <Clock className="h-3 w-3 text-amber-400 shrink-0" />
          <span>Pendente</span>
        </span>
      );
    case "FALHA":
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"
          title={ultimoErro || "Erro desconhecido na liquidação"}
        >
          <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
          <span>Falha</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-300">
          <span>{status}</span>
        </span>
      );
  }
}

export function RepasseLogsList({
  repasses,
  isLoading,
  filters,
  onFiltersChange,
  hideDriverColumn,
  onRetry,
  isRetryingId,
}: RepasseLogsListProps) {
  const [selectedRepasse, setSelectedRepasse] = useState<AdminRepasseItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {filters && onFiltersChange && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Buscar por ID, EndToEndId ou código..."
              className="pl-10 h-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl text-xs"
            />
            {filters.search && (
              <button
                onClick={() => onFiltersChange({ ...filters, search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(val) => onFiltersChange({ ...filters, status: val as StatusRepasse | "TODOS" })}
            >
              <SelectTrigger className="h-10 w-[140px] bg-slate-950/60 border-slate-800 text-slate-200 text-xs rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="TODOS">Todos Status</SelectItem>
                <SelectItem value="SUCESSO">Sucesso</SelectItem>
                <SelectItem value="PROCESSANDO">Processando</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="FALHA">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-[#131b2e] rounded-2xl border border-slate-800/80">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Carregando repasses bancários...</p>
        </div>
      ) : repasses.length === 0 ? (
        <AdminEmptyState
          title="Nenhum repasse encontrado"
          description="Nenhum repasse corresponde aos filtros selecionados para o período."
          icon={ArrowUpRight}
        />
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#131b2e] shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Data / Hora</th>
                  {!hideDriverColumn && <th className="py-3.5 px-4">Motorista</th>}
                  <th className="py-3.5 px-4">Aluno / Parcela</th>
                  <th className="py-3.5 px-4 text-right">Valor Bruto</th>
                  <th className="py-3.5 px-4 text-right">Taxa Van360</th>
                  <th className="py-3.5 px-4 text-right">Líquido Motorista</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {repasses.map((item) => {
                  const isRetrying = isRetryingId === item.id;
                  const canRetry = item.status_repasse === "FALHA" || item.status_repasse === "PENDENTE";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/40 transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-white">{formatDateTimeToBR(item.created_at)}</div>
                        <div className="text-[10px] text-slate-500">{formatRelativeTime(item.created_at)}</div>
                      </td>

                      {!hideDriverColumn && (
                        <td className="py-3.5 px-4">
                          <Link
                            to={ROUTES.PRIVATE.ADMIN.USER_DETAILS.replace(":id", item.motorista.id)}
                            className="font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5"
                          >
                            <User className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{item.motorista.nome}</span>
                          </Link>
                          {item.motorista.telefone && (
                            <span className="text-[10px] text-slate-500 block">
                              {phoneMask(item.motorista.telefone)}
                            </span>
                          )}
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{item.passageiro.nome}</div>
                        <div className="text-[10px] text-slate-500">
                          Parcela {item.cobranca.mes}/{item.cobranca.ano}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                        {formatCurrency(item.valor_bruto)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-amber-400 font-medium">
                        - {formatCurrency(item.taxa_plataforma)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(item.valor_liquido_motorista)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(item.status_repasse, item.ultimo_erro)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {canRetry && onRetry && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isRetrying}
                              onClick={() => onRetry(item.id)}
                              className="h-7 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 text-[11px] rounded-lg gap-1"
                              title="Retentar liquidação do repasse"
                            >
                              {isRetrying ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                              <span>Retentar</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRepasse(item)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                            title="Ver detalhes"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {repasses.map((item) => {
              const isRetrying = isRetryingId === item.id;
              const canRetry = item.status_repasse === "FALHA" || item.status_repasse === "PENDENTE";

              return (
                <div
                  key={item.id}
                  className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-medium">
                        {formatDateTimeToBR(item.created_at)}
                      </span>
                      <span className="font-bold text-sm text-slate-100">{item.passageiro.nome}</span>
                      <span className="text-xs text-slate-400 block">
                        Parcela {item.cobranca.mes}/{item.cobranca.ano}
                      </span>
                    </div>
                    {renderStatusBadge(item.status_repasse, item.ultimo_erro)}
                  </div>

                  {!hideDriverColumn && (
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-slate-400">Motorista:</span>
                      <Link
                        to={ROUTES.PRIVATE.ADMIN.USER_DETAILS.replace(":id", item.motorista.id)}
                        className="font-bold text-blue-400 hover:underline truncate max-w-[200px]"
                      >
                        {item.motorista.nome}
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Bruto</span>
                      <span className="font-medium text-slate-300">{formatCurrency(item.valor_bruto)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Taxa</span>
                      <span className="font-medium text-amber-400">-{formatCurrency(item.taxa_plataforma)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Líquido</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(item.valor_liquido_motorista)}
                      </span>
                    </div>
                  </div>

                  {item.ultimo_erro && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-xs text-rose-300 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Último Erro:
                      </span>
                      <p className="line-clamp-2 text-[11px] font-mono break-all">{item.ultimo_erro}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {canRetry && onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRetrying}
                        onClick={() => onRetry(item.id)}
                        className="h-8 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs rounded-xl gap-1.5"
                      >
                        {isRetrying ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        <span>Retentar Repasse</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRepasse(item)}
                      className="h-8 px-3 bg-slate-900 border-slate-700 text-slate-200 text-xs rounded-xl gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detalhes</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedRepasse && (
        <AdminBaseDialog
          open={Boolean(selectedRepasse)}
          onOpenChange={(open) => !open && setSelectedRepasse(null)}
          description={`ID do Repasse: ${selectedRepasse.id}`}
          maxWidth="lg"
        >
          <AdminBaseDialog.Header
            title="Detalhes do Repasse Pix"
            subtitle={`ID: ${selectedRepasse.id}`}
            onClose={() => setSelectedRepasse(null)}
          />
          <AdminBaseDialog.Body>
            <div className="space-y-5 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Status do Repasse</span>
                  <div className="mt-1">{renderStatusBadge(selectedRepasse.status_repasse)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Provedor Gateway</span>
                  <span className="font-bold text-slate-100 mt-1 inline-block">{selectedRepasse.provedor}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Divisão Financeira (Split)
                </h4>
                <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Valor Bruto</span>
                    <span className="font-bold text-slate-200">{formatCurrency(selectedRepasse.valor_bruto)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Taxa Van360</span>
                    <span className="font-bold text-amber-400">-{formatCurrency(selectedRepasse.taxa_plataforma)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Líquido Transferido</span>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(selectedRepasse.valor_liquido_motorista)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  Identificadores Bancários
                </h4>
                <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">End-to-End ID do Saque (Out):</span>
                    <div className="flex items-center justify-between text-slate-200 mt-0.5 break-all">
                      <span>{selectedRepasse.end_to_end_id_out || "Não gerado"}</span>
                      {selectedRepasse.end_to_end_id_out && (
                        <button
                          onClick={() => handleCopy(selectedRepasse.end_to_end_id_out)}
                          className="text-slate-400 hover:text-white ml-2 shrink-0"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2">
                    <span className="text-[10px] text-slate-500 block font-sans">Transação do Provedor:</span>
                    <span className="text-slate-300 break-all">{selectedRepasse.transacao_provedor_id}</span>
                  </div>
                </div>
              </div>

              {selectedRepasse.ultimo_erro && (
                <div className="space-y-1.5 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    Motivo da Falha Registrada
                  </span>
                  <p className="text-[11px] font-mono text-rose-200 break-all">{selectedRepasse.ultimo_erro}</p>
                  <div className="text-[10px] text-rose-400/80 pt-1">
                    Tentativas executadas: {selectedRepasse.tentativas} de 5
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-slate-500 block">Pagamento do Pai:</span>
                  <span className="text-slate-300">
                    {selectedRepasse.data_pagamento_pai
                      ? formatDateTimeToBR(selectedRepasse.data_pagamento_pai)
                      : "Pendente"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Repasse ao Motorista:</span>
                  <span className="text-slate-300">
                    {selectedRepasse.data_repasse_motorista
                      ? formatDateTimeToBR(selectedRepasse.data_repasse_motorista)
                      : "Pendente"}
                  </span>
                </div>
              </div>
            </div>
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </div>
  );
}
