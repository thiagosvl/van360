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
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
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
  showPeriodFilter?: boolean;
}

function renderStatusBadge(status: StatusRepasse, ultimoErro?: string | null) {
  switch (status) {
    case "SUCESSO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Sucesso</span>
        </span>
      );
    case "PROCESSANDO":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/20 animate-pulse">
          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
          <span>Processando</span>
        </span>
      );
    case "PENDENTE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Pendente</span>
        </span>
      );
    case "FALHA":
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20"
          title={ultimoErro || "Erro desconhecido na liquidação"}
        >
          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <span>Falha</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-secondary text-muted-foreground">
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
  showPeriodFilter,
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
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-secondary/40 p-3 sm:p-4 rounded-2xl border border-border/80">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Buscar por ID, EndToEndId ou código..."
              className="pl-9 pr-9 h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => onFiltersChange({ ...filters, search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            {showPeriodFilter && (
              <div className="w-full sm:w-auto">
                <AdminPeriodFilter
                  defaultPreset="mes_atual"
                  startDate={filters.dataInicio}
                  endDate={filters.dataFim}
                  onChange={(start, end) =>
                    onFiltersChange({ ...filters, dataInicio: start, dataFim: end })
                  }
                />
              </div>
            )}

            <div className="w-full sm:w-48">
              <Select
                value={filters.status}
                onValueChange={(val) => onFiltersChange({ ...filters, status: val as StatusRepasse | "TODOS" })}
              >
                <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="TODOS">Todos os status</SelectItem>
                  <SelectItem value="SUCESSO">Sucesso</SelectItem>
                  <SelectItem value="PROCESSANDO">Processando</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="FALHA">Falha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-card rounded-3xl border border-border shadow-xs">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Carregando repasses bancários...</p>
        </div>
      ) : repasses.length === 0 ? (
        <AdminEmptyState
          title="Nenhum repasse encontrado"
          description="Nenhum repasse corresponde aos filtros selecionados para o período."
          icon={ArrowUpRight}
        />
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Data / hora</th>
                  {!hideDriverColumn && <th className="py-3.5 px-4">Motorista</th>}
                  <th className="py-3.5 px-4">Aluno / parcela</th>
                  <th className="py-3.5 px-4 text-right">Valor bruto</th>
                  <th className="py-3.5 px-4 text-right">Taxa Van360</th>
                  <th className="py-3.5 px-4 text-right">Líquido motorista</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {repasses.map((item) => {
                  const isRetrying = isRetryingId === item.id;
                  const canRetry = item.status_repasse === "FALHA" || item.status_repasse === "PENDENTE";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-secondary/40 transition-colors duration-150"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{formatDateTimeToBR(item.created_at)}</div>
                        <div className="text-[11px] text-muted-foreground">{formatRelativeTime(item.created_at)}</div>
                      </td>

                      {!hideDriverColumn && (
                        <td className="py-3.5 px-4">
                          <Link
                            to={ROUTES.PRIVATE.ADMIN.USER_DETAILS.replace(":id", item.motorista.id)}
                            className="font-semibold text-primary hover:underline flex items-center gap-1.5"
                          >
                            <User className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[160px]">{item.motorista.nome}</span>
                          </Link>
                          {item.motorista.telefone && (
                            <span className="text-[11px] text-muted-foreground font-mono block">
                              {phoneMask(item.motorista.telefone)}
                            </span>
                          )}
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{item.passageiro.nome}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Parcela {item.cobranca.mes}/{item.cobranca.ano}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-foreground/80 font-mono">
                        {formatCurrency(item.valor_bruto)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-amber-500 font-medium font-mono">
                        - {formatCurrency(item.taxa_plataforma)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-500 font-mono">
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
                              className="h-7 px-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30 text-xs rounded-xl gap-1"
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
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
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
                  className="bg-secondary/30 border border-border/80 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        {formatDateTimeToBR(item.created_at)}
                      </span>
                      <span className="font-semibold text-sm text-foreground">{item.passageiro.nome}</span>
                      <span className="text-xs text-muted-foreground block">
                        Parcela {item.cobranca.mes}/{item.cobranca.ano}
                      </span>
                    </div>
                    {renderStatusBadge(item.status_repasse, item.ultimo_erro)}
                  </div>

                  {!hideDriverColumn && (
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Motorista:</span>
                      <Link
                        to={ROUTES.PRIVATE.ADMIN.USER_DETAILS.replace(":id", item.motorista.id)}
                        className="font-semibold text-primary hover:underline truncate max-w-[200px]"
                      >
                        {item.motorista.nome}
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-secondary/60 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Bruto</span>
                      <span className="font-medium text-foreground font-mono">{formatCurrency(item.valor_bruto)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Taxa</span>
                      <span className="font-medium text-amber-500 font-mono">-{formatCurrency(item.taxa_plataforma)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Líquido</span>
                      <span className="font-semibold text-emerald-500 font-mono">
                        {formatCurrency(item.valor_liquido_motorista)}
                      </span>
                    </div>
                  </div>

                  {item.ultimo_erro && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-2.5 text-xs text-destructive space-y-1">
                      <span className="font-semibold flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Último erro:
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
                        className="h-8 px-3 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30 text-xs rounded-xl gap-1.5"
                      >
                        {isRetrying ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        <span>Retentar repasse</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRepasse(item)}
                      className="h-8 px-3 bg-card border-border text-foreground hover:bg-secondary text-xs rounded-xl gap-1.5"
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
            title="Detalhes do repasse Pix"
            subtitle={`ID: ${selectedRepasse.id}`}
            onClose={() => setSelectedRepasse(null)}
          />
          <AdminBaseDialog.Body>
            <div className="space-y-5 text-xs text-foreground">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-2xl border border-border">
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Status do repasse</span>
                  <div className="mt-1">{renderStatusBadge(selectedRepasse.status_repasse)}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Provedor gateway</span>
                  <span className="font-semibold text-foreground mt-1 inline-block">{selectedRepasse.provedor}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Divisão financeira (split)
                </h4>
                <div className="grid grid-cols-3 gap-2 bg-secondary/40 p-3 rounded-2xl border border-border text-center">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Valor bruto</span>
                    <span className="font-semibold text-foreground font-mono">{formatCurrency(selectedRepasse.valor_bruto)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Taxa Van360</span>
                    <span className="font-semibold text-amber-500 font-mono">-{formatCurrency(selectedRepasse.taxa_plataforma)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Líquido transferido</span>
                    <span className="font-semibold text-emerald-500 font-mono">
                      {formatCurrency(selectedRepasse.valor_liquido_motorista)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Identificadores bancários
                </h4>
                <div className="space-y-2 bg-secondary/40 p-3.5 rounded-2xl border border-border font-mono text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-sans">End-to-End ID do saque (out):</span>
                    <div className="flex items-center justify-between text-foreground mt-0.5 break-all">
                      <span>{selectedRepasse.end_to_end_id_out || "Não gerado"}</span>
                      {selectedRepasse.end_to_end_id_out && (
                        <button
                          onClick={() => handleCopy(selectedRepasse.end_to_end_id_out)}
                          className="text-muted-foreground hover:text-foreground ml-2 shrink-0 cursor-pointer"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-2">
                    <span className="text-[11px] text-muted-foreground block font-sans">Transação do provedor:</span>
                    <span className="text-foreground/80 break-all">{selectedRepasse.transacao_provedor_id}</span>
                  </div>
                </div>
              </div>

              {selectedRepasse.status_repasse === "FALHA" && selectedRepasse.ultimo_erro && (
                <div className="space-y-1.5 bg-destructive/10 border border-destructive/30 p-3 rounded-2xl">
                  <span className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    Motivo da falha registrada
                  </span>
                  <p className="text-xs font-mono text-destructive break-all">{selectedRepasse.ultimo_erro}</p>
                  <div className="text-[11px] text-destructive/80 pt-1">
                    Tentativas executadas: {selectedRepasse.tentativas} de 5
                  </div>
                </div>
              )}

              {selectedRepasse.status_repasse === "SUCESSO" && selectedRepasse.tentativas > 1 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-emerald-500 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Liquidado com sucesso após compensação do saldo na instituição
                  </span>
                  <span className="font-semibold text-emerald-500 font-mono text-[11px] shrink-0 ml-2">
                    {selectedRepasse.tentativas} tentativas
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
                <div>
                  <span className="text-muted-foreground block font-sans">Pagamento do responsável:</span>
                  <span className="text-foreground font-mono">
                    {selectedRepasse.data_pagamento_pai
                      ? formatDateTimeToBR(selectedRepasse.data_pagamento_pai)
                      : "Pendente"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-sans">Repasse ao motorista:</span>
                  <span className="text-foreground font-mono">
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
