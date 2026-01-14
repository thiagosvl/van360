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