/**
 * Calcula uma data de vencimento segura, garantindo que o dia não exceda
 * o último dia do mês alvo (ex: dia 31 em Fevereiro vira dia 28/29).
 * 
 * Se o mês não for especificado e o dia já passou no mês atual, avança para o próximo mês.
 * 
 * @param day Dia alvo do vencimento
 * @param month Mês alvo (0-indexed, janeiro = 0). Default: mês atual ou próximo se dia já passou.
 * @param year Ano alvo. Default: ano atual.
 * @returns Date configurada para o dia válido mais próximo no futuro
 */
export function calculateSafeDueDate(day: number, month?: number, year?: number): Date {
  const today = new Date();
  let targetYear = year ?? today.getFullYear();
  let targetMonth = month ?? today.getMonth();

  // Se mês não foi especificado e dia já passou no mês atual, usar próximo mês
  if (month === undefined && day < today.getDate()) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  // Último dia do mês alvo
  // (dia 0 do próximo mês = último dia do mês atual)
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  // Se o dia solicitado for maior que o último dia do mês, usa o último dia
  const safeDay = Math.min(day, lastDayOfMonth);

  return new Date(targetYear, targetMonth, safeDay);
}
