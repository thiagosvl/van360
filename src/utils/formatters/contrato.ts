import { ContratoProvider, ContratoStatus } from "@/types/enums";

export const formatContratoStatus = (
  status?: ContratoStatus | string | null,
  provider?: ContratoProvider | string | null
): string => {
  if (provider === ContratoProvider.IMPORTADO) return "PDF Importado";
  if (status === ContratoStatus.ASSINADO) return "Assinado";
  if (status === ContratoStatus.PENDENTE) return "Não Assinado";

  return "Sem Contrato";
};