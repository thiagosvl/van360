import { useMemo } from "react";
import { CobrancaStatus } from "@/types/enums";
import type { Cobranca } from "@/types/cobranca";
import type { Passageiro } from "@/types/passageiro";

interface UseReciboAnualElegibilidadeParams {
  passageiro?: Passageiro | null;
  selectedYear: number;
  cobrancas: Cobranca[];
}

export interface ReciboAnualElegibilidadeResult {
  isElegivel: boolean;
  totalMesesEsperados: number;
  totalMesesPagos: number;
  totalPago: number;
}

export function useReciboAnualElegibilidade({
  passageiro,
  selectedYear,
  cobrancas,
}: UseReciboAnualElegibilidadeParams): ReciboAnualElegibilidadeResult {
  return useMemo(() => {
    if (!passageiro || passageiro.isento) {
      return { isElegivel: false, totalMesesEsperados: 0, totalMesesPagos: 0, totalPago: 0 };
    }

    if (!passageiro.data_inicio_cobranca || !passageiro.data_fim_cobranca) {
      return { isElegivel: false, totalMesesEsperados: 0, totalMesesPagos: 0, totalPago: 0 };
    }

    const dataInicio = new Date(passageiro.data_inicio_cobranca);
    const dataFim = new Date(passageiro.data_fim_cobranca);

    const anoInicio = dataInicio.getUTCFullYear();
    const anoFim = dataFim.getUTCFullYear();

    if (selectedYear < anoInicio || selectedYear > anoFim) {
      return { isElegivel: false, totalMesesEsperados: 0, totalMesesPagos: 0, totalPago: 0 };
    }

    const mesInicio = selectedYear === anoInicio ? dataInicio.getUTCMonth() + 1 : 1;
    const mesFim = selectedYear === anoFim ? dataFim.getUTCMonth() + 1 : 12;

    const mesesEsperados = new Set<number>();
    for (let m = mesInicio; m <= mesFim; m++) {
      mesesEsperados.add(m);
    }

    const cobrancasDoAno = cobrancas.filter(
      (c) => c.ano === selectedYear && c.status !== CobrancaStatus.CANCELADA
    );

    const mesesPagos = new Set<number>();
    let totalPago = 0;

    for (const c of cobrancasDoAno) {
      const isParcial =
        c.status === CobrancaStatus.PAGO &&
        c.valor_pago !== null &&
        Number(c.valor_pago) < Number(c.valor);

      if (c.status === CobrancaStatus.PAGO && !isParcial && c.mes && mesesEsperados.has(c.mes)) {
        mesesPagos.add(c.mes);
        totalPago += Number(c.valor_pago || c.valor || 0);
      }
    }

    const temParcelaNaoPagaNoIntervalo = cobrancasDoAno.some((c) => {
      if (!c.mes || !mesesEsperados.has(c.mes)) return false;
      const isParcial =
        c.status === CobrancaStatus.PAGO &&
        c.valor_pago !== null &&
        Number(c.valor_pago) < Number(c.valor);
      return c.status !== CobrancaStatus.PAGO || isParcial;
    });

    const todosMesesPagos =
      mesesEsperados.size > 0 &&
      mesesPagos.size >= mesesEsperados.size &&
      !temParcelaNaoPagaNoIntervalo;

    return {
      isElegivel: todosMesesPagos,
      totalMesesEsperados: mesesEsperados.size,
      totalMesesPagos: mesesPagos.size,
      totalPago,
    };
  }, [passageiro, selectedYear, cobrancas]);
}
