import { CobrancaStatus } from "@/types/enums";
import { checkCobrancaEmAtraso } from "./cobranca";
import { getStartOfDayBR, getNowBR, differenceInCalendarDaysBR } from "../dateUtils";

export const getStatusText = (status: string, dataVencimento?: string) => {
  if (status === CobrancaStatus.CANCELADA) {
    return "Cancelada";
  }

  if (status === CobrancaStatus.PAGO) {
    return "Pago";
  }

  if (!dataVencimento) {
    return "Pendente";
  }

  const vencimento = getStartOfDayBR(dataVencimento);
  const hoje = getStartOfDayBR();

  const diffDays = differenceInCalendarDaysBR(hoje, vencimento);

  if (vencimento < hoje) {
    return "Em atraso";
  } else if (diffDays === 0) {
    return "Vence hoje";
  }

  return "Pendente";
};

export const getStatusColor = (status: string, dataVencimento?: string) => {
  if (status === CobrancaStatus.CANCELADA) {
    return "bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]";
  }

  if (status === CobrancaStatus.PAGO) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
  }

  if (!dataVencimento) {
    return "bg-amber-50 text-amber-700 border border-amber-200/60";
  }

  if (checkCobrancaEmAtraso(dataVencimento)) {
    return "bg-red-50 text-[#e7000b] border border-red-200/60";
  }

  const diffDays = differenceInCalendarDaysBR(getNowBR(), dataVencimento);

  if (diffDays === 0) {
    return "bg-orange-50 text-orange-700 border border-orange-200/60";
  }

  return "bg-amber-50 text-amber-700 border border-amber-200/60";
};

