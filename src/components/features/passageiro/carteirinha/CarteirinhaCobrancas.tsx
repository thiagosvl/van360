import { MobileActionItem } from "@/components/common/MobileActionItem";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getPaymentMethodLabel } from "@/constants/paymentMethods";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";
import {
  formatDateToBR,
  formatDiasAtraso,
  getMesNome,
} from "@/utils/formatters";
import { formatNomeResponsavelCompletoExibicao, isResponsavelMockTelefone } from "@/utils/formatters/name";
import { buildCobrancaWhatsAppUrl } from "@/utils/whatsapp";
import { openBrowserLink } from "@/utils/browser";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Info,
  Plus,
} from "lucide-react";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";
import { UnifiedEmptyState } from "@/components/empty";
import { forwardRef } from "react";
import { getNowBR } from "@/utils/dateUtils";
import { getAvailableRetroactiveMonths, isPassageiroIncompleto, shouldGeneratePassengerProjection } from "@/utils/domain";

interface CarteirinhaCobrancasProps {
  cobrancas: Cobranca[];
  passageiro: Passageiro;
  yearFilter: string;
  mostrarTodasCobrancas: boolean;
  onOpenCobrancaDialog: (mes?: number, ano?: number, lockFoiPago?: boolean, lockMesAno?: boolean) => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onToggleLembretes: (cobranca: Cobranca) => void;
  onDesfazerPagamento: (cobrancaId: string) => void;
  onToggleClick: (statusAtual: boolean) => void;
  onVerRecibo: (url: string, cobranca: Cobranca) => void;
  limiteCobrancasMobile?: number;
}

import { CobrancaOrigem, CobrancaStatus } from "@/types/enums";
import { useMemo } from "react";

