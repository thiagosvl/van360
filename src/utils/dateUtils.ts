/**
 * Analisa uma data ou string de data e a ajusta para o fuso horário de Brasília,
 * mantendo o dia, mês e ano pretendidos sem o deslocamento UTC comum.
 */
export const parseLocalDate = (date: Date | string | null | undefined): Date => {
  if (!date) return new Date();
  
  if (typeof date === 'string') {
    // Caso 1: Apenas data YYYY-MM-DD (ex: nascimento, vencimento)
    // Forçamos para o meio do dia (12h) para evitar qualquer oscilação de fuso mudar o dia
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(`${date}T12:00:00-03:00`);
    }

    // Caso 2: String ISO completa ou parcial
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date();
    return parseLocalDate(d); 
  }
  
  // Caso 3: Objeto Date - Extraímos as partes reais segundo o fuso de SP
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23' // h23 garante range 0-23; hour12:false pode retornar "24" à meia-noite em alguns ambientes
  });
  
  const parts = formatter.formatToParts(date instanceof Date ? date : new Date(date));
  const p: Record<string, string> = {};
  parts.forEach(part => {
    p[part.type] = part.value;
  });
  
  return new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}-03:00`);
};

/**
 * Retorna a data e hora atual ajustada para Brasília.
 */
export const getNowBR = (): Date => {
  return parseLocalDate(new Date());
};

/**
 * Retorna o objeto Date representando o final do dia (23:59:59.999) no fuso de Brasília.
 */
export const getEndOfDayBR = (date?: Date | string | null): Date => {
  const d = date ? parseLocalDate(date) : getNowBR();
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Retorna o objeto Date representando o início do dia (00:00:00.000) no fuso de Brasília.
 */
export const getStartOfDayBR = (date?: Date | string | null): Date => {
  const d = date ? parseLocalDate(date) : getNowBR();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Converte um objeto Date para uma string YYYY-MM-DD no fuso horário de Brasília.
 * ESSENCIAL para evitar o erro de ISOString() que muda de dia às 21h.
 */
export const toPersistenceString = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Alias para compatibilidade legada.
 */
export const toLocalDateString = (date: Date | string | null | undefined): string => {
  return toPersistenceString(date);
};

/**
 * Formata para DD/MM/YYYY HH:mm forçando Brasília.
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(d);
};

/**
 * Formata uma data para o padrão brasileiro (DD/MM/YYYY) de forma segura.
 */
export function formatSafeBrazilianDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = parseLocalDate(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(d);
}

/**
 * Alias compacto para formatSafeBrazilianDate.
 */
export const formatLocalDate = formatSafeBrazilianDate;

/**
 * Retorna o nome do mês em português.
 */
export const getMonthNameBR = (monthNumber?: number): string => {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) return "";
  const names = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return names[monthNumber - 1];
};

/**
 * Adiciona dias a uma data de forma segura.
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Adiciona meses a uma data de forma segura.
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

/**
 * Verifica se a data fornecida é antes de "agora" em Brasília.
 */
export const isBeforeNowBR = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const target = typeof date === 'string' ? parseLocalDate(date) : date;
  return target.getTime() < getNowBR().getTime();
};

/**
 * Converte um objeto Date para uma string ISO completa com fuso de Brasília (-03:00).
 * ESSENCIAL para colunas TIMESTAMPTZ.
 */
export const toISODateTimeBR = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const d = parseLocalDate(date);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}-03:00`;
};

/**
 * Calcula uma data de vencimento segura para o fuso de Brasília.
 */
export function calculateSafeDueDate(day: number, month?: number, year?: number): Date {
  const today = getNowBR();
  const targetYear = year ?? today.getFullYear();
  const targetMonth = month !== undefined ? month : today.getMonth();

  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const safeDay = Math.min(day, lastDayOfMonth);

  return parseLocalDate(`${targetYear}-${(targetMonth + 1).toString().padStart(2, '0')}-${safeDay.toString().padStart(2, '0')}`);
}

/**
 * Retorna o número de dias em um determinado mês/ano no fuso de Brasília.
 * @param month Mês (1-12)
 * @param year Ano (YYYY)
 */
export const getDaysInMonthBR = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Calcula a diferença em dias de calendário entre duas datas (DataFinal - DataInicial).
 * Útil para contagens de "X dias restantes".
 */
export const differenceInCalendarDaysBR = (later: Date | string, earlier: Date | string): number => {
  const d1 = getStartOfDayBR(later);
  const d2 = getStartOfDayBR(earlier);
  
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

