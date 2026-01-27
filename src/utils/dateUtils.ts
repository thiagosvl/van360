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

  // Normalizar "hoje" para 00:00:00 para comparação justa de datas
  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);

  // Se a data calculada for anterior a hoje, retorna hoje
  // Isso evita erro "data de vencimento menor que data atual" em APIs bancárias (Inter)
  if (calculatedDate < todayZero) {
    return todayZero;
  }

  return calculatedDate;
}
