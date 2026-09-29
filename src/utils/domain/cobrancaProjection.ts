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
 * Retorna uma string YYYY-MM-DD segura para o vencimento projetado de um mês/ano,
 * ajustando o dia para o último dia do mês caso o mês seja menor (ex: dia 31 em Fev -> 28).
 */
export function getSafeDueDateString(diaVencimento: number | null | undefined, month: number, year: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  const rawDia = Number(diaVencimento || 10);
  const diaFinal = Math.min(rawDia, lastDay);
  const mesStr = String(month).padStart(2, "0");
  const diaStr = String(diaFinal).padStart(2, "0");
  return `${year}-${mesStr}-${diaStr}`;
}

/**
 * Verifica se o passageiro possui cadastro incompleto (sem valor de cobrança definido).
 */
export function isPassageiroIncompleto(passageiro?: Partial<Passageiro> | null): boolean {
  if (!passageiro || passageiro.isento === true) return false;
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
  // 1. Deve estar ativo e NÃO ser isento
  if (passageiro.ativo === false || passageiro.isento === true) {
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
import { CobrancaStatus } from "@/types/enums";

export function getAvailableRetroactiveMonths({
  passageiro,
  cobrancas = [],
  driverCreatedAt,
  currentMonth,
  currentYear,
}: AvailableRetroactiveMonthsParams): number[] {
  if (!passageiro || passageiro.isento === true) return [];

  const existingActiveMesesSet = new Set(
    cobrancas.filter((c) => !c.isProjection && c.status !== CobrancaStatus.CANCELADA).map((c) => c.mes)
  );

  const available: number[] = [];

  const inicioStr = passageiro.data_inicio_cobranca || passageiro.created_at || driverCreatedAt;
  const inicio = parseMonthYearFromDateString(inicioStr);

  let startMonth = 1;
  if (inicio) {
    if (inicio.year > currentYear) {
      startMonth = 13;
    } else if (inicio.year === currentYear) {
      startMonth = Math.max(1, inicio.month);
    }
  }

  let endMonth = currentMonth - 1;
  if (passageiro.data_fim_cobranca) {
    const fim = parseMonthYearFromDateString(passageiro.data_fim_cobranca);
    if (fim) {
      if (fim.year < currentYear) {
        endMonth = 0;
      } else if (fim.year === currentYear) {
        endMonth = Math.min(currentMonth - 1, fim.month);
      }
    }
  }

  // 1. Meses passados dentro da vigência sem cobrança ativa
  for (let m = startMonth; m <= endMonth; m++) {
    if (!existingActiveMesesSet.has(m)) {
      available.push(m);
    }
  }

  // 2. Meses do ano atual com cobrança cancelada (para permitir revigoração)
  for (let m = 1; m <= 12; m++) {
    const isCancelada = cobrancas.some((c) => !c.isProjection && c.mes === m && c.status === CobrancaStatus.CANCELADA);
    if (isCancelada && !available.includes(m)) {
      available.push(m);
    }
  }

  return available.sort((a, b) => a - b);
}
