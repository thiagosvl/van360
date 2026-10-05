import { apiClient } from "../client";
import { CheckoutPaymentMethod, SubscriptionStatus } from "@/types/enums";

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
  receitaRecorrenteMensalFixa: number;
  receitaContratadaAnual: number;
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
  statusAssinatura?: SubscriptionStatus;
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

export interface HistoricoReceitaMensalItem {
  chaveMes: string;
  labelMes: string;
  valor: number;
  quantidadeFaturas: number;
}

export interface AdminFinancialStatsResponse {
  kpis: AdminFinancialKpis;
  projecao12Meses: Projecao12MesesItem[];
  distribuicaoDiasMes: DistribuicaoDiaMesItem[];
  meiosPagamento: MeiosPagamentoBreakdown;
  proximasRenovacoes: ProximaRenovacaoItem[];
  safrasTrials: SafraTrialItem[];
  historicoReceitaMensal: HistoricoReceitaMensalItem[];
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

export interface TrialPipelineItem {
  assinaturaId: string;
  usuarioId: string;
  nome: string;
  apelido: string | null;
  trialEndsAt: string;
  diasRestantes: number;
  diasAcessados: number;
  totalAcoes: number;
  alunos: number;
  escolas: number;
  veiculos: number;
  rotas: number;
  contratos: number;
  solicitacoes: number;
  indicadoPor: string | null;
  valorMensal: number;
  valorAnual: number;
}

export interface TrialsPipelineResponse {
  trials: TrialPipelineItem[];
  total: number;
}

export const adminFinancialApi = {
  async getFinancialStats(): Promise<AdminFinancialStatsResponse> {
    const { data } = await apiClient.get<AdminFinancialStatsResponse>("/admin/stats/financial");
    return data;
  },

  async getDemographicsStats(): Promise<AdminDemographicsStatsResponse> {
    const { data } = await apiClient.get<AdminDemographicsStatsResponse>("/admin/stats/demographics");
    return data;
  },

  async getTrialsPipeline(): Promise<TrialsPipelineResponse> {
    const { data } = await apiClient.get<TrialsPipelineResponse>("/admin/financial/trials-pipeline");
    return data;
  }
};
