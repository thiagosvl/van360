import { RouteNodeType, RouteSentido, RouteStopStatus } from "@/types/route";
import { formatShortName } from "@/utils/formatters";

export interface ItineraryNode {
  id: string;
  tipo_no: RouteNodeType;
  passageiro_id?: string | null;
  escola_id?: string | null;
  nome?: string;
  status?: RouteStopStatus;
  sentido?: RouteSentido | null;
  passageiro?: any;
  escola?: any;
}

export interface TempoEstimadoOptions {
  tempoBaseMin?: number;
  tempoPorParadaPassageiroMin?: number;
  tempoPorParadaEscolaMin?: number;
  distanciaEstimadaKm?: number;
  velocidadeMediaKmH?: number;
}

export interface TempoEstimadoResultado {
  tempoTotalMinutos: number;
  tempoFormatado: string;
  totalParadasPassageiros: number;
  totalParadasEscolas: number;
}

/**
 * Calcula a ordenação ideal de embarque na IDA (Aluno -> Escola) vs desembarque na VOLTA (Escola -> Aluno)
 */
export function calcularOrdenacaoItinerario(
  passageiros: ItineraryNode[],
  escolas: ItineraryNode[],
  sentido: RouteSentido
): ItineraryNode[] {
  if (sentido === RouteSentido.INDO) {
    const passNodes = passageiros.map((p) => ({ ...p, sentido: RouteSentido.INDO }));
    const escolaNodes = escolas.map((e) => ({ ...e, sentido: RouteSentido.INDO }));
    return [...passNodes, ...escolaNodes];
  } else {
    const escolaNodes = escolas.map((e) => ({ ...e, sentido: RouteSentido.VOLTANDO }));
    const passNodes = passageiros.map((p) => ({ ...p, sentido: RouteSentido.VOLTANDO }));
    return [...escolaNodes, ...passNodes];
  }
}

/**
 * Altera o sentido da rota inteira (INDO <-> VOLTANDO), ajustando a ordem dos nós e o sentido de cada parada
 */
export function alterarSentidoRota(
  itinerario: ItineraryNode[],
  novoSentido: RouteSentido
): ItineraryNode[] {
  const passageiros = itinerario.filter((item) => item.tipo_no === RouteNodeType.PASSAGEIRO);
  const escolas = itinerario.filter((item) => item.tipo_no === RouteNodeType.ESCOLA);

  if (novoSentido === RouteSentido.VOLTANDO) {
    const passInvertidos = [...passageiros].reverse().map((p) => ({
      ...p,
      sentido: RouteSentido.VOLTANDO,
    }));
    const escolasAjustadas = escolas.map((e) => ({
      ...e,
      sentido: RouteSentido.VOLTANDO,
    }));
    return [...escolasAjustadas, ...passInvertidos];
  } else {
    const passInvertidos = [...passageiros].reverse().map((p) => ({
      ...p,
      sentido: RouteSentido.INDO,
    }));
    const escolasAjustadas = escolas.map((e) => ({
      ...e,
      sentido: RouteSentido.INDO,
    }));
    return [...passInvertidos, ...escolasAjustadas];
  }
}

/**
 * Calcula o tempo estimado total de percurso com base nas paradas e distância
 */
export function calcularTempoEstimadoPercurso(
  itinerario: ItineraryNode[],
  opcoes?: TempoEstimadoOptions
): TempoEstimadoResultado {
  const tempoBase = opcoes?.tempoBaseMin ?? 5;
  const tempoPassageiro = opcoes?.tempoPorParadaPassageiroMin ?? 3;
  const tempoEscola = opcoes?.tempoPorParadaEscolaMin ?? 5;
  const velMedia = opcoes?.velocidadeMediaKmH ?? 30;

  const passageiros = itinerario.filter((item) => item.tipo_no === RouteNodeType.PASSAGEIRO);
  const escolas = itinerario.filter((item) => item.tipo_no === RouteNodeType.ESCOLA);

  const tempoParadasPassageiros = passageiros.length * tempoPassageiro;
  const tempoParadasEscolas = escolas.length * tempoEscola;

  let tempoDeslocamento = 0;
  if (opcoes?.distanciaEstimadaKm && opcoes.distanciaEstimadaKm > 0) {
    tempoDeslocamento = Math.round((opcoes.distanciaEstimadaKm / velMedia) * 60);
  } else {
    const totalTrechos = Math.max(0, itinerario.length - 1);
    tempoDeslocamento = totalTrechos * 4;
  }

  const tempoTotalMinutos = tempoBase + tempoParadasPassageiros + tempoParadasEscolas + tempoDeslocamento;

  const horas = Math.floor(tempoTotalMinutos / 60);
  const mins = tempoTotalMinutos % 60;

  let tempoFormatado = "";
  if (horas > 0) {
    tempoFormatado = `${horas}h${mins > 0 ? ` ${mins}min` : ""}`;
  } else {
    tempoFormatado = `${mins} min`;
  }

  return {
    tempoTotalMinutos,
    tempoFormatado,
    totalParadasPassageiros: passageiros.length,
    totalParadasEscolas: escolas.length,
  };
}

