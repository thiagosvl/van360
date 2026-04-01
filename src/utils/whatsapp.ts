import { formatDateToBR, formatFirstName, getMesNome } from "./formatters";

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
  const primeiroNomePas = formatFirstName(params.nomePassageiro);
  const mesNome = getMesNome(params.mes);
  const valorFormatado = Number(params.valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const vencimento = formatDateToBR(params.dataVencimento);

  const mensagem = [
    `Oi ${primeiroNomeResp}! Passando para lembrar da mensalidade de *${primeiroNomePas}* 🚌`,
    ``,
    `📅 *Mês:* ${mesNome}`,
    `💰 *Valor:* ${valorFormatado}`,
    `📆 *Vencimento:* ${vencimento}`,
    ``,
    `Qualquer dúvida, estou à disposição! 😊`,
  ].join("\n");

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}
