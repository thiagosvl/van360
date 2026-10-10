import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnifiedEmptyState } from "@/components/empty";
import { ListSkeleton } from "@/components/skeletons";
import { CobrancaActionsMenu } from "@/components/features/cobranca/CobrancaActionsMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { safeCloseDialog, useAppPreferences } from "@/hooks";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus, CobrancaTab } from "@/types/enums";
import {
  formatShortName,
} from "@/utils/formatters";
import { formatNomeResponsavelExibicao, formatNomeResponsavelCompletoExibicao } from "@/utils/formatters/name";
import { checkCobrancaEmAtraso, getCobrancaValorExibicao } from "@/utils/formatters/cobranca";
import { DollarSign, Wallet, CalendarClock, History, MessageSquare } from "lucide-react";
import { buildCobrancaWhatsAppUrl } from "@/utils/whatsappTemplates";
import { openBrowserLink } from "@/utils/browser";
import { memo, useState } from "react";
import { CobrancaSummary } from "./CobrancaSummary";
interface CobrancasListProps {
  cobrancas: Cobranca[];
  activeTab: CobrancaTab;
  isLoading: boolean;
  busca: string;
  mesFilter: number;
  anoFilter?: number;
  isFutureMonth?: boolean;
  isPastMonth?: boolean;
  isCurrentMonth?: boolean;
  meses: string[];

  onVerCarteirinha: (passageiroId: string) => void;
  onEditarCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onDesfazerPagamento?: (cobranca: Cobranca) => void;
  onVerRecibo: (url: string, cobranca: Cobranca) => void;
  onActionSuccess: () => void;
  onClearSearch?: () => void;
}

import { isPassageiroIncompleto } from "@/utils/domain";

function getVencimentoDia(cobranca: Cobranca) {
  if (cobranca?.isProjection && isPassageiroIncompleto(cobranca?.passageiro)) {
    return "--";
  }
  const dateStr = cobranca?.data_vencimento;
  if (!dateStr) return "--";
  const parts = dateStr.split("-");
  if (parts.length === 3) return parts[2].substring(0, 2);
  return "--";
}



