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

  const isAssinado = rawStatus === ContratoStatus.ASSINADO;
  const isPendente = rawStatus === ContratoStatus.PENDENTE;

  if (isAssinado) {
    return item.contrato_final_url || item.minuta_url || item.contrato_url || null;
  }

  if (isPendente) {
    return item.minuta_url || item.contrato_final_url || item.contrato_url || null;
  }

  return item.contrato_final_url || item.minuta_url || item.contrato_url || null;
}

export function substituirPlaceholdersContrato(
  texto?: string | null,
  dados?: Record<string, unknown> | null
): string {
  if (!texto) return "";
  if (!dados) return texto;

  return texto.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, chave: string) => {
    const valor = dados[chave];
    if (valor === null || valor === undefined) return "";
    return String(valor);
  });
}

