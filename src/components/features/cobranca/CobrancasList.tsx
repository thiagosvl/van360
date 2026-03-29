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
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus, CobrancaTab } from "@/types/enums";
import {
  formatDateToBR,
  formatDiasAtraso,
  formatFirstName,
  formatPaymentType,
  formatShortName,
} from "@/utils/formatters";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { DollarSign, Wallet } from "lucide-react";
import { memo, useState } from "react";
import { CobrancaSummary } from "./CobrancaSummary";
interface CobrancasListProps {
  cobrancas: Cobranca[];
  activeTab: CobrancaTab;
  isLoading: boolean;
  busca: string;
  mesFilter: number;
  meses: string[];

  onVerCarteirinha: (passageiroId: string) => void;
  onEditarCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onDesfazerPagamento?: (cobranca: Cobranca) => void;
  onActionSuccess: () => void;
}

const CobrancaMobileCard = memo(function CobrancaMobileCard({
  cobranca,
  index,
  activeTab,
  onVerCarteirinha,
  onEditarCobranca,
  onRegistrarPagamento,
  onExcluirCobranca,
  onDesfazerPagamento,
  onActionSuccess,
}: {
  cobranca: Cobranca;
  index: number;
  activeTab: CobrancaTab;
} & Omit<CobrancasListProps, "cobrancas" | "isLoading" | "busca" | "mesFilter" | "meses">) {

  const actions = useCobrancaActions({
    cobranca,
    onVerCobranca: () => {},
    onVerCarteirinha: () => onVerCarteirinha(cobranca.passageiro_id),
    onEditarCobranca: () => onEditarCobranca(cobranca),
    onRegistrarPagamento: () => onRegistrarPagamento(cobranca),
    onExcluirCobranca: () => onExcluirCobranca(cobranca),
    onDesfazerPagamento: onDesfazerPagamento ? () => onDesfazerPagamento(cobranca) : undefined,
    onActionSuccess,
  });

  const getVencimentoDia = (dateStr?: string) => {
    if (!dateStr) return "??";
    const parts = dateStr.split("-");
    if (parts.length === 3) return parts[2].substring(0, 2);
    return "??";
  };

  const vencDia = getVencimentoDia(cobranca?.data_vencimento);
  const isPaid = cobranca?.status === CobrancaStatus.PAGO;
  const isAtrasado = !isPaid && checkCobrancaEmAtraso(cobranca?.data_vencimento);

  const shortName = formatShortName(cobranca?.passageiro?.nome, true);
  const firstNomeResponsavel = formatFirstName(cobranca?.passageiro?.nome_responsavel);

  const statusColor = isPaid
    ? "bg-emerald-50 text-emerald-600"
    : (isAtrasado ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600");
  const renderHeader = () => <CobrancaSummary cobranca={cobranca} />;

  return (
    <MobileActionItem 
      actions={actions} 
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div
        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          isPaid ? "bg-emerald-500" : isAtrasado ? "bg-red-500" : "bg-amber-500"
        )}>
          <span className="text-white font-headline font-bold text-sm leading-none">
            {vencDia}
          </span>
        </div>

        <div className="flex-grow min-w-0 pr-8">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {shortName}
          </p>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {firstNomeResponsavel}
            </p>
            {isAtrasado && (
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-tight mt-0.5">
                {formatDiasAtraso(cobranca.data_vencimento)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-8 top-1/2 -translate-y-1/2">
          <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
            {Number(cobranca?.valor).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <StatusBadge
            status={cobranca?.status}
            dataVencimento={cobranca?.data_vencimento}
            className={cn(
              "font-bold text-[8px] h-3.5 px-1 rounded-sm border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
              statusColor
            )}
          />
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
  ...props
}: CobrancasListProps) {

  const [openedCobranca, setOpenedCobranca] = useState<Cobranca | null>(null);
  const isPendingTab = activeTab === CobrancaTab.ARECEBER;

  const getEmptyState = () => {
    if (busca !== "") {
      return (
        <UnifiedEmptyState
          icon={Wallet}
          title="Nenhum resultado"
          description="Tente buscar por outro nome ou termo."
        />
      );
    }
    return (
      <UnifiedEmptyState
        icon={isPendingTab ? Wallet : DollarSign}
        title="Nenhuma mensalidade"
        description="Não há mensalidades para este período."
      />
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
          onVerCarteirinha={props.onVerCarteirinha}
          onEditarCobranca={props.onEditarCobranca}
          onRegistrarPagamento={props.onRegistrarPagamento}
          onExcluirCobranca={props.onExcluirCobranca}
          onDesfazerPagamento={props.onDesfazerPagamento}
          onActionSuccess={props.onActionSuccess}
        />
      )}
    >
      <div className="rounded-[28px] overflow-hidden bg-white shadow-diff-shadow border-none">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100/80">
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Passageiro
              </TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Valor
              </TableHead>
              <TableHead className="px-8 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Status
              </TableHead>
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {isPendingTab ? "Vencimento" : "Pagamento"}
              </TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cobrancas.map((cobranca) => {
              const firstName = formatFirstName(cobranca?.passageiro?.nome_responsavel);

              return (
                <TableRow
                  key={cobranca.id}
                  onClick={() => setOpenedCobranca(cobranca)}
                  className="hover:bg-surface-container-low/20 border-b border-surface-container-low/50 last:border-0 transition-colors cursor-pointer group/row"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col">
                      <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                        {formatShortName(cobranca?.passageiro?.nome, true)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                        {firstName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-headline font-bold text-[#1a3a5c] text-sm">
                      {Number(cobranca?.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-center">
                    <StatusBadge
                      status={cobranca?.status}
                      dataVencimento={cobranca?.data_vencimento}
                      className={cn(
                        "font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none shadow-none uppercase tracking-widest inline-flex items-center",
                        cobranca?.status === CobrancaStatus.PAGO
                          ? "bg-emerald-50 text-emerald-600"
                          : checkCobrancaEmAtraso(cobranca?.data_vencimento)
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                      )}
                    />
                  </TableCell>

                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-bold",
                        !isPendingTab ? "text-emerald-500" : "text-[#1a3a5c]"
                      )}>
                        {isPendingTab
                          ? formatDateToBR(cobranca?.data_vencimento)
                          : formatDateToBR(cobranca?.data_pagamento)}
                      </span>
                      {!isPendingTab && (
                        <span className="text-[9px] text-gray-400 font-medium">
                          {formatPaymentType(cobranca?.tipo_pagamento)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <CobrancaActionsMenu
                      cobranca={cobranca}
                      onVerCarteirinha={() => props.onVerCarteirinha(cobranca.passageiro_id)}
                      onEditarCobranca={() => props.onEditarCobranca(cobranca)}
                      onRegistrarPagamento={() => props.onRegistrarPagamento(cobranca)}
                      onActionSuccess={props.onActionSuccess}
                      onExcluirCobranca={() => props.onExcluirCobranca(cobranca)}
                      onDesfazerPagamento={props.onDesfazerPagamento ? () => props.onDesfazerPagamento(cobranca) : undefined}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>

    {/* Desktop-triggered ActionSheet (Quick View) */}
    {openedCobranca && (
      <ActionSheetWrapper
        cobranca={openedCobranca}
        open={!!openedCobranca}
        onOpenChange={(open) => !open && setOpenedCobranca(null)}
        props={props}
      />
    )}
    </>
  );
}

// Wrapper to avoid calling useCobrancaActions for all rows upfront
function ActionSheetWrapper({ 
  cobranca, 
  open, 
  onOpenChange, 
  props 
}: { 
  cobranca: Cobranca; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  props: any;
}) {
  const actions = useCobrancaActions({
    cobranca,
    onVerCobranca: () => {},
    onVerCarteirinha: () => props.onVerCarteirinha(cobranca.passageiro_id),
    onEditarCobranca: () => props.onEditarCobranca(cobranca),
    onRegistrarPagamento: () => props.onRegistrarPagamento(cobranca),
    onExcluirCobranca: () => props.onExcluirCobranca(cobranca),
    onDesfazerPagamento: props.onDesfazerPagamento ? () => props.onDesfazerPagamento(cobranca) : undefined,
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
