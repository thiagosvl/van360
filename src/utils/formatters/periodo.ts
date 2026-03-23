import { PassageiroPeriodo } from "@/types/enums";

export const formatPeriodo = (periodo: string): string => {
  if (periodo === PassageiroPeriodo.INTEGRAL) return "Integral";
  if (periodo === PassageiroPeriodo.MANHA) return "Manhã";
  if (periodo === PassageiroPeriodo.TARDE) return "Tarde";
  if (periodo === PassageiroPeriodo.NOITE) return "Noite";

  return "Não Identificado";
};

export const periodos = Object.values(PassageiroPeriodo).map(value => ({
    value,
    label: formatPeriodo(value)
}));
