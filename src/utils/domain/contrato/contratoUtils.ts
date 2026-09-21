import { ContratoStatus } from "@/types/enums";

export interface ContratoDocumentoLike {
  status?: string | ContratoStatus | null;
  status_contrato?: string | ContratoStatus | null;
  minuta_url?: string | null;
  contrato_final_url?: string | null;
  contrato_url?: string | null;
}

export function obterUrlDocumentoContrato(item?: ContratoDocumentoLike | null): string | null {
  if (!item) return null;

  const rawStatus = (item.status || item.status_contrato || "")
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

export function gerarNomeArquivoContrato(
  nomePassageiro?: string | null,
  ano?: number | string | null
): string {
  const anoFinal = ano || new Date().getFullYear();
  if (!nomePassageiro || !nomePassageiro.trim()) {
    return `contrato-${anoFinal}.pdf`;
  }

  const preposicoes = new Set(["de", "da", "do", "das", "dos", "e"]);
  const partes = nomePassageiro
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const nomesRelevantes = partes.filter((parte) => !preposicoes.has(parte));
  const selecionados = nomesRelevantes.slice(0, 2);

  const slug = selecionados.length > 0 ? selecionados.join("-") : partes.slice(0, 2).join("-");

  return slug ? `contrato-${slug}-${anoFinal}.pdf` : `contrato-${anoFinal}.pdf`;
}

