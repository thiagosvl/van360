import { meses } from "./constants";

export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDate = (date: string | Date) => {
  if (date instanceof Date) {
    return date;
  }

  return new Date(`${date}T00:00:00`);
};

export const formatDateToBR = (date: string | Date): string => {
  const newDate = formatDate(date);
  return newDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTimeToBR = (
  date: string | Date,
  options: { includeTime?: boolean } = {}
): string => {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const formattedDate = dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (options.includeTime) {
      const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formattedDate} ${formattedTime}`;
    }

    return formattedDate;
  } catch (error) {
    return "Invalid Date";
  }
};

export const currentMonthInText = () => {
  const date = new Date();
  return meses[date.getMonth()];
};

export const getMesNome = (mes: number) => {
  const currentYear = new Date().getFullYear();
  const nomeMes = new Date(currentYear, mes - 1).toLocaleDateString("pt-BR", {
    month: "long",
  });
  return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
};

