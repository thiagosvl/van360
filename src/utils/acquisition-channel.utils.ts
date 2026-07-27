import { CanalAquisicao } from "@/types/enums";

export interface CanalAquisicaoItemConfig {
  label: string;
  color: string;
}

export const CANAL_AQUISICAO_CONFIG: Record<CanalAquisicao | "NAO_INFORMADO", CanalAquisicaoItemConfig> = {
  [CanalAquisicao.PLAY_STORE]: { label: "Play Store (Android)", color: "#34A853" },
  [CanalAquisicao.APP_STORE]: { label: "App Store (iPhone/iOS)", color: "#007AFF" },
  [CanalAquisicao.INDICACAO]: { label: "Indicação", color: "#10B981" },
  [CanalAquisicao.INSTAGRAM]: { label: "Instagram", color: "#E1306C" },
  [CanalAquisicao.GOOGLE]: { label: "Google / Busca", color: "#4285F4" },
  [CanalAquisicao.FACEBOOK]: { label: "Facebook", color: "#1877F2" },
  [CanalAquisicao.TIKTOK]: { label: "TikTok", color: "#0F172A" },
  [CanalAquisicao.YOUTUBE]: { label: "YouTube", color: "#EF4444" },
  [CanalAquisicao.PANFLETO]: { label: "Panfleto", color: "#F59E0B" },
  [CanalAquisicao.OUTROS]: { label: "Outros", color: "#6366F1" },
  NAO_INFORMADO: { label: "Não informado", color: "#94A3B8" },
};

export const CanalAquisicaoLabels: Record<CanalAquisicao, string> = {
  [CanalAquisicao.PLAY_STORE]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.PLAY_STORE].label,
  [CanalAquisicao.APP_STORE]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.APP_STORE].label,
  [CanalAquisicao.INDICACAO]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.INDICACAO].label,
  [CanalAquisicao.PANFLETO]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.PANFLETO].label,
  [CanalAquisicao.INSTAGRAM]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.INSTAGRAM].label,
  [CanalAquisicao.FACEBOOK]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.FACEBOOK].label,
  [CanalAquisicao.TIKTOK]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.TIKTOK].label,
  [CanalAquisicao.YOUTUBE]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.YOUTUBE].label,
  [CanalAquisicao.GOOGLE]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.GOOGLE].label,
  [CanalAquisicao.OUTROS]: CANAL_AQUISICAO_CONFIG[CanalAquisicao.OUTROS].label,
};
