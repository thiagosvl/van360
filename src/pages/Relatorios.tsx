import { PremiumBanner } from "@/components/alerts/PremiumBanner";
import { BlurredValue } from "@/components/common/BlurredValue";
import { DateNavigation } from "@/components/common/DateNavigation";
import { PassengerLimitHealthBar } from "@/components/features/passageiro/PassengerLimitHealthBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCobrancas,
  useEscolas,
  useGastos,
  usePassageiros,
  useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import { canViewRelatorios } from "@/utils/domain/plano/accessRules";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { periodos as periodosConstants } from "@/utils/formatters/constants";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  ClipboardCheck,
  Coins,
  FileText,
  Fuel,
  HelpCircle,
  Percent,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIA_ICONS: Record<
  string,
  { icon: typeof Fuel; color: string; bg: string }
> = {
  Combustível: { icon: Fuel, color: "text-orange-600", bg: "bg-orange-100" },
  Manutenção: { icon: Wrench, color: "text-blue-600", bg: "bg-blue-100" },
  Salário: { icon: Wallet, color: "text-green-600", bg: "bg-green-100" },
  Vistorias: {
    icon: ClipboardCheck,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  Documentação: {
    icon: FileText,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  Outros: { icon: HelpCircle, color: "text-gray-600", bg: "bg-gray-100" },
};

// Mapeamento de labels para formas de pagamento
const FORMAS_PAGAMENTO_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  pix: { label: "PIX", color: "bg-emerald-500" },
  dinheiro: { label: "Dinheiro", color: "bg-green-500" },
  "cartao-credito": { label: "Cartão de Crédito", color: "bg-orange-500" },
  "cartao-debito": { label: "Cartão de Débito", color: "bg-yellow-500" },
  transferencia: { label: "Transferência", color: "bg-blue-500" },
  boleto: { label: "Boleto", color: "bg-purple-500" },
};

// Mock data para quando não tem acesso (com blur)
const MOCK_DATA_NO_ACCESS = {
  visaoGeral: {
    lucroEstimado: 0,
    recebido: 0,
    gasto: 0,
    custoPorPassageiro: 0,
    atrasos: {
      valor: 0,
      passageiros: 4,
    },
    taxaRecebimento: 90.9,
  },
  entradas: {
    previsto: 0,
    realizado: 0,
    ticketMedio: 0,
    passageirosPagantes: 0,
    passageirosPagos: 0,
    formasPagamento: [
      { metodo: "Pix", valor: 0, percentual: 33, color: "bg-emerald-500" },
      {
        metodo: "Dinheiro",
        valor: 2500,
        percentual: 29,
        color: "bg-green-500",
      },
      { metodo: "Cartão", valor: 0, percentual: 33, color: "bg-teal-500" },
    ],
  },
  saidas: {
    total: 0,
    margemOperacional: 0,
    mediaDiaria: 0,
    diasContabilizados: 0,
    custoPorPassageiro: 0,
    topCategorias: [
      {
        nome: "Combustível",
        valor: 0,
        count: 0,
        icon: Fuel,
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
      {
        nome: "Manutenção",
        valor: 0,
        count: 0,
        icon: Wrench,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      {
        nome: "Outros",
        valor: 0,
        count: 0,
        icon: HelpCircle,
        color: "text-gray-600",
        bg: "bg-gray-100",
      },
    ],
  },
  operacional: {
    passageirosCount: 0,
    escolas: [
      { nome: "Colégio Objetivo", passageiros: 0, valor: 2500, percentual: 33 },
      {
        nome: "Escola Adventista",
        passageiros: 0,
        valor: 1800,
        percentual: 33,
      },
      { nome: "Colégio Anglo", passageiros: 0, valor: 1200, percentual: 33 },
    ],
    periodos: [
      { nome: "Manhã", passageiros: 0, valor: 3500, percentual: 33 },
      { nome: "Tarde", passageiros: 0, valor: 2000, percentual: 33 },
    ],
    veiculos: [
      {
        placa: "ABC-1234",
        passageiros: 0,
        valor: 4000,
        marca: "Chevrolet",
        modelo: "Camaro",
        percentual: 33,
      },
      {
        placa: "XYZ-5678",
        passageiros: 0,
        valor: 1500,
        marca: "Chevrolet",
        modelo: "Camaro",
        percentual: 33,
      },
      {
        placa: "DEF-9012",
        passageiros: 0,
        valor: 0,
        marca: "Chevrolet",
        modelo: "Camaro",
        percentual: 33,
      },
    ],
  },
  automacao: {
    envios: 25,
    limite: 50,
    tempoEconomizado: "8h",
  },
};

export default function Relatorios() {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const { user } = useSession();
  const { profile, plano: profilePlano } = useProfile(user?.id);

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  // Access Logic - baseado no plano completo
  const hasAccess = canViewRelatorios(profilePlano);
  const passageirosLimit = profilePlano?.planoCompleto?.limite_passageiros || null;
  const isFreePlan = profilePlano?.isFreePlan;

  // Buscar dados reais - APENAS se tiver acesso
  const shouldFetchData = hasAccess && !!profile?.id;

  const { data: cobrancasData } = useCobrancas(
    {
      usuarioId: profile?.id,
      mes,
      ano,
    },
    { enabled: shouldFetchData }
  );

  const { data: gastosData = [] } = useGastos(
    {
      usuarioId: profile?.id,
      mes,
      ano,
    },
    { enabled: shouldFetchData }
  );

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id },
    { enabled: shouldFetchData }
  );

  const { data: escolasData } = useEscolas(profile?.id, {
    enabled: shouldFetchData,
  });

  const { data: veiculosData } = useVeiculos(profile?.id, {
    enabled: shouldFetchData,
  });

  // Calcular dados reais
  const dadosReais = useMemo(() => {
    if (!hasAccess || !cobrancasData || !gastosData || !passageirosData) {
      return null;
    }

    if (escolasData === undefined || veiculosData === undefined) {
      return null;
    }

    const cobrancas = cobrancasData.all || [];
    const cobrancasPagas = cobrancasData.pagas || [];
    const cobrancasAbertas = cobrancasData.abertas || [];

    // Visão Geral
    const recebido = cobrancasPagas.reduce(
      (acc, c) => acc + Number(c.valor || 0),
      0
    );
    const gasto = gastosData.reduce((acc, g) => acc + Number(g.valor || 0), 0);
    const lucroEstimado = recebido - gasto;

    // Atrasos (cobranças vencidas não pagas)
    const hoje = new Date();
    const atrasos = cobrancasAbertas.filter((c) => {
      const vencimento = new Date(c.data_vencimento);
      return vencimento < hoje;
    });
    const valorAtrasos = atrasos.reduce(
      (acc, c) => acc + Number(c.valor || 0),
      0
    );

    // Taxa de Recebimento
    const totalPrevisto = cobrancas.reduce(
      (acc, c) => acc + Number(c.valor || 0),
      0
    );
    const taxaRecebimento =
      totalPrevisto > 0 ? (recebido / totalPrevisto) * 100 : 0;

    // Passageiros
    const passageirosList = passageirosData?.list || [];
    const passageirosCount = passageirosList.length;

    // Custo por Passageiro
    const custoPorPassageiro =
      passageirosCount > 0 ? gasto / passageirosCount : 0;

    // Entradas
    const passageirosPagantes = new Set(cobrancas.map((c) => c.passageiro_id))
      .size;
    const passageirosPagos = new Set(cobrancasPagas.map((c) => c.passageiro_id))
      .size;
    const ticketMedio = passageirosPagos > 0 ? recebido / passageirosPagos : 0;

    // Formas de pagamento - usar apenas os tipos do constants.ts
    const formasPagamentoMap: Record<string, { valor: number; count: number }> =
      {};
    cobrancasPagas.forEach((c) => {
      const tipo = c.tipo_pagamento?.toLowerCase() || "";
      // Validar se é um tipo válido do constants.ts
      if (tipo) {
        if (!formasPagamentoMap[tipo]) {
          formasPagamentoMap[tipo] = { valor: 0, count: 0 };
        }
        formasPagamentoMap[tipo].valor += Number(c.valor || 0);
        formasPagamentoMap[tipo].count += 1;
      }
    });

    const formasPagamento = Object.entries(formasPagamentoMap)
      .map(([tipo, dados]) => {
        const labelData = FORMAS_PAGAMENTO_LABELS[tipo] || {
          label: tipo,
          color: "bg-gray-500",
        };
        return {
          metodo: labelData.label,
          valor: dados.valor,
          percentual: recebido > 0 ? (dados.valor / recebido) * 100 : 0,
          color: labelData.color,
        };
      })
      .filter((f) => f.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    // Saídas
    const diasComGastos = new Set(
      gastosData.map((g) => new Date(g.data).getDate())
    ).size;
    const mediaDiaria = diasComGastos > 0 ? gasto / diasComGastos : 0;
    const margemOperacional =
      recebido > 0 ? ((recebido - gasto) / recebido) * 100 : 0;

    // Categorias de gastos - usar dados reais
    const categoriasMap: Record<
      string,
      { valor: number; count: number; nome: string }
    > = {};
    gastosData.forEach((g) => {
      const cat = g.categoria || "Outros";
      if (!categoriasMap[cat]) {
        categoriasMap[cat] = { valor: 0, count: 0, nome: cat };
      }
      categoriasMap[cat].valor += Number(g.valor || 0);
      categoriasMap[cat].count += 1;
    });

    const topCategorias = Object.values(categoriasMap)
      .sort((a, b) => b.valor - a.valor)
      .map((cat) => {
        const iconData = CATEGORIA_ICONS[cat.nome] || CATEGORIA_ICONS.Outros;
        return {
          nome: cat.nome,
          valor: cat.valor,
          count: cat.count,
          icon: iconData.icon,
          color: iconData.color,
          bg: iconData.bg,
        };
      });

    // Operacional
    const escolasList =
      (
        escolasData as
          | {
              list?: Array<{
                id: number;
                nome: string;
                passageiros_ativos_count?: number;
              }>;
            }
          | undefined
      )?.list || [];

    const totalPassageirosPorEscola = escolasList.reduce(
      (acc, e) => acc + (e.passageiros_ativos_count || 0),
      0
    );

    const escolas = escolasList
      .filter((e) => (e.passageiros_ativos_count || 0) > 0)
      .map((e) => {
        // Calcular valor financeiro da escola
        const valor = passageirosList
          .filter((p) => p.ativo && p.escola_id === e.id)
          .reduce((acc, p) => acc + Number(p.valor_cobranca || 0), 0);

        return {
          nome: e.nome,
          passageiros: e.passageiros_ativos_count || 0,
          valor,
          percentual:
            totalPassageirosPorEscola > 0
              ? ((e.passageiros_ativos_count || 0) /
                  totalPassageirosPorEscola) *
                100
              : 0,
        };
      })
      .sort((a, b) => b.passageiros - a.passageiros)
      .slice(0, 5);

    const veiculosList =
      (
        veiculosData as
          | {
              list?: Array<{
                id: number;
                placa: string;
                marca: string;
                modelo: string;
                passageiros_ativos_count?: number;
              }>;
            }
          | undefined
      )?.list || [];

    const totalPassageirosPorVeiculo = veiculosList.reduce(
      (acc, v) => acc + (v.passageiros_ativos_count || 0),
      0
    );

    const veiculos = veiculosList
      .filter((v) => (v.passageiros_ativos_count || 0) > 0)
      .map((v) => {
        // Calcular valor financeiro do veículo
        const valor = passageirosList
          .filter((p) => p.ativo && p.veiculo_id === v.id)
          .reduce((acc, p) => acc + Number(p.valor_cobranca || 0), 0);

        return {
          placa: formatarPlacaExibicao(v.placa),
          passageiros: v.passageiros_ativos_count || 0,
          valor,
          marca: v.marca,
          modelo: v.modelo,
          percentual:
            totalPassageirosPorVeiculo > 0
              ? ((v.passageiros_ativos_count || 0) /
                  totalPassageirosPorVeiculo) *
                100
              : 0,
        };
      })
      .sort((a, b) => b.passageiros - a.passageiros)
      .slice(0, 5);

    const periodosMap: Record<string, { count: number; valor: number }> = {};
    passageirosList
      .filter((p) => p.ativo)
      .forEach((p) => {
        const periodo = p.periodo || "Outros";
        if (!periodosMap[periodo]) {
          periodosMap[periodo] = { count: 0, valor: 0 };
        }
        periodosMap[periodo].count += 1;
        periodosMap[periodo].valor += Number(p.valor_cobranca || 0);
      });

    const totalPorPeriodo = Object.values(periodosMap).reduce(
      (acc, v) => acc + v.count,
      0
    );

    const periodos = Object.entries(periodosMap)
      .map(([value, data]) => {
        const periodoData = periodosConstants.find((p) => p.value === value);
        return {
          nome: periodoData?.label || value,
          passageiros: data.count,
          valor: data.valor,
          percentual:
            totalPorPeriodo > 0 ? (data.count / totalPorPeriodo) * 100 : 0,
        };
      })
      .sort((a, b) => b.passageiros - a.passageiros);

    // Automação (cobranças automáticas)
    const passageirosComAutomatica = passageirosList.filter(
      (p) => p.enviar_cobranca_automatica && p.ativo
    ).length;
    const limiteAutomatica =
      profilePlano?.planoCompleto?.franquia_contratada_cobrancas || 50;

    return {
      visaoGeral: {
        lucroEstimado,
        recebido,
        gasto,
        custoPorPassageiro,
        atrasos: {
          valor: valorAtrasos,
          passageiros: atrasos.length,
        },
        taxaRecebimento,
      },
      entradas: {
        previsto: totalPrevisto,
        realizado: recebido,
        ticketMedio,
        passageirosPagantes,
        passageirosPagos,
        formasPagamento,
      },
      saidas: {
        total: gasto,
        margemOperacional,
        mediaDiaria,
        diasContabilizados: diasComGastos,
        custoPorPassageiro,
        topCategorias,
      },
      operacional: {
        passageirosCount,
        escolas,
        periodos,
        veiculos,
      },
      automacao: {
        envios: passageirosComAutomatica,
        limite: limiteAutomatica,
        tempoEconomizado: `${Math.round(passageirosComAutomatica * 0.08)}h`,
      },
    };
  }, [
    hasAccess,
    cobrancasData,
    gastosData,
    passageirosData,
    escolasData,
    veiculosData,
    mes,
    ano,
    profilePlano,
  ]);

  // Usar dados reais ou mock (com blur) - mock só para quem não tem acesso
  const dados = hasAccess && dadosReais ? dadosReais : MOCK_DATA_NO_ACCESS;

  useEffect(() => {
    setPageTitle("Relatórios");
  }, [setPageTitle]);

  const handleNavigate = (newMes: number, newAno: number) => {
    setMes(newMes);
    setAno(newAno);
  };

  const lucroPositivo = dados.visaoGeral.lucroEstimado >= 0;

  // Helper for Progress Bars in No-Access State
  const getProgressValue = (realValue: number) => {
    if (hasAccess) return realValue;
    return 50; // Fixed visual percentage for "teaser" look
  };

  if (!profilePlano) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="relative min-h-screen pb-20 space-y-6 bg-gray-50/50">
      {/* Premium Banner (Top of Page) */}
      {!hasAccess && (
        <PremiumBanner
          title="Você está dirigindo no escuro?"
          description="Descubra para onde está indo seu dinheiro. Escolha um plano para ver seu lucro real, quem está devendo e onde cortar gastos."
          ctaText="Liberar meus Relatórios"
          variant="orange"
        />
      )}

      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DateNavigation
          mes={mes}
          ano={ano}
          onNavigate={handleNavigate}
          disabled={!hasAccess}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="visao-geral" className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 md:h-12 inline-flex w-auto min-w-full md:min-w-0">
              <TabsTrigger
                value="visao-geral"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="entradas"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Entradas
              </TabsTrigger>
              <TabsTrigger
                value="saidas"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Saídas
              </TabsTrigger>
              <TabsTrigger
                value="operacional"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Operacional
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Aba 1: Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lucro Estimado */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Lucro Estimado
                </CardTitle>
                <div
                  className={cn(
                    "p-2 rounded-full",
                    lucroPositivo
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  <Wallet className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-baseline gap-2">
                  <BlurredValue
                    value={dados.visaoGeral.lucroEstimado}
                    visible={hasAccess}
                    type="currency"
                    className={cn(
                      "text-3xl md:text-4xl font-bold tracking-tight",
                      lucroPositivo ? "text-emerald-600" : "text-red-600"
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "text-xs mt-2 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Entradas - Saídas do mês
                </p>
              </CardContent>
            </Card>

            {/* Atrasos */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Em Atraso
                </CardTitle>
                <div className="p-2 rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-baseline gap-2">
                  <BlurredValue
                    value={dados.visaoGeral.atrasos.valor}
                    visible={hasAccess}
                    type="currency"
                    className="text-3xl md:text-4xl font-bold tracking-tight text-red-600"
                  />
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md">
                  <span
                    className={cn(
                      "text-xs font-medium text-red-700",
                      !hasAccess && "blur-sm select-none"
                    )}
                  >
                    <BlurredValue
                      value={dados.visaoGeral.atrasos.passageiros}
                      visible={hasAccess}
                      type="number"
                    />{" "}
                    passageiros
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPIs Secundários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custo por Passageiro */}
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Custo por Passageiro
                </CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-gray-900">
                  <BlurredValue
                    value={dados.visaoGeral.custoPorPassageiro}
                    visible={hasAccess}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Média de custo por assento ocupado
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Taxa de Recebimento
                </CardTitle>
                <Percent className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-6 pb-6 flex items-baseline gap-2">
                <div>
                  <span className="text-3xl font-bold text-emerald-600">
                    <BlurredValue
                      value={dados.visaoGeral.taxaRecebimento}
                      visible={hasAccess}
                      type="percent"
                    />
                  </span>
                  <span
                    className={cn(
                      "text-sm text-gray-400 ml-2 font-medium",
                      !hasAccess && "blur-sm select-none"
                    )}
                  >
                    do previsto
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo Barras */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-lg font-bold text-gray-900">
                Fluxo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-6 pb-8">
              {(() => {
                // Calcular o valor máximo entre recebido e gasto para usar como base (100%)
                const maxValor = Math.max(
                  dados.visaoGeral.recebido,
                  dados.visaoGeral.gasto
                );
                const percentualEntradas =
                  maxValor > 0
                    ? (dados.visaoGeral.recebido / maxValor) * 100
                    : 0;
                const percentualSaidas =
                  maxValor > 0 ? (dados.visaoGeral.gasto / maxValor) * 100 : 0;

                return (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2 font-medium">
                          <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                          Entradas
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          <BlurredValue
                            value={dados.visaoGeral.recebido}
                            visible={hasAccess}
                            type="currency"
                          />
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(percentualEntradas)}
                        className="h-3 bg-gray-100 rounded-full"
                        indicatorClassName="bg-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2 font-medium">
                          <ArrowDownCircle className="h-5 w-5 text-red-500" />
                          Saídas
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          <BlurredValue
                            value={dados.visaoGeral.gasto}
                            visible={hasAccess}
                            type="currency"
                          />
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(percentualSaidas)}
                        className="h-3 bg-gray-100 rounded-full"
                        indicatorClassName="bg-red-500 rounded-full"
                      />
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Entradas */}
        <TabsContent value="entradas" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Receita Realizada
                </CardTitle>
                <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-bold text-gray-900">
                  <BlurredValue
                    value={dados.entradas.realizado}
                    visible={hasAccess}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Total recebido no mês
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ticket Médio
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                  <Coins className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-bold text-gray-900">
                  <BlurredValue
                    value={dados.entradas.ticketMedio}
                    visible={hasAccess}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Valor médio por passageiro
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Formas de Pagamento */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-lg font-bold text-gray-900">
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <div className="space-y-4">
                {dados.entradas.formasPagamento.map((forma, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {forma.metodo}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          <BlurredValue
                            value={forma.valor}
                            visible={hasAccess}
                            type="currency"
                          />
                        </span>
                        <span className="text-gray-400 text-xs w-10 text-right">
                          <BlurredValue
                            value={forma.percentual}
                            visible={hasAccess}
                            type="percent"
                          />
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={getProgressValue(forma.percentual)}
                      className="h-2 bg-gray-100 rounded-full"
                      indicatorClassName={cn(forma.color, "rounded-full")}
                    />
                  </div>
                ))}
                {dados.entradas.formasPagamento.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhum pagamento registrado neste mês.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 3: Saídas */}
        <TabsContent value="saidas" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total de Despesas
                </CardTitle>
                <div className="p-2 rounded-full bg-red-50 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-bold text-gray-900">
                  <BlurredValue
                    value={dados.saidas.total}
                    visible={hasAccess}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Acumulado no mês
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Margem Operacional
                </CardTitle>
                <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900">
                    <BlurredValue
                      value={dados.saidas.margemOperacional}
                      visible={hasAccess}
                      type="percent"
                    />
                  </div>
                  {hasAccess && (
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                        dados.saidas.margemOperacional > 30
                          ? "bg-emerald-100 text-emerald-700"
                          : dados.saidas.margemOperacional > 10
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {dados.saidas.margemOperacional > 30
                        ? "Saudável"
                        : dados.saidas.margemOperacional > 10
                        ? "Atenção"
                        : "Crítico"}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Quanto sobra de cada real
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Onde gastei mais */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-lg font-bold text-gray-900">
                Onde gastei mais?
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <div className="space-y-4">
                {dados.saidas.topCategorias.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            cat.bg,
                            cat.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {cat.nome}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="font-bold text-gray-900">
                              <BlurredValue
                                value={cat.valor}
                                visible={hasAccess}
                                type="currency"
                              />
                            </span>
                            <span>•</span>
                            <span>
                              <BlurredValue
                                value={cat.count}
                                visible={hasAccess}
                                type="number"
                              />{" "}
                              <span
                                className={cn(
                                  "text-xs text-gray-400 mt-1",
                                  !hasAccess && "blur-sm select-none"
                                )}
                              >
                                {cat.count === 1 ? "registro" : "registros"}
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {dados.saidas.topCategorias.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhuma despesa registrada neste mês.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 4: Operacional */}
        <TabsContent value="operacional" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isFreePlan ? (
              <PassengerLimitHealthBar
                current={dados.operacional.passageirosCount}
                max={passageirosLimit}
                label="Passageiros"
                className="mb-0"
              />
            ) : (
              <Card className="border-none shadow-sm rounded-2xl bg-white">
                <CardHeader className="pb-0 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Passageiros Ativos
                  </CardTitle>
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
                    <BlurredValue
                      value={dados.operacional.passageirosCount}
                      visible={hasAccess}
                      type="number"
                    />
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      / Ilimitado
                    </span>
                  </h3>
                </CardContent>
              </Card>
            )}

            {/* Automação (Cobranças Automáticas) */}
            {profilePlano?.isCompletePlan ? (
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Cobranças Automáticas
                      </p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
                        <BlurredValue
                          value={dados.automacao.envios}
                          visible={hasAccess}
                          type="number"
                        />
                        <span className="text-gray-400 font-normal ml-1">
                          / {dados.automacao.limite}
                        </span>
                      </h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                      <Zap className="h-5 w-5" />
                    </div>
                  </div>
                  <Progress
                    value={
                      (dados.automacao.envios / dados.automacao.limite) * 100
                    }
                    className="h-2 bg-gray-100 rounded-full"
                    indicatorClassName="bg-amber-500 rounded-full"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Passageiros com envio automático ativado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white shadow-lg">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold">
                        Automatize sua rotina
                      </p>
                    </div>
                    <p className="text-xs text-white/80">
                      Deixe a cobrança com a gente! Recebimento automático e
                      baixa instantânea.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4 px-5 rounded-full border-white/30 bg-white/20 text-white hover:bg-white/30 font-semibold"
                      onClick={() => navigate("/planos?plano=completo")}
                    >
                      Quero automação total →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Escolas */}
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Por Escola
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8 pt-4 space-y-4">
                {dados.operacional.escolas.map((escola, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-end text-sm">
                      <span className="font-medium text-gray-700 truncate max-w-[140px] md:max-w-[180px]">
                        {escola.nome}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          <BlurredValue
                            value={escola.valor}
                            visible={hasAccess}
                            type="currency"
                          />
                        </div>
                        <div className="font-semibold text-gray-900">
                          <BlurredValue
                            value={escola.passageiros}
                            visible={hasAccess}
                            type="number"
                          />{" "}
                           <span
                            className={cn(
                              "text-xs text-gray-400 mt-1",
                              !hasAccess && "blur-sm select-none"
                            )}
                          >
                            passageiros
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={getProgressValue(escola.percentual)}
                      className="h-2 bg-gray-100 rounded-full"
                      indicatorClassName="bg-blue-500 rounded-full"
                    />
                  </div>
                ))}
                {dados.operacional.escolas.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhum dado disponível.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Períodos */}
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Por Período
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8 pt-4 space-y-4">
                {dados.operacional.periodos.map((periodo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-end text-sm">
                      <span className="font-medium text-gray-700">
                        {periodo.nome}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          <BlurredValue
                            value={periodo.valor}
                            visible={hasAccess}
                            type="currency"
                          />
                        </div>
                        <div className="font-semibold text-gray-900">
                          <BlurredValue
                            value={periodo.passageiros}
                            visible={hasAccess}
                            type="number"
                          />{" "}
                           <span
                            className={cn(
                              "text-xs text-gray-400 mt-1",
                              !hasAccess && "blur-sm select-none"
                            )}
                          >
                            passageiros
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={getProgressValue(periodo.percentual)}
                      className="h-2 bg-gray-100 rounded-full"
                      indicatorClassName="bg-blue-500 rounded-full"
                    />
                  </div>
                ))}
                {dados.operacional.periodos.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhum dado disponível.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Veículos */}
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Por Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8 pt-4 space-y-4">
                {dados.operacional.veiculos.map((veiculo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-end text-sm">
                      <div>
                        <div className="text-xs text-gray-500">{`${veiculo.marca} ${veiculo.modelo}`}</div>
                        <div className="font-medium text-gray-700">
                          {veiculo.placa}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          <BlurredValue
                            value={veiculo.valor}
                            visible={hasAccess}
                            type="currency"
                          />
                        </div>
                        <div className="font-semibold text-gray-900">
                          <BlurredValue
                            value={veiculo.passageiros}
                            visible={hasAccess}
                            type="number"
                          />{" "}
                          <span
                            className={cn(
                              "text-xs text-gray-400 mt-1",
                              !hasAccess && "blur-sm select-none"
                            )}
                          >
                            passageiros
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={getProgressValue(veiculo.percentual)}
                      className="h-2 bg-gray-100 rounded-full"
                      indicatorClassName="bg-blue-500 rounded-full"
                    />
                  </div>
                ))}
                {dados.operacional.veiculos.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhum dado disponível.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
