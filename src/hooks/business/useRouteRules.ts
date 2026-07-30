import { RouteNodeType, RouteSentido } from "@/types/route";
import { formatShortName } from "@/utils/formatters";

/**
 * Hook/Helper centralizado para regras de negócio de itinerários de rotas.
 * Compartilhado entre configuração de rota e execução ativa em tempo real.
 */
export function useRouteRules() {

  /**
   * Gera um mapa de erros focados em AÇÃO e SOLUÇÃO por nó no itinerário
   * (ativado apenas quando a rota possui tanto passageiros quanto escolas).
   */
  const gerarErrosPorNo = (itinerario: any[]): Record<string, string> => {
    const map: Record<string, string> = {};

    const temPassageiro = itinerario.some(item => item.tipo_no === RouteNodeType.PASSAGEIRO);
    const temEscola = itinerario.some(item => item.tipo_no === RouteNodeType.ESCOLA);
    if (!temPassageiro || !temEscola) return map;

    for (let i = 0; i < itinerario.length; i++) {
      const item = itinerario[i];
      if (item.tipo_no === RouteNodeType.PASSAGEIRO) {
        const pass = item.passageiro;
        const escolaId = pass?.escola_id || pass?.escola?.id || item.escola_id;
        const alunoNome = pass?.nome || item.nome || "Passageiro";
        const primeiroNome = formatShortName(alunoNome, true);

        if (!escolaId) continue;

        const indicesEscola = itinerario
          .map((node, idx) => {
            const nodeEscolaId = node.escola_id || node.escola?.id;
            return (node.tipo_no === RouteNodeType.ESCOLA && nodeEscolaId === escolaId) ? idx : -1;
          })
          .filter(idx => idx !== -1);

        if (indicesEscola.length === 0) {
          map[item.id] = `Adicione a escola de ${primeiroNome} no itinerário.`;
          continue;
        }

        const sentido = item.sentido || RouteSentido.INDO;
        if (sentido === RouteSentido.INDO) {
          const temEscolaDepois = indicesEscola.some(idxEscola => idxEscola > i);
          if (!temEscolaDepois) {
            map[item.id] = `Mova a escola para depois de ${primeiroNome} ou reposicione ${primeiroNome} antes da escola.`;
          }
        } else if (sentido === RouteSentido.VOLTANDO) {
          const temEscolaAntes = indicesEscola.some(idxEscola => idxEscola < i);
          if (!temEscolaAntes) {
            map[item.id] = `Mova a escola para antes de ${primeiroNome} ou reposicione ${primeiroNome} depois da escola.`;
          }
        }
      }
    }

    return map;
  };

  /**
   * Valida se a rota está completa e pronta para ser salva/executada
   */
  const validarItinerarioPronto = (tipo: any, itinerario: any[]): { isPronto: boolean; errorMsg: string | null } => {
    if (itinerario.length === 0) {
      return { isPronto: false, errorMsg: "Adicione paradas para montar a rota." };
    }

    const temPassageiro = itinerario.some(item => item.tipo_no === RouteNodeType.PASSAGEIRO);
    if (!temPassageiro) {
      return { isPronto: false, errorMsg: "Adicione pelo menos um passageiro à rota." };
    }

    const temEscola = itinerario.some(item => item.tipo_no === RouteNodeType.ESCOLA);
    if (!temEscola) {
      return { isPronto: false, errorMsg: "Adicione pelo menos uma escola à rota." };
    }

    const errosMap = gerarErrosPorNo(itinerario);
    const primeiroErroKey = Object.keys(errosMap)[0];
    if (primeiroErroKey) {
      return { isPronto: false, errorMsg: errosMap[primeiroErroKey] };
    }

    return { isPronto: true, errorMsg: null };
  };

  /**
   * Valida se um movimento de reordenação (Up/Down) é permitido
   */
  const validarMovimentoPermitido = (
    tipo: any,
    index: number,
    direction: "up" | "down",
    itinerario: any[],
  ): boolean => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itinerario.length) return false;

    const simulado = [...itinerario];
    const temp = simulado[index];
    simulado[index] = simulado[targetIndex];
    simulado[targetIndex] = temp;

    const check = validarItinerarioPronto(tipo, simulado);
    return check.isPronto;
  };

  return {
    gerarErrosPorNo,
    validarItinerarioPronto,
    validarMovimentoPermitido,
  };
}
