export interface CobrancaCalcItem {
  valor?: number | string | null;
  status?: string | null;
}

export interface GastoCalcItem {
  valor?: number | string | null;
}

export interface FinancialReportSummary {
  totalReceitasPrevistas: number;
  totalReceitasRecebidas: number;
  totalReceitasPendentes: number;
  totalDespesas: number;
  lucroAtual: number;
  lucroEstimado: number;
  taxaRecebimento: number;
  porcentagemInadimplencia: number;
}

/**
 * Calcula o acumulado de receitas (previstas, realizadas e pendentes)
 */
export function calculateTotalReceitas(cobrancas: CobrancaCalcItem[] = []): {
  prevista: number;
  realizada: number;
  pendente: number;
} {
  let prevista = 0;
  let realizada = 0;
  let pendente = 0;

  for (const c of cobrancas) {
    const val = Number(c?.valor || 0);
    prevista += val;
    if (c?.status === "PAGO") {
      realizada += val;
    } else {
      pendente += val;
    }
  }

  return { prevista, realizada, pendente };
}

/**
 * Calcula o total de despesas a partir de uma lista de gastos
 */
export function calculateTotalDespesas(gastos: GastoCalcItem[] = []): number {
  return gastos.reduce((acc, g) => acc + Number(g?.valor || 0), 0);
}

/**
 * Calcula o lucro líquido (receita - despesas)
 */
export function calculateLucroLiquido(receita: number, despesas: number): number {
  return receita - despesas;
}

/**
 * Calcula a porcentagem de inadimplência (pendente / prevista * 100)
 */
export function calculatePorcentagemInadimplencia(
  pendente: number,
  prevista: number
): number {
  if (!prevista || prevista <= 0 || pendente <= 0) return 0;
  return Number(((pendente / prevista) * 100).toFixed(2));
}

/**
 * Calcula a taxa de recebimento (realizada / prevista * 100)
 */
export function calculateTaxaRecebimento(
  realizada: number,
  prevista: number
): number {
  if (!prevista || prevista <= 0) return 0;
  return Number(((realizada / prevista) * 100).toFixed(2));
}

/**
 * Calcula o resumo financeiro completo de relatórios
 */
export function calculateFinancialReport(
  cobrancas: CobrancaCalcItem[] = [],
  gastos: GastoCalcItem[] = []
): FinancialReportSummary {
  const { prevista, realizada, pendente } = calculateTotalReceitas(cobrancas);
  const despesas = calculateTotalDespesas(gastos);
  const lucroAtual = calculateLucroLiquido(realizada, despesas);
  const lucroEstimado = calculateLucroLiquido(prevista, despesas);
  const taxaRecebimento = calculateTaxaRecebimento(realizada, prevista);
  const porcentagemInadimplencia = calculatePorcentagemInadimplencia(pendente, prevista);

  return {
    totalReceitasPrevistas: prevista,
    totalReceitasRecebidas: realizada,
    totalReceitasPendentes: pendente,
    totalDespesas: despesas,
    lucroAtual,
    lucroEstimado,
    taxaRecebimento,
    porcentagemInadimplencia,
  };
}
