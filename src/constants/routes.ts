export const ROUTES = {
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/cadastro",
    EXTERNAL_PASSENGER_FORM: "/cadastro-passageiro/:motoristaId",
    SPLASH: "/splash",
    ROOT: "/",
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
    }
  }
} as const;
