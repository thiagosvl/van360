export const ROUTES = {
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/cadastro",
    NEW_PASSWORD: "/nova-senha",
    EXTERNAL_PASSENGER_FORM: "/cadastro-passageiro/:motoristaId",
    ROOT: "/",
  },
  PRIVATE: {
    RESPONSAVEL: {
        ROOT: "/responsavel/*",
        HOME: "/responsavel/carteirinha",
        SELECT: "/responsavel/selecionar",
    }, 
    ADMIN: {
        DASHBOARD: "/admin/dashboard",
    }, 
    MOTORISTA: {
      HOME: "/inicio",
      SUBSCRIPTION: "/assinatura",
      PASSENGERS: "/passageiros",
      PASSENGER_DETAILS: "/passageiros/:passageiro_id",
      PASSENGER_BILLING: "/cobrancas/:cobranca_id",
      BILLING: "/cobrancas",
      SCHOOLS: "/escolas",
      VEHICLES: "/veiculos",
      EXPENSES: "/gastos",
      REPORTS: "/relatorios",
    }
  }
} as const;
