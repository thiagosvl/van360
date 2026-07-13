import { TIPOS_CHAVE_PIX_LABEL, TipoChavePix } from "@/types/pix";
import { formatDateToBR, formatFirstName, formatShortName, getMesNome } from "./formatters";

interface CobrancaWhatsAppParams {
  telefoneResponsavel: string;
  nomeResponsavel: string;
  nomePassageiro: string;
  mes: number;
  valor: number;
  dataVencimento: string;
  chavePix?: string | null;
  tipoChavePix?: string | null;
}

export function buildCobrancaWhatsAppUrl(params: CobrancaWhatsAppParams): string {
  const telefone = `55${params.telefoneResponsavel.replace(/\D/g, "")}`;
  const primeiroNomeResp = formatFirstName(params.nomeResponsavel);
  const nomePassageiro = formatShortName(params.nomePassageiro, true);
  const mesNome = getMesNome(params.mes);
  const valorFormatado = Number(params.valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const vencimento = formatDateToBR(params.dataVencimento);

  const mensagem = [
    `🗓️ *Parcela — ${nomePassageiro}*`,
    ``,
    `${primeiroNomeResp}, lembrete da parcela do transporte.`,
    ``,
    `🔹 Valor: *${valorFormatado}*`,
    `🔹 Vencimento: *${vencimento}*`,
  ];

  if (params.chavePix) {
    const labelTipo = params.tipoChavePix ? TIPOS_CHAVE_PIX_LABEL[params.tipoChavePix as TipoChavePix] || params.tipoChavePix : "Chave";
    mensagem.push(``);
    mensagem.push(`💳 *Pix para pagamento:*`);
    mensagem.push(`Chave (${labelTipo}): ${params.chavePix}`);
  }

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem.join("\n"))}`;
}

interface ContratoWhatsAppParams {
  telefoneResponsavel: string;
  nomeResponsavel: string;
  nomePassageiro: string;
  link: string;
}

export function buildContratoWhatsAppUrl(params: ContratoWhatsAppParams): string {
  const telefone = `55${params.telefoneResponsavel.replace(/\D/g, "")}`;
  const link = params.link;

  const primeiroNomeResp = formatFirstName(params.nomeResponsavel);
  const primeiroNomePassageiro = formatFirstName(params.nomePassageiro);

  const mensagem = [
    `📄 *Contrato de transporte disponível*`,
    ``,
    `${primeiroNomeResp}, o contrato de *${primeiroNomePassageiro}* está pronto para assinatura digital.`,
    ``,
    `👉 Assine aqui: ${link}`,
  ].join("\n");

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

export function formatWhatsappPurpose(purpose: string): string {
  if (purpose === "BULK") return "Massa (Lento)";
  if (purpose === "TRANSACTIONAL") return "Transacional (Rápido)";
  return purpose;
}
