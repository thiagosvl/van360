import { describe, it, expect } from "vitest";
import {
  RouteStopStatus,
  RouteNodeType,
  RouteSentido,
  RouteExecutionPassenger,
} from "@/types/route";

function calcularEstadoPrancheta(paradas: RouteExecutionPassenger[]) {
  const paradasConcluidas = paradas.filter(
    (p) => !!p.visitado_em || p.status === RouteStopStatus.AUSENTE || p.is_ausente
  );
  const paradasPendentes = paradas.filter(
    (p) => !p.visitado_em && p.status !== RouteStopStatus.AUSENTE && !p.is_ausente
  );

  const paradaAtual = paradasPendentes.length > 0 ? paradasPendentes[0] : null;
  const proximasParadas = paradasPendentes.length > 1 ? paradasPendentes.slice(1) : [];
  const totalStops = paradas.length;
  const concludedStops = paradasConcluidas.length;
  const progressPercentage = totalStops > 0 ? Math.round((concludedStops / totalStops) * 100) : 0;
  const isFinalizadoPronto = paradasPendentes.length === 0 && totalStops > 0;

  return {
    paradasConcluidas,
    paradasPendentes,
    paradaAtual,
    proximasParadas,
    totalStops,
    concludedStops,
    progressPercentage,
    isFinalizadoPronto,
  };
}

function transicionarStatusParada(
  paradas: RouteExecutionPassenger[],
  paradaId: string,
  novoStatus: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE | RouteStopStatus.PENDENTE
): RouteExecutionPassenger[] {
  return paradas.map((p) => {
    if (p.id !== paradaId) return p;

    if (novoStatus === RouteStopStatus.EMBARCADO) {
      return {
        ...p,
        status: RouteStopStatus.EMBARCADO,
        is_ausente: false,
        visitado_em: new Date().toISOString(),
      };
    } else if (novoStatus === RouteStopStatus.AUSENTE) {
      return {
        ...p,
        status: RouteStopStatus.AUSENTE,
        is_ausente: true,
        visitado_em: undefined,
      };
    } else {
      return {
        ...p,
        status: RouteStopStatus.PENDENTE,
        is_ausente: false,
        visitado_em: undefined,
      };
    }
  });
}

