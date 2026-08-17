import React, { useMemo, useState } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { getMesNome, formatDateToBR, formatDiasAtraso } from "@/utils/formatters";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { CheckCircle2, Clock, AlertCircle, History, ShieldCheck, Eye, Download } from "lucide-react";
import { openBrowserLink } from "@/utils/browser";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";
import { ResponsavelReceiptDialog } from "@/components/dialogs/ResponsavelReceiptDialog";
import { cn } from "@/lib/utils";
import { mapearCarteirinhaParaPassageiro } from "@/utils/domain/carteirinhaConverter";
import { getNowBR } from "@/utils/dateUtils";

interface ResponsavelCarteirinhaCobrancasProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaCobrancas: React.FC<ResponsavelCarteirinhaCobrancasProps> = ({
  carteirinha,
}) => {
  const cobrancas = carteirinha.cobrancas || [];
  const passageiroConvertido = useMemo(() => mapearCarteirinhaParaPassageiro(carteirinha), [carteirinha]);

  const [receiptDialogState, setReceiptDialogState] = useState<{
    open: boolean;
    url: string | null;
    descricao?: string;
  }>({ open: false, url: null });

  const handleOpenReceiptDialog = (url: string, descricao?: string) => {
    setReceiptDialogState({ open: true, url, descricao });
  };

  const handleCloseReceiptDialog = () => {
    setReceiptDialogState((prev) => ({ ...prev, open: false }));
  };

  const handleDownloadReceiptDirect = async (receiptUrl: string) => {
    try {
      if (receiptUrl.startsWith("http")) {
        const response = await fetch(receiptUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `comprovante-${getNowBR().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        openBrowserLink(receiptUrl);
      }
    } catch {
      openBrowserLink(receiptUrl);
    }
  };

  if (carteirinha.isento) {
    return (
      <UnifiedEmptyState
        icon={ShieldCheck}
        title="Passageiro Isento de Parcelas"
        description="Este passageiro possui isenção de parcelas cadastrada. Nenhuma cobrança ou parcela é gerada automaticamente."
      />
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none px-2">
            {cobrancas.length} {cobrancas.length === 1 ? "PARCELA" : "PARCELAS"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {cobrancas.length === 0 ? (
          <UnifiedEmptyState
            icon={History}
            title="Sem parcelas registradas"
            description="Nenhuma parcela foi encontrada para este aluno até o momento."
          />
        ) : (
          cobrancas.map((item) => {
            const isPago = item.status === "pago";
            const isAtrasado = !isPago && checkCobrancaEmAtraso(item.data_vencimento);
            const nomeMes = getMesNome(item.mes);
            const cobrancaDesc = `Recibo de ${item.mes}/${item.ano} - ${carteirinha.nome}`;
            const valorNum = Number(item.valor) || 0;

            const statusColor = isPago
              ? "bg-emerald-50 text-emerald-600"
              : isAtrasado
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-600";

            const cobrancaObjParaSummary = {
              id: item.id,
              passageiro_id: carteirinha.id,
              mes: item.mes,
              ano: item.ano,
              valor: valorNum,
              status: (isAtrasado ? "vencido" : item.status) as any,
              data_vencimento: item.data_vencimento,
              created_at: "",
              updated_at: "",
              usuario_id: "",
              origem: "manual" as any,
            };

            const hasReceipt = isPago && !!item.recibo_url;

            const actions = [
              {
                icon: Eye,
                label: "Visualizar Comprovante",
                onClick: () => {
                  if (hasReceipt) {
                    handleOpenReceiptDialog(item.recibo_url!, cobrancaDesc);
                  }
                },
                disabled: !hasReceipt,
              },
              {
                icon: Download,
                label: "Baixar Comprovante",
                onClick: () => {
                  if (hasReceipt) {
                    handleDownloadReceiptDirect(item.recibo_url!);
                  }
                },
                disabled: !hasReceipt,
              },
            ];

            return (
              <MobileActionItem
                key={item.id}
                actions={actions}
                onClickItem={undefined}
                className="bg-transparent"
                renderHeader={() => (
                  <CobrancaSummary cobranca={{ ...cobrancaObjParaSummary, passageiro: passageiroConvertido }} />
                )}
                hideTriggerOnDesktop
              >
                <div className="p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border bg-white border-gray-100/50 relative cursor-pointer">
                  <div
                    className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-headline font-bold text-sm text-white shadow-sm",
                      isPago
                        ? "bg-emerald-500"
                        : isAtrasado
                        ? "bg-red-500"
                        : "bg-amber-500"
                    )}
                  >
                    {isPago ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : isAtrasado ? (
                      <AlertCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Clock className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className="flex-grow min-w-0 pr-[88px] sm:pr-4">
                    <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
                      {nomeMes}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-gray-500 font-medium leading-snug opacity-70 break-words line-clamp-2">
                        {isPago
                          ? `Venc. ${formatDateToBR(item.data_vencimento)}`
                          : isAtrasado
                          ? formatDiasAtraso(item.data_vencimento)
                          : `Venc. ${formatDateToBR(item.data_vencimento)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 sm:static absolute right-8 sm:right-auto top-1/2 -translate-y-1/2 sm:translate-y-0">
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
                        {valorNum.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <StatusBadge
                        status={isAtrasado ? ("vencido" as any) : (item.status as any)}
                        dataVencimento={item.data_vencimento}
                        className={cn(
                          "font-bold text-[8px] h-3.5 px-1 rounded-sm border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
                          statusColor
                        )}
                      />
                    </div>
                  </div>
                </div>
              </MobileActionItem>
            );
          })
        )}
      </div>

      {receiptDialogState.open && (
        <ResponsavelReceiptDialog
          isOpen={receiptDialogState.open}
          onClose={handleCloseReceiptDialog}
          receiptUrl={receiptDialogState.url}
          cobrancaDescricao={receiptDialogState.descricao}
        />
      )}
    </div>
  );
};