const CobrancaMobileCard = memo(function CobrancaMobileCard({
  cobranca,
  onVerCarteirinha,
  onEditarCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
  onVerRecibo,
  onActionSuccess,
  onOpenCreateForProjection,
  chavePix,
  tipoChavePix,
}: {
  cobranca: Cobranca;
  index: number;
  activeTab: CobrancaTab;
  chavePix?: string | null;
  tipoChavePix?: string | null;
  onOpenCreateForProjection?: (cobranca: Cobranca) => void;
} & Omit<CobrancasListProps, "cobrancas" | "isLoading" | "busca" | "mesFilter" | "meses">) {

  const respPrincipal = cobranca.passageiro?.responsavel_principal;
  const telefoneResponsavel = respPrincipal?.telefone;
  const nomeRespText = respPrincipal?.nome ?? "";

  const onEnviarCobranca = (telefoneResponsavel && !isPassageiroIncompleto(cobranca.passageiro))
    ? () => openBrowserLink(buildCobrancaWhatsAppUrl({
      telefoneResponsavel,
      nomeResponsavel: nomeRespText,
      nomePassageiro: cobranca.passageiro?.nome ?? "",
      mes: cobranca.mes,
      valor: cobranca.valor,
      dataVencimento: cobranca.data_vencimento,
      chavePix,
      tipoChavePix,
    }))
    : undefined;

  const actions = useCobrancaActions({
    cobranca,
    onVerCobranca: () => { },
    onVerCarteirinha: () => onVerCarteirinha(cobranca.passageiro_id),
    onEditarCobranca: () => onEditarCobranca(cobranca),
    onRegistrarPagamento: cobranca?.isProjection
      ? () => onOpenCreateForProjection?.(cobranca)
      : () => onRegistrarPagamento(cobranca),
    onExcluirCobranca: () => onExcluirCobranca(cobranca),
    onDesfazerPagamento: cobranca?.isProjection ? undefined : (onDesfazerPagamento ? () => onDesfazerPagamento(cobranca) : undefined),
    onVerRecibo: cobranca?.isProjection ? undefined : (cobranca.recibo_url ? () => onVerRecibo(cobranca.recibo_url!, cobranca) : undefined),
    onEnviarCobranca,
    onActionSuccess,
  });

  const vencDia = getVencimentoDia(cobranca);
  const isPaid = cobranca?.status === CobrancaStatus.PAGO;
  const isParcial = isPaid && cobranca.valor_pago !== null && cobranca.valor_pago !== undefined && Number(cobranca.valor_pago) < Number(cobranca.valor);
  const isAtrasado = !isPaid && checkCobrancaEmAtraso(cobranca?.data_vencimento);

  const { formatoNomeResponsavel } = useAppPreferences();
  const shortName = formatShortName(cobranca?.passageiro?.nome, true);
  const firstNomeResponsavel = formatNomeResponsavelExibicao(respPrincipal?.nome, formatoNomeResponsavel);

  const statusColor = isPaid
    ? "bg-emerald-50 text-emerald-600"
    : (isAtrasado ? "bg-red-50 text-[#e7000b]" : "bg-amber-50 text-amber-600");
  const renderHeader = () => <CobrancaSummary cobranca={cobranca} />;

  return (
    <MobileActionItem
      actions={actions}
      onClickItem={
        cobranca?.isProjection && isPassageiroIncompleto(cobranca.passageiro)
          ? () => onOpenCreateForProjection?.(cobranca)
          : undefined
      }
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div
        className={cn(
          "p-3.5 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center gap-3 active:scale-[0.99] transition-all duration-150 relative",
          cobranca?.isProjection && "cursor-pointer"
        )}
      >
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-xs shrink-0 border transition-colors",
          isPaid
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
            : isAtrasado
              ? "bg-red-50 text-[#e7000b] border-red-200/60"
              : "bg-amber-50 text-amber-700 border-amber-200/60"
        )}>
          {vencDia}
        </div>

        <div className="flex-grow min-w-0 pr-[92px] sm:pr-24">
          <div className="flex items-center gap-1 min-w-0">
            <p className="font-semibold text-sm text-[#0a0a0a] truncate leading-tight">
              {shortName}
            </p>
            {cobranca.observacao?.trim() && (
              <MessageSquare className="h-3.5 w-3.5 text-[#737373] shrink-0" />
            )}
          </div>
          <div className="flex flex-col min-w-0 mt-0.5">
            <p className={cn(
              "text-xs text-[#737373] font-normal leading-snug",
              formatoNomeResponsavel === "completo" ? "truncate" : "break-words line-clamp-2"
            )}>
              {firstNomeResponsavel}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-1 flex-shrink-0 absolute right-8 top-1/2 -translate-y-1/2">
          <p className="font-bold text-[#0a0a0a] text-[13px] sm:text-sm leading-none tabular-nums mb-0.5 text-center sm:text-right">
            {getCobrancaValorExibicao(cobranca) > 0
              ? getCobrancaValorExibicao(cobranca).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
              : "R$ --"}
          </p>
          {cobranca.repasse_em_processamento ? (
            <span className="font-bold text-[8px] h-3.5 px-1.5 rounded-[18px] border border-blue-200 uppercase tracking-widest whitespace-nowrap leading-none flex items-center bg-blue-50 text-blue-700 animate-pulse">
              Processando
            </span>
          ) : isParcial ? (
            <span className="font-bold text-[8px] h-3.5 px-1.5 rounded-[18px] border border-amber-200/60 uppercase tracking-widest whitespace-nowrap leading-none flex items-center bg-amber-50 text-amber-700">
              Parcial
            </span>
          ) : (
            <StatusBadge
              status={cobranca?.status}
              dataVencimento={cobranca?.data_vencimento}
              className={cn(
                "font-bold text-[8px] h-3.5 px-1.5 rounded-[18px] border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
                statusColor
              )}
            />
          )}
        </div>
      </div>
    </MobileActionItem>
  );
});

