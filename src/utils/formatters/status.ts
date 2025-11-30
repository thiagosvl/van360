import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { checkCobrancaEmAtraso } from "./cobranca";
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
    return `Em atraso`;
  } else if (diffDays === 0) {
    return "Vence hoje";
  }

  return "A vencer";
};

export const getStatusColor = (status: string, dataVencimento: string) => {
  if (status === PASSAGEIRO_COBRANCA_STATUS_PAGO) {
    return "bg-green-100 text-green-800 hover:bg-green-200";
  }

  if (checkCobrancaEmAtraso(dataVencimento)) {
    return "bg-red-100 text-red-800 hover:bg-red-200";
  }

  // Verificar se vence hoje
  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);
  
  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Vence hoje: gradiente de laranja para vermelho (mais perceptível)
    return "bg-gradient-to-r from-white via-orange-100 to-red-200 text-orange-900 hover:from-white hover:via-orange-200 hover:to-red-300";
  }

  // A vencer: laranja
  return "bg-orange-100 text-orange-800 hover:bg-orange-200";
};

