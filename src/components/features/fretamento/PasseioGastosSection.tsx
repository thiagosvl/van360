import { memo } from "react";
import { formatCurrency } from "@/utils/formatters";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto } from "@/hooks/api/useGastoMutations";
import { Button } from "@/components/ui/button";
import { GastosList } from "@/components/features/financeiro/GastosList";
import { toast } from "sonner";
import {
  TrendingDown,
  DollarSign,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";
import type { Gasto } from "@/types/gasto";
import type { FretamentoDetalhesCalculado } from "@/hooks/business/useFretamentoCalculations";

interface PasseioGastosSectionProps {
  calculados: FretamentoDetalhesCalculado;
}

export const PasseioGastosSection = memo(function PasseioGastosSection({
  calculados,
}: PasseioGastosSectionProps) {
  const { openGastoFormDialog, openConfirmationDialog } = useLayout();
  const deleteGastoMutation = useDeleteGasto();

  const gastos = (calculados.gastos || []) as Gasto[];
  const primeiroVeiculoId =
    calculados.veiculos && calculados.veiculos.length > 0
      ? calculados.veiculos[0].veiculo_id
      : undefined;

  const veiculosProps = (calculados.veiculos || []).map((v) => ({
    id: v.veiculo_id,
    placa: v.placa || "",
  }));

  const handleOpenAdicionarGasto = () => {
    openGastoFormDialog({
      fretamentoId: calculados.id,
      fretamentoTitulo: calculados.titulo,
      defaultVeiculoId: primeiroVeiculoId,
      veiculos: veiculosProps,
    });
  };

  const handleOpenEditarGasto = (gasto: Gasto) => {
    openGastoFormDialog({
      gastoToEdit: gasto,
      fretamentoId: calculados.id,
      fretamentoTitulo: calculados.titulo,
      defaultVeiculoId: gasto.veiculo_id || primeiroVeiculoId,
      veiculos: veiculosProps,
    });
  };

  const handleConfirmarExclusaoGasto = (id: string) => {
    const gasto = gastos.find((g) => g.id === id);
    openConfirmationDialog({
      title: "Excluir Gasto",
      description: gasto
        ? `Deseja realmente excluir o gasto de ${formatCurrency(gasto.valor)} (${gasto.descricao || gasto.categoria})?`
        : "Deseja realmente excluir esta despesa?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteGastoMutation.mutateAsync({ id });
        } catch {
          toast.error("Erro ao excluir despesa.");
        }
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* KPIs com scroll horizontal no mobile */}
      <div className="-mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:py-0 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible touch-pan-x">
        <div className="flex items-stretch gap-2.5 sm:gap-3 w-max sm:w-full sm:grid sm:grid-cols-3">
          {/* Custos Totais */}
          <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1">
                Custos Totais
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2 min-w-0">
              <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(calculados.totalGastos)}
              </span>
              <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
                {gastos.length} {gastos.length === 1 ? "registro" : "registros"}
              </span>
            </div>
          </div>

          {/* Lucro Previsto */}
          <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1">
                Lucro Previsto
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shrink-0">
                <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2 min-w-0">
              <span
                className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none truncate ${
                  calculados.lucroLiquido > 0
                    ? "text-emerald-700"
                    : calculados.lucroLiquido < 0
                      ? "text-red-600"
                      : "text-[#0a0a0a]"
                }`}
              >
                {formatCurrency(calculados.lucroLiquido)}
              </span>
              <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
                Previsto - Custos
              </span>
            </div>
          </div>

          {/* Caixa Atual */}
          <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1">
                Caixa Atual
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
                <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2 min-w-0">
              <span
                className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none truncate ${
                  calculados.lucroCaixa > 0
                    ? "text-emerald-700"
                    : calculados.lucroCaixa < 0
                      ? "text-red-600"
                      : "text-[#0a0a0a]"
                }`}
              >
                {formatCurrency(calculados.lucroCaixa)}
              </span>
              <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
                Recebido - Custos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card da Listagem */}
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">
              Despesas Registradas
            </h2>
          </div>

          <Button
            size="sm"
            variant="tonal"
            onClick={handleOpenAdicionarGasto}
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs font-semibold gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Gasto</span>
          </Button>
        </div>

        {gastos.length === 0 ? (
          <div className="p-6 rounded-[18px] bg-[#fafafa] border border-dashed border-[#e5e5e5] text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-1.5 py-8">
            <Receipt className="h-6 w-6 text-[#737373]" />
            <span>Nenhum gasto registrado para este passeio.</span>
          </div>
        ) : (
          <GastosList
            gastos={gastos}
            onEdit={handleOpenEditarGasto}
            onDelete={handleConfirmarExclusaoGasto}
            veiculos={veiculosProps}
            ocultarBadgeViagem
          />
        )}
      </div>
    </div>
  );
});