/**
 * Determina o sentido inicial de um nó ao ser adicionado
 */
export function calcularSentidoInicial(
  nodesAntes: ItineraryNode[],
  escolaId?: string
): RouteSentido {
  if (escolaId) {
    const temSuaEscolaAntes = nodesAntes.some((item) => {
      const itemEscolaId = item.escola_id || item.escola?.id;
      return item.tipo_no === RouteNodeType.ESCOLA && itemEscolaId === escolaId;
    });
    return temSuaEscolaAntes ? RouteSentido.VOLTANDO : RouteSentido.INDO;
  }

  const temQualquerEscolaAntes = nodesAntes.some((item) => item.tipo_no === RouteNodeType.ESCOLA);
  return temQualquerEscolaAntes ? RouteSentido.VOLTANDO : RouteSentido.INDO;
}

/**
 * Gera um mapa de erros focados em AÇÃO e SOLUÇÃO por nó no itinerário
 */
export function gerarErrosPorNo(itinerario: ItineraryNode[]): Record<string, string> {
  const map: Record<string, string> = {};

  const temPassageiro = itinerario.some((item) => item.tipo_no === RouteNodeType.PASSAGEIRO);
  const temEscola = itinerario.some((item) => item.tipo_no === RouteNodeType.ESCOLA);
  if (!temPassageiro || !temEscola) return map;

  for (let i = 0; i < itinerario.length; i++) {
    const item = itinerario[i];
    if (item.tipo_no === RouteNodeType.PASSAGEIRO) {
      if (item.status === RouteStopStatus.AUSENTE || item.passageiro?.status === RouteStopStatus.AUSENTE) {
        continue;
      }

      const pass = item.passageiro;
      const escolaId = item.escola_id || pass?.escola_id || pass?.escola?.id;
      const alunoNome = pass?.nome || item.nome || "Passageiro";
      const primeiroNome = formatShortName(alunoNome, true);

      if (!escolaId) continue;

      const indicesEscola = itinerario
        .map((node, idx) => {
          const nodeEscolaId = node.escola_id || node.escola?.id;
          return node.tipo_no === RouteNodeType.ESCOLA && nodeEscolaId === escolaId ? idx : -1;
        })
        .filter((idx) => idx !== -1);

      if (indicesEscola.length === 0) {
        map[item.id] = `Adicione a escola de ${primeiroNome} no itinerário.`;
        continue;
      }

      const sentido = item.sentido || RouteSentido.INDO;
      if (sentido === RouteSentido.INDO) {
        const temEscolaDepois = indicesEscola.some((idxEscola) => idxEscola > i);
        if (!temEscolaDepois) {
          map[item.id] = `Mova a escola para depois de ${primeiroNome} ou reposicione ${primeiroNome} antes da escola.`;
        }
      } else if (sentido === RouteSentido.VOLTANDO) {
        const temEscolaAntes = indicesEscola.some((idxEscola) => idxEscola < i);
        if (!temEscolaAntes) {
          map[item.id] = `Mova a escola para antes de ${primeiroNome} ou reposicione ${primeiroNome} depois da escola.`;
        }
      }
    }
  }

  return map;
}

/**
 * Valida se a rota está completa e pronta para ser salva/executada
 */
export function validarItinerarioPronto(
  tipo: any,
  itinerario: ItineraryNode[]
): { isPronto: boolean; errorMsg: string | null } {
  if (itinerario.length === 0) {
    return { isPronto: false, errorMsg: "Adicione paradas para montar a rota." };
  }

  const temPassageiro = itinerario.some((item) => item.tipo_no === RouteNodeType.PASSAGEIRO);
  if (!temPassageiro) {
    return { isPronto: false, errorMsg: "Adicione pelo menos um passageiro à rota." };
  }

  const temEscola = itinerario.some((item) => item.tipo_no === RouteNodeType.ESCOLA);
  if (!temEscola) {
    return { isPronto: false, errorMsg: "Adicione pelo menos uma escola à rota." };
  }

  const errosMap = gerarErrosPorNo(itinerario);
  const primeiroErroKey = Object.keys(errosMap)[0];
  if (primeiroErroKey) {
    return { isPronto: false, errorMsg: errosMap[primeiroErroKey] };
  }

  return { isPronto: true, errorMsg: null };
}

/**
 * Valida se um movimento de reordenação (Up/Down) é permitido
 */
export function validarMovimentoPermitido(
  tipo: any,
  index: number,
  direction: "up" | "down",
  itinerario: ItineraryNode[],
  paradasConcluidas: ItineraryNode[] = []
): boolean {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= itinerario.length) return false;

  const simulado = [...itinerario];
  const temp = simulado[index];
  simulado[index] = simulado[targetIndex];
  simulado[targetIndex] = temp;

  const fullItinerario = [...paradasConcluidas, ...simulado];

  const check = validarItinerarioPronto(tipo, fullItinerario);
  return check.isPronto;
}