export const CarteirinhaCobrancas = ({
  cobrancas,
  passageiro,
  yearFilter,
  onOpenCobrancaDialog,
  onEditCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
  onVerRecibo,
}: CarteirinhaCobrancasProps) => {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const now = getNowBR();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const selectedYear = Number(yearFilter) || currentYear;

  const displayCobrancas = useMemo(() => {
    const list = [...cobrancas];

    if (!passageiro) return list;

    if (selectedYear < currentYear) {
      return list;
    }

    const startMonth = selectedYear === currentYear ? currentMonth : 1;
    const endMonth = 12;
    const dbMonths = new Set(list.filter((c) => c.ano === selectedYear).map((c) => c.mes));
    const diaVenc = passageiro.dia_vencimento ? String(passageiro.dia_vencimento).padStart(2, "0") : "10";

    for (let m = startMonth; m <= endMonth; m++) {
      if (!dbMonths.has(m)) {
        const canGenerate = shouldGeneratePassengerProjection({
          passageiro,
          driverCreatedAt: profile?.created_at,
          targetMonth: m,
          targetYear: selectedYear,
        });

        if (canGenerate) {
          const mesStr = String(m).padStart(2, "0");
          list.push({
            id: `proj_pass_${passageiro.id}_${m}_${selectedYear}`,
            passageiro_id: passageiro.id!,
            mes: m,
            ano: selectedYear,
            valor: Number(passageiro.valor_cobranca),
            status: CobrancaStatus.PENDENTE,
            data_vencimento: `${selectedYear}-${mesStr}-${diaVenc}`,
            origem: CobrancaOrigem.AUTOMATICA,
            isProjection: true,
            passageiro,
          });
        }
      }
    }

    return list.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });
  }, [cobrancas, passageiro, selectedYear, currentYear, currentMonth, profile?.created_at]);

  const availableRetroMonths = useMemo(() => {
    return getAvailableRetroactiveMonths({
      passageiro,
      cobrancas,
      driverCreatedAt: profile?.created_at,
      currentMonth,
      currentYear,
    });
  }, [passageiro, cobrancas, profile?.created_at, currentMonth, currentYear]);

  const hasRetroactiveMonths = availableRetroMonths.length > 0;
  const isIncomplete = isPassageiroIncompleto(passageiro);


  const resumo = useMemo(() => {
    return displayCobrancas.reduce(
      (acc, c) => {
        const isPago = c.status === CobrancaStatus.PAGO;
        const isProjection = c.isProjection === true;
        const atrasado = !isPago && !isProjection && checkCobrancaEmAtraso(c.data_vencimento);

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
      { pago: 0, qtdPago: 0, atrasado: 0, qtdAtrasado: 0, pendente: 0, qtdPendente: 0 }
    );
  }, [displayCobrancas]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none px-2">
            {displayCobrancas.length} {displayCobrancas.length === 1 ? "PARCELA" : "PARCELAS"}
          </span>
        </div>

        {hasRetroactiveMonths && (
          <Button
            type="button"
            onClick={() => onOpenCobrancaDialog()}
            className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-semibold text-xs h-8 px-3 rounded-lg shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Registrar Retroativa</span>
          </Button>
        )}
      </div>

      {isIncomplete && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-[11px] leading-tight">
          <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>Conclua o cadastro para que as parcelas exibam corretamente o valor e o dia de vencimento.</span>
        </div>
      )}

      <div className="space-y-3">
        {displayCobrancas.length === 0 ? (
          <UnifiedEmptyState
            icon={History}
            title="Sem parcelas configuradas"
            description="Defina o valor da parcela nas informações do passageiro para ativar a geração automática."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {displayCobrancas.map((cobranca, idx) => (
              <CobrancaItemPassageiro
                key={cobranca.id}
                cobranca={cobranca}
                passageiro={passageiro}
                index={idx}
                chavePix={profile?.chave_pix}
                tipoChavePix={profile?.tipo_chave_pix}
                onOpenCobrancaDialog={onOpenCobrancaDialog}
                onEditCobranca={onEditCobranca}
                onRegistrarPagamento={onRegistrarPagamento}
                onExcluirCobranca={onExcluirCobranca}
                onDesfazerPagamento={onDesfazerPagamento}
                onVerRecibo={onVerRecibo}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Mini KPIs */}
      {displayCobrancas.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2">
          <MiniKPI
            label="Atrasadas"
            value={resumo.atrasado}
            count={resumo.qtdAtrasado}
            colorClass="text-rose-500 bg-rose-50/60"
            icon={<AlertCircle className="h-3.5 w-3.5" />}
          />
          <MiniKPI
            label="Pendentes"
            value={resumo.pendente}
            count={resumo.qtdPendente}
            colorClass="text-amber-500 bg-amber-50/60"
            icon={<Clock className="h-3.5 w-3.5" />}
          />
          <MiniKPI
            label="Pagas"
            value={resumo.pago}
            count={resumo.qtdPago}
            colorClass="text-emerald-500 bg-emerald-50/60"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
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
    chavePix?: string | null;
    tipoChavePix?: string | null;
    onOpenCobrancaDialog?: (mes?: number, ano?: number) => void;
    onEditCobranca: (c: Cobranca) => void;
    onRegistrarPagamento: (c: Cobranca) => void;
    onExcluirCobranca: (c: Cobranca) => void;
    onDesfazerPagamento: (id: string) => void;
    onVerRecibo: (url: string, cobranca: Cobranca) => void;
  }
>(({
  cobranca,
  passageiro,
  index,
  chavePix,
  tipoChavePix,
  onOpenCobrancaDialog,
  onEditCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
  onVerRecibo,
}, ref) => {
  const isIncomplete = isPassageiroIncompleto(passageiro);
  const isPaid = cobranca.status === CobrancaStatus.PAGO;
  const isAtrasado = !isPaid && !isIncomplete && checkCobrancaEmAtraso(cobranca.data_vencimento);

  const statusColor = isPaid
    ? "bg-emerald-50 text-emerald-600"
    : isAtrasado
      ? "bg-red-50 text-red-600"
      : "bg-amber-50 text-amber-600";

  const telefoneResponsavel = isResponsavelMockTelefone(passageiro.telefone_responsavel) ? undefined : passageiro.telefone_responsavel;
  const onEnviarCobranca = telefoneResponsavel && !cobranca.isProjection
    ? () => openBrowserLink(buildCobrancaWhatsAppUrl({
      telefoneResponsavel,
      nomeResponsavel: formatNomeResponsavelCompletoExibicao(passageiro.nome_responsavel),
      nomePassageiro: passageiro.nome,
      mes: cobranca.mes,
      valor: cobranca.valor,
      dataVencimento: cobranca.data_vencimento,
      chavePix,
      tipoChavePix,
    }))
    : undefined;

  const actions = cobranca.isProjection
    ? [
      {
        label: "Registrar Pagamento",
        icon: <CheckCircle2 className="h-4 w-4" />,
        onClick: () => onOpenCobrancaDialog?.(cobranca.mes, cobranca.ano),
      },
    ]
    : useCobrancaActions({
      cobranca,
      onVerCobranca: () => { },
      onVerCarteirinha: undefined,
      onEditarCobranca: () => onEditCobranca(cobranca),
      onRegistrarPagamento: () => onRegistrarPagamento(cobranca),
      onExcluirCobranca: () => onExcluirCobranca(cobranca),
      onDesfazerPagamento: onDesfazerPagamento ? () => onDesfazerPagamento(cobranca.id) : undefined,
      onVerRecibo: cobranca.recibo_url ? () => onVerRecibo(cobranca.recibo_url!, cobranca) : undefined,
      onEnviarCobranca,
      showHistory: true,
    });

  const renderHeader = () => (
    <CobrancaSummary cobranca={{ ...cobranca, passageiro }} />
  );

  const now = getNowBR();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
    >
      <MobileActionItem
        actions={actions}
        onClickItem={cobranca.isProjection ? () => onOpenCobrancaDialog?.(cobranca.mes, cobranca.ano) : undefined}
        className="bg-transparent"
        renderHeader={renderHeader}
      >
        <div
          className={cn(
            "p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border bg-white border-gray-100/50",
            cobranca.isProjection && "cursor-pointer"
          )}
        >
          <div className={cn(
            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-headline font-bold text-sm text-white shadow-sm",
            isPaid ? "bg-emerald-500" :
              isAtrasado ? "bg-red-500" :
                "bg-amber-500"
          )}>
            {isPaid ? <CheckCircle2 className="h-4 w-4 text-white" /> :
              isAtrasado ? <AlertCircle className="h-4 w-4 text-white" /> :
                <Clock className="h-4 w-4 text-white" />}
          </div>

          <div className="flex-grow min-w-0 pr-[72px] sm:pr-20">
            <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
              {getMesNome(cobranca.mes)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-gray-500 font-medium leading-snug opacity-70 break-words line-clamp-2">
                {isPaid
                  ? (cobranca.tipo_pagamento ? getPaymentMethodLabel(cobranca.tipo_pagamento) : `Venc. ${formatDateToBR(cobranca.data_vencimento)}`)
                  : isIncomplete
                    ? "Venc. dia --"
                    : isAtrasado
                      ? formatDiasAtraso(cobranca.data_vencimento)
                      : `Venc. ${formatDateToBR(cobranca.data_vencimento)}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-8 top-1/2 -translate-y-1/2">
            <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
              {Number(cobranca.valor) > 0
                ? Number(cobranca.valor).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
                : "R$ --"}
            </p>
            <StatusBadge
              status={cobranca.status}
              dataVencimento={isIncomplete ? undefined : cobranca.data_vencimento}
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
  <div className={cn("rounded-2xl p-2 sm:p-3 text-center min-w-0 flex flex-col items-center justify-center", colorClass)}>
    <div className="flex items-center justify-center gap-1 mb-1 max-w-full">
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-70 whitespace-nowrap">
        {label}
      </span>
    </div>
    <span className="text-xs max-[320px]:text-[10px] font-headline font-bold text-[#1a3a5c] block tabular-nums truncate w-full">
      {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </span>
    <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 truncate w-full">
      {count} {count === 1 ? "parcela" : "parcelas"}
    </span>
  </div>
);