export function CobrancasList({
  cobrancas,
  activeTab,
  isLoading,
  busca,
  onClearSearch,
  mesFilter,
  anoFilter,
  isFutureMonth,
  isPastMonth,
  meses,
  ...props
}: CobrancasListProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { formatoNomeResponsavel } = useAppPreferences();
  const {
    openCobrancaFormDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFinanceiroDialog,
  } = useLayout();

  const [openedCobranca, setOpenedCobranca] = useState<Cobranca | null>(null);
  const isPendingTab = activeTab === CobrancaTab.ARECEBER;

  const handleOpenCreateForProjection = (cobranca: Cobranca) => {
    if (isPassageiroIncompleto(cobranca.passageiro)) {
      openConfirmationDialog({
        title: "Valor das parcelas não configurado",
        description:
          "Para registrar o pagamento desta previsão, primeiro é necessário definir o valor e o vencimento da parcela. Deseja configurar agora?",
        confirmText: "Configurar agora",
        cancelText: "Fazer depois",
        onConfirm: () => {
          safeCloseDialog(closeConfirmationDialog);
          setTimeout(() => {
            if (cobranca.passageiro) {
              openPassageiroFinanceiroDialog({ passageiro: cobranca.passageiro });
            }
          }, 100);
        },
      });
      return;
    }

    openCobrancaFormDialog({
      passageiroId: cobranca.passageiro_id,
      passageiroNome: formatShortName(cobranca.passageiro?.nome, true),
      passageiroResponsavelNome: formatNomeResponsavelExibicao(cobranca.passageiro?.responsavel_principal?.nome),
      valorCobranca: Number(cobranca.valor),
      diaVencimento: Number(cobranca.passageiro?.dia_vencimento || 10),
      mes: cobranca.mes,
      ano: cobranca.ano,
      lockFoiPago: true,
      lockMesAno: true,
      onSuccess: props.onActionSuccess,
    });
  };

  const getEmptyState = () => {
    if (busca !== "") {
      return (
        <UnifiedEmptyState
          icon={Wallet}
          title="Nenhum resultado"
          description="Tente buscar por outro nome ou termo."
          action={onClearSearch ? { label: "Limpar Busca", onClick: onClearSearch } : undefined}
        />
      );
    }

    if (isFutureMonth) {
      const nomeMes = meses?.[mesFilter - 1] || "";
      return (
        <UnifiedEmptyState
          icon={CalendarClock}
          title="Geração Automática de Parcelas"
          description={`As parcelas de ${nomeMes}/${anoFilter || 2026} serão geradas automaticamente na virada do mês. Todos os alunos ativos serão cobrados normalmente.`}
        />
      );
    }

    if (isPastMonth) {
      return (
        <UnifiedEmptyState
          icon={History}
          title="Sem parcelas neste período"
          description="Seu cadastro ou contratos de alunos iniciaram a partir de Julho/2026. Não há histórico de cobranças anteriores a este período."
        />
      );
    }

    return (
      <UnifiedEmptyState
        icon={isPendingTab ? Wallet : DollarSign}
        title="Nenhuma parcela"
        description="Não há parcelas registradas para este período."
      />
    );
  };

  const renderDesktopRow = (cobranca: Cobranca) => {
    const respPrincipal = cobranca.passageiro?.responsavel_principal;
    const telefoneResponsavel = respPrincipal?.telefone;

    const onEnviarCobranca = (telefoneResponsavel && !isPassageiroIncompleto(cobranca.passageiro))
      ? () => openBrowserLink(buildCobrancaWhatsAppUrl({
        telefoneResponsavel,
        nomeResponsavel: formatNomeResponsavelCompletoExibicao(respPrincipal?.nome),
        nomePassageiro: cobranca.passageiro?.nome ?? "",
        mes: cobranca.mes,
        valor: cobranca.valor,
        dataVencimento: cobranca.data_vencimento,
        chavePix: profile?.chave_pix,
        tipoChavePix: profile?.tipo_chave_pix,
      }))
      : undefined;

    return (
      <TableRow
        key={cobranca.id}
        onClick={() => setOpenedCobranca(cobranca)}
        className="hover:bg-[#fafafa] border-b border-[#e5e5e5] last:border-0 transition-colors cursor-pointer group/row"
      >
        <TableCell className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-xs shrink-0 border transition-colors",
              cobranca?.status === CobrancaStatus.PAGO
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : checkCobrancaEmAtraso(cobranca?.data_vencimento)
                  ? "bg-red-50 text-[#e7000b] border-red-200/60"
                  : "bg-amber-50 text-amber-700 border-amber-200/60"
            )}>
              {getVencimentoDia(cobranca)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm text-[#0a0a0a]">
                  {formatShortName(cobranca?.passageiro?.nome, true)}
                </p>
                {cobranca.observacao?.trim() && (
                  <MessageSquare className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                )}
              </div>
              <p className={cn(
                "text-xs text-[#737373] font-normal mt-0.5",
                formatoNomeResponsavel === "completo" ? "truncate max-w-[200px]" : "truncate"
              )}>
                {formatNomeResponsavelExibicao(cobranca?.passageiro?.responsavel_principal?.nome, formatoNomeResponsavel)}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-6 py-4 text-center">
          {cobranca.repasse_em_processamento ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
              Processando Repasse
            </span>
          ) : cobranca?.status === CobrancaStatus.PAGO && cobranca.valor_pago !== null && cobranca.valor_pago !== undefined && Number(cobranca.valor_pago) < Number(cobranca.valor) ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
              Parcial
            </span>
          ) : (
            <StatusBadge
              status={cobranca?.status}
              dataVencimento={cobranca?.data_vencimento}
            />
          )}
        </TableCell>

        <TableCell className="px-6 py-4 text-right">
          <span className="font-semibold text-sm text-[#0a0a0a]">
            {getCobrancaValorExibicao(cobranca) > 0
              ? getCobrancaValorExibicao(cobranca).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
              : "R$ --"}
          </span>
        </TableCell>

        <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <CobrancaActionsMenu
            cobranca={cobranca}
            onVerCarteirinha={() => props.onVerCarteirinha(cobranca.passageiro_id)}
            onEditarCobranca={() => props.onEditarCobranca(cobranca)}
            onRegistrarPagamento={cobranca.isProjection
              ? () => handleOpenCreateForProjection(cobranca)
              : () => props.onRegistrarPagamento(cobranca)}
            onActionSuccess={props.onActionSuccess}
            onExcluirCobranca={() => props.onExcluirCobranca(cobranca)}
            onDesfazerPagamento={props.onDesfazerPagamento ? () => props.onDesfazerPagamento(cobranca) : undefined}
            onVerRecibo={props.onVerRecibo ? () => props.onVerRecibo(cobranca.recibo_url!, cobranca) : undefined}
            onEnviarCobranca={onEnviarCobranca}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <ResponsiveDataList
        data={cobrancas}
        isLoading={isLoading}
        loadingSkeleton={<ListSkeleton count={5} />}
        emptyState={getEmptyState()}
        mobileContainerClassName="space-y-3"
        mobileItemRenderer={(cobranca, index) => (
          <CobrancaMobileCard
            key={cobranca.id}
            cobranca={cobranca}
            index={index}
            activeTab={activeTab}
            chavePix={profile?.chave_pix}
            tipoChavePix={profile?.tipo_chave_pix}
            onVerCarteirinha={props.onVerCarteirinha}
            onEditarCobranca={props.onEditarCobranca}
            onRegistrarPagamento={props.onRegistrarPagamento}
            onExcluirCobranca={props.onExcluirCobranca}
            onDesfazerPagamento={props.onDesfazerPagamento}
            onVerRecibo={props.onVerRecibo}
            onActionSuccess={props.onActionSuccess}
            onOpenCreateForProjection={handleOpenCreateForProjection}
          />
        )}
      >
        <div className="rounded-[24px] overflow-hidden bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <Table>
            <TableHeader className="bg-[#fafafa]">
              <TableRow className="hover:bg-transparent border-b border-[#e5e5e5]">
                <TableHead className="px-6 py-3.5 text-left text-[11px] sm:text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Aluno
                </TableHead>
                <TableHead className="px-6 py-3.5 text-center text-[11px] sm:text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3.5 text-right text-[11px] sm:text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Valor
                </TableHead>
                <TableHead className="px-6 py-3.5 text-right text-[11px] sm:text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cobrancas.map(renderDesktopRow)}
            </TableBody>
          </Table>
        </div>
      </ResponsiveDataList>

      {/* Desktop-triggered ActionSheet (Quick View) */}
      {
        openedCobranca && (
          <ActionSheetWrapper
            cobranca={openedCobranca}
            open={!!openedCobranca}
            onOpenChange={(open) => !open && safeCloseDialog(() => setOpenedCobranca(null))}
            props={props}
            onOpenCreateForProjection={handleOpenCreateForProjection}
            chavePix={profile?.chave_pix}
            tipoChavePix={profile?.tipo_chave_pix}
          />
        )
      }
    </>
  );
}

