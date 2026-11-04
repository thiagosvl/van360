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
  isPassado: boolean;
  isConcluido: boolean;
  totalGastos: number;
  lucroLiquido: number;
  lucroCaixa: number;
  margemLucro: number;
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
  totalGastos: number;
  lucroLiquido: number;
  lucroCaixa: number;
  margemLucro: number;
}

export const verificarSeViagemPassou = (dataInicio: string, dataFim?: string | null): boolean => {
  const agora = new Date();
  const dataReferencia = new Date(dataFim || dataInicio);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const dataEventoDia = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    dataReferencia.getDate()
  );
  return dataEventoDia.getTime() < hoje.getTime();
};

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
      const totalGastos = Number(
        item.total_gastos ??
          (item.gastos ? item.gastos.reduce((acc, g) => acc + Number(g.valor || 0), 0) : 0)
      );
      const lucroLiquido = valorTotal - totalGastos;
      const lucroCaixa = totalPago - totalGastos;
      const margemLucro = valorTotal > 0 ? Math.round((lucroLiquido / valorTotal) * 100) : 0;

      const percentualPago = calcularProgressoPagamento(valorTotal, totalPago);
      const vagasRestantes = calcularVagasRestantes(item.vagas_totais, item.vagas_ocupadas);
      const isLotado = vagasRestantes !== null && vagasRestantes === 0;
      const isQuitado = item.status_pagamento === "quitado" || (valorTotal > 0 && totalPago >= valorTotal);
      const isPassado = verificarSeViagemPassou(item.data_inicio, item.data_fim);
      const isCancelado = item.status === "cancelado";
      const isSemSaldo = isQuitado || Math.max(0, valorTotal - totalPago) <= 0;
      const isPasseioSemInscritos = item.tipo === "passeio" && item.vagas_ocupadas === 0;

      const isConcluidoManual = item.status === "concluido";
      const isConcluido = isCancelado || isConcluidoManual || (isPassado && (isSemSaldo || isPasseioSemInscritos));

      return {
        ...item,
        percentualPago,
        isQuitado,
        isLotado,
        vagasRestantes,
        isPassado,
        isConcluido,
        totalGastos,
        lucroLiquido,
        lucroCaixa,
        margemLucro,
      };
    });
  }, [itens]);

  const totais = useMemo(() => {
    const totalFaturado = resumoFinanceiro
      ? resumoFinanceiro.total_faturado_previsto
      : itens.reduce((acc, i) => acc + Number(i.valor_total || 0), 0);

    const totalRecebido = resumoFinanceiro
      ? resumoFinanceiro.total_recebido
      : itens.reduce((acc, i) => acc + Number(i.total_pago || 0), 0);

    const totalAReceber = resumoFinanceiro
      ? resumoFinanceiro.total_a_receber
      : Math.max(0, totalFaturado - totalRecebido);

    const totalGastos =
      resumoFinanceiro?.total_gastos !== undefined
        ? Number(resumoFinanceiro.total_gastos)
        : itens.reduce((acc, i) => {
            const g = Number(
              i.total_gastos ??
                (i.gastos ? i.gastos.reduce((a, x) => a + Number(x.valor || 0), 0) : 0)
            );
            return acc + g;
          }, 0);

    const lucroTotal =
      resumoFinanceiro?.lucro_total !== undefined
        ? Number(resumoFinanceiro.lucro_total)
        : totalFaturado - totalGastos;

    const percentualRecebido = calcularProgressoPagamento(totalFaturado, totalRecebido);

    return {
      totalFaturado,
      totalRecebido,
      totalAReceber,
      totalGastos,
      lucroTotal,
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
    const totalGastos = Number(
      detalhes.total_gastos ??
        (detalhes.gastos ? detalhes.gastos.reduce((acc, g) => acc + Number(g.valor || 0), 0) : 0)
    );
    const lucroLiquido = valorTotal - totalGastos;
    const lucroCaixa = totalPago - totalGastos;
    const margemLucro = valorTotal > 0 ? Math.round((lucroLiquido / valorTotal) * 100) : 0;

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
      totalGastos,
      lucroLiquido,
      lucroCaixa,
      margemLucro,
    };
  }, [detalhes]);
};
