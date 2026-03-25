import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnifiedEmptyState } from "@/components/empty";
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
  formatFirstName,
  formatPaymentType,
  formatShortName,
} from "@/utils/formatters";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { DollarSign, Wallet } from "lucide-react";
import { memo } from "react";

interface CobrancasListProps {
  cobrancas: Cobranca[];
  activeTab: CobrancaTab;
  isLoading: boolean;
  busca: string;
  mesFilter: number;
  meses: string[];

  onVerCobranca: (cobranca: Cobranca) => void;
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
  onVerCobranca,
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
    onVerCobranca: () => onVerCobranca(cobranca),
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

  const shortName = formatShortName(cobranca?.passageiro?.nome);
  const firstNomeResponsavel = formatFirstName(cobranca?.passageiro?.nome_responsavel);

  const statusColor = isPaid
    ? "bg-emerald-50 text-emerald-600"
    : (isAtrasado ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600");

  return (
    <MobileActionItem actions={actions} className="bg-transparent">
      <div
        onClick={() => onVerCobranca(cobranca)}
        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className="flex-shrink-0 w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center">
          <span className="text-white font-headline font-bold text-sm leading-none">
            {vencDia}
          </span>
        </div>

        <div className="flex-grow min-w-0 pr-10">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {shortName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {firstNomeResponsavel}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
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
        title="Nenhuma informação"
        description="Não há mensalidades para o período."
      />
    );
  };

  return (
    <ResponsiveDataList
      data={cobrancas}
      isLoading={isLoading}
      emptyState={getEmptyState()}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(cobranca, index) => (
        <CobrancaMobileCard
          key={cobranca.id}
          cobranca={cobranca}
          index={index}
          activeTab={activeTab}
          {...props}
        />
      )}
    >
      <div className="rounded-xl overflow-hidden bg-white shadow-diff-shadow border-none">
        <Table>
          <TableHeader className="bg-surface-container-low/30">
            <TableRow className="hover:bg-transparent border-b border-surface-container-low">
              <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Passageiro
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Valor
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {isPendingTab ? "Vencimento" : "Pagamento"}
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">
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
                  onClick={() => props.onVerCobranca(cobranca)}
                  className="hover:bg-surface-container-low/20 border-b border-surface-container-low/50 last:border-0 transition-colors cursor-pointer"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                        {cobranca?.passageiro?.nome || "Not informed"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        Responsável: {firstName}
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

                  <TableCell className="px-6 py-4">
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
                        <span className="text-[9px] text-gray-400 font-medium uppercase">
                          {formatPaymentType(cobranca?.tipo_pagamento)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <CobrancaActionsMenu
                      cobranca={cobranca}
                      onVerCarteirinha={() => props.onVerCarteirinha(cobranca.passageiro_id)}
                      onVerCobranca={() => props.onVerCobranca(cobranca)}
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
  );
}
