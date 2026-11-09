import {
  gerarErrosPorNo,
  validarItinerarioPronto,
  validarMovimentoPermitido,
  podeReordenarParada,
  calcularOrdenacaoItinerario,
  alterarSentidoRota,
  calcularTempoEstimadoPercurso,
  calcularSentidoInicial,
  getAlunosEscolaPorPosicao,
  isParadaAlunoAusente,
  filtrarAlunosAtivosEscola,
  ItineraryNode,
  ParadaAlunoStatusTarget,
  TempoEstimadoOptions,
  TempoEstimadoResultado,
} from "@/utils/domain/route/routeRules";

export {
  gerarErrosPorNo,
  validarItinerarioPronto,
  validarMovimentoPermitido,
  podeReordenarParada,
  calcularOrdenacaoItinerario,
  alterarSentidoRota,
  calcularTempoEstimadoPercurso,
  calcularSentidoInicial,
  getAlunosEscolaPorPosicao,
  isParadaAlunoAusente,
  filtrarAlunosAtivosEscola,
};

export type {
  ItineraryNode,
  ParadaAlunoStatusTarget,
  TempoEstimadoOptions,
  TempoEstimadoResultado,
};

/**
 * Hook/Helper centralizado para regras de negócio de itinerários de rotas.
 * Compartilhado entre configuração de rota e execução ativa em tempo real.
 */
export function useRouteRules() {
  return {
    gerarErrosPorNo,
    validarItinerarioPronto,
    validarMovimentoPermitido,
    podeReordenarParada,
    calcularOrdenacaoItinerario,
    alterarSentidoRota,
    calcularTempoEstimadoPercurso,
    calcularSentidoInicial,
    getAlunosEscolaPorPosicao,
    isParadaAlunoAusente,
    filtrarAlunosAtivosEscola,
  };
}

