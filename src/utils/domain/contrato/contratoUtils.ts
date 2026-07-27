import { ContratoStatus } from "@/types/enums";

export interface ContratoDocumentoLike {
  status?: string | ContratoStatus | null;
  status_contrato?: string | ContratoStatus | null;
  contrato_status?: string | ContratoStatus | null;
  minuta_url?: string | null;
  contrato_final_url?: string | null;
  contrato_url?: string | null;
}

export function obterUrlDocumentoContrato(item?: ContratoDocumentoLike | null): string | null {
  if (!item) return null;

  const rawStatus = (item.status || item.status_contrato || item.contrato_status || "")
    .toString()
    .toLowerCase();

  const isAssinado = rawStatus === ContratoStatus.ASSINADO || rawStatus === "assinado";
  const isPendente = rawStatus === ContratoStatus.PENDENTE || rawStatus === "pendente";

  if (isAssinado) {
    return item.contrato_final_url || item.minuta_url || item.contrato_url || null;
  }

  if (isPendente) {
    return item.minuta_url || item.contrato_final_url || item.contrato_url || null;
  }

  return item.contrato_final_url || item.minuta_url || item.contrato_url || null;
}
