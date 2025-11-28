import { DateNavigation } from "@/components/common/DateNavigation";
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
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import {
  periodos as periodosConstants,
  tiposPagamento,
} from "@/utils/formatters/constants";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Bot,
  CheckCircle2,
  Clock,
  Crown,
  Fuel,
  Percent,
  TrendingDown,
  TrendingUp,
  Users,
  UserX,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Mapeamento de ícones e cores para categorias
const CATEGORIA_ICONS: Record<
  string,
  { icon: typeof Fuel; color: string; bg: string }
> = {
  Combustível: { icon: Fuel, color: "text-red-500", bg: "bg-red-50" },
  Manutenção: { icon: Wrench, color: "text-orange-500", bg: "bg-orange-50" },
  Salário: { icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
  Vistorias: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  Documentação: {
    icon: AlertTriangle,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  Outros: { icon: AlertTriangle, color: "text-gray-500", bg: "bg-gray-50" },
};

// Mapeamento de labels para formas de pagamento
const FORMAS_PAGAMENTO_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  PIX: { label: "PIX", color: "bg-emerald-500" },
  dinheiro: { label: "Dinheiro", color: "bg-green-500" },
  cartao: { label: "Cartão", color: "bg-teal-500" },
  transferencia: { label: "Transferência", color: "bg-blue-500" },
  boleto: { label: "Boleto", color: "bg-purple-500" },
};

// Mock data para quando não tem acesso (com blur)
const MOCK_DATA_NO_ACCESS = {
  visaoGeral: {
    lucroEstimado: 0,
    recebido: 0,
    gasto: 0,
    passageirosDesativados: 0,
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
        icon: Fuel,
        color: "text-red-500",
        bg: "bg-red-50",
      },
      {
        nome: "Manutenção",
        valor: 0,
        icon: Wrench,
        color: "text-orange-500",
        bg: "bg-orange-50",
      },
      {
        nome: "Outros",
        valor: 0,
        icon: AlertTriangle,
        color: "text-gray-500",
        bg: "bg-gray-50",
      },
    ],
  },
  operacional: {
    passageirosAtivos: 0,
    escolas: [
      { nome: "Colégio Objetivo", passageiros: 0, percentual: 33 },
      { nome: "Escola Adventista", passageiros: 0, percentual: 33 },
      { nome: "Colégio Anglo", passageiros: 0, percentual: 33 },
    ],
    periodos: [
      { nome: "Manhã", passageiros: 0, percentual: 33 },
      { nome: "Tarde", passageiros: 0, percentual: 33 },
    ],
    veiculos: [
      { placa: "ABC-1234", passageiros: 0, percentual: 33 },
      { placa: "XYZ-5678", passageiros: 0, percentual: 33 },
      { placa: "DEF-9012", passageiros: 0, percentual: 33 },
    ],
  },
  automacao: {
    envios: 25,
    limite: 50,
    tempoEconomizado: "8h",
  },
};

