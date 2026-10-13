import { useMemo } from "react";
import type {
  FretamentoItemLista,
  FretamentoDetalhes,
  ResumoFinanceiroFretamento,
} from "@/services/api/fretamento.api";

export interface FretamentoItemCalculado extends FretamentoItemLista {
  percentualPago: number;
  isQuitado: boolean;
  isLotado: boolean;
  vagasRestantes: number | null;
}

export interface FretamentoDetalhesCalculado extends FretamentoDetalhes {
  percentualPago: number;
  isQuitado: boolean;
  isLotado: boolean;
  vagasRestantes: number | null;
  totalPagoParticipantes: number;
  totalPendenteParticipantes: number;
  participantesPagosCount: number;
  participantesPendentesCount: number;
  participantesParciaisCount: number;
}

export const calcularProgressoPagamento = (valorTotal: number, totalPago: number) => {
  if (valorTotal <= 0) return 100;
  return Math.min(100, Math.round((totalPago / valorTotal) * 100));
};

export const calcularVagasRestantes = (vagasTotais: number | null | undefined, vagasOcupadas: number) => {
  if (vagasTotais === null || vagasTotais === undefined) return null;
  return Math.max(0, vagasTotais - vagasOcupadas);
};

export const useFretamentoCalculations = (
  itens: FretamentoItemLista[] = [],
  resumoFinanceiro?: ResumoFinanceiroFretamento
) => {
  const itensCalculados = useMemo<FretamentoItemCalculado[]>(() => {
    return itens.map((item) => {
      const valorTotal = Number(item.valor_total || 0);
      const totalPago = Number(item.total_pago || 0);
      const percentualPago = calcularProgressoPagamento(valorTotal, totalPago);
      const vagasRestantes = calcularVagasRestantes(item.vagas_totais, item.vagas_ocupadas);
      const isLotado = vagasRestantes !== null && vagasRestantes === 0;
      const isQuitado = item.status_pagamento === "quitado" || (valorTotal > 0 && totalPago >= valorTotal);

      return {
        ...item,
        percentualPago,
        isQuitado,
        isLotado,
        vagasRestantes,
      };
    });
  }, [itens]);

  const totais = useMemo(() => {
    if (resumoFinanceiro) {
      return {
        totalFaturado: resumoFinanceiro.total_faturado_previsto,
        totalRecebido: resumoFinanceiro.total_recebido,
        totalAReceber: resumoFinanceiro.total_a_receber,
        percentualRecebido: calcularProgressoPagamento(
          resumoFinanceiro.total_faturado_previsto,
          resumoFinanceiro.total_recebido
        ),
      };
    }

    const totalFaturado = itens.reduce((acc, i) => acc + Number(i.valor_total || 0), 0);
    const totalRecebido = itens.reduce((acc, i) => acc + Number(i.total_pago || 0), 0);
    const totalAReceber = Math.max(0, totalFaturado - totalRecebido);
    const percentualRecebido = calcularProgressoPagamento(totalFaturado, totalRecebido);

    return {
      totalFaturado,
      totalRecebido,
      totalAReceber,
      percentualRecebido,
    };
  }, [itens, resumoFinanceiro]);

  return {
    itensCalculados,
    totais,
  };
};

export const usePasseioDetalhesCalculations = (detalhes?: FretamentoDetalhes) => {
  return useMemo<FretamentoDetalhesCalculado | null>(() => {
    if (!detalhes) return null;

    const valorTotal = Number(detalhes.valor_total || 0);
    const totalPago = Number(detalhes.total_pago || 0);
    const percentualPago = calcularProgressoPagamento(valorTotal, totalPago);
    const vagasRestantes = calcularVagasRestantes(detalhes.vagas_totais, detalhes.vagas_ocupadas);
    const isLotado = vagasRestantes !== null && vagasRestantes === 0;
    const isQuitado = detalhes.status_pagamento === "quitado" || (valorTotal > 0 && totalPago >= valorTotal);

    const participantes = detalhes.participantes || [];
    const participantesPagos = participantes.filter((p) => p.status_pagamento === "pago");
    const participantesParciais = participantes.filter((p) => p.status_pagamento === "parcial");
    const participantesPendentes = participantes.filter(
      (p) => p.status_pagamento === "pendente" || (!p.status_pagamento && Number(p.valor_pago || 0) === 0)
    );

    const totalPagoParticipantes = participantes.reduce(
      (acc, p) => acc + Number(p.valor_pago ?? (p.status_pagamento === "pago" ? p.valor : 0)),
      0
    );
    const totalPendenteParticipantes = participantes.reduce((acc, p) => {
      const v = Number(p.valor || 0);
      const vp = Number(p.valor_pago ?? (p.status_pagamento === "pago" ? p.valor : 0));
      return acc + Math.max(0, v - vp);
    }, 0);

    return {
      ...detalhes,
      percentualPago,
      isQuitado,
      isLotado,
      vagasRestantes,
      totalPagoParticipantes,
      totalPendenteParticipantes,
      participantesPagosCount: participantesPagos.length,
      participantesPendentesCount: participantesPendentes.length,
      participantesParciaisCount: participantesParciais.length,
    };
  }, [detalhes]);
};
