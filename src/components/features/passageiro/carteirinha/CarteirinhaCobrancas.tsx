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
import { formatNomeResponsavelCompletoExibicao } from "@/utils/formatters/name";
import { buildCobrancaWhatsAppUrl } from "@/utils/whatsappTemplates";
import { openBrowserLink } from "@/utils/browser";
import { checkCobrancaEmAtraso, getCobrancaValorExibicao } from "@/utils/formatters/cobranca";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Info,
  Plus,
  ShieldCheck,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react";
import { usePermissions } from "@/hooks/business/usePermissions";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";
import { UnifiedEmptyState } from "@/components/empty";
import { forwardRef } from "react";
import { getNowBR } from "@/utils/dateUtils";
import { getAvailableRetroactiveMonths, isPassageiroIncompleto, shouldGeneratePassengerProjection, getSafeDueDateString, parseMonthYearFromDateString } from "@/utils/domain";
import { CobrancaActionsMenu } from "@/components/features/cobranca/CobrancaActionsMenu";
import { useReciboAnualElegibilidade } from "@/hooks/business/useReciboAnualElegibilidade";
import { useReciboAnual } from "@/hooks/api/useReciboAnual";
import { CarteirinhaReciboAnualCard } from "./CarteirinhaReciboAnualCard";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";

interface CarteirinhaCobrancasProps {
  cobrancas: Cobranca[];
  passageiro: Passageiro;
  yearFilter: string;
  mostrarTodasCobrancas: boolean;
  onOpenCobrancaDialog: (mes?: number, ano?: number, lockFoiPago?: boolean, lockMesAno?: boolean, availableMonths?: number[]) => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onToggleLembretes: (cobranca: Cobranca) => void;
  onDesfazerPagamento: (cobrancaId: string) => void;
  onToggleClick: (statusAtual: boolean) => void;
  onVerRecibo: (url: string, cobranca: Cobranca) => void;
  onActionSuccess?: () => void;
  limiteCobrancasMobile?: number;
}