export default function Relatorios() {
  const { setPageTitle } = useLayout();
  const { user } = useSession();
  const { profile, plano: profilePlano } = useProfile(user?.id);
  console.log(profilePlano);

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  // Access Logic - baseado no plano completo
  const hasAccess =
    profilePlano?.isCompletePlan ||
    profilePlano?.isEssentialPlan ||
    (profilePlano?.isTrial && profilePlano?.isValidTrial);
  const passageirosLimit = profilePlano?.planoCompleto?.max_passageiros || null;

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
    const passageirosAtivos = passageirosList.filter((p) => p.ativo).length;
    const passageirosDesativados = passageirosList.filter(
      (p) => !p.ativo
    ).length;

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

      // Normalizar e mapear para os valores do constants.ts
      let key = "";
      if (tipo === "pix") {
        key = "PIX";
      } else if (tipo === "dinheiro") {
        key = "dinheiro";
      } else if (tipo.includes("cartao") || tipo.includes("cartão")) {
        key = "cartao";
      } else if (tipo === "transferencia" || tipo === "transferência") {
        key = "transferencia";
      } else if (tipo === "boleto") {
        key = "boleto";
      }

      // Validar se é um tipo válido do constants.ts
      if (key) {
        const isValidType = tiposPagamento.some((tp) => {
          const tpValue = tp.value.toLowerCase();
          if (key === "PIX") {
            return tpValue === "pix";
          } else if (key === "cartao") {
            return tpValue.includes("cartao");
          }
          return tpValue === key.toLowerCase();
        });

        if (isValidType) {
          if (!formasPagamentoMap[key]) {
            formasPagamentoMap[key] = { valor: 0, count: 0 };
          }
          formasPagamentoMap[key].valor += Number(c.valor || 0);
          formasPagamentoMap[key].count += 1;
        }
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
    const categoriasMap: Record<string, { valor: number; nome: string }> = {};
    gastosData.forEach((g) => {
      const cat = g.categoria || "Outros";
      if (!categoriasMap[cat]) {
        categoriasMap[cat] = { valor: 0, nome: cat };
      }
      categoriasMap[cat].valor += Number(g.valor || 0);
    });

    const topCategorias = Object.values(categoriasMap)
      .sort((a, b) => b.valor - a.valor)
      .map((cat) => {
        const iconData = CATEGORIA_ICONS[cat.nome] || CATEGORIA_ICONS.Outros;
        return {
          nome: cat.nome,
          valor: cat.valor,
          icon: iconData.icon,
          color: iconData.color,
          bg: iconData.bg,
        };
      });

    const custoPorPassageiro =
      passageirosAtivos > 0 ? gasto / passageirosAtivos : 0;

    // Operacional
    const escolasList =
      (
        escolasData as
          | {
              list?: Array<{ nome: string; passageiros_ativos_count?: number }>;
            }
          | undefined
      )?.list || [];
    const totalPassageirosPorEscola = escolasList.reduce(
      (acc, e) => acc + (e.passageiros_ativos_count || 0),
      0
    );
    const escolas = escolasList
      .filter((e) => (e.passageiros_ativos_count || 0) > 0)
      .map((e) => ({
        nome: e.nome,
        passageiros: e.passageiros_ativos_count || 0,
        percentual:
          totalPassageirosPorEscola > 0
            ? ((e.passageiros_ativos_count || 0) / totalPassageirosPorEscola) *
              100
            : 0,
      }))
      .sort((a, b) => b.passageiros - a.passageiros)
      .slice(0, 5);

    const veiculosList =
      (
        veiculosData as
          | {
              list?: Array<{
                placa: string;
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
      .map((v) => ({
        placa: formatarPlacaExibicao(v.placa),
        passageiros: v.passageiros_ativos_count || 0,
        percentual:
          totalPassageirosPorVeiculo > 0
            ? ((v.passageiros_ativos_count || 0) / totalPassageirosPorVeiculo) *
              100
            : 0,
      }))
      .sort((a, b) => b.passageiros - a.passageiros)
      .slice(0, 5);

    const periodosMap: Record<string, number> = {};
    passageirosList
      .filter((p) => p.ativo)
      .forEach((p) => {
        const periodo = p.periodo || "Outros";
        periodosMap[periodo] = (periodosMap[periodo] || 0) + 1;
      });
    const totalPorPeriodo = Object.values(periodosMap).reduce(
      (acc, v) => acc + v,
      0
    );
    const periodos = Object.entries(periodosMap)
      .map(([value, count]) => {
        const periodoData = periodosConstants.find((p) => p.value === value);
        return {
          nome: periodoData?.label || value,
          passageiros: count,
          percentual: totalPorPeriodo > 0 ? (count / totalPorPeriodo) * 100 : 0,
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
        passageirosDesativados,
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
        passageirosAtivos,
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

  // --- Helper Components ---

  const CircularProgress = ({
    value,
    max,
    size = 60,
    strokeWidth = 6,
  }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-indigo-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-indigo-600 transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute text-xs font-bold text-indigo-700">
          {Math.round((value / max) * 100)}%
        </div>
      </div>
    );
  };

  /**
   * PrivateData Component
   * Handles the display of sensitive data.
   * If !hasAccess, it shows a blurred fictitious value.
   */
  const PrivateData = ({
    value,
    type = "currency",
    className,
    blurIntensity = "blur-sm",
  }: {
    value: number;
    type?: "currency" | "number" | "percent";
    className?: string;
    blurIntensity?: string;
  }) => {
    if (hasAccess) {
      if (type === "currency") {
        return (
          <span className={className}>
            {value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        );
      }
      if (type === "percent") {
        return <span className={className}>{value.toFixed(1)}%</span>;
      }
      return <span className={className}>{value}</span>;
    }

    // Generate a consistent "fake" value based on the real value
    const fakeValue = value * 1.42;

    let formattedFake;
    if (type === "currency") {
      formattedFake = fakeValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    } else if (type === "percent") {
      formattedFake = fakeValue.toFixed(1) + "%";
    } else {
      formattedFake = Math.round(fakeValue).toString();
    }

    return (
      <span
        className={cn(
          "select-none opacity-60 transition-all duration-300",
          blurIntensity,
          className
        )}
        title="Disponível no plano Premium"
      >
        {formattedFake}
      </span>
    );
  };

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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Visualize seus resultados completos
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Libere o acesso aos relatórios financeiros e operacionais
                detalhados para tomar as melhores decisões.
              </p>
            </div>
          </div>
          <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-orange-200/50 transition-transform hover:scale-105">
            Liberar Acesso Premium
          </Button>
        </div>
      )}

      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DateNavigation mes={mes} ano={ano} onNavigate={handleNavigate} />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="visao-geral" className="w-full space-y-6">
        <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <TabsList className="bg-white p-1 rounded-xl h-12 w-full md:w-auto inline-flex min-w-max shadow-sm border border-gray-100">
            <TabsTrigger
              value="visao-geral"
              className="rounded-lg h-10 px-5 text-xs md:text-sm font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 text-gray-500 transition-all"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="entradas"
              className="rounded-lg h-10 px-5 text-xs md:text-sm font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 text-gray-500 transition-all"
            >
              Entradas
            </TabsTrigger>
            <TabsTrigger
              value="saidas"
              className="rounded-lg h-10 px-5 text-xs md:text-sm font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 text-gray-500 transition-all"
            >
              Saídas
            </TabsTrigger>
            <TabsTrigger
              value="operacional"
              className="rounded-lg h-10 px-5 text-xs md:text-sm font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 text-gray-500 transition-all"
            >
              Operacional
            </TabsTrigger>
          </TabsList>
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
                  <PrivateData
                    value={dados.visaoGeral.lucroEstimado}
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
                  <PrivateData
                    value={dados.visaoGeral.atrasos.valor}
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
                    <PrivateData
                      value={dados.visaoGeral.atrasos.passageiros}
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
            <Card className="border-none shadow-sm rounded-2xl bg-indigo-50/30">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Passageiros Desativados
                </CardTitle>
                <UserX className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-indigo-900">
                  <PrivateData
                    value={dados.visaoGeral.passageirosDesativados}
                    type="number"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs text-indigo-600/70 mt-1",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Passageiros inativos no momento
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
                    <PrivateData
                      value={dados.visaoGeral.taxaRecebimento}
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
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2 font-medium">
                    <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                    Entradas
                  </span>
                  <span className="font-bold text-gray-900 text-base">
                    <PrivateData
                      value={dados.visaoGeral.recebido}
                      type="currency"
                    />
                  </span>
                </div>
                <Progress
                  value={getProgressValue(100)}
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
                    <PrivateData
                      value={dados.visaoGeral.gasto}
                      type="currency"
                    />
                  </span>
                </div>
                <Progress
                  value={getProgressValue(
                    dados.visaoGeral.recebido > 0
                      ? (dados.visaoGeral.gasto / dados.visaoGeral.recebido) *
                          100
                      : 0
                  )}
                  className="h-3 bg-gray-100 rounded-full"
                  indicatorClassName="bg-red-500 rounded-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Entradas */}
        <TabsContent value="entradas" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-blue-50/50 border-none shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
                <CardTitle className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Total Previsto
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl md:text-3xl font-bold text-blue-900">
                  <PrivateData
                    value={dados.entradas.previsto}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs md:text-sm text-blue-600/80 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  <PrivateData
                    value={dados.entradas.passageirosPagantes}
                    type="number"
                  />{" "}
                  Passageiros
                </p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50/50 border-none shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
                <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Realizado
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl md:text-3xl font-bold text-emerald-900">
                  <PrivateData
                    value={dados.entradas.realizado}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs md:text-sm text-emerald-600/80 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  <PrivateData
                    value={dados.entradas.passageirosPagos}
                    type="number"
                  />{" "}
                  pagaram
                </p>
              </CardContent>
            </Card>

            {/* Ticket Médio - NOVO KPI */}
            <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ticket Médio
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-gray-900">
                  <PrivateData
                    value={dados.entradas.ticketMedio}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  por passageiro pago
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Barras (Formas de Pagamento) */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {dados.entradas.formasPagamento.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.metodo}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs font-medium">
                        <PrivateData value={item.valor} type="currency" />
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          !hasAccess && "blur-sm select-none"
                        )}
                      >
                        <PrivateData value={item.percentual} type="percent" />
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={getProgressValue(item.percentual)}
                    className="h-2.5 bg-gray-100"
                    indicatorClassName={item.color}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 3: Saídas */}
        <TabsContent value="saidas" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total de Gastos */}
            <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total de Gastos
                </CardTitle>
                <div className="p-2 rounded-full bg-red-50 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-bold text-red-900">
                  <PrivateData value={dados.saidas.total} type="currency" />
                </div>
                <p
                  className={cn(
                    "text-sm text-red-600 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  {dados.saidas.topCategorias.length} categorias
                </p>
              </CardContent>
            </Card>

            {/* Margem Operacional - NOVO KPI */}
            <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Margem Operacional
                </CardTitle>
                <div
                  className={cn(
                    "p-2 rounded-full",
                    dados.saidas.margemOperacional > 30
                      ? "bg-emerald-50 text-emerald-600"
                      : dados.saidas.margemOperacional > 10
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  <Percent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      dados.saidas.margemOperacional > 30
                        ? "text-emerald-600"
                        : dados.saidas.margemOperacional > 10
                        ? "text-amber-600"
                        : "text-red-600"
                    )}
                  >
                    <PrivateData
                      value={dados.saidas.margemOperacional}
                      type="percent"
                    />
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs text-gray-400 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  Sobra de cada R$ 100
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Média Diária */}
            <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Média Diária
                </CardTitle>
                <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-gray-900">
                  <PrivateData
                    value={dados.saidas.mediaDiaria}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-sm text-gray-400 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  <PrivateData
                    value={dados.saidas.diasContabilizados}
                    type="number"
                  />{" "}
                  dias com gastos
                </p>
              </CardContent>
            </Card>

            {/* Custo por Passageiro */}
            <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Custo / Passageiro
                </CardTitle>
                <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-gray-900">
                  <PrivateData
                    value={dados.saidas.custoPorPassageiro}
                    type="currency"
                  />
                </div>
                <p
                  className={cn(
                    "text-sm text-gray-500 mt-1 font-medium",
                    !hasAccess && "blur-sm select-none"
                  )}
                >
                  <PrivateData
                    value={dados.operacional.passageirosAtivos}
                    type="number"
                  />{" "}
                  ativos
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-lg font-bold text-gray-900">
                Onde gastei mais?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-gray-50 px-6 pb-8">
              {dados.saidas.topCategorias.length > 0 ? (
                dados.saidas.topCategorias.map((cat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                          cat.bg
                        )}
                      >
                        <cat.icon className={cn("h-6 w-6", cat.color)} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">
                          {cat.nome}
                        </p>
                        <p
                          className={cn(
                            "text-xs text-gray-500 font-medium",
                            !hasAccess && "blur-sm select-none"
                          )}
                        >
                          <PrivateData
                            value={
                              dados.saidas.total > 0
                                ? (cat.valor / dados.saidas.total) * 100
                                : 0
                            }
                            type="percent"
                          />{" "}
                          do total
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      <PrivateData value={cat.valor} type="currency" />
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum gasto registrado neste mês
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 4: Operacional */}
        <TabsContent value="operacional" className="space-y-4 mt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* Card Passageiros */}
            <Card className="border-none shadow-sm rounded-2xl bg-white p-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Passageiros
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    <PrivateData
                      value={dados.operacional.passageirosAtivos}
                      type="number"
                    />
                  </span>
                  {passageirosLimit && (
                    <span
                      className={cn(
                        "text-sm text-gray-400 font-medium",
                        !hasAccess && "blur-sm select-none"
                      )}
                    >
                      /{passageirosLimit}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: passageirosLimit
                        ? `${Math.min(
                            (dados.operacional.passageirosAtivos /
                              passageirosLimit) *
                              100,
                            100
                          )}%`
                        : "75%",
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Automação */}
            {profilePlano.isCompletePlan ? (
              <Card className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                      <Zap className="h-5 w-5 fill-indigo-600" />
                    </div>
                  </div>
                  <CircularProgress
                    value={dados.automacao.envios}
                    max={dados.automacao.limite}
                    size={48}
                    strokeWidth={5}
                  />
                </div>
                <div className="z-10 mt-4">
                  <span className="text-2xl font-bold text-indigo-900 block leading-tight">
                    {dados.automacao.tempoEconomizado}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium text-indigo-600 leading-tight block mt-1",
                      !hasAccess && "blur-sm select-none"
                    )}
                  >
                    economizados
                  </span>
                </div>
              </Card>
            ) : (
              <Card className="bg-white border border-amber-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Bot className="h-20 w-20 text-amber-500" />
                </div>
                <div className="flex items-center gap-2 mb-4 z-10">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Automação
                  </span>
                </div>
                <div className="z-10">
                  <p className="text-xs text-gray-500 leading-tight mb-4 font-medium">
                    Cansado de cobrar manualmente?
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 w-full rounded-lg"
                  >
                    Conhecer
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Listas de Logística */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pt-6 px-6">
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Por Escola
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-8">
                {dados.operacional.escolas.length > 0 ? (
                  dados.operacional.escolas.map((escola, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-semibold">
                          {escola.nome}
                        </span>
                        <span
                          className={cn(
                            "text-gray-500 text-xs font-medium",
                            !hasAccess && "blur-sm select-none"
                          )}
                        >
                          <PrivateData
                            value={escola.passageiros}
                            type="number"
                          />{" "}
                          passageiros
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(escola.percentual)}
                        className="h-2 bg-gray-100 rounded-full"
                        indicatorClassName="bg-gray-400 rounded-full"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma escola cadastrada
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pt-6 px-6">
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Por Período
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-8">
                {dados.operacional.periodos.length > 0 ? (
                  dados.operacional.periodos.map((periodo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-semibold">
                          {periodo.nome}
                        </span>
                        <span
                          className={cn(
                            "text-gray-500 text-xs font-medium",
                            !hasAccess && "blur-sm select-none"
                          )}
                        >
                          <PrivateData
                            value={periodo.passageiros}
                            type="number"
                          />{" "}
                          passageiros
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(periodo.percentual)}
                        className="h-2 bg-gray-100 rounded-full"
                        indicatorClassName="bg-indigo-400 rounded-full"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum período cadastrado
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="pt-6 px-6">
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Por Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-8">
                {dados.operacional.veiculos.length > 0 ? (
                  dados.operacional.veiculos.map((veiculo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-semibold">
                          {veiculo.placa}
                        </span>
                        <span
                          className={cn(
                            "text-gray-500 text-xs font-medium",
                            !hasAccess && "blur-sm select-none"
                          )}
                        >
                          <PrivateData
                            value={veiculo.passageiros}
                            type="number"
                          />{" "}
                          passageiros
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(veiculo.percentual)}
                        className="h-2 bg-gray-100 rounded-full"
                        indicatorClassName="bg-blue-400 rounded-full"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum veículo cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