describe("Suíte de Testes da Prancheta Digital de Embarque do Aluno (route-execution-ui)", () => {
  const paradasIniciais: RouteExecutionPassenger[] = [
    {
      id: "stop-1",
      execucao_rota_id: "exec-100",
      tipo_no: RouteNodeType.PASSAGEIRO,
      passageiro_id: "pas-1",
      status: RouteStopStatus.PENDENTE,
      ordem: 1,
      sentido: RouteSentido.INDO,
      passageiro: {
        id: "pas-1",
        nome: "Lucas Silva",
        escola_nome: "Escola Municipal Monteiro Lobato",
      } as any,
    },
    {
      id: "stop-2",
      execucao_rota_id: "exec-100",
      tipo_no: RouteNodeType.PASSAGEIRO,
      passageiro_id: "pas-2",
      status: RouteStopStatus.PENDENTE,
      ordem: 2,
      sentido: RouteSentido.INDO,
      passageiro: {
        id: "pas-2",
        nome: "Mariana Oliveira",
        escola_nome: "Escola Municipal Monteiro Lobato",
      } as any,
    },
    {
      id: "stop-3",
      execucao_rota_id: "exec-100",
      tipo_no: RouteNodeType.PASSAGEIRO,
      passageiro_id: "pas-3",
      status: RouteStopStatus.PENDENTE,
      ordem: 3,
      sentido: RouteSentido.INDO,
      passageiro: {
        id: "pas-3",
        nome: "Gabriel Santos",
        escola_nome: "Escola Municipal Monteiro Lobato",
      } as any,
    },
  ];

  it("1. Deve iniciar a prancheta com o primeiro aluno da fila como paradaAtual e 0% de progresso", () => {
    const estado = calcularEstadoPrancheta(paradasIniciais);

    expect(estado.paradaAtual?.id).toBe("stop-1");
    expect(estado.paradaAtual?.passageiro?.nome).toBe("Lucas Silva");
    expect(estado.proximasParadas.length).toBe(2);
    expect(estado.paradasConcluidas.length).toBe(0);
    expect(estado.progressPercentage).toBe(0);
    expect(estado.isFinalizadoPronto).toBe(false);
  });

  it("2. Deve transicionar parada1 de PENDENTE -> EMBARCADO e avançar a prancheta para o segundo aluno", () => {
    const paradasAposEmbarque1 = transicionarStatusParada(
      paradasIniciais,
      "stop-1",
      RouteStopStatus.EMBARCADO
    );
    const estado = calcularEstadoPrancheta(paradasAposEmbarque1);

    expect(estado.paradaAtual?.id).toBe("stop-2");
    expect(estado.paradaAtual?.passageiro?.nome).toBe("Mariana Oliveira");
    expect(estado.paradasConcluidas.length).toBe(1);
    expect(estado.paradasConcluidas[0].id).toBe("stop-1");
    expect(estado.concludedStops).toBe(1);
    expect(estado.progressPercentage).toBe(33);
  });

  it("3. Deve transicionar parada2 de PENDENTE -> AUSENTE e avançar a prancheta para o terceiro aluno", () => {
    const paradasPasso1 = transicionarStatusParada(
      paradasIniciais,
      "stop-1",
      RouteStopStatus.EMBARCADO
    );
    const paradasPasso2 = transicionarStatusParada(
      paradasPasso1,
      "stop-2",
      RouteStopStatus.AUSENTE
    );
    const estado = calcularEstadoPrancheta(paradasPasso2);

    expect(estado.paradaAtual?.id).toBe("stop-3");
    expect(estado.paradaAtual?.passageiro?.nome).toBe("Gabriel Santos");
    expect(estado.paradasConcluidas.length).toBe(2);
    expect(estado.concludedStops).toBe(2);
    expect(estado.progressPercentage).toBe(67);
  });

  it("4. Deve concluir todas as paradas e liberar o botão de 'Finalizar Rota' com 100% de progresso", () => {
    let paradas = transicionarStatusParada(paradasIniciais, "stop-1", RouteStopStatus.EMBARCADO);
    paradas = transicionarStatusParada(paradas, "stop-2", RouteStopStatus.EMBARCADO);
    paradas = transicionarStatusParada(paradas, "stop-3", RouteStopStatus.EMBARCADO);

    const estado = calcularEstadoPrancheta(paradas);

    expect(estado.paradaAtual).toBeNull();
    expect(estado.proximasParadas.length).toBe(0);
    expect(estado.paradasConcluidas.length).toBe(3);
    expect(estado.progressPercentage).toBe(100);
    expect(estado.isFinalizadoPronto).toBe(true);
  });

  it("5. Deve desfazer a ausência do aluno e reativá-lo na prancheta de embarque", () => {
    let paradas = transicionarStatusParada(paradasIniciais, "stop-1", RouteStopStatus.EMBARCADO);
    paradas = transicionarStatusParada(paradas, "stop-2", RouteStopStatus.AUSENTE);

    const estadoAposAusencia = calcularEstadoPrancheta(paradas);
    expect(estadoAposAusencia.paradaAtual?.id).toBe("stop-3");

    paradas = transicionarStatusParada(paradas, "stop-2", RouteStopStatus.PENDENTE);
    const estadoDesfeito = calcularEstadoPrancheta(paradas);

    expect(estadoDesfeito.paradaAtual?.id).toBe("stop-2");
    expect(estadoDesfeito.paradaAtual?.passageiro?.nome).toBe("Mariana Oliveira");
    expect(estadoDesfeito.concludedStops).toBe(1);
  });
});
