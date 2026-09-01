export enum UserType {
  ADMIN = "admin",
  MOTORISTA = "motorista",
  MOTORISTA_AUXILIAR = "motorista_auxiliar",
  MONITOR = "monitor",
  RESPONSAVEL = "responsavel",
}

export enum TipoResponsavel {
  PRINCIPAL = "principal",
  ADICIONAL = "adicional",
}

export enum PushNotificationAction {
  OPEN_HOME = "OPEN_HOME",
  OPEN_SUBSCRIPTION = "OPEN_SUBSCRIPTION",
  OPEN_CONTRACTS = "OPEN_CONTRACTS",
  OPEN_ROUTE = "OPEN_ROUTE",
  OPEN_TEAM = "OPEN_TEAM",
  OPEN_BILLING = "OPEN_BILLING",
  OPEN_PASSENGERS = "OPEN_PASSENGERS",
  OPEN_SCHOOLS = "OPEN_SCHOOLS",
  OPEN_VEHICLES = "OPEN_VEHICLES",
  OPEN_EXPENSES = "OPEN_EXPENSES",
  OPEN_REPORTS = "OPEN_REPORTS",
  OPEN_SETTINGS = "OPEN_SETTINGS",
  OPEN_BIRTHDAYS = "OPEN_BIRTHDAYS",
  OPEN_PASSENGER_REQUESTS = "OPEN_PASSENGER_REQUESTS",
  OPEN_TRACKING = "OPEN_TRACKING"
}

export enum ContractMultaTipo {
  PERCENTUAL = "percentual",
  FIXO = "fixo"
}

export enum CobrancaStatus {
  PAGO = "pago",
  PENDENTE = "pendente",
  CANCELADA = "cancelada",
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

export enum WabaTemplateNameEnum {
  PAIS_VENCIMENTO_PROXIMO = "van360_pais_vencimento_proximo",
  PAIS_VENCIMENTO_PROXIMO_PIX = "van360_pais_vencimento_proximo_pix",
  PAIS_VENCIMENTO_PROXIMO_SEM_PIX = "van360_pais_vencimento_proximo_sem_pix",
  PAIS_VENCIMENTO_HOJE = "van360_pais_vencimento_hoje",
  PAIS_VENCIMENTO_HOJE_PIX = "van360_pais_vencimento_hoje_pix",
  PAIS_VENCIMENTO_HOJE_SEM_PIX = "van360_pais_vencimento_hoje_sem_pix",
  PAIS_ATRASADO = "van360_pais_atrasado",
  PAIS_ATRASADO_PIX = "van360_pais_atrasado_pix",
  PAIS_ATRASADO_SEM_PIX = "van360_pais_atrasado_sem_pix",
  PAIS_RECIBO = "van360_pais_recibo",
  PAIS_CONTRATO = "van360_pais_contrato",
  MOTORISTA_RENOVACAO_PIX = "van360_motorista_renovacao_pix",
  MOTORISTA_FALHA_CARTAO = "van360_motorista_falha_cartao",
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

export enum DriverContractConfigStatus {
  NAO_CONFIGURADO = "NAO_CONFIGURADO",
  ATIVO = "ATIVO",
  DESATIVADO = "DESATIVADO"
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
  ROTA = "ROTA",
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
  CONTRATO_IMPORTADO = "CONTRATO_IMPORTADO",
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
  ROTA_CRIADA = "ROTA_CRIADA",
  ROTA_EDITADA = "ROTA_EDITADA",
  ROTA_EXCLUIDA = "ROTA_EXCLUIDA",
  ROTA_INICIADA = "ROTA_INICIADA",
  ROTA_CONCLUIDA = "ROTA_CONCLUIDA",
  ROTA_CANCELADA = "ROTA_CANCELADA",

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
  DOCUSIGN = "docusign",
  IMPORTADO = "importado"
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
  APP_ANDROID_MIN_VERSION = "app_android_min_version",
  APP_ANDROID_LATEST_VERSION = "app_android_latest_version",
  APP_ANDROID_UPDATE_TITLE = "app_android_update_title",
  APP_ANDROID_UPDATE_MESSAGE = "app_android_update_message",
}

export enum CanalAquisicao {
  PLAY_STORE = "PLAY_STORE",
  APP_STORE = "APP_STORE",
  INDICACAO = "INDICACAO",
  PANFLETO = "PANFLETO",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  TIKTOK = "TIKTOK",
  YOUTUBE = "YOUTUBE",
  GOOGLE = "GOOGLE",
  OUTROS = "OUTROS"
}

export enum DispositivoCadastro {
  APP_ANDROID = "APP_ANDROID",
  APP_IOS = "APP_IOS",
  WEB_MOBILE_ANDROID = "WEB_MOBILE_ANDROID",
  WEB_MOBILE_IOS = "WEB_MOBILE_IOS",
  WEB_DESKTOP = "WEB_DESKTOP",
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

export enum StatusFilter {
  ALL = "all",
  ACTIVE = "active",
  INACTIVE = "inactive",
  INCOMPLETE = "incomplete",
}

export enum AdminUserTab {
  GERAL = "geral",
  DADOS = "dados",
  COBRANCAS = "cobrancas",
  LOGS = "logs",
  CADASTROS = "cadastros",
}

export enum AdminUserSubTab {
  PASSAGEIROS = "passageiros",
  VEICULOS = "veiculos",
  ESCOLAS = "escolas",
  SOLICITACOES = "solicitacoes",
  CONTRATOS = "contratos",
  INDICACOES = "indicacoes",
}

export enum TipoChavePix {
  CPF = "CPF",
  CNPJ = "CNPJ",
  TELEFONE = "TELEFONE",
  EMAIL = "EMAIL",
  EVP = "EVP",
  ALEATORIA = "ALEATORIA",
}

export enum GastoTipoCalculoParcela {
  TOTAL = "total",
  PARCELA = "parcela",
}

export enum GastoEscopoAcao {
  UNICA = "unica",
  FUTURAS = "futuras",
  TODAS = "todas",
}

export enum RouteBroadcastEvent {
  ROUTE_EXECUTION_CHANGED = "route_execution_changed",
  ROUTE_DEFINITION_CHANGED = "route_definition_changed",
  STOP_STATUS_CHANGED = "stop_status_changed",
  ABSENCE_CHANGED = "absence_changed"
}

export enum RoutePermission {
  VISUALIZAR = "rotas.visualizar",
  CRIAR_EDITAR = "rotas.criar_editar",
  EXCLUIR = "rotas.excluir",
  INICIAR_ENCERRAR = "rotas.iniciar_encerrar",
  EXECUTAR_PARADAS = "rotas.executar_paradas"
}

export enum AppPermissionStatus {
  GRANTED = "granted",
  DENIED = "denied",
  PROMPT = "prompt",
  UNAVAILABLE = "unavailable",
}

export enum PermissionRescueType {
  PUSH = "push",
  LOCATION = "location",
  BOTH = "both",
}

