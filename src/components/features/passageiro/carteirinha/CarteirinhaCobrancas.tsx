import { MobileActionItem } from "@/components/common/MobileActionItem";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  formatDateToBR,
  getMesNome,
} from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";

interface CarteirinhaCobrancasProps {
  cobrancas: Cobranca[];
  passageiro: Passageiro;
  yearFilter: string;
  availableYears: string[];
  mostrarTodasCobrancas: boolean;
  onYearChange: (year: string) => void;
  onOpenCobrancaDialog: () => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onEnviarNotificacao: (cobrancaId: string) => void;
  onToggleLembretes: (cobranca: Cobranca) => void;
  onDesfazerPagamento: (cobrancaId: string) => void;
  onToggleClick: (statusAtual: boolean) => void;
  limiteCobrancasMobile?: number;
}

export const CarteirinhaCobrancas = ({
  cobrancas,
  passageiro,
  yearFilter,
  availableYears,
  onYearChange,
  onOpenCobrancaDialog,
  onEditCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onEnviarNotificacao,
  onToggleLembretes,
  onDesfazerPagamento,
}: CarteirinhaCobrancasProps) => {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const isAtrasado = (dataVencimento: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento + "T00:00:00");
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Histórico Mensal
          </span>
          <h3 className="text-sm font-headline font-black text-[#1a3a5c]">
            Listagem de Pagamentos
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {availableYears.length > 1 && (
            <Select value={yearFilter} onValueChange={onYearChange}>
              <SelectTrigger className="w-[90px] h-11 bg-white border-slate-100 rounded-2xl shadow-sm text-xs font-bold text-[#1a3a5c]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {availableYears.map((ano) => (
                  <SelectItem key={ano} value={ano} className="rounded-xl text-xs font-bold py-2.5">
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={onOpenCobrancaDialog}
            className="h-11 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white px-5 font-bold shadow-diff-shadow transition-all group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Lançamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {cobrancas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <History className="h-10 w-10 text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
              Nenhum registro em {yearFilter}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {cobrancas.map((cobranca, idx) => {
              const atrasado = !cobranca.status.includes(CobrancaStatus.PAGO) && isAtrasado(cobranca.data_vencimento);
              const isPago = cobranca.status === CobrancaStatus.PAGO;

              const actions = useCobrancaActions({
                cobranca,
                onVerCobranca: () => {},
                onVerCarteirinha: undefined,
                onEditarCobranca: () => onEditCobranca(cobranca),
                onRegistrarPagamento: () => onRegistrarPagamento(cobranca),
                onExcluirCobranca: () => onExcluirCobranca(cobranca),
                onDesfazerPagamento: onDesfazerPagamento ? () => onDesfazerPagamento(cobranca.id) : undefined,
                onVerRecibo: cobranca.recibo_url ? () => setReceiptUrl(cobranca.recibo_url || null) : undefined,
              });

              const renderHeader = () => <CobrancaSummary cobranca={cobranca} />;

              return (
                <motion.div
                  key={cobranca.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <MobileActionItem 
                    actions={actions}
                    renderHeader={renderHeader}
                  >
                    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-4 pr-8 flex items-center gap-4 group transition-all active:scale-[0.98]">
                      {/* Status Circle Icon */}
                      <div className={cn(
                        "h-14 w-14 rounded-[1.4rem] flex items-center justify-center shrink-0 transition-transform shadow-sm relative",
                        isPago ? "bg-emerald-50 text-emerald-500 shadow-emerald-100/30" : 
                        atrasado ? "bg-rose-50 text-rose-500 shadow-rose-100/30" : 
                        "bg-amber-50 text-amber-500 shadow-amber-100/30"
                      )}>
                        {isPago ? <CheckCircle2 className="h-7 w-7" /> : 
                         atrasado ? <AlertCircle className="h-7 w-7" /> : 
                         <Clock className="h-7 w-7" />}
                      </div>

                      {/* Content Detail */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-headline font-black text-[#1a3a5c] uppercase truncate tracking-tight">
                            {getMesNome(cobranca.mes)}
                          </h4>
                          <span className="text-sm font-black text-[#1a3a5c] font-headline">
                            {Number(cobranca.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px] font-bold">
                              Venc: {formatDateToBR(cobranca.data_vencimento)}
                            </span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-100" />
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-none bg-transparent p-0 text-[10px] font-black uppercase tracking-widest leading-none h-auto",
                              isPago ? "text-emerald-500" : atrasado ? "text-rose-500" : "text-amber-500"
                            )}
                          >
                            {isPago ? "Liquidado" : atrasado ? "Atrasado" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </MobileActionItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <ReceiptDialog
        open={!!receiptUrl}
        onOpenChange={(open) => !open && setReceiptUrl(null)}
        url={receiptUrl || ""}
      />
    </div>
  );
};
