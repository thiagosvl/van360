import { meses } from "./constants";
import {
  parseLocalDate,
  formatSafeBrazilianDate,
  formatDateTime,
  getNowBR,
  toPersistenceString,
  differenceInCalendarDaysBR
} from "../dateUtils";

/**
 * Converte para string YYYY-MM-DD (persistência).
 */
export const toLocalDateString = (date: Date | string): string => {
  return toPersistenceString(date);
};

/**
 * Garante que temos um objeto Date válido no fuso de Brasília.
 */
export const formatDate = (date: string | Date): Date => {
  return parseLocalDate(date);
};

/**
 * Formata para DD/MM/YYYY.
 */
export const formatDateToBR = (date: string | Date): string => {
  return formatSafeBrazilianDate(date);
};

/**
 * Formata para data e opcionalmente hora.
 */
export const formatDateTimeToBR = (
  date: string | Date,
  options: { includeTime?: boolean } = {}
): string => {
  if (!date) return "-";
  if (options.includeTime) {
    return formatDateTime(date);
  }
  return formatSafeBrazilianDate(date);
};

/**
 * Retorna o nome do mês atual.
 */
export const currentMonthInText = () => {
  const now = getNowBR();
  return meses[now.getMonth()];
};

/**
 * Retorna o nome do mês formatado.
 */
export const getMesNome = (mes: number) => {
  const currentYear = getNowBR().getFullYear();
  // Cria uma data no dia 15 do mês para evitar problemas de fuso/virada
  const date = parseLocalDate(`${currentYear}-${mes.toString().padStart(2, '0')}-15`);
  const nomeMes = date.toLocaleDateString("pt-BR", {
    month: "long",
    timeZone: 'America/Sao_Paulo'
  });
  return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
};

/**
 * Formata o tempo relativo (há X min, etc).
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = getNowBR();
  const past = parseLocalDate(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Agora mesmo";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Há ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Há ${diffInHours} h`;
  }

  const diffInDays = differenceInCalendarDaysBR(now, past);
  if (diffInDays === 1) {
    return "Ontem";
  }
  if (diffInDays < 7) {
    return `Há ${diffInDays} dias`;
  }

  return formatSafeBrazilianDate(past);
};

/**
 * Calcula e formata dias de atraso.
 */
export const formatDiasAtraso = (dataVencimento: string): string => {
  if (!dataVencimento) return "";
  const hoje = getNowBR();
  const dias = differenceInCalendarDaysBR(hoje, dataVencimento);

  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Venceu ontem";
  if (dias < 0) return `Vence em ${Math.abs(dias)} dias`;
  return `Vencido há ${dias} dias`;
};

/**
 * Converte DD/MM/YYYY para YYYY-MM-DD.
 */
export const convertDateBrToISO = (dateBr: string): string => {
  if (!dateBr || dateBr.length !== 10) return "";
  const [day, month, year] = dateBr.split("/");
  return `${year}-${month}-${day}`;
};
