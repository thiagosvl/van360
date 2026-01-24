export enum UserType {
  ADMIN = "admin",
  MOTORISTA = "motorista",
  RESPONSAVEL = "responsavel",
  ESCOLA = "escola"
}

export enum CobrancaStatus {
  PAGO = "pago",
  PENDENTE = "pendente",
  CANCELADA = "cancelada"
}

export enum CobrancaOrigem {
  MANUAL = "manual",
  AUTOMATICA = "automatica",
}

export enum WhatsappStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  UNKNOWN = "UNKNOWN",
  NOT_FOUND = "NOT_FOUND"
}

export enum AssinaturaStatus {
  ATIVA = "ativa",
  TRIAL = "trial",
  SUSPENSA = "suspensa",
  PENDENTE_PAGAMENTO = "pendente_pagamento",
  CANCELADA = "cancelada"
}

export enum AssinaturaCobrancaStatus {
  PAGO = "pago",
  PENDENTE_PAGAMENTO = "pendente_pagamento",
  CANCELADA = "cancelada"
}

export enum AssinaturaBillingType {
  SUBSCRIPTION = "subscription",
  UPGRADE_PLAN = "upgrade_plan",
  UPGRADE = "upgrade",
  DOWNGRADE = "downgrade",
  ACTIVATION = "activation",
  EXPANSION = "expansion",
  RENEWAL = "renewal",
}

export enum PixKeyStatus {
  VALIDADA = "VALIDADA",
  NAO_CADASTRADA = "NAO_CADASTRADA",
  FALHA_VALIDACAO = "FALHA_VALIDACAO",
  PENDENTE_VALIDACAO = "PENDENTE_VALIDACAO"
}

export enum CobrancaTipoPagamento {
  DINHEIRO = "dinheiro",
  PIX = "pix",
  TRANSFERENCIA = "transferencia",
  BOLETO = "boleto",
  CARTAO = "cartao"
}

export enum PassageiroFormModes {
  CREATE = "create",
  EDIT = "edit",
  FINALIZE = "finalize"
}

export enum PlanSalesContext {
  UPGRADE = "upgrade",
  REGISTER = "register",
  EXPANSION = "expansion",
  UPGRADE_AUTO = "upgrade_auto",
  TRIAL_CONVERSION = "trial_conversion"
}