import { CobrancaStatus } from "@/types/enums";
import { checkCobrancaEmAtraso } from "./cobranca";
import { formatDate } from "./date";

export const getStatusText = (status: string, dataVencimento: string) => {
  if (status === CobrancaStatus.PAGO) {
    return "Pago";
  }

  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (vencimento < hoje) {
    return "Em atraso";
  } else if (diffDays === 0) {
    return "Vence hoje";
  }

  return "Pendente";
};

export const getStatusColor = (status: string, dataVencimento: string) => {
  if (status === CobrancaStatus.PAGO) {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent shadow-sm";
  }

  if (checkCobrancaEmAtraso(dataVencimento)) {
    return "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm";
  }

  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);

  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200 shadow-sm";
  }

  return "bg-amber-50 text-amber-600 hover:bg-amber-100 border-transparent shadow-sm";
};

