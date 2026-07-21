export enum UserType {
  ADMIN = "admin",
  MOTORISTA = "motorista",
}

export enum ContractMultaTipo {
  PERCENTUAL = "percentual",
  FIXO = "fixo"
}

export enum CobrancaStatus {
  PAGO = "pago",
  PENDENTE = "pendente"
}

export enum CobrancaOrigem {
  MANUAL = "manual",
  AUTOMATICA = "automatica",
}

export enum WhatsappStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  OPEN = "open",
  CLOSE = "close",
  UNKNOWN = "UNKNOWN",
  NOT_FOUND = "NOT_FOUND"
}

export enum PixKeyStatus {
  VALIDADA = "VALIDADA",
  NAO_CADASTRADA = "NAO_CADASTRADA",
  FALHA_VALIDACAO = "FALHA_VALIDACAO",
  PENDENTE_VALIDACAO = "PENDENTE_VALIDACAO",
  INVALIDADA_POS_FALHA = "INVALIDADA_POS_FALHA"
}

export enum CobrancaTipoPagamento {
  DINHEIRO = "dinheiro",
  PIX = "PIX",
  TRANSFERENCIA = "transferencia",
  BOLETO = "boleto",
  CARTAO_CREDITO = "cartao-credito",
  CARTAO_DEBITO = "cartao-debito"
}

export enum PassageiroTab {
  PASSAGEIROS = "passageiros",
  SOLICITACOES = "solicitacoes",
}

export enum CobrancaTab {
  ARECEBER = "areceber",
  RECEBIDAS = "recebidas",
}

export enum ContratoTab {
  PENDENTES = "pendentes",
  ASSINADOS = "assinados",
  SEM_CONTRATO = "sem_contrato",
}

export enum RelatorioTab {
  VISAO_GERAL = "visao-geral",
  ENTRADAS = "entradas",
  SAIDAS = "saidas",
  OPERACIONAL = "operacional",
}

export enum FilterDefaults {
  TODOS = "todos",
  TODAS = "todas",
}

export enum PassageiroFormModes {
  CREATE = "create",
  EDIT = "edit",
  FINALIZE = "finalize"
}

export enum ContratoStatus {
  PENDENTE = "pendente",
  ASSINADO = "assinado",
  SUBSTITUIDO = "substituido"
}

export enum PassageiroModalidade {
  IDA_VOLTA = "ida_volta",
  IDA = "ida",
  VOLTA = "volta"
}

export enum PassageiroGenero {
  MASCULINO = "masculino",
  FEMININO = "feminino",
}

export enum ParentescoResponsavel {
  PAI = "pai",
  MAE = "mae",
  AVO = "avo",
  TIO = "tio",
  IRMAO = "irmao",
  PRIMO = "primo",
  PADRASTRO = "padrastro",
  MADRASTA = "madrasta",
  RESPONSAVEL_LEGAL = "responsavel_legal",
  OUTRO = "outro"
}

export enum PassageiroPeriodo {
  MANHA = "manha",
  TARDE = "tarde",
  NOITE = "noite",
  INTEGRAL = "integral"
}

export enum AtividadeEntidadeTipo {
  COBRANCA = "COBRANCA",
  PASSAGEIRO = "PASSAGEIRO",
  USUARIO = "USUARIO",
  GASTO = "GASTO",
  VEICULO = "VEICULO",
  ESCOLA = "ESCOLA",
  CONTRATO = "CONTRATO",
  SAAS_ASSINATURA = "SAAS_ASSINATURA",
  SAAS_FATURA = "SAAS_FATURA",
  BLOG_POST = "BLOG_POST",
}

export enum AtividadeAcao {
  COBRANCA_CRIADA = "COBRANCA_CRIADA",
  COBRANCA_EDITADA = "COBRANCA_EDITADA",
  COBRANCA_EXCLUIDA = "COBRANCA_EXCLUIDA",
  PAGAMENTO_MANUAL = "PAGAMENTO_MANUAL",
  PAGAMENTO_REVERTIDO = "PAGAMENTO_REVERTIDO",
  NOTIFICACAO_WHATSAPP = "NOTIFICACAO_WHATSAPP",
  CONFIG_LEMBRETE = "CONFIG_LEMBRETE",

  PASSAGEIRO_CRIADO = "PASSAGEIRO_CRIADO",
  PASSAGEIRO_EDITADO = "PASSAGEIRO_EDITADO",
  PASSAGEIRO_STATUS = "PASSAGEIRO_STATUS",
  PASSAGEIRO_EXCLUIDO = "PASSAGEIRO_EXCLUIDO",
  PRE_CADASTRO_CONCLUIDO = "PRE_CADASTRO_CONCLUIDO",