// Wrapper to avoid calling useCobrancaActions for all rows upfront
function ActionSheetWrapper({
  cobranca,
  open,
  onOpenChange,
  props,
  onOpenCreateForProjection,
  chavePix,
  tipoChavePix,
}: {
  cobranca: Cobranca;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  props: Omit<CobrancasListProps, "cobrancas" | "isLoading" | "busca" | "mesFilter" | "meses" | "activeTab">;
  onOpenCreateForProjection: (cobranca: Cobranca) => void;
  chavePix?: string | null;
  tipoChavePix?: string | null;
}) {
  const respPrincipal = cobranca.passageiro?.responsavel_principal;
  const telefoneResponsavel = respPrincipal?.telefone;
  const onEnviarCobranca = (telefoneResponsavel && !isPassageiroIncompleto(cobranca.passageiro))
    ? () => openBrowserLink(buildCobrancaWhatsAppUrl({
      telefoneResponsavel,
      nomeResponsavel: respPrincipal?.nome ?? "",
      nomePassageiro: cobranca.passageiro?.nome ?? "",
      mes: cobranca.mes,
      valor: cobranca.valor,
      dataVencimento: cobranca.data_vencimento,
      chavePix,
      tipoChavePix,
    }))
    : undefined;

  const actions = useCobrancaActions({
    cobranca,
    onVerCobranca: () => { },
    onVerCarteirinha: () => props.onVerCarteirinha(cobranca.passageiro_id),
    onEditarCobranca: () => props.onEditarCobranca(cobranca),
    onRegistrarPagamento: cobranca.isProjection
      ? () => onOpenCreateForProjection(cobranca)
      : () => props.onRegistrarPagamento(cobranca),
    onExcluirCobranca: cobranca.isProjection ? undefined : () => props.onExcluirCobranca(cobranca),
    onDesfazerPagamento: cobranca.isProjection ? undefined : (props.onDesfazerPagamento ? () => props.onDesfazerPagamento(cobranca) : undefined),
    onVerRecibo: cobranca.isProjection ? undefined : (cobranca.recibo_url ? () => props.onVerRecibo(cobranca.recibo_url!, cobranca) : undefined),
    onEnviarCobranca,
    onActionSuccess: props.onActionSuccess,
  });

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      actions={actions.map(a => ({
        ...a,
        onClick: () => {
          onOpenChange(false);
          a.onClick();
        }
      }))}
    >
      <CobrancaSummary cobranca={cobranca} />
    </ActionSheet>
  );
}
