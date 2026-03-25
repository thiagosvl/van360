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
