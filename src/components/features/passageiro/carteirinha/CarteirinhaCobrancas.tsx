import { MobileActionItem } from "@/components/common/MobileActionItem";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getPaymentMethodLabel } from "@/constants/paymentMethods";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  formatDateToBR,
  formatDiasAtraso,
  getMesNome,
} from "@/utils/formatters";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Plus,
} from "lucide-react";
import { forwardRef, useState } from "react";

interface CarteirinhaCobrancasProps {
  cobrancas: Cobranca[];
  passageiro: Passageiro;
  yearFilter: string;
  mostrarTodasCobrancas: boolean;
  onOpenCobrancaDialog: () => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onToggleLembretes: (cobranca: Cobranca) => void;
  onDesfazerPagamento: (cobrancaId: string) => void;
  onToggleClick: (statusAtual: boolean) => void;
  limiteCobrancasMobile?: number;
}

export const CarteirinhaCobrancas = ({
  cobrancas,
  passageiro,
  yearFilter,
  onOpenCobrancaDialog,
  onEditCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
}: CarteirinhaCobrancasProps) => {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  // KPIs rápidos
  const resumo = cobrancas.reduce(
    (acc, c) => {
      const isPago = c.status === CobrancaStatus.PAGO;
      const atrasado = !isPago && checkCobrancaEmAtraso(c.data_vencimento);
      if (isPago) {
        acc.pago += Number(c.valor);
        acc.qtdPago++;
      } else if (atrasado) {
        acc.atrasado += Number(c.valor);
        acc.qtdAtrasado++;
      } else {
        acc.pendente += Number(c.valor);
        acc.qtdPendente++;
      }
      return acc;
    },
    { pago: 0, pendente: 0, atrasado: 0, qtdPago: 0, qtdPendente: 0, qtdAtrasado: 0 }
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none px-2">
            {cobrancas.length} {cobrancas.length === 1 ? "Registro" : "Registros"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenCobrancaDialog}
            size="sm"
            className="h-10 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white px-4 font-bold shadow-diff-shadow transition-all group text-xs"
          >
            <Plus className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform" />
            Registrar
          </Button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {cobrancas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <History className="h-8 w-8 text-slate-200 mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Nenhum registro em {yearFilter}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {cobrancas.map((cobranca, idx) => (
              <CobrancaItemPassageiro
                key={cobranca.id}
                cobranca={cobranca}
                passageiro={passageiro}
                index={idx}
                onEditCobranca={onEditCobranca}
                onRegistrarPagamento={onRegistrarPagamento}
                onExcluirCobranca={onExcluirCobranca}
                onDesfazerPagamento={onDesfazerPagamento}
                onSetReceiptUrl={setReceiptUrl}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Mini KPIs */}
      {cobrancas.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <MiniKPI
            label="Pago"
            value={resumo.pago}
            count={resumo.qtdPago}
            colorClass="text-emerald-500 bg-emerald-50/60"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          />
          <MiniKPI
            label="Pendente"
            value={resumo.pendente}
            count={resumo.qtdPendente}
            colorClass="text-amber-500 bg-amber-50/60"
            icon={<Clock className="h-3.5 w-3.5" />}
          />
          <MiniKPI
            label="Atrasado"
            value={resumo.atrasado}
            count={resumo.qtdAtrasado}
            colorClass="text-rose-500 bg-rose-50/60"
            icon={<AlertCircle className="h-3.5 w-3.5" />}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Card de cobrança no contexto do passageiro.
 * Segue o mesmo padrão visual do CobrancaMobileCard de CobrancasList,
 * mas substitui nome/responsável (redundante) por mês + data de vencimento.
 */
const CobrancaItemPassageiro = forwardRef<
  HTMLDivElement,
  {
    cobranca: Cobranca;
    passageiro: Passageiro;
    index: number;
    onEditCobranca: (c: Cobranca) => void;
    onRegistrarPagamento: (c: Cobranca) => void;
    onExcluirCobranca: (c: Cobranca) => void;
    onDesfazerPagamento: (id: string) => void;
    onSetReceiptUrl: (url: string | null) => void;
  }
>(({
  cobranca,
  passageiro,
  index,
  onEditCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
  onSetReceiptUrl,
}, ref) => {
  const isPaid = cobranca.status === CobrancaStatus.PAGO;
  const isAtrasado = !isPaid && checkCobrancaEmAtraso(cobranca.data_vencimento);

  const statusColor = isPaid
    ? "bg-emerald-50 text-emerald-600"
    : isAtrasado
      ? "bg-red-50 text-red-600"
      : "bg-amber-50 text-amber-600";

  const actions = useCobrancaActions({
    cobranca,
    onVerCobranca: () => { },
    onVerCarteirinha: undefined,
    onEditarCobranca: () => onEditCobranca(cobranca),
    onRegistrarPagamento: () => onRegistrarPagamento(cobranca),
    onExcluirCobranca: () => onExcluirCobranca(cobranca),
    onDesfazerPagamento: onDesfazerPagamento ? () => onDesfazerPagamento(cobranca.id) : undefined,
    onVerRecibo: cobranca.recibo_url ? () => onSetReceiptUrl(cobranca.recibo_url || null) : undefined,
    showHistory: true,
  });

  const renderHeader = () => (
    <div className="flex flex-col gap-2 p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm text-left">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
          {getMesNome(cobranca.mes)} {cobranca.ano}
        </p>
        <StatusBadge
          status={cobranca.status}
          dataVencimento={cobranca.data_vencimento}
          className="h-4 px-2 text-[7px] font-bold uppercase tracking-widest rounded-full border-none shadow-none ring-1 ring-inset ring-slate-100"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-headline font-bold text-[#1a3a5c] tracking-tighter">
          {Number(cobranca.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <span className="text-[10px] font-bold text-slate-500">
          Venc: {formatDateToBR(cobranca.data_vencimento)}
        </span>
        {isPaid && cobranca.tipo_pagamento && (
          <span className="text-[8px] font-bold text-emerald-600/70 uppercase tracking-widest px-1.5 py-0.5 bg-emerald-50/50 rounded-md ring-1 ring-inset ring-emerald-100/50">
            {getPaymentMethodLabel(cobranca.tipo_pagamento)}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
    >
      <MobileActionItem
        actions={actions}
        className="bg-transparent"
        renderHeader={renderHeader}
      >
        {/* Card — mesmo padrão de CobrancasList mobile */}
        <div className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50">
          {/* Status icon (equivalente ao bloco de dia na tela de mensalidades) */}
          <div className={cn(
            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
            isPaid ? "bg-emerald-500" :
              isAtrasado ? "bg-red-500" :
                "bg-amber-500"
          )}>
            {isPaid ? <CheckCircle2 className="h-4 w-4 text-white" /> :
              isAtrasado ? <AlertCircle className="h-4 w-4 text-white" /> :
                <Clock className="h-4 w-4 text-white" />}
          </div>

          {/* Conteúdo central: mês + info contextual */}
          <div className="flex-grow min-w-0 pr-8">
            <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
              {getMesNome(cobranca.mes)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
                {isPaid
                  ? (cobranca.tipo_pagamento ? getPaymentMethodLabel(cobranca.tipo_pagamento) : `Venc. ${formatDateToBR(cobranca.data_vencimento)}`)
                  : isAtrasado
                    ? formatDiasAtraso(cobranca.data_vencimento)
                    : `Venc. ${formatDateToBR(cobranca.data_vencimento)}`}
              </p>
            </div>
          </div>

          {/* Valor + StatusBadge — posição absoluta, mesmo padrão */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-8 top-1/2 -translate-y-1/2">
            <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
              {Number(cobranca.valor).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <StatusBadge
              status={cobranca.status}
              dataVencimento={cobranca.data_vencimento}
              className={cn(
                "font-bold text-[8px] h-3.5 px-1 rounded-sm border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
                statusColor
              )}
            />
          </div>
        </div>
      </MobileActionItem>
    </motion.div>
  );
});

/* Mini KPI Card */
const MiniKPI = ({
  label,
  value,
  count,
  colorClass,
  icon,
}: {
  label: string;
  value: number;
  count: number;
  colorClass: string;
  icon: React.ReactNode;
}) => (
  <div className={cn("rounded-2xl p-3 text-center", colorClass)}>
    <div className="flex items-center justify-center gap-1.5 mb-1">
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </span>
    </div>
    <span className="text-xs max-[320px]:text-[11px] font-headline font-bold text-[#1a3a5c] block tabular-nums">
      {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </span>
    <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
      {count} {count === 1 ? "parcela" : "parcelas"}
    </span>
  </div>
);