import { Banner } from "@/components/ui/Banner";
import { CobrancaStatus, PassageiroFormModes } from "@/types/enums";
import { useCallback, useMemo } from "react";

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
  onActionSuccess,
}: CarteirinhaCobrancasProps) => {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const now = getNowBR();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const selectedYear = Number(yearFilter) || currentYear;

  const { openAnnualReceiptDialog, openPassageiroFormDialog, openPassageiroFinanceiroDialog } = useLayout();
  const { can } = usePermissions();
  const canManageFinancials = can("passageiros.gerenciar") || can("cobrancas.gerenciar");
  const elegibilidadeReciboAnual = useReciboAnualElegibilidade({
    passageiro,
    selectedYear,
    cobrancas,
  });

  const {
    data: reciboAnual,
    isLoading: isPendingReciboAnual,
    isFetching: isFetchingReciboAnual,
  } = useReciboAnual(
    passageiro?.id,
    selectedYear,
    { enabled: elegibilidadeReciboAnual.isElegivel }
  );

  const isCarregandoReciboAnual = isPendingReciboAnual || isFetchingReciboAnual;

  const handleVerReciboAnual = useCallback(() => {
    if (!reciboAnual?.recibo_url) return;
    openAnnualReceiptDialog({
      receiptUrl: reciboAnual.recibo_url,
      ano: selectedYear,
      alunoNome: passageiro?.nome || "Aluno",
      passageiroId: passageiro?.id,
    });
  }, [openAnnualReceiptDialog, reciboAnual?.recibo_url, selectedYear, passageiro?.nome, passageiro?.id]);

  const displayCobrancas = useMemo(() => {
    const list = [...cobrancas];

    if (!passageiro) return list;

    if (selectedYear < currentYear) {
      return list;
    }

    const startMonth = selectedYear === currentYear ? currentMonth : 1;
    const endMonth = 12;
    const dbMonths = new Set(list.filter((c) => c.ano === selectedYear).map((c) => c.mes));

    for (let m = startMonth; m <= endMonth; m++) {
      if (!dbMonths.has(m)) {
        const canGenerate = shouldGeneratePassengerProjection({
          passageiro,
          driverCreatedAt: profile?.created_at,
          targetMonth: m,
          targetYear: selectedYear,
        });

        if (canGenerate) {
          const dataVenc = getSafeDueDateString(passageiro.dia_vencimento, m, selectedYear);
          list.push({
            id: `proj_pass_${passageiro.id}_${m}_${selectedYear}`,
            passageiro_id: passageiro.id!,
            mes: m,
            ano: selectedYear,
            valor: Number(passageiro.valor_cobranca),
            status: CobrancaStatus.PENDENTE,
            data_vencimento: dataVenc,
            isProjection: true,
            passageiro,
            ano_letivo: passageiro.ano_letivo || selectedYear,
          });
        }
      }
    }

    if (passageiro.data_fim_cobranca) {
      const fim = parseMonthYearFromDateString(passageiro.data_fim_cobranca);
      if (fim && fim.year > selectedYear) {
        for (let y = selectedYear + 1; y <= fim.year; y++) {
          const maxM = y === fim.year ? fim.month : 12;
          const dbMonthsFuture = new Set(list.filter((c) => c.ano === y).map((c) => c.mes));
          for (let m = 1; m <= maxM; m++) {
            if (!dbMonthsFuture.has(m)) {
              const canGenerate = shouldGeneratePassengerProjection({
                passageiro,
                driverCreatedAt: profile?.created_at,
                targetMonth: m,
                targetYear: y,
              });

              if (canGenerate) {
                const dataVenc = getSafeDueDateString(passageiro.dia_vencimento, m, y);
                list.push({
                  id: `proj_pass_${passageiro.id}_${m}_${y}`,
                  passageiro_id: passageiro.id!,
                  mes: m,
                  ano: y,
                  valor: Number(passageiro.valor_cobranca),
                  status: CobrancaStatus.PENDENTE,
                  data_vencimento: dataVenc,
                  isProjection: true,
                  passageiro,
                  ano_letivo: passageiro.ano_letivo || selectedYear,
                });
              }
            }
          }
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
  const showAjusteBanner = !passageiro.isento && isIncomplete;


  const emptyStateInfo = useMemo(() => {
    if (passageiro.isento) {
      return {
        icon: ShieldCheck,
        title: "Aluno Isento",
        description: "Este aluno foi marcado como isento e não possui parcelas.",
      };
    }

    if (selectedYear < currentYear) {
      return {
        icon: History,
        title: `Nenhuma parcela em ${selectedYear}`,
        description: `Não foram encontradas cobranças registradas para este aluno no ano de ${selectedYear}.`,
      };
    }

    const fim = parseMonthYearFromDateString(passageiro.data_fim_cobranca);
    const inicio = parseMonthYearFromDateString(
      passageiro.data_inicio_cobranca || passageiro.created_at || profile?.created_at
    );

    const isEncerrado = fim && (fim.year < selectedYear || (fim.year === selectedYear && fim.month < currentMonth));

    if (isEncerrado) {
      const mesFimNome = getMesNome(fim.month);
      const mesInicioNome = inicio ? getMesNome(inicio.month) : null;

      if (hasRetroactiveMonths) {
        return {
          icon: History,
          title: `Cobrança finalizada em ${mesFimNome}`,
          description: mesInicioNome
            ? `A cobrança deste aluno foi configurada de ${mesInicioNome} até ${mesFimNome}. Para lançar os meses anteriores, use o botão "+ Registrar Parcela" acima.`
            : `A cobrança deste aluno terminou em ${mesFimNome}. Para lançar os meses anteriores, use o botão "+ Registrar Parcela" acima.`,
        };
      }

      return {
        icon: History,
        title: `Cobrança finalizada em ${mesFimNome}`,
        description: `A cobrança deste aluno terminou em ${mesFimNome}. Se ele continuar na van, basta editar os dados do aluno e alterar o mês final.`,
      };
    }

    const isFuturo = inicio && (inicio.year > selectedYear || (inicio.year === selectedYear && inicio.month > currentMonth));

    if (isFuturo) {
      const mesInicioNome = getMesNome(inicio.month);
      return {
        icon: History,
        title: `Cobrança inicia em ${mesInicioNome}`,
        description: `As parcelas deste aluno começarão a ser geradas automaticamente a partir de ${mesInicioNome}.`,
      };
    }

    return {
      icon: History,
      title: "Nenhuma parcela ativa",
      description: "Não há parcelas pendentes para o período selecionado.",
    };
  }, [
    passageiro.isento,
    passageiro.data_fim_cobranca,
    passageiro.data_inicio_cobranca,
    passageiro.created_at,
    profile?.created_at,
    selectedYear,
    currentYear,
    currentMonth,
    hasRetroactiveMonths,
  ]);

  const resumo = useMemo(() => {
    return displayCobrancas.reduce(
      (acc, c) => {
        if (c.status === CobrancaStatus.CANCELADA) {
          return acc;
        }

        const isPago = c.status === CobrancaStatus.PAGO;
        const valorTotal = Number(c.valor || 0);
        const valorPago = isPago ? Number(c.valor_pago ?? c.valor ?? 0) : 0;
        const isParcial = isPago && valorPago < valorTotal;
        const atrasado = checkCobrancaEmAtraso(c.data_vencimento);

        if (isPago) {
          acc.pago += valorPago;
          if (isParcial) {
            const saldoRestante = valorTotal - valorPago;
            if (atrasado) {
              acc.atrasado += saldoRestante;
              acc.qtdAtrasado++;
            } else {
              acc.pendente += saldoRestante;
              acc.qtdPendente++;
            }
          } else {
            acc.qtdPago++;
          }
        } else if (atrasado) {
          acc.atrasado += valorTotal;
          acc.qtdAtrasado++;
        } else {
          acc.pendente += valorTotal;
          acc.qtdPendente++;
        }
        return acc;
      },
      { pago: 0, qtdPago: 0, atrasado: 0, qtdAtrasado: 0, pendente: 0, qtdPendente: 0 }
    );
  }, [displayCobrancas]);

  return (
    <div className="space-y-4">
      {elegibilidadeReciboAnual.isElegivel && (
        <CarteirinhaReciboAnualCard
          ano={selectedYear}
          totalPago={elegibilidadeReciboAnual.totalPago}
          quantidadeMeses={elegibilidadeReciboAnual.totalMesesPagos}
          reciboUrl={reciboAnual?.recibo_url}
          isLoading={isCarregandoReciboAnual}
          onVisualizar={handleVerReciboAnual}
        />
      )}

      {((canManageFinancials && !showAjusteBanner) || hasRetroactiveMonths) && (
        <div className="flex items-center justify-between gap-3 min-h-[32px]">
          <div>
            {canManageFinancials && !showAjusteBanner && (
              <button
                type="button"
                onClick={() => openPassageiroFinanceiroDialog({ passageiro, onSuccess: onActionSuccess })}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer group py-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
                <span>Ajustar Condições</span>
              </button>
            )}
          </div>

          {hasRetroactiveMonths && (
            <Button
              type="button"
              onClick={() => onOpenCobrancaDialog(undefined, undefined, undefined, undefined, availableRetroMonths)}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3.5 rounded-[18px] shadow-xs transition-all active:scale-95 shrink-0 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Registrar Parcela</span>
            </Button>
          )}
        </div>
      )}

      {showAjusteBanner && (
        <Banner
          variant="info"
          title="Ajuste as parcelas do aluno"
          description="Esta lista é uma prévia do ano e você pode ajustar. Preencha o valor e o vencimento para exibir as parcelas corretamente."
          action={{
            label: "Ajustar parcelas",
            onClick: () =>
              openPassageiroFinanceiroDialog({
                passageiro,
                onSuccess: onActionSuccess,
              }),
            className: "h-9 px-4 text-xs font-semibold shrink-0",
          }}
          className="p-3 sm:p-3.5 mb-4"
        />
      )}

      <div className="space-y-3">
        {displayCobrancas.length === 0 ? (
          <UnifiedEmptyState
            icon={emptyStateInfo.icon}
            title={emptyStateInfo.title}
            description={emptyStateInfo.description}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {displayCobrancas.map((cobranca, idx) => (
              <CobrancaItemPassageiro
                key={cobranca.id}
                cobranca={cobranca}
                passageiro={passageiro}
                selectedYear={selectedYear}
                index={idx}
                chavePix={profile?.chave_pix}
                tipoChavePix={profile?.tipo_chave_pix}
                onOpenCobrancaDialog={onOpenCobrancaDialog}
                onEditCobranca={onEditCobranca}
                onRegistrarPagamento={onRegistrarPagamento}
                onExcluirCobranca={onExcluirCobranca}
                onDesfazerPagamento={onDesfazerPagamento}
                onVerRecibo={onVerRecibo}
                onActionSuccess={onActionSuccess}
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
    selectedYear?: number;
    index: number;
    chavePix?: string | null;
    tipoChavePix?: string | null;
    onOpenCobrancaDialog?: (mes?: number, ano?: number, lockFoiPago?: boolean, lockMesAno?: boolean) => void;
    onEditCobranca: (c: Cobranca) => void;
    onRegistrarPagamento: (c: Cobranca) => void;
    onExcluirCobranca: (c: Cobranca) => void;
    onDesfazerPagamento: (id: string) => void;
    onVerRecibo: (url: string, cobranca: Cobranca) => void;
    onActionSuccess?: () => void;
  }
>(({
  cobranca,
  passageiro,
  selectedYear,
  index,
  chavePix,
  tipoChavePix,
  onOpenCobrancaDialog,
  onEditCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
  onVerRecibo,
  onActionSuccess,
}, ref) => {
  const {
    openPassageiroFinanceiroDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();
  const isIncomplete = isPassageiroIncompleto(passageiro);
  const isCancelada = cobranca.status === CobrancaStatus.CANCELADA;
  const isPaid = !isCancelada && cobranca.status === CobrancaStatus.PAGO;
  const isParcial = isPaid && cobranca.valor_pago !== null && cobranca.valor_pago !== undefined && Number(cobranca.valor_pago) < Number(cobranca.valor);
  const isAtrasado = !isCancelada && !isPaid && !isIncomplete && checkCobrancaEmAtraso(cobranca.data_vencimento);
  const valorExibicao = getCobrancaValorExibicao(cobranca);

  const statusColor = isCancelada
    ? "bg-[#f5f5f5] text-[#737373]"
    : isPaid
      ? "bg-emerald-50 text-emerald-600"
      : isAtrasado
        ? "bg-red-50 text-[#e7000b]"
        : "bg-amber-50 text-amber-600";

  const respPrincipal = passageiro.responsavel_principal;
  const telefoneResponsavel = respPrincipal?.telefone;
  const onEnviarCobranca = !isCancelada && telefoneResponsavel && !isIncomplete && (valorExibicao > 0 || !cobranca.isProjection)
    ? () => openBrowserLink(buildCobrancaWhatsAppUrl({
      telefoneResponsavel,
      nomeResponsavel: formatNomeResponsavelCompletoExibicao(respPrincipal?.nome),
      nomePassageiro: passageiro.nome,
      mes: cobranca.mes,
      valor: valorExibicao,
      dataVencimento: cobranca.data_vencimento,
      chavePix,
      tipoChavePix,
    }))
    : undefined;

  const handleIncompleteClick = () => {
    openPassageiroFinanceiroDialog({ passageiro, onSuccess: onActionSuccess });
  };

  const handleIncompletePaymentClick = () => {
    openConfirmationDialog({
      title: "Valor das parcelas não configurado",
      description:
        "Para registrar o pagamento desta previsão, primeiro é necessário definir o valor e o vencimento da parcela. Deseja configurar agora?",
      confirmText: "Configurar agora",
      cancelText: "Fazer depois",
      onConfirm: () => {
        safeCloseDialog(closeConfirmationDialog);
        setTimeout(() => {
          openPassageiroFinanceiroDialog({ passageiro, onSuccess: onActionSuccess });
        }, 100);
      },
    });
  };

  const actions = useCobrancaActions({
    cobranca: {
      ...cobranca,
      passageiro: cobranca.passageiro || passageiro,
    },
    onVerCobranca: () => { },
    onVerCarteirinha: undefined,
    onEditarCobranca: isCancelada
      ? undefined
      : cobranca.isProjection && isIncomplete
        ? handleIncompleteClick
        : () => onEditCobranca(cobranca),
    onRegistrarPagamento: cobranca.isProjection
      ? (isIncomplete ? handleIncompletePaymentClick : () => onOpenCobrancaDialog?.(cobranca.mes, cobranca.ano, true, true))
      : isCancelada
        ? undefined
        : () => onRegistrarPagamento(cobranca),
    onExcluirCobranca: isCancelada ? undefined : () => onExcluirCobranca(cobranca),
    onDesfazerPagamento: cobranca.isProjection || isCancelada ? undefined : (onDesfazerPagamento ? () => onDesfazerPagamento(cobranca.id) : undefined),
    onVerRecibo: cobranca.isProjection || isCancelada ? undefined : (cobranca.recibo_url ? () => onVerRecibo(cobranca.recibo_url!, cobranca) : undefined),
    onEnviarCobranca: isCancelada ? undefined : onEnviarCobranca,
    showHistory: cobranca.isProjection ? false : true,
    onActionSuccess,
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
        onClickItem={cobranca.isProjection && isIncomplete ? handleIncompletePaymentClick : undefined}
        className="bg-transparent"
        renderHeader={renderHeader}
        hideTriggerOnDesktop
      >
        <div
          onClick={cobranca.isProjection && isIncomplete ? handleIncompletePaymentClick : undefined}
          className={cn(
            "p-3.5 rounded-[18px] sm:rounded-[20px] shadow-xs flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border bg-[#ffffff] border-[#e5e5e5] relative hover:border-[#d4d4d4]",
            cobranca.isProjection && "cursor-pointer"
          )}
        >
          <div className={cn(
            "flex-shrink-0 w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0 border transition-colors",
            isCancelada ? "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]" :
              isPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                isAtrasado ? "bg-red-50 text-[#e7000b] border-red-100" :
                  "bg-amber-50 text-amber-600 border-amber-100"
          )}>
            {isCancelada ? <Clock className="h-4 w-4" /> :
              isPaid ? <CheckCircle2 className="h-4 w-4" /> :
                isAtrasado ? <AlertCircle className="h-4 w-4" /> :
                  <Clock className="h-4 w-4" />}
          </div>

          <div className="flex-grow min-w-0 pr-[88px] sm:pr-4">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="font-bold text-[#0a0a0a] text-sm truncate leading-tight">
                {getMesNome(cobranca.mes)}
                {cobranca.ano && cobranca.ano !== (selectedYear || passageiro.ano_letivo) ? `/${cobranca.ano}` : ""}
              </p>
              {cobranca.observacao?.trim() && (
                <MessageSquare className="h-3 w-3 text-[#737373] shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-[#737373] font-medium leading-snug break-words line-clamp-2">
                {isCancelada
                  ? `Venc. ${formatDateToBR(cobranca.data_vencimento)}`
                  : isPaid
                    ? (cobranca.tipo_pagamento ? getPaymentMethodLabel(cobranca.tipo_pagamento) : `Venc. ${formatDateToBR(cobranca.data_vencimento)}`)
                    : isIncomplete
                      ? "Venc. dia --"
                      : isAtrasado
                        ? formatDiasAtraso(cobranca.data_vencimento)
                        : `Venc. ${formatDateToBR(cobranca.data_vencimento)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 sm:static absolute right-8 sm:right-auto top-1/2 -translate-y-1/2 sm:translate-y-0">
            <div className="flex flex-col items-center sm:items-end gap-1">
              <p className="font-bold text-[#0a0a0a] text-[13px] sm:text-sm leading-none tabular-nums mb-0.5 text-center sm:text-right">
                {valorExibicao > 0
                  ? valorExibicao.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                  : "R$ --"}
              </p>
              {cobranca.repasse_em_processamento ? (
                <>
                  <span className="sm:hidden font-bold text-[8px] h-3.5 px-1.5 rounded-[18px] border border-blue-200 uppercase tracking-widest whitespace-nowrap leading-none flex items-center bg-blue-50 text-blue-700 animate-pulse">
                    Processando
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                    Processando Repasse
                  </span>
                </>
              ) : isParcial ? (
                <>
                  <span className="sm:hidden font-bold text-[8px] h-3.5 px-1.5 rounded-[18px] border border-amber-200/60 uppercase tracking-widest whitespace-nowrap leading-none flex items-center bg-amber-50 text-amber-700">
                    Parcial
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
                    Parcial
                  </span>
                </>
              ) : (
                <>
                  <StatusBadge
                    status={cobranca.status}
                    dataVencimento={isIncomplete || isCancelada ? undefined : cobranca.data_vencimento}
                    className={cn(
                      "sm:hidden font-bold text-[8px] h-3.5 px-1.5 rounded-[18px] border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
                      statusColor
                    )}
                  />
                  <StatusBadge
                    status={cobranca.status}
                    dataVencimento={isIncomplete || isCancelada ? undefined : cobranca.data_vencimento}
                    className="hidden sm:inline-flex"
                  />
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center ml-1" onClick={(e) => e.stopPropagation()}>
              <CobrancaActionsMenu
                cobranca={cobranca}
                onVerCarteirinha={undefined}
                onEditarCobranca={isCancelada
                  ? undefined
                  : cobranca.isProjection && isIncomplete
                    ? handleIncompleteClick
                    : () => onEditCobranca(cobranca)}
                onRegistrarPagamento={cobranca.isProjection
                  ? (isIncomplete ? handleIncompletePaymentClick : () => onOpenCobrancaDialog?.(cobranca.mes, cobranca.ano, true, true))
                  : isCancelada
                    ? undefined
                    : () => onRegistrarPagamento(cobranca)}
                onExcluirCobranca={isCancelada ? undefined : () => onExcluirCobranca(cobranca)}
                onDesfazerPagamento={cobranca.isProjection || isCancelada ? undefined : (onDesfazerPagamento ? () => onDesfazerPagamento(cobranca.id) : undefined)}
                onVerRecibo={cobranca.isProjection || isCancelada ? undefined : (cobranca.recibo_url ? () => onVerRecibo(cobranca.recibo_url!, cobranca) : undefined)}
                onEnviarCobranca={isCancelada ? undefined : onEnviarCobranca}
                onActionSuccess={onActionSuccess}
              />
            </div>
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
  <div className={cn("rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 text-center min-w-0 flex flex-col items-center justify-center border border-[#e5e5e5] bg-[#ffffff] shadow-xs", colorClass)}>
    <div className="flex items-center justify-center gap-1 mb-1 max-w-full">
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#737373] whitespace-nowrap">
        {label}
      </span>
    </div>
    <span className="text-xs sm:text-sm max-[320px]:text-[10px] font-bold text-[#0a0a0a] block tabular-nums truncate w-full">
      {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </span>
    <span className="text-[9px] font-medium text-[#737373] block mt-0.5 truncate w-full">
      {count} {count === 1 ? "parcela" : "parcelas"}
    </span>
  </div>
);
