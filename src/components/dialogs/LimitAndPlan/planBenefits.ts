import { PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";

export interface PlanBenefit {
  text: string;
  description: string;
  enabled_plans: string[];
  soon?: boolean;
}

export const PLAN_BENEFITS: PlanBenefit[] = [
  {
    text: "Cadastro Ilimitado de Passageiros",
    description: "Cadastre quantos alunos precisar, sem limites.",
    enabled_plans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
  },
  {
    text: "Gestão Escolar Completa",
    description: "Organize rotas, escolas e veículos em um só lugar.",
    enabled_plans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
  },
  {
    text: "Suporte Prioritário via WhatsApp",
    description: "Fale direto com nosso time de especialistas.",
    enabled_plans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
  },
  {
    text: "Relatórios Financeiros Detalhados",
    description: "Saiba exatamente quanto cada van está lucrando.",
    enabled_plans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
  },
  {
    text: "Controle de Despesas e Abastecimento",
    description: "Registre gastos e acompanhe o custo da frota.",
    enabled_plans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
  },
  {
    text: "Cobrança Automática (PIX e Boleto)",
    description: "Nós cobramos os pais todo mês para você.",
    enabled_plans: [PLANO_PROFISSIONAL],
  },
  {
    text: "Cobrança de Inadimplentes",
    description: "Lembretes automáticos para pais que esqueceram de pagar.",
    enabled_plans: [PLANO_PROFISSIONAL],
  },
  {
    text: "Envio Automático de Comprovantes",
    description: "Recibos enviados no WhatsApp do pai após o pagamento.",
    enabled_plans: [PLANO_PROFISSIONAL],
  },
  {
    text: "Roteirização Inteligente",
    description: "Crie a melhor rota para buscar os alunos.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
  {
    text: "Mensagens em Massa",
    description: "Avise todos os pais sobre imprevistos ou avisos.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
  {
    text: "Gerador de Contratos",
    description: "Crie contratos profissionais prontos para assinar.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
  {
    text: "Cálculo Automático de Multas",
    description: "Adicione juros e multas para pagamentos atrasados.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
  {
    text: "Repasse de Taxas",
    description: "Inclua o custo do sistema na mensalidade.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
  {
    text: "Monitoramento em Tempo Real",
    description: "Pais acompanham a van no mapa.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
  {
    text: "App para os Pais",
    description: "Aplicativo exclusivo para os responsáveis.",
    enabled_plans: [PLANO_PROFISSIONAL],
    soon: true,
  },
];
