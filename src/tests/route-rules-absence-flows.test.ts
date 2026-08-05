import { describe, it, expect } from "vitest";
import {
  calcularOrdenacaoItinerario,
  alterarSentidoRota,
  calcularTempoEstimadoPercurso,
  calcularSentidoInicial,
  gerarErrosPorNo,
  validarItinerarioPronto,
  validarMovimentoPermitido,
  ItineraryNode,
} from "@/utils/domain/route/routeRules";
import { useRouteRules } from "@/hooks/business/useRouteRules";
import {
  inicializarAusenciaState,
  validarDatasAusencia,
  gerarAvisoMonitores,
  validarFormularioAusencia,
} from "@/hooks/ui/useRegistrarAusenciaViewModel";
import { mapearPrePassageiroParaFormulario } from "@/utils/domain/passageiro/prePassageiroConverter";
import { passageiroSchema } from "@/hooks/form/usePassageiroForm";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { PrePassageiro } from "@/types/prePassageiro";

describe("Suíte de Testes Automatizados - Fluxos Avançados (route-rules-absence-flows)", () => {
  describe("1. Regras de Rota IDA/VOLTA (useRouteRules.ts e routeRules.ts)", () => {
    const passageirosBase: ItineraryNode[] = [
      {
        id: "no-pass-1",
        tipo_no: RouteNodeType.PASSAGEIRO,
        passageiro_id: "pas-1",
        nome: "Lucas Gabriel",
        escola_id: "escola-1",
        passageiro: { id: "pas-1", nome: "Lucas Gabriel", escola_id: "escola-1" },
      },
      {
        id: "no-pass-2",
        tipo_no: RouteNodeType.PASSAGEIRO,
        passageiro_id: "pas-2",
        nome: "Mariana Oliveira",
        escola_id: "escola-1",
        passageiro: { id: "pas-2", nome: "Mariana Oliveira", escola_id: "escola-1" },
      },
    ];

    const escolasBase: ItineraryNode[] = [
      {
        id: "no-escola-1",
        tipo_no: RouteNodeType.ESCOLA,
        escola_id: "escola-1",
        nome: "Escola Monteiro Lobato",
      },
    ];

    it("Deve calcular a ordenação de embarque na IDA (alunos residência -> escola desembarque)", () => {
      const itinerarioIda = calcularOrdenacaoItinerario(passageirosBase, escolasBase, RouteSentido.INDO);

      expect(itinerarioIda.length).toBe(3);
      expect(itinerarioIda[0].tipo_no).toBe(RouteNodeType.PASSAGEIRO);
      expect(itinerarioIda[0].nome).toBe("Lucas Gabriel");
      expect(itinerarioIda[0].sentido).toBe(RouteSentido.INDO);

      expect(itinerarioIda[1].tipo_no).toBe(RouteNodeType.PASSAGEIRO);
      expect(itinerarioIda[1].nome).toBe("Mariana Oliveira");
      expect(itinerarioIda[1].sentido).toBe(RouteSentido.INDO);

      expect(itinerarioIda[2].tipo_no).toBe(RouteNodeType.ESCOLA);
      expect(itinerarioIda[2].nome).toBe("Escola Monteiro Lobato");
      expect(itinerarioIda[2].sentido).toBe(RouteSentido.INDO);
    });

    it("Deve calcular a ordenação de embarque na VOLTA (escola embarque -> alunos desembarque residência)", () => {
      const itinerarioVolta = calcularOrdenacaoItinerario(passageirosBase, escolasBase, RouteSentido.VOLTANDO);

      expect(itinerarioVolta.length).toBe(3);
      expect(itinerarioVolta[0].tipo_no).toBe(RouteNodeType.ESCOLA);
      expect(itinerarioVolta[0].nome).toBe("Escola Monteiro Lobato");
      expect(itinerarioVolta[0].sentido).toBe(RouteSentido.VOLTANDO);

      expect(itinerarioVolta[1].tipo_no).toBe(RouteNodeType.PASSAGEIRO);
      expect(itinerarioVolta[1].sentido).toBe(RouteSentido.VOLTANDO);

      expect(itinerarioVolta[2].tipo_no).toBe(RouteNodeType.PASSAGEIRO);
      expect(itinerarioVolta[2].sentido).toBe(RouteSentido.VOLTANDO);
    });

    it("Deve alterar o sentido da rota de INDO para VOLTANDO e ajustar a sequência dos nós", () => {
      const itinerarioIda = calcularOrdenacaoItinerario(passageirosBase, escolasBase, RouteSentido.INDO);
      const itinerarioAlterado = alterarSentidoRota(itinerarioIda, RouteSentido.VOLTANDO);

      expect(itinerarioAlterado[0].tipo_no).toBe(RouteNodeType.ESCOLA);
      expect(itinerarioAlterado[0].sentido).toBe(RouteSentido.VOLTANDO);
      expect(itinerarioAlterado[1].tipo_no).toBe(RouteNodeType.PASSAGEIRO);
      expect(itinerarioAlterado[1].sentido).toBe(RouteSentido.VOLTANDO);
    });

    it("Deve calcular o sentido inicial automático com base na posição da escola no itinerário", () => {
      const nodesSemEscola: ItineraryNode[] = [...passageirosBase];
      const sentidoSemEscola = calcularSentidoInicial(nodesSemEscola, "escola-1");
      expect(sentidoSemEscola).toBe(RouteSentido.INDO);

      const nodesComEscolaAntes: ItineraryNode[] = [...escolasBase, ...passageirosBase];
      const sentidoComEscolaAntes = calcularSentidoInicial(nodesComEscolaAntes.slice(0, 1), "escola-1");
      expect(sentidoComEscolaAntes).toBe(RouteSentido.VOLTANDO);
    });

    it("Deve calcular o tempo estimado total do percurso com base nas paradas e deslocamento", () => {
      const itinerarioCompleto = calcularOrdenacaoItinerario(passageirosBase, escolasBase, RouteSentido.INDO);

      // Base (5min) + 2 Alunos (2*3=6min) + 1 Escola (5min) + 2 Trechos (2*4=8min) = 24min
      const estimativaPadrao = calcularTempoEstimadoPercurso(itinerarioCompleto);
      expect(estimativaPadrao.tempoTotalMinutos).toBe(24);
      expect(estimativaPadrao.tempoFormatado).toBe("24 min");
      expect(estimativaPadrao.totalParadasPassageiros).toBe(2);
      expect(estimativaPadrao.totalParadasEscolas).toBe(1);

      // Com distância de 30km a 30km/h (60min de deslocamento) + 5 + 6 + 5 = 76min = 1h 16min
      const estimativaComDistancia = calcularTempoEstimadoPercurso(itinerarioCompleto, {
        distanciaEstimadaKm: 30,
        velocidadeMediaKmH: 30,
      });
      expect(estimativaComDistancia.tempoTotalMinutos).toBe(76);
      expect(estimativaComDistancia.tempoFormatado).toBe("1h 16min");
    });

    it("Deve validar itinerário pronto e gerar erros de sequência por nó via useRouteRules / routeRules", () => {
      const routeRules = useRouteRules();

      const itinerarioValido = [
        {
          id: "no-1",
          tipo_no: RouteNodeType.PASSAGEIRO,
          escola_id: "esc-1",
          sentido: RouteSentido.INDO,
          passageiro: { id: "pas-1", nome: "Lucas", escola_id: "esc-1" },
        },
        {
          id: "no-2",
          tipo_no: RouteNodeType.ESCOLA,
          escola_id: "esc-1",
        },
      ];

      const checkValido = routeRules.validarItinerarioPronto(null, itinerarioValido);
      expect(checkValido.isPronto).toBe(true);
      expect(checkValido.errorMsg).toBeNull();

      // Inversão inválida na IDA (Escola antes do Passageiro)
      const itinerarioInvalido = [itinerarioValido[1], itinerarioValido[0]];
      const checkInvalido = routeRules.validarItinerarioPronto(null, itinerarioInvalido);
      expect(checkInvalido.isPronto).toBe(false);
      expect(checkInvalido.errorMsg).toContain("Mova a escola para depois de Lucas");

      // Validação de movimento
      const podeMover = routeRules.validarMovimentoPermitido(null, 0, "down", itinerarioValido);
      expect(podeMover).toBe(false);
    });
  });

  describe("2. ViewModel de Registro de Ausência (useRegistrarAusenciaViewModel.ts)", () => {
    const rotasMock = [
      { id: "rota-1", nome: "Rota Manhã Centro" },
      { id: "rota-2", nome: "Rota Tarde Bairro" },
    ];

    const alunoMock = { id: "pas-100", nome: "Ana Beatriz Rocha" };

    it("Deve pré-preencher o formulário de ausência quando um aluno está travado (lockedPassageiro)", () => {
      const state = inicializarAusenciaState({
        isOpen: true,
        lockedPassageiro: alunoMock,
        passageiroRotas: [rotasMock[0]],
      });

      expect(state.passageiroId).toBe("pas-100");
      expect(state.passageiroNomeSelected).toBe("Ana Beatriz Rocha");
      expect(state.rotaId).toBe("rota-1"); // Seleção automática com 1 rota disponível
      expect(state.hasNoRoutesForStudent).toBe(false);
    });

    it("Deve indicar erro quando o aluno travado não possui nenhuma rota cadastrada", () => {
      const state = inicializarAusenciaState({
        isOpen: true,
        lockedPassageiro: alunoMock,
        passageiroRotas: [],
      });

      expect(state.hasNoRoutesForStudent).toBe(true);
      expect(state.rotasDisponiveis.length).toBe(0);
    });

    it("Deve pré-preencher a rota quando lockedRotaId é fornecido sem aluno travado", () => {
      const state = inicializarAusenciaState({
        isOpen: true,
        lockedRotaId: "rota-2",
        rotasList: rotasMock,
      });

      expect(state.rotaId).toBe("rota-2");
      expect(state.passageiroId).toBe("");
    });

    it("Deve validar o intervalo de datas de ausência (data inicial <= data final)", () => {
      // Data de término anterior à data de início
      const checkInvalido = validarDatasAusencia("2026-08-10", "2026-08-05");
      expect(checkInvalido.isValid).toBe(false);
      expect(checkInvalido.error).toBe("A data final deve ser igual ou posterior à data inicial");

      // Data de término igual ou posterior
      const checkMesmoDia = validarDatasAusencia("2026-08-10", "2026-08-10");
      expect(checkMesmoDia.isValid).toBe(true);

      const checkPeriodoValido = validarDatasAusencia("2026-08-10", "2026-08-15");
      expect(checkPeriodoValido.isValid).toBe(true);

      // Validação do formulário completo
      const formCheckInvalido = validarFormularioAusencia({
        rotaId: "rota-1",
        passageiroId: "pas-1",
        dataAusencia: "2026-08-10",
        dataFimAusencia: "2026-08-01",
      });

      expect(formCheckInvalido.isValid).toBe(false);
      expect(formCheckInvalido.errors.dataFimAusencia).toBe("A data final deve ser igual ou posterior à data inicial");
    });

    it("Deve gerar o aviso correto para os monitores sobre a ausência do aluno", () => {
      const avisoDiaUnico = gerarAvisoMonitores("Ana Beatriz", "2026-08-10");
      expect(avisoDiaUnico).toBe("Aviso aos Monitores: O passageiro Ana Beatriz estará ausente no dia 2026-08-10.");

      const avisoPeriodo = gerarAvisoMonitores("Ana Beatriz", "2026-08-10", "2026-08-15");
      expect(avisoPeriodo).toBe("Aviso aos Monitores: O passageiro Ana Beatriz estará ausente no período de 2026-08-10 até 2026-08-15.");
    });
  });

  describe("3. Conversão de Pré-Passageiro para Passageiro Definitivo", () => {
    const prePassageiroMock: PrePassageiro = {
      id: "pre-123",
      usuario_id: "usr-999",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      nome: "Carlos Eduardo Santos",
      nome_responsavel: "Roberto Santos",
      cpf_responsavel: "52998224725",
      telefone_responsavel: "11999998888",
      periodo: "MANHA",
      modalidade: "AMBOS",
      turma: "5º Ano A",
      nome_professor: "Prof. Helena",
      data_nascimento: "2015-05-20",
      genero: "MASCULINO",
      parentesco_responsavel: "PAI",
      logradouro: "Rua das Flores",
      numero: "500",
      bairro: "Jardins",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310100",
      referencia: "Próximo à padaria",
      complemento: "Apto 12",
      observacoes: "Aluno alérgico a amendoim",
      escola_id: "escola-uuid-1",
      veiculo_id: "veiculo-uuid-2",
      valor_cobranca: 450,
      dia_vencimento: 10,
      data_inicio_transporte: "2026-02-01",
      data_fim_transporte: "2026-12-15",
      data_inicio_cobranca: "2026-02-01",
      data_fim_cobranca: "2026-12-01",
    };

    it("Deve mapear todos os campos do pré-cadastro para a estrutura do formulário de passageiro definitivo com máscaras adequadas", () => {
      const formData = mapearPrePassageiroParaFormulario(prePassageiroMock);

      expect(formData.nome).toBe("Carlos Eduardo Santos");
      expect(formData.nome_responsavel).toBe("Roberto Santos");
      expect(formData.cpf_responsavel).toBe("529.982.247-25");
      expect(formData.telefone_responsavel).toBe("(11) 99999-8888");
      expect(formData.periodo).toBe("MANHA");
      expect(formData.modalidade).toBe("AMBOS");
      expect(formData.turma).toBe("5º Ano A");
      expect(formData.nome_professor).toBe("Prof. Helena");
      expect(formData.data_nascimento).toBe("20/05/2015");
      expect(formData.genero).toBe("MASCULINO");
      expect(formData.parentesco_responsavel).toBe("PAI");
      expect(formData.logradouro).toBe("Rua das Flores");
      expect(formData.numero).toBe("500");
      expect(formData.bairro).toBe("Jardins");
      expect(formData.cidade).toBe("São Paulo");
      expect(formData.estado).toBe("SP");
      expect(formData.cep).toBe("01310-100");
      expect(formData.referencia).toBe("Próximo à padaria");
      expect(formData.complemento).toBe("Apto 12");
      expect(formData.observacoes).toBe("Aluno alérgico a amendoim");
      expect(formData.escola_id).toBe("escola-uuid-1");
      expect(formData.veiculo_id).toBe("veiculo-uuid-2");
      expect(formData.valor_cobranca?.replace(/\s/g, " ")).toBe("R$ 450,00");
      expect(formData.dia_vencimento).toBe("10");
      expect(formData.data_inicio_transporte).toBe("01/02/2026");
      expect(formData.data_fim_transporte).toBe("15/12/2026");
      expect(formData.mes_inicio_cobranca).toBe("2");
      expect(formData.mes_fim_cobranca).toBe("12");
      expect(formData.ativo).toBe(true);
    });

    it("Deve validar que os dados convertidos do pré-cadastro satisfazem o schema de validação (passageiroSchema)", () => {
      const formData = mapearPrePassageiroParaFormulario(prePassageiroMock);
      const validationResult = passageiroSchema.safeParse(formData);

      expect(validationResult.success).toBe(true);
    });

    it("Deve tratar adequadamente campos nulos ou ausentes no pré-cadastro sem quebrar o mapeamento", () => {
      const preIncompleto: PrePassageiro = {
        id: "pre-456",
        usuario_id: "usr-999",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        nome: "João Pedro",
        nome_responsavel: "Maria Pedro",
        cpf_responsavel: "",
        telefone_responsavel: "(11) 98888-7777",
        periodo: "MANHA",
        logradouro: null,
        numero: null,
        bairro: null,
        cidade: null,
        estado: null,
        cep: null,
        referencia: null,
        observacoes: null,
        escola_id: null,
        veiculo_id: null,
        valor_cobranca: null,
        dia_vencimento: null,
      };

      const formData = mapearPrePassageiroParaFormulario(preIncompleto);

      expect(formData.nome).toBe("João Pedro");
      expect(formData.nome_responsavel).toBe("Maria Pedro");
      expect(formData.cpf_responsavel).toBe("");
      expect(formData.logradouro).toBe("");
      expect(formData.valor_cobranca).toBe("");
      expect(formData.dia_vencimento).toBe("");
      expect(formData.ativo).toBe(true);
    });
  });
});
