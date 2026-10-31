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
const defaultTooltipText = 'Veja Como Funciona';

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
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-gastos.mp4`,
    tooltipText: defaultTooltipText,
    ctaText: "Registrar Gasto",
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-gastos.mp4`,
        title: "Controle de Despesas da Van",
      },
    ],
  },
  relatorios: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-relatorios.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-relatorios.mp4`,
        title: "Visão Geral e Relatórios de Lucro",
      },
    ],
  },
  parcelas: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-parcelas.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-parcelas.mp4`,
        title: "Cobrança Automática e Pagamentos",
      },
    ],
  },
  contratos: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-contratos.mp4`,
    tooltipText: defaultTooltipText,
    ctaText: "Configurar Contrato",
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-contratos.mp4`,
        title: "Criação e Assinatura Digital de Contratos",
      },
    ],
  },
  carteirinha: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-carteirinha.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-carteirinha.mp4`,
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
  renovacoes: {
    previewUrl: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-renovacao.mp4`,
    tooltipText: defaultTooltipText,
    videos: [
      {
        url: `${CLOUDFLARE_VIDEOS_BASE_URL}/tutorial-renovacao.mp4`,
        title: "Renovação de Matrículas para o Próximo Ano",
      },
    ],
  },
} as const satisfies Record<string, ScreenTutorialConfig>;

export type ScreenTutorialKey = keyof typeof TUTORIALS_CONFIG;
