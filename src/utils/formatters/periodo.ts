export const formatPeriodo = (periodo: string): string => {
  if (periodo === "integral") return "Integral";
  if (periodo === "manha") return "Manhã";
  if (periodo === "almoco") return "Almoço";
  if (periodo === "tarde") return "Tarde";
  if (periodo === "noite") return "Noite";

  return "Pendente";
};

