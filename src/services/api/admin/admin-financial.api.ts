import { apiClient } from "../client";
import { CheckoutPaymentMethod } from "@/types/enums";

export interface ProjecaoMesValor {
  total: number;
  pix: number;
  cartao: number;
}

export interface AdminFinancialKpis {
  mrr: number;
  arr: number;
  receitaRealizadaMes: number;
  receitaRealizadaMesAnterior: number;
  projecaoProximoMes: ProjecaoMesValor;
  projecaoCaixaRealProximoMes: ProjecaoMesValor;
  taxaConversaoTrial: number;
  trialsAtivosCount: number;
  trialsReceitaPotencial: number;
  totalAssinantesAtivos: number;
  totalMensais: number;
  totalAnuais: number;
  totalVitalicios: number;
  previsaoFechamentoMes: number;
}

export interface Projecao12MesesItem {
  chaveMes: string;
  labelMes: string;
  mensal: number;
  anual: number;
  mensalCaixa: number;
  anualCaixa: number;
  trialPotencial: number;
  totalVencimento: number;
  totalCaixaReal: number;
  quantidadeRenovacoes: number;
}

export interface DistribuicaoDiaMesItem {
  dia: number;
  valor: number;
  quantidade: number;
  isHoje: boolean;
}

export interface MeioPagamentoItem {
  count: number;
  total: number;
  pct: number;
  pctValor: number;
}

export interface MeiosPagamentoBreakdown {
  pix: MeioPagamentoItem;
  cartao: MeioPagamentoItem;
  outros: MeioPagamentoItem;
}

export interface ProximaRenovacaoItem {
  id: string;
  usuarioId: string;
  motoristaNome: string;
  motoristaTelefone: string;
  planoNome: string;
  tipoPlano: "MONTHLY" | "YEARLY";
  metodoPagamento: CheckoutPaymentMethod | null;
  dataVencimento: string | null;
  dataLiquidacaoPrevista: string | null;
  valor: number;
  isVitalicio: boolean;
}

export interface SafraTrialItem {
  chaveMes: string;
  labelMes: string;
  novosTrials: number;
  convertidos: number;
  vitalicios: number;
  emAndamento: number;
  taxaConversao: number;
}

export interface AdminFinancialStatsResponse {
  kpis: AdminFinancialKpis;
  projecao12Meses: Projecao12MesesItem[];
  distribuicaoDiasMes: DistribuicaoDiaMesItem[];
  meiosPagamento: MeiosPagamentoBreakdown;
  proximasRenovacoes: ProximaRenovacaoItem[];
  safrasTrials: SafraTrialItem[];
  diasRetencaoCartao: number;
}

export interface FaixaEtariaItem {
  faixa: string;
  quantidade: number;
  porcentagem: number;
}

export interface FunilConversao {
  cadastrados: number;
  trialsIniciados: number;
  trialsAtivos?: number;
  convertidosPagantes: number;
  assinantesAtivos: number;
  expiradosOuCancelados: number;
  taxaConversaoTrial: number;
  taxaRetencaoAtiva: number;
}

export interface EvolucaoMensalUsuarioItem {
  chaveMes: string;
  labelMes: string;
  novosCadastros: number;
  novosAssinantes: number;
  cancelados: number;
}

export interface AdminEstadoDemographics {
  uf: string;
  nome: string;
  regiao: string;
  quantidade: number;
  porcentagem: number;
}

export interface AdminDemographicsStatsResponse {
  faixasEtarias: FaixaEtariaItem[];
  funil: FunilConversao;
  evolucaoMensal: EvolucaoMensalUsuarioItem[];
  distribuicaoEstados: AdminEstadoDemographics[];
}

export const adminFinancialApi = {
  async getFinancialStats(): Promise<AdminFinancialStatsResponse> {
    const { data } = await apiClient.get<AdminFinancialStatsResponse>("/admin/stats/financial");
    return data;
  },

  async getDemographicsStats(): Promise<AdminDemographicsStatsResponse> {
    const { data } = await apiClient.get<AdminDemographicsStatsResponse>("/admin/stats/demographics");
    return data;
  }
};
