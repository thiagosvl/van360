import { VideoStoryItem } from "@/contexts/LayoutContext";

export interface ScreenTutorialConfig {
  previewUrl: string;
  tooltipText: string;
  ctaText?: string;
  videos: VideoStoryItem[];
}

export function hasValidTutorialVideos(config?: ScreenTutorialConfig): boolean {
  if (!config) return false;
  return config.videos.some((v) => Boolean(v.url && v.url.trim().length > 0));
}

const SUPABASE_VIDEOS_BASE_URL = "https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/videos";
const CLOUDFLARE_VIDEOS_BASE_URL = "https://pub-6302b932ae5749838fec8c6031c88963.r2.dev/videos";
const defaultTooltipText = 'Ver Demonstração';

export const TUTORIALS_CONFIG = {
  alunos: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-alunos-lista.mp4`,
    tooltipText: defaultTooltipText,
    ctaText: "Cadastrar Aluno",
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-alunos-lista.mp4`,
        title: "Lista de Alunos e Organização",
      },
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-alunos-solicitacoes.mp4`,
        title: "Solicitações de Cadastro dos Pais",
      },
    ],
  },
  gastos: {
    previewUrl: `${SUPABASE_VIDEOS_BASE_URL}/gastos-2.mp4`,
    tooltipText: defaultTooltipText,
    ctaText: "Registrar Gasto",
    videos: [
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/gastos-2.mp4`,
        title: "Como Registrar Gastos",
      },
    ],
  },
  relatorios: {
    previewUrl: `${SUPABASE_VIDEOS_BASE_URL}/relatorios-1.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/relatorios-1.mp4`,
        title: "Visão Geral Financeira",
      },
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/relatorios-2.mp4`,
        title: "Relatório de Pagamentos",
      },
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/relatorios-3.mp4`,
        title: "Relatório de Gastos",
      },
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/relatorios-4.mp4`,
        title: "Números Gerais da Van",
      },
    ],
  },
  parcelas: {
    previewUrl: `${SUPABASE_VIDEOS_BASE_URL}/parcelas-1.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/parcelas-1.mp4`,
        title: "Cobrança Automática",
      },
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/parcelas-2.mp4`,
        title: "Controle de Inadimplência",
      },
    ],
  },
  contratos: {
    previewUrl: `${SUPABASE_VIDEOS_BASE_URL}/contratos-1.mp4`,
    tooltipText: defaultTooltipText,
    ctaText: "Configurar Contrato",
    videos: [
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/contratos-1.mp4`,
        title: "Criando Modelo de Contrato",
      },
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/contratos-2.mp4`,
        title: "Gerando Contrato para o Aluno",
      },
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/contratos-3.mp4`,
        title: "Contratos Assinados",
      },
    ],
  },
  carteirinha: {
    previewUrl: `${SUPABASE_VIDEOS_BASE_URL}/carteirinha-1.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${SUPABASE_VIDEOS_BASE_URL}/carteirinha-1.mp4`,
        title: "Carteirinha Digital do Aluno",
      },
    ],
  },
  rotas: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-rotas.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-rotas.mp4`,
        title: "Rotas e Chamada na Escola",
      },
    ],
  },
} as const satisfies Record<string, ScreenTutorialConfig>;

export type ScreenTutorialKey = keyof typeof TUTORIALS_CONFIG;
