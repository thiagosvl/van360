/**
 * Calcula uma data de vencimento segura, garantindo que o dia não exceda
 * o último dia do mês alvo (ex: dia 31 em Fevereiro vira dia 28/29).
 * 
 * @param day Dia alvo do vencimento
 * @param month Mês alvo (0-indexed, janeiro = 0). Default: mês atual.
 * @param year Ano alvo. Default: ano atual.
 * @returns Date configurada para o dia válido mais próximo
 */
export function calculateSafeDueDate(day: number, month?: number, year?: number): Date {
  const today = new Date();
  const targetYear = year ?? today.getFullYear();
  const targetMonth = month ?? today.getMonth();

  // Último dia do mês alvo
  // (dia 0 do próximo mês = último dia do mês atual)
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  // Se o dia solicitado for maior que o último dia do mês, usa o último dia
  const safeDay = Math.min(day, lastDayOfMonth);

  const calculatedDate = new Date(targetYear, targetMonth, safeDay);

  return calculatedDate;
}

/**
 * Converte um objeto Date para uma string YYYY-MM-DD no fuso horário local.
 * Evita o erro de ISOString() que muda de dia às 21h.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}
