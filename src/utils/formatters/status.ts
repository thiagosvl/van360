import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { checkCobrancaJaVenceu } from "./cobranca";
import { formatDate } from "./date";

export const formatProfile = (profile: string): string => {
  if (profile === "admin") {
    return "Admin";
  }
  return "Motorista";
};

export const formatStatus = (origem: string): string => {
  if (origem === PASSAGEIRO_COBRANCA_STATUS_PAGO) {
    return "Pago";
  }
  return "Pendente";
};

export const getStatusText = (status: string, dataVencimento: string) => {
  if (status === PASSAGEIRO_COBRANCA_STATUS_PAGO) return "Pago";

  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (vencimento < hoje) {
    // return `Venceu há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    return `Venceu`;
  } else if (diffDays === 0) {
    return "Vence hoje";
  }

  return "A vencer";
};

export const getStatusColor = (status: string, dataVencimento: string) => {
  if (status === PASSAGEIRO_COBRANCA_STATUS_PAGO) return "bg-green-100 text-green-800 hover:bg-green-200";

  return checkCobrancaJaVenceu(dataVencimento)
    ? "bg-red-100 text-red-800 hover:bg-red-200"
    : "bg-orange-100 text-orange-800 hover:bg-orange-200";
};

