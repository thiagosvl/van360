import { BASE_DOMAIN, TRIAL_DURATION_DAYS } from "@/constants";
import { TipoChavePix, TIPOS_CHAVE_PIX_LABEL } from "@/types/pix";
import { PLAY_STORE_URL } from "@/utils/detectPlatform";
import { formatDateToBR, formatFirstName, formatShortName } from "@/utils/formatters";

export interface CobrancaWhatsAppParams {
  telefoneResponsavel: string;
  nomeResponsavel: string;
  nomePassageiro: string;
  mes: number;
  valor: number;
  dataVencimento: string;
  chavePix?: string | null;
  tipoChavePix?: string | null;
}

export interface ContratoWhatsAppParams {
  telefoneResponsavel: string;
  nomeResponsavel: string;
  nomePassageiro: string;
  link: string;
}

export interface ResponsavelAppInviteParams {
  telefoneResponsavel: string;
  nomeResponsavel: string;
  nomePassageiro: string;
  appAndroidLink?: string;
  webLoginLink?: string;
}

export function cleanWhatsAppPhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function buildWhatsAppUrl(phone?: string | null, message?: string): string {
  const cleanPhone = cleanWhatsAppPhone(phone);
  const encodedText = message ? encodeURIComponent(message) : "";

  if (cleanPhone) {
    return encodedText
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/${cleanPhone}`;
  }

  return encodedText ? `https://wa.me/?text=${encodedText}` : "https://wa.me/";
}

export function buildPrePassageiroShareMessage(link: string): string {
  return [
    "Olá! Tudo bem? 🚐✨",
    "",
    "Para trazer mais conforto, agilidade e segurança para o transporte do seu filho(a), estamos utilizando o aplicativo *Van360*.",
    "",
    "Por favor, acesse o link abaixo para preencher o cadastro do aluno(a). Leva menos de 2 minutinhos:",
    "",
    "📲 *Link de cadastro:*",
    link,
    "",
    "Qualquer dúvida, estou à disposição!"
  ].join("\n");
}

export function buildReferralShareMessage(
  referralLink: string,
  trialDays: number = TRIAL_DURATION_DAYS
): string {
  return [
    "Olá! Tudo bem? 🚐💨",
    "",
    "Estou usando o aplicativo Van360 no transporte escolar e me tirou um peso enorme das costas:",
    "",
    "💸 *Não precisa cobrar os pais:* o app envia lembretes e cobranças automáticas no WhatsApp já com a chave Pix, sem constrangimento.",
    "",
    "📊 *Saber o lucro real da van:* controle de quem pagou, quem deve e gastos do mês na hora.",
    "",
    "🪪 *Carteirinha dos alunos:* contatos dos pais, da escola, dados de emergência e controle de recebimentos das parcelas na palma da mão.",
    "",
    "✍️ *Chega de papelada:* contratos assinados direto pelo celular pelos pais, sem cartório.",
    "",
    "📍 *Rotas e avisos:* paradas organizadas e os pais acompanham a van em tempo real.",
    "",
    "👨‍👩‍👧 *App para os pais:* eles avisam faltas do filho e acessam contratos e recibos sozinhos.",
    "",
    `Você tem *${trialDays} dias grátis* para testar e, pelo meu convite, ganha *desconto exclusivo* na primeira mensalidade!`,
    "",
    "📲 *Acesse pelo link para garantir seu desconto:*",
    referralLink,
    "",
    "Bora simplificar o dia a dia da van!"
  ].join("\n");
}

export function buildCobrancaWhatsAppMessage(params: CobrancaWhatsAppParams): string {
  const primeiroNomeResp = formatFirstName(params.nomeResponsavel);
  const nomePassageiro = formatShortName(params.nomePassageiro, true);
  const valorFormatado = Number(params.valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const vencimento = formatDateToBR(params.dataVencimento);

  const linhas = [
    `Olá, ${primeiroNomeResp}! Tudo bem? 🚐`,
    "",
    `Passando para lembrar sobre a mensalidade do transporte escolar de *${nomePassageiro}*.`,
    "",
    "📋 *Detalhes do pagamento:*",
    `• Valor: *${valorFormatado}*`,
    `• Vencimento: *${vencimento}*`,
  ];

  if (params.chavePix) {
    const labelTipo = params.tipoChavePix
      ? TIPOS_CHAVE_PIX_LABEL[params.tipoChavePix as TipoChavePix] || params.tipoChavePix
      : "Chave";
    linhas.push("");
    linhas.push("💳 *Chave Pix para pagamento:*");
    linhas.push(`${labelTipo}: ${params.chavePix}`);
  }

  linhas.push("");
  linhas.push("Qualquer dúvida ou caso já tenha efetuado o pagamento, fico à disposição!");

  return linhas.join("\n");
}

export function buildCobrancaWhatsAppUrl(params: CobrancaWhatsAppParams): string {
  const mensagem = buildCobrancaWhatsAppMessage(params);
  return buildWhatsAppUrl(params.telefoneResponsavel, mensagem);
}

export function buildContratoWhatsAppMessage(params: ContratoWhatsAppParams): string {
  const primeiroNomeResp = formatFirstName(params.nomeResponsavel);
  const primeiroNomePassageiro = formatFirstName(params.nomePassageiro);

  return [
    `Olá, ${primeiroNomeResp}! Tudo bem? 🚐📄`,
    "",
    `O contrato de prestação de serviços do transporte escolar de *${primeiroNomePassageiro}* já está disponível.`,
    "",
    "A assinatura é 100% digital, segura e leva menos de 1 minuto pelo celular:",
    "",
    "✍️ *Toque no link para ler e assinar:*",
    params.link,
    "",
    "Se tiver qualquer dúvida, estou à disposição!"
  ].join("\n");
}

export function buildContratoWhatsAppUrl(params: ContratoWhatsAppParams): string {
  const mensagem = buildContratoWhatsAppMessage(params);
  return buildWhatsAppUrl(params.telefoneResponsavel, mensagem);
}

export function buildResponsavelAppInviteMessage(params: ResponsavelAppInviteParams): string {
  const respNome = formatFirstName(params.nomeResponsavel);
  const passNome = formatFirstName(params.nomePassageiro);
  const appAndroidLink = params.appAndroidLink || PLAY_STORE_URL;
  const webLoginLink = params.webLoginLink || `${BASE_DOMAIN}/login`;

  return [
    `Olá, ${respNome}! Tudo bem? 🚐🎒`,
    "",
    `Convido você a acompanhar a rotina escolar de *${passNome}* pelo aplicativo *Van360*.`,
    "",
    "Com o app, você tem mais tranquilidade e praticidade:",
    "• Acompanhe o transporte escolar em tempo real",
    "• Receba avisos importantes da rota",
    "• Acesse contratos e mensalidades com facilidade",
    "",
    "📲 *Baixe o app para Android:*",
    appAndroidLink,
    "",
    "🌐 *Ou acesse diretamente pelo navegador:*",
    webLoginLink,
    "",
    "Estou à disposição para ajudar no acesso!"
  ].join("\n");
}

export function buildResponsavelAppInviteUrl(params: ResponsavelAppInviteParams): string {
  const mensagem = buildResponsavelAppInviteMessage(params);
  return buildWhatsAppUrl(params.telefoneResponsavel, mensagem);
}
