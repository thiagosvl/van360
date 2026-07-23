import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";

export interface ProjectionContextParams {
  passageiro: Passageiro;
  driverCreatedAt?: string | null;
  targetMonth: number;
  targetYear: number;
}

/**
 * Extrai ano e mês (1-indexed) de uma string de data (YYYY-MM-DD ou ISO).
 */
export function parseMonthYearFromDateString(dateStr?: string | null): { year: number; month: number } | null {
  if (!dateStr) return null;

  // Trata formato YYYY-MM ou YYYY-MM-DD diretamente sem problemas de timezone GMT
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        return { year, month };
      }
    }
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
}

/**
 * Verifica se o passageiro possui cadastro incompleto (sem valor de cobrança definido).
 */
export function isPassageiroIncompleto(passageiro?: Partial<Passageiro> | null): boolean {
  if (!passageiro) return false;
  return !passageiro.valor_cobranca || Number(passageiro.valor_cobranca) <= 0;
}

/**
 * Valida se um passageiro deve gerar cobrança projetada (virtual) para um mês/ano alvo.
 * 
 * Regras Globais:
 * 1. Passageiro ativo !== false.
 * 2. Mês/Ano alvo >= Mês/Ano de Início da Cobrança:
 *    - Prioridade 1: data_inicio_cobranca do passageiro.
 *    - Prioridade 2 (Fallback): created_at do passageiro.
 *    - Prioridade 3 (Fallback): driverCreatedAt (Data de cadastro do motorista).
 * 3. Mês/Ano alvo <= Mês/Ano de Término da Cobrança:
 *    - Somente se data_fim_cobranca do passageiro estiver preenchida.
 */
export function shouldGeneratePassengerProjection({
  passageiro,
  driverCreatedAt,
  targetMonth,
  targetYear,
}: ProjectionContextParams): boolean {
  // 1. Deve estar ativo
  if (passageiro.ativo === false) {
    return false;
  }

  // 2. Validação do Mês/Ano de Início da Cobrança
  const inicioStr = passageiro.data_inicio_cobranca || passageiro.created_at || driverCreatedAt;
  const inicio = parseMonthYearFromDateString(inicioStr);
  if (inicio) {
    if (targetYear < inicio.year || (targetYear === inicio.year && targetMonth < inicio.month)) {
      return false;
    }
  }

  // 3. Validação do Mês/Ano de Término da Cobrança
  if (passageiro.data_fim_cobranca) {
    const fim = parseMonthYearFromDateString(passageiro.data_fim_cobranca);
    if (fim) {
      if (targetYear > fim.year || (targetYear === fim.year && targetMonth > fim.month)) {
        return false;
      }
    }
  }

  return true;
}

export interface AvailableRetroactiveMonthsParams {
  passageiro?: Passageiro | null;
  cobrancas?: Cobranca[];
  driverCreatedAt?: string | null;
  currentMonth: number;
  currentYear: number;
}

/**
 * Retorna a lista de meses (1-indexed) retroativos do ano atual pendentes de registro.
 * 
 * Regras Unificadas:
 * 1. Janela retroativa: Sempre de Janeiro (mês 1) até o mês anterior ao atual (currentMonth - 1).
 * 2. Exclusão: Ignora meses que já possuem cobrança real gravada no banco de dados.
 */
export function getAvailableRetroactiveMonths({
  passageiro,
  cobrancas = [],
  currentMonth,
}: AvailableRetroactiveMonthsParams): number[] {
  if (!passageiro) return [];

  const startMonth = 1; // Janeiro
  const endMonth = currentMonth - 1; // Mês anterior ao atual

  if (startMonth > endMonth) {
    return []; // Em Janeiro (mês 1), não há meses retroativos no ano
  }

  // Filtrar meses do passado que já possuem cobrança real gravada no banco
  const existingMesesSet = new Set(
    cobrancas.filter((c) => !c.isProjection).map((c) => c.mes)
  );

  const available: number[] = [];
  for (let m = startMonth; m <= endMonth; m++) {
    if (!existingMesesSet.has(m)) {
      available.push(m);
    }
  }

  return available;
}
