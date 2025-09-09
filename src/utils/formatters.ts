export const formatDate = (date: string | Date) => {
  const d = new Date(date + "T00:00:00");
  return d;
};

export const formatDateToBR = (date: string | Date): string => {
  const newDate = new Date(date + "T00:00:00");
  return newDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatProfile = (profile: string): string => {
  if (profile === "admin") {
    return "Admin";
  }
  return "Motorista";
};

// --- NOVA FUNÇÃO ADICIONADA ---
/**
 * Formata uma data (string ISO ou objeto Date) para o padrão brasileiro.
 * @param date A data a ser formatada.
 * @param options Opções de formatação.
 * @param options.includeTime Se verdadeiro, inclui a hora e os minutos (hh:mm). O padrão é falso.
 * @returns A data formatada como string.
 */
export const formatDateTimeToBR = (
  date: string | Date,
  options: { includeTime?: boolean } = {}
): string => {
  try {
    const dateObj = new Date(date);

    // Verifica se a data é válida
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
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};