export const formatPeriodo = (periodo: string): string => {
  if (periodo === "integral") return "Integral";
  if (periodo === "manha") return "Manhã";
  if (periodo === "tarde") return "Tarde";
  if (periodo === "noite") return "Noite";

  return "Não Identificado";
};

