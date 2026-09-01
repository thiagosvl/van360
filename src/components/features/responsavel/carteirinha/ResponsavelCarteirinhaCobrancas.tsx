import React, { useMemo, useState } from "react";
import { ResponsavelCarteirinhaData, ResponsavelCobrancaItem } from "@/types/responsavel";
import { getMesNome, formatDateToBR, formatDiasAtraso } from "@/utils/formatters";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { CheckCircle2, Clock, AlertCircle, History, ShieldCheck, Eye, Share2 } from "lucide-react";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { CobrancaSummary } from "@/components/features/cobranca/CobrancaSummary";
import { ResponsavelReceiptDialog } from "@/components/dialogs/ResponsavelReceiptDialog";
import { cn } from "@/lib/utils";
import { mapearCarteirinhaParaPassageiro } from "@/utils/domain/carteirinhaConverter";
import { getNowBR } from "@/utils/dateUtils";
import { CobrancaStatus } from "@/types/enums";
import { shouldGeneratePassengerProjection, getSafeDueDateString } from "@/utils/domain";

import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface ResponsavelCarteirinhaCobrancasProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaCobrancas: React.FC<ResponsavelCarteirinhaCobrancasProps> = ({
  carteirinha,
}) => {
  const passageiroConvertido = useMemo(() => mapearCarteirinhaParaPassageiro(carteirinha), [carteirinha]);

  const now = getNowBR();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const displayCobrancas = useMemo(() => {
    const rawList = carteirinha.cobrancas || [];
    const list: ResponsavelCobrancaItem[] = [...rawList];

    if (!passageiroConvertido || carteirinha.isento) return list;

    const startMonth = currentMonth;
    const endMonth = 12;
    const dbMonths = new Set(list.filter((c) => c.ano === currentYear).map((c) => c.mes));

    for (let m = startMonth; m <= endMonth; m++) {
      if (!dbMonths.has(m)) {
        const canGenerate = shouldGeneratePassengerProjection({
          passageiro: passageiroConvertido,
          targetMonth: m,
          targetYear: currentYear,
        });

        if (canGenerate) {
          const dataVenc = getSafeDueDateString(carteirinha.dia_vencimento, m, currentYear);
          list.push({
            id: `proj_resp_${carteirinha.id}_${m}_${currentYear}`,
            mes: m,
            ano: currentYear,
            valor: Number(carteirinha.valor_cobranca || 0),
            status: CobrancaStatus.PENDENTE,
            data_vencimento: dataVenc,
            isProjection: true,
          });
        }
      }
    }

    return list.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });
  }, [carteirinha, passageiroConvertido, currentMonth, currentYear]);

  const [receiptDialogState, setReceiptDialogState] = useState<{
    open: boolean;
    url: string | null;
    descricao?: string;
  }>({ open: false, url: null });

  const handleOpenReceiptDialog = (url: string, descricao?: string) => {
    setReceiptDialogState({ open: true, url, descricao });
  };

  const handleCloseReceiptDialog = () => {
    safeCloseDialog(() => {
      setReceiptDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const handleShareReceiptDirect = async (receiptUrl: string, descricao: string) => {
    await shareReceiptFile({
      url: receiptUrl,
      filename: "recibo.png",
      title: "Recibo Van360",
      text: descricao,
    });
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none px-2">
            {displayCobrancas.length} {displayCobrancas.length === 1 ? "PARCELA" : "PARCELAS"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {displayCobrancas.length === 0 ? (
          <UnifiedEmptyState
            icon={carteirinha.isento ? ShieldCheck : History}
            title={carteirinha.isento ? "Passageiro Isento de Parcelas" : "Sem parcelas registradas"}
            description={
              carteirinha.isento
                ? "Este passageiro possui isenção de parcelas cadastrada. Nenhuma cobrança ou parcela é gerada automaticamente."
                : "Nenhuma parcela foi encontrada para este aluno até o momento."
            }
          />
        ) : (
          displayCobrancas.map((item) => {
            const isCancelada = item.status === CobrancaStatus.CANCELADA;
            const isPago = !isCancelada && item.status === CobrancaStatus.PAGO;
            const isAtrasado = !isCancelada && !isPago && checkCobrancaEmAtraso(item.data_vencimento);
            const nomeMes = getMesNome(item.mes);
            const cobrancaDesc = `Recibo de ${item.mes}/${item.ano}`;
            const valorNum = Number(item.valor) || 0;

            const statusColor = isCancelada
              ? "bg-slate-100 text-slate-600"
              : isPago
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
              status: isCancelada
                ? CobrancaStatus.CANCELADA
                : isPago
                  ? CobrancaStatus.PAGO
                  : CobrancaStatus.PENDENTE,
              data_vencimento: item.data_vencimento,
              created_at: "",
              updated_at: "",
              usuario_id: "",
              isProjection: item.isProjection,
            };

            const hasReceipt = isPago && !!item.recibo_url && !item.isProjection;

            const actions = isCancelada
              ? []
              : [
                {
                  icon: <Eye className="h-4 w-4" />,
                  label: "Ver Recibo",
                  onClick: () => {
                    if (hasReceipt && item.recibo_url) {
                      handleOpenReceiptDialog(item.recibo_url, cobrancaDesc);
                    }
                  },
                  disabled: !hasReceipt,
                },
                {
                  icon: <Share2 className="h-4 w-4" />,
                  label: "Compartilhar Recibo",
                  onClick: () => {
                    if (hasReceipt && item.recibo_url) {
                      handleShareReceiptDirect(item.recibo_url, cobrancaDesc);
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
                      isCancelada
                        ? "bg-slate-400"
                        : isPago
                          ? "bg-emerald-500"
                          : isAtrasado
                            ? "bg-red-500"
                            : "bg-amber-500"
                    )}
                  >
                    {isCancelada ? (
                      <Clock className="h-4 w-4 text-white" />
                    ) : isPago ? (
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
                        {isCancelada
                          ? `Venc. ${formatDateToBR(item.data_vencimento)}`
                          : isPago
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
                        status={
                          isCancelada
                            ? CobrancaStatus.CANCELADA
                            : isPago
                              ? CobrancaStatus.PAGO
                              : CobrancaStatus.PENDENTE
                        }
                        dataVencimento={isCancelada ? undefined : item.data_vencimento}
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
