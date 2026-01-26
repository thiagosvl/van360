import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { periodos as periodosConstants } from "@/utils/formatters/constants";
import {
  ClipboardCheck,
  Cog,
  FileText,
  Fuel,
  HelpCircle,
  Wallet,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";

export const CATEGORIA_ICONS: Record<
  string,
  { icon: any; color: string; bg: string }
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
  Administrativa: {
    icon: Cog,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  Outros: { icon: HelpCircle, color: "text-gray-600", bg: "bg-gray-100" },
};

export const FORMAS_PAGAMENTO_LABELS: Record<
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



interface UseRelatoriosCalculationsProps {
  hasAccess?: boolean;
  cobrancasData: any;
  gastosData: any[];
  passageirosData: any;
  escolasData: any;
  veiculosData: any;
  profilePlano: any;
  profile: any;
  financeiro?: {
    receita: {
      realizada: number;
      prevista: number;
      taxa_recebimento: number;
    };
    saidas: {
      total: number;
      margem_operacional: number;
    };
    atrasos: {
      valor: number;
      count: number;
    };
    ticket_medio: number;
  };
}

  export const useRelatoriosCalculations = ({
  cobrancasData,
  gastosData,
  passageirosData,
  escolasData,
  veiculosData,
  profilePlano,
  profile,
  financeiro,
}: UseRelatoriosCalculationsProps) => {
  const dados = useMemo(() => {
    // 1. Safe guards for optional data
    const cobrancas = cobrancasData?.all || [];
    const cobrancasPagas = cobrancasData?.pagas || [];
    const cobrancasAbertas = cobrancasData?.abertas || [];
    const gastos = gastosData || [];
    const passageirosList = passageirosData?.list || [];
    const escolasList = (escolasData as any)?.list || [];
    const veiculosListFull = (veiculosData as any)?.list || [];

    // --- FINANCIAL CALCULATIONS (Depend on hasAccess implicitly via empty arrays above) ---

    // Visão Geral
    const recebido = financeiro?.receita.realizada ?? cobrancasPagas.reduce(
      (acc: number, c: any) => acc + Number(c.valor || 0),
      0
    );
    const gasto = financeiro?.saidas.total ?? gastos.reduce((acc: number, g: any) => acc + Number(g.valor || 0), 0);
    const lucroEstimado = recebido - gasto;

    // Atrasos
    const hoje = new Date();
    const atrasos = cobrancasAbertas.filter((c: any) => {
      const vencimento = new Date(c.data_vencimento);
      return vencimento < hoje;
    });
    const valorAtrasos = financeiro?.atrasos.valor ?? atrasos.reduce(
      (acc: number, c: any) => acc + Number(c.valor || 0),
      0
    );
    const atrasosCount = financeiro?.atrasos.count ?? atrasos.length;

    // Taxa de Recebimento
    const totalPrevisto = cobrancas.reduce(
      (acc: number, c: any) => acc + Number(c.valor || 0),
      0
    );
    const taxaRecebimento =
      financeiro?.receita.taxa_recebimento ?? (totalPrevisto > 0 ? (recebido / totalPrevisto) * 100 : 0);

    // Passageiros
    const passageirosCount = passageirosList.length;
    const passageirosAtivosCount = passageirosList.filter((p: any) => p.ativo).length;

    // Custo por Passageiro
    const custoPorPassageiro =
      passageirosAtivosCount > 0 ? gasto / passageirosAtivosCount : 0;

    // Entradas
    const passageirosPagantes = new Set(cobrancas.map((c: any) => c.passageiro_id))
      .size;
    const passageirosPagos = new Set(cobrancasPagas.map((c: any) => c.passageiro_id))
      .size;
    const ticketMedio = financeiro?.ticket_medio ?? (passageirosPagos > 0 ? recebido / passageirosPagos : 0);

    // Formas de pagamento
    const formasPagamentoMap: Record<string, { valor: number; count: number }> = {};
    cobrancasPagas.forEach((c: any) => {
      const tipo = c.tipo_pagamento?.toLowerCase() || "";
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
      gastos.map((g: any) => new Date(g.data).getDate())
    ).size;
    const mediaDiaria = diasComGastos > 0 ? gasto / diasComGastos : 0;
    const margemOperacional =
      financeiro?.saidas.margem_operacional ?? (recebido > 0 ? ((recebido - gasto) / recebido) * 100 : 0);

    // Categorias de gastos
    const veiculosMap: Record<
      string,
      { nome: string; placa: string; marca: string; modelo: string }
    > = {};
    
    veiculosListFull.forEach((v: any) => {
      veiculosMap[v.id] = {
        nome: `${v.marca} ${v.modelo}`,
        placa: formatarPlacaExibicao(v.placa),
        marca: v.marca,
        modelo: v.modelo,
      };
    });

    const categoriasMap: Record<
      string,
      { 
          valor: number; 
          count: number; 
          nome: string; 
          veiculos: Record<string, { valor: number; count: number }>;
      }
    > = {};
    
    gastos.forEach((g: any) => {
      const cat = g.categoria || "Outros";
      const veiculoId = g.veiculo_id || "outros";
      const valor = Number(g.valor || 0);

      if (!categoriasMap[cat]) {
        categoriasMap[cat] = { valor: 0, count: 0, nome: cat, veiculos: {} };
      }
      categoriasMap[cat].valor += valor;
      categoriasMap[cat].count += 1;

      if (!categoriasMap[cat].veiculos[veiculoId]) {
          categoriasMap[cat].veiculos[veiculoId] = { valor: 0, count: 0 };
      }
      categoriasMap[cat].veiculos[veiculoId].valor += valor;
      categoriasMap[cat].veiculos[veiculoId].count += 1;
    });

    const topCategorias = Object.values(categoriasMap)
      .sort((a, b) => b.valor - a.valor)
      .map((cat) => {
        const iconData = CATEGORIA_ICONS[cat.nome] || CATEGORIA_ICONS.Outros;
        const veiculos = Object.entries(cat.veiculos).map(([vId, data]) => {
             const info = veiculosMap[vId] || { nome: "Geral / Sem vínculo", placa: "-" };
             return {
                 id: vId,
                 nome: info.nome,
                 placa: info.placa,
                 valor: data.valor,
                 count: data.count
             };
        }).sort((a, b) => {
             if (a.id === "outros" || a.placa === "-") return 1;
             if (b.id === "outros" || b.placa === "-") return -1;
             return b.valor - a.valor;
        });

        return {
          nome: cat.nome,
          valor: cat.valor,
          count: cat.count,
          icon: iconData.icon,
          color: iconData.color,
          bg: iconData.bg,
          veiculos,
        };
      });

    // Gastos por Veículo
    const gastosPorVeiculoMap: Record<
      string,
      { valor: number; count: number; veiculoId: string }
    > = {};

    gastos.forEach((g: any) => {
      const veiculoId = g.veiculo_id || "outros";
      const valor = Number(g.valor || 0);

      if (!gastosPorVeiculoMap[veiculoId]) {
        gastosPorVeiculoMap[veiculoId] = { valor: 0, count: 0, veiculoId };
      }
      gastosPorVeiculoMap[veiculoId].valor += valor;
      gastosPorVeiculoMap[veiculoId].count += 1;
    });

    const gastosPorVeiculo = Object.values(gastosPorVeiculoMap)
      .map((item) => {
        const info = veiculosMap[item.veiculoId] || {
          nome: "Geral / Sem vínculo",
          placa: "-",
        };
        return {
          ...item,
          nome: info.nome,
          placa: info.placa,
          percentual: gasto > 0 ? (item.valor / gasto) * 100 : 0,
        };
      })
      .sort((a, b) => {
          if (a.veiculoId === "outros" || a.placa === "-") return 1;
          if (b.veiculoId === "outros" || b.placa === "-") return -1;
          return b.valor - a.valor;
      });

    const temGastosVinculados = gastosPorVeiculo.some(
      (v) => v.veiculoId !== "outros" && v.placa !== "-"
    );

    // --- OPERATIONAL DATA (METADATA - Visible even if restricted) ---

    // Escolas
    const totalPassageirosPorEscola = escolasList.reduce(
      (acc: number, e: any) => acc + (e.passageiros_ativos_count || 0),
      0
    );

    const escolas = escolasList
      .filter((e: any) => (e.passageiros_ativos_count || 0) > 0)
      .map((e: any) => {
        const valor = passageirosList
          .filter((p: any) => p.ativo && String(p.escola_id) === String(e.id))
          .reduce((acc: number, p: any) => acc + Number(p.valor_cobranca || 0), 0);

        return {
          nome: e.nome,
          passageiros: e.passageiros_ativos_count || 0,
          valor: valor,
          percentual:
            totalPassageirosPorEscola > 0
              ? ((e.passageiros_ativos_count || 0) /
                  totalPassageirosPorEscola) *
                100
              : 0,
        };
      })
      .sort((a: any, b: any) => b.passageiros - a.passageiros)
      .slice(0, 5);

    // Veículos (Lista Operacional)
    const totalPassageirosPorVeiculo = veiculosListFull.reduce(
      (acc: number, v: any) => acc + (v.passageiros_ativos_count || 0),
      0
    );

    const veiculos = veiculosListFull
      .filter((v: any) => (v.passageiros_ativos_count || 0) > 0)
      .map((v: any) => {
        const valor = passageirosList
          .filter((p: any) => p.ativo && String(p.veiculo_id) === String(v.id))
          .reduce((acc: number, p: any) => acc + Number(p.valor_cobranca || 0), 0);

        return {
          placa: formatarPlacaExibicao(v.placa),
          passageiros: v.passageiros_ativos_count || 0,
          valor: valor,
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
      .sort((a: any, b: any) => b.passageiros - a.passageiros)
      .slice(0, 5);

    // Períodos
    const periodosMap: Record<string, { count: number; valor: number }> = {};
    passageirosList
      .filter((p: any) => p.ativo)
      .forEach((p: any) => {
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

    // Automação
    const passageirosComAutomatica = passageirosList.filter(
      (p: any) => p.enviar_cobranca_automatica && p.ativo
    ).length;
    const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
    const limiteAutomatica =
      assinatura?.franquia_contratada_cobrancas ||
      profilePlano?.planoProfissional?.franquia_contratada_cobrancas ||
      50;

    return {
      visaoGeral: {
        lucroEstimado,
        recebido,
        gasto,
        custoPorPassageiro,
        atrasos: {
          valor: valorAtrasos,
          passageiros: atrasosCount,
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
        gastosPorVeiculo,
        veiculosCount: veiculosListFull.length,
        temGastosVinculados,
      },
      operacional: {
        passageirosCount,
        passageirosAtivosCount,
        escolas,
        periodos,
        veiculos,
      },
      automacao: {
        envios: passageirosComAutomatica,
        limite: limiteAutomatica,
      },
    };
  }, [
    cobrancasData,
    gastosData,
    passageirosData,
    escolasData,
    veiculosData,
    profilePlano,
    profile,
  ]);

  return dados;
};
