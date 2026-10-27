import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import type { FretamentoPagamento } from "@/services/api/fretamento.api";
import { Pencil, Trash2, Calendar, CreditCard, Receipt } from "lucide-react";

interface FretamentoPagamentosListProps {
  pagamentos: FretamentoPagamento[];
  pagamentoEmEdicaoId?: string | null;
  onEditar: (pagamento: FretamentoPagamento) => void;
  onExcluir: (pagamento: FretamentoPagamento) => void;
  isDeletingId?: string | null;
}

const formatarTipoPagamento = (tipo: string) => {
  switch (tipo) {
    case "cartao-credito":
      return "Cartão Crédito";
    case "cartao-debito":
      return "Cartão Débito";
    case "transferencia":
      return "Transferência";
    default:
      return tipo.toUpperCase();
  }
};

export function FretamentoPagamentosList({
  pagamentos,
  pagamentoEmEdicaoId,
  onEditar,
  onExcluir,
  isDeletingId,
}: FretamentoPagamentosListProps) {
  if (pagamentos.length === 0) {
    return (
      <div className="p-4 rounded-[18px] bg-[#fafafa] border border-dashed border-[#e5e5e5] text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-1.5 py-6">
        <Receipt className="h-6 w-6 text-[#737373]" />
        <span>Nenhum pagamento registrado até o momento.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-[#0a0a0a] block">
        Histórico de Recebimentos ({pagamentos.length})
      </span>
      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
        {pagamentos.map((pagamento) => {
          const isSelected = pagamentoEmEdicaoId === pagamento.id;
          const isDeleting = isDeletingId === pagamento.id;

          return (
            <div
              key={pagamento.id}
              className={`p-3 rounded-[18px] border transition-all flex items-center justify-between gap-3 text-xs ${
                isSelected
                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                  : "bg-[#fafafa] border-[#e5e5e5] hover:border-[#737373]/40"
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#0a0a0a] text-sm">
                    {formatCurrency(Number(pagamento.valor || 0))}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[10px] font-medium bg-white text-[#171717] border border-[#e5e5e5]">
                    <CreditCard className="h-2.5 w-2.5 text-[#737373]" />
                    {formatarTipoPagamento(pagamento.tipo_pagamento)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#737373] flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateToBR(pagamento.data_pagamento)}
                  </span>
                  {pagamento.descricao && (
                    <span className="truncate max-w-[180px] sm:max-w-[240px]" title={pagamento.descricao}>
                      • {pagamento.descricao}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-white border border-transparent hover:border-[#e5e5e5]"
                  onClick={() => onEditar(pagamento)}
                  title="Editar pagamento"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  className="h-8 w-8 rounded-[18px] text-[#737373] hover:text-[#e7000b] hover:bg-[#e7000b]/10 border border-transparent hover:border-[#e7000b]/20"
                  onClick={() => onExcluir(pagamento)}
                  title="Excluir pagamento"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
