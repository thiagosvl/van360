import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { safeCloseDialog } from "@/hooks";
import { useLayout } from "@/contexts/LayoutContext";
import { useFretamentoDetalhesQuery } from "@/hooks/api/useFretamentosApi";
import { useDeleteGasto } from "@/hooks/api/useGastoMutations";
import { GastosList } from "@/components/features/financeiro/GastosList";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
import type { Gasto } from "@/types/gasto";
import { formatCurrency } from "@/utils/formatters";
import { TrendingDown, PlusCircle, Receipt } from "lucide-react";

interface GerenciarGastosFretamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fretamento: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export function GerenciarGastosFretamentoDialog({
  isOpen,
  onClose,
  fretamento,
  onSuccess,
}: GerenciarGastosFretamentoDialogProps) {
  const { openGastoFormDialog, openConfirmationDialog } = useLayout();
  const deleteGastoMutation = useDeleteGasto();

  const { data: fretamentoReal, refetch } = useFretamentoDetalhesQuery(
    fretamento?.id || "",
    isOpen && !!fretamento?.id
  );
  const itemAtual = fretamentoReal || fretamento;

  if (!itemAtual) return null;

  const gastos = (itemAtual.gastos || []) as unknown as Gasto[];
  const totalGastos = Number(itemAtual.total_gastos || 0);
  const valorTotal = Number(itemAtual.valor_total || 0);
  const lucroLiquido = itemAtual.lucro_liquido !== undefined ? itemAtual.lucro_liquido : (valorTotal - totalGastos);

  const primeiroVeiculoId =
    itemAtual.veiculos && itemAtual.veiculos.length > 0
      ? itemAtual.veiculos[0].veiculo_id
      : undefined;

  const veiculosParaForm = (itemAtual.veiculos || []).map((v) => ({
    id: v.veiculo_id,
    placa: v.placa || "",
  }));

  const handleOpenAdicionarGasto = () => {
    openGastoFormDialog({
      fretamentoId: itemAtual.id,
      fretamentoTitulo: itemAtual.titulo,
      defaultVeiculoId: primeiroVeiculoId,
      veiculos: veiculosParaForm,
    });
  };

  const handleOpenEditarGasto = (gasto: Gasto) => {
    openGastoFormDialog({
      gastoToEdit: gasto,
      fretamentoId: itemAtual.id,
      fretamentoTitulo: itemAtual.titulo,
      defaultVeiculoId: gasto.veiculo_id || primeiroVeiculoId,
      veiculos: veiculosParaForm,
    });
  };

  const handleExcluirGasto = (id: string) => {
    const gasto = gastos.find((g) => g.id === id);
    openConfirmationDialog({
      title: "Excluir Gasto",
      description: gasto
        ? `Deseja realmente excluir o gasto de ${formatCurrency(gasto.valor)} (${gasto.descricao || gasto.categoria})?`
        : "Deseja realmente excluir este gasto?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await deleteGastoMutation.mutateAsync({ id });
      },
    });
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) safeCloseDialog(onClose);
      }}
      className="max-w-[95vw] sm:max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden"
    >
      <BaseDialog.Header
        title="Gerenciar Gastos"
        subtitle={`Viagem: ${itemAtual.titulo}`}
        icon={<TrendingDown className="h-5 w-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">
            {itemAtual.tipo === "passeio" ? "Arrecadado" : "Total do Frete"}
          </span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">
            {formatCurrency(valorTotal)}
          </span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Custos Totais</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">
            {formatCurrency(totalGastos)}
          </span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Lucro Apurado</span>
          <span
            className={`font-semibold text-xs sm:text-sm truncate block mt-0.5 ${
              lucroLiquido > 0
                ? "text-emerald-700"
                : lucroLiquido < 0
                  ? "text-red-600"
                  : "text-[#737373]"
            }`}
          >
            {formatCurrency(lucroLiquido)}
          </span>
        </div>
      </div>

      <BaseDialog.Body className="space-y-3 p-4 sm:p-6 overflow-y-auto bg-white flex-1 pb-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#0a0a0a]">Despesas</span>
          <Button
            type="button"
            variant="tonal"
            size="sm"
            onClick={handleOpenAdicionarGasto}
            className="h-8 px-3 text-xs font-semibold gap-1.5 shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Novo Gasto</span>
          </Button>
        </div>

        {gastos.length === 0 ? (
          <div className="p-6 rounded-[18px] bg-[#fafafa] border border-dashed border-[#e5e5e5] text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-1.5 py-8">
            <Receipt className="h-6 w-6 text-[#737373]" />
            <span>Nenhum gasto registrado para esta viagem.</span>
          </div>
        ) : (
          <GastosList
            gastos={gastos}
            onEdit={handleOpenEditarGasto}
            onDelete={handleExcluirGasto}
            veiculos={veiculosParaForm}
            ocultarBadgeViagem
          />
        )}
      </BaseDialog.Body>
    </BaseDialog>
  );
}
