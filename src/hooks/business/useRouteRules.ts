import {
  gerarErrosPorNo,
  validarItinerarioPronto,
  validarMovimentoPermitido,
  calcularOrdenacaoItinerario,
  alterarSentidoRota,
  calcularTempoEstimadoPercurso,
  calcularSentidoInicial,
  ItineraryNode,
  TempoEstimadoOptions,
  TempoEstimadoResultado,
} from "@/utils/domain/route/routeRules";

export {
  gerarErrosPorNo,
  validarItinerarioPronto,
  validarMovimentoPermitido,
  calcularOrdenacaoItinerario,
  alterarSentidoRota,
  calcularTempoEstimadoPercurso,
  calcularSentidoInicial,
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
    calcularOrdenacaoItinerario,
    alterarSentidoRota,
    calcularTempoEstimadoPercurso,
    calcularSentidoInicial,
  };
}

