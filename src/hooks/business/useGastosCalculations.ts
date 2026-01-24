import { Gasto } from "@/types/gasto";
import { useMemo } from "react";



interface UseGastosCalculationsProps {
  gastos: Gasto[];
  mesFilter: number;
  anoFilter: number;
  searchTerm?: string;
  loadingActions: boolean;
}

export const useGastosCalculations = ({
  gastos,
  mesFilter,
  anoFilter,
  searchTerm,
  loadingActions,
}: UseGastosCalculationsProps) => {
  const gastosFiltrados = useMemo(() => {
    if (!searchTerm) return gastos || [];
    const lowerSearch = searchTerm.toLowerCase();
    return (gastos || []).filter(
      (g) =>
        g.descricao?.toLowerCase().includes(lowerSearch) ||
        g.categoria.toLowerCase().includes(lowerSearch)
    );
  }, [gastos, searchTerm]);

  const { totalGasto, principalCategoriaData, mediaDiaria } = useMemo(() => {
    // Garantir que gastos seja um array válido
    const gastosArray = Array.isArray(gastos) ? gastos : [];

    const total = gastosArray.reduce((sum, g) => {
      const valor = Number(g?.valor) || 0;
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);

    const gastosPorCategoria = gastosArray.reduce((acc, gasto) => {
      if (!gasto?.categoria) return acc;
      if (!acc[gasto.categoria]) {
        acc[gasto.categoria] = { total: 0, count: 0 };
      }
      const valor = Number(gasto.valor) || 0;
      acc[gasto.categoria].total += isNaN(valor) ? 0 : valor;
      acc[gasto.categoria].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const principal =
      gastosArray.length > 0 && Object.keys(gastosPorCategoria).length > 0
        ? Object.entries(gastosPorCategoria).reduce((a, b) =>
          a[1].total > b[1].total ? a : b
        )
        : null;

    // Calculate Daily Average
    const now = new Date();
    let daysPassed = 1;

    if (
      anoFilter < now.getFullYear() ||
      (anoFilter === now.getFullYear() && mesFilter < now.getMonth() + 1)
    ) {
      // Past month: use total days in month
      daysPassed = new Date(anoFilter, mesFilter, 0).getDate();
    } else if (
      anoFilter === now.getFullYear() &&
      mesFilter === now.getMonth() + 1
    ) {
      // Current month: use current day
      daysPassed = now.getDate();
    } else {
      // Future month: 1 (avoid division by zero, though no expenses should exist)
      daysPassed = 1;
    }

    const media = total > 0 && daysPassed > 0 ? total / daysPassed : 0;
    const topCatPercentage =
      principal && total > 0 ? (principal[1].total / total) * 100 : 0;

    return {
      totalGasto: isNaN(total) ? 0 : total,
      principalCategoriaData: principal
        ? {
          name: principal[0] || "-",
          value: isNaN(principal[1].total) ? 0 : principal[1].total,
          percentage: isNaN(topCatPercentage) ? 0 : topCatPercentage,
        }
        : null,
      mediaDiaria: isNaN(media) ? 0 : media,
    };
  }, [gastos, mesFilter, anoFilter]);

  // Use real data if not loading
  const displayData = useMemo(() => {
    if (loadingActions)
      return {
        totalGasto: 0,
        principalCategoriaData: null,
        mediaDiaria: 0,
        gastosFiltrados: [],
      };

    return {
      totalGasto,
      principalCategoriaData,
      mediaDiaria,
      gastosFiltrados,
    };
  }, [
    loadingActions,
    totalGasto,
    principalCategoriaData,
    mediaDiaria,
    gastosFiltrados,
  ]);

  return displayData;
};
