import { Fuel, HelpCircle, Wrench } from "lucide-react";

export const MOCK_DATA_NO_ACCESS_RELATORIOS = {
  visaoGeral: {
    lucroEstimado: 12500.0,
    recebido: 25000.0,
    gasto: 12500.0,
    custoPorPassageiro: 150.0,
    atrasos: {
      valor: 1200.0,
      passageiros: 4,
    },
    taxaRecebimento: 90.9,
  },
  entradas: {
    previsto: 28000.0,
    realizado: 25000.0,
    ticketMedio: 350.0,
    passageirosPagantes: 75,
    passageirosPagos: 68,
    formasPagamento: [
      { metodo: "Pix", valor: 12000, percentual: 48, color: "bg-emerald-500" },
      {
        metodo: "Dinheiro",
        valor: 5000,
        percentual: 20,
        color: "bg-green-500",
      },
      { metodo: "Cartão", valor: 8000, percentual: 32, color: "bg-teal-500" },
    ],
  },
  saidas: {
    total: 12500.0,
    margemOperacional: 50.0,
    mediaDiaria: 416.0,
    diasContabilizados: 30,
    custoPorPassageiro: 150.0,
    topCategorias: [
      {
        nome: "Combustível",
        valor: 4500,
        count: 12,
        icon: Fuel,
        color: "text-orange-600",
        bg: "bg-orange-100",
        veiculos: [
             { id: "1", nome: "Mercedes Sprinter", placa: "ABC-1234", valor: 2500, count: 6 },
             { id: "2", nome: "Renault Master", placa: "XYZ-5678", valor: 2000, count: 6 }
        ]
      },
      {
        nome: "Manutenção",
        valor: 2500,
        count: 2,
        icon: Wrench,
        color: "text-blue-600",
        bg: "bg-blue-100",
         veiculos: [
             { id: "1", nome: "Mercedes Sprinter", placa: "ABC-1234", valor: 2500, count: 2 }
        ]
      },
      {
        nome: "Outros",
        valor: 5500,
        count: 5,
        icon: HelpCircle,
        color: "text-gray-600",
        bg: "bg-gray-100",
         veiculos: [
             { id: "2", nome: "Renault Master", placa: "XYZ-5678", valor: 5500, count: 5 }
        ]
      },
    ],
    veiculosCount: 2,
  },
  operacional: {
    passageirosCount: 5,
    passageirosAtivosCount: 5,
    escolas: [
      { nome: "Colégio Objetivo", passageiros: 35, valor: 12250, percentual: 41 },
      {
        nome: "Escola Adventista",
        passageiros: 25,
        valor: 8750,
        percentual: 29,
      },
      { nome: "Colégio Anglo", passageiros: 25, valor: 8750, percentual: 29 },
    ],
    periodos: [
      { nome: "Manhã", passageiros: 45, valor: 15750, percentual: 53 },
      { nome: "Tarde", passageiros: 40, valor: 14000, percentual: 47 },
    ],
    veiculos: [
      {
        placa: "ABC-1234",
        passageiros: 45,
        valor: 15750,
        marca: "Mercedes",
        modelo: "Sprinter",
        percentual: 53,
      },
      {
        placa: "XYZ-5678",
        passageiros: 40,
        valor: 14000,
        marca: "Renault",
        modelo: "Master",
        percentual: 47,
      },
    ],
  },
  automacao: {
    envios: 25,
    limite: 50,
    tempoEconomizado: "8h",
  },
};

const today = new Date();
const daysAgo = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

export const MOCK_VEICULOS = [
  { id: "mock-v1", placa: "ABC-1234", nome: "Van Escolar 1" },
  { id: "mock-v2", placa: "EQB-4321", nome: "Van Executiva" },
];

export const MOCK_DATA_NO_ACCESS_GASTOS = {
  totalGasto: 12500.5,
  principalCategoriaData: {
    name: "Combustível",
    value: 4500.0,
    percentage: 36,
  },
  mediaDiaria: 416.68,
  gastos: [
    {
      id: "1",
      categoria: "Combustível",
      descricao: "Abastecimento Semanal",
      valor: 450.0,
      data: daysAgo(2),
      created_at: daysAgo(2),
      usuario_id: "mock",
      veiculo_id: "mock-v1",
    },
    {
      id: "2",
      categoria: "Manutenção",
      descricao: "Troca de Óleo",
      valor: 250.0,
      data: daysAgo(5),
      created_at: daysAgo(5),
      usuario_id: "mock",
      veiculo_id: "mock-v2",
    },
    {
      id: "3",
      categoria: "Salário",
      descricao: "Adiantamento Monitor",
      valor: 1200.0,
      data: daysAgo(8),
      created_at: daysAgo(8),
      usuario_id: "mock",
      veiculo_id: null,
    },
    {
      id: "4",
      categoria: "Vistorias",
      descricao: "Vistoria Semestral",
      valor: 150.0,
      data: daysAgo(12),
      created_at: daysAgo(12),
      usuario_id: "mock",
      veiculo_id: "mock-v1",
    },
    {
      id: "5",
      categoria: "Documentação",
      descricao: "Licenciamento Anual",
      valor: 350.0,
      data: daysAgo(15),
      created_at: daysAgo(15),
      usuario_id: "mock",
      veiculo_id: null,
    },
    {
      id: "6",
      categoria: "Combustível",
      descricao: "Abastecimento Extra",
      valor: 300.0,
      data: daysAgo(18),
      created_at: daysAgo(18),
      usuario_id: "mock",
      veiculo_id: "mock-v2",
    },
  ],
};
