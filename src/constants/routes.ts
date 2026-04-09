export const ROUTES = {
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/cadastro",
    EXTERNAL_PASSENGER_FORM: "/cadastro-passageiro/:motoristaId",
    SPLASH: "/splash",
    ROOT: "/",
    PRIVACY_POLICY: "/politica-de-privacidade",
    TERMS_OF_USE: "/termos-de-uso",
  },
  PRIVATE: {
    RESPONSAVEL: {
      ROOT: "/responsavel/*",
      HOME: "/responsavel/carteirinha",
      SELECT: "/responsavel/selecionar",
    },
    ADMIN: {
      ROOT: "/admin",
      DASHBOARD: "/admin/dashboard",
      SETTINGS: "/admin/configuracoes",
    },
    MOTORISTA: {
      HOME: "/inicio",
      PASSENGERS: "/passageiros",
      PASSENGER_DETAILS: "/passageiros/:passageiro_id",
      BILLING: "/mensalidades",
      SCHOOLS: "/escolas",
      VEHICLES: "/veiculos",
      EXPENSES: "/gastos",
      REPORTS: "/relatorios",
      CONTRACTS: "/contratos",
      SUBSCRIPTION: "/assinatura",
    }
  }
} as const;
