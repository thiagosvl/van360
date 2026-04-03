import { formatDateToBR, formatFirstName, formatShortName, getMesNome } from "./formatters";

interface CobrancaWhatsAppParams {
  telefoneResponsavel: string;
  nomeResponsavel: string;
  nomePassageiro: string;
  mes: number;
  valor: number;
  dataVencimento: string;
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
    `Oi ${primeiroNomeResp}! Passando para lembrar da mensalidade de *${nomePassageiro}* 🚌`,
    ``,
    `📅 *Mês:* ${mesNome}`,
    `💰 *Valor:* ${valorFormatado}`,
    `📆 *Vencimento:* ${vencimento}`,
  ].join("\n");

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
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

  const mensagem = [
    `Segue o link para visualização e assinatura do contrato digital:`,
    ``,
    `${link}`,
  ].join("\n");

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}