  CHAVE_PIX_ALTERADA = "CHAVE_PIX_ALTERADA",
  PERFIL_EDITADO = "PERFIL_EDITADO",
  CONTRATO_CONFIG_EDITADA = "CONTRATO_CONFIG_EDITADA",
  CONTRATO_GERADO = "CONTRATO_GERADO",
  CONTRATO_ASSINADO = "CONTRATO_ASSINADO",
  CONTRATO_EXCLUIDO = "CONTRATO_EXCLUIDO",
  USUARIO_SUSPENSO = "USUARIO_SUSPENSO",
  WHATSAPP_STATUS_ALTERADO = "WHATSAPP_STATUS_ALTERADO",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  SENHA_ALTERADA = "SENHA_ALTERADA",
  RECUPERACAO_SENHA = "RECUPERACAO_SENHA",

  GASTO_REGISTRADO = "GASTO_REGISTRADO",
  GASTO_EDITADO = "GASTO_EDITADO",
  GASTO_EXCLUIDO = "GASTO_EXCLUIDO",
  VEICULO_CRIADO = "VEICULO_CRIADO",
  VEICULO_EDITADO = "VEICULO_EDITADO",
  VEICULO_STATUS = "VEICULO_STATUS",
  VEICULO_EXCLUIDO = "VEICULO_EXCLUIDO",
  ESCOLA_CRIADA = "ESCOLA_CRIADA",
  ESCOLA_EDITADA = "ESCOLA_EDITADA",
  ESCOLA_STATUS = "ESCOLA_STATUS",
  ESCOLA_EXCLUIDA = "ESCOLA_EXCLUIDA",

  COBRANCAS_GERADAS = "COBRANCAS_GERADAS",

  SAAS_ASSINATURA_ATIVA = "SAAS_ASSINATURA_ATIVA",
  SAAS_ASSINATURA_CANCELADA = "SAAS_ASSINATURA_CANCELADA",
  SAAS_ASSINATURA_ATRASO = "SAAS_ASSINATURA_ATRASO",
  SAAS_ASSINATURA_EXPIRADA = "SAAS_ASSINATURA_EXPIRADA",
  SAAS_FATURA_GERADA = "SAAS_FATURA_GERADA",
  SAAS_PAGAMENTO_RECEBIDO = "SAAS_PAGAMENTO_RECEBIDO",
}

export enum GastoCategoria {
  COMBUSTIVEL = "combustivel",
  MANUTENCAO = "manutencao",
  IMPOSTOS = "impostos",
  MULTAS = "multas",
  LAVAGEM = "lavagem",
  ALIMENTACAO = "alimentacao",
  SEGURO = "seguro",
  OUTROS = "outros"
}

export enum ContratoProvider {
  INHOUSE = "inhouse",
  ASSINAFY = "assinafy",
  DOCUSIGN = "docusign"
}

export enum KPICardVariant {
  PRIMARY = "primary",
  OUTLINE = "outline"
}

export enum SubscriptionStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED"
}

export enum SubscriptionInvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELED = "CANCELED",
  FAILED = "FAILED"
}

export enum SubscriptionIdentifer {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY"
}

export enum IndicacaoStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

export enum CheckoutPaymentMethod {
  PIX = "pix",
  CREDIT_CARD = "credit_card"
}

export enum ConfigKey {
  PASSAGEIRO_DIAS_AVISO_VENCIMENTO = "PASSAGEIRO_DIAS_AVISO_VENCIMENTO",
  SAAS_DIAS_VENCIMENTO = "SAAS_DIAS_VENCIMENTO",
  SAAS_DIAS_CARENCIA = "SAAS_DIAS_CARENCIA",
  SAAS_DIAS_AVISO_TRIAL = "SAAS_DIAS_AVISO_TRIAL",
  SAAS_PROMOCAO_ATIVA = "SAAS_PROMOCAO_ATIVA",
  SAAS_MAX_TENTATIVAS_CARTAO = "SAAS_MAX_TENTATIVAS_CARTAO",
  SAAS_REFERRAL_BONUS_DAYS = "SAAS_REFERRAL_BONUS_DAYS",
  SAAS_REFERRAL_DISCOUNT_PCT = "SAAS_REFERRAL_DISCOUNT_PCT",
  SAAS_DIAS_ANTECEDENCIA_RENOVACAO = "SAAS_DIAS_ANTECEDENCIA_RENOVACAO",
}

export enum CanalAquisicao {
  INDICACAO = "INDICACAO",
  PANFLETO = "PANFLETO",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  TIKTOK = "TIKTOK",
  YOUTUBE = "YOUTUBE",
  GOOGLE = "GOOGLE",
  OUTROS = "OUTROS"
}

export enum BlogPostStatus {
  DRAFT = "draft",
  PUBLISHED = "published"
}

export enum BlogPageView {
  LIST = "list",
  CREATE = "create",
  EDIT = "edit"
}
