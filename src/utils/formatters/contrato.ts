import { ContratoStatus } from "@/types/enums";

export const formatContratoStatus = (status: string): string => {
  if (status === ContratoStatus.ASSINADO) return "Assinado";
  if (status === ContratoStatus.PENDENTE) return "Pendente";

  return "Sem Contrato";
};