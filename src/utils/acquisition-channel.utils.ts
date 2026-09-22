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

export interface ResolvedOrigemAtribuicao {
  label: string;
  detalhe?: string;
  corBadge: string;
  categoria: "meta_ads" | "google_ads" | "tiktok_ads" | "play_store" | "site_organico" | "indicacao" | "direto";
}

export function resolveOrigemAtribuicao(
  metadados?: Record<string, unknown> | null,
  dispositivo?: string | null,
  canalAuto?: string | null
): ResolvedOrigemAtribuicao {
  const utm = (metadados?.utm as Record<string, string | undefined> | null) || undefined;
  const source = utm?.source?.toLowerCase();
  const fbclid = utm?.fbclid;
  const gclid = utm?.gclid;
  const gbraid = utm?.gbraid;
  const ttclid = utm?.ttclid;
  const campaign = utm?.campaign;
  const content = utm?.content;
  const referrer = typeof metadados?.referrer === "string" ? metadados.referrer : undefined;
  const isInternalReferrer = Boolean(
    referrer && (
      referrer.includes("app.van360.com.br") ||
      referrer.includes("capacitor://") ||
      referrer.includes("localhost")
    )
  );
  const cleanReferrer = isInternalReferrer ? undefined : referrer;
  const dispUpper = dispositivo?.toUpperCase();

  if (source === "ig" || (source === "lp" && fbclid) || source === "instagram") {
    return {
      label: "Instagram Ads",
      detalhe: content || campaign || "Meta Ads",
      corBadge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      categoria: "meta_ads",
    };
  }

  if (source === "fb" || source === "facebook" || fbclid) {
    return {
      label: "Facebook Ads",
      detalhe: content || campaign || "Meta Ads",
      corBadge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      categoria: "meta_ads",
    };
  }

  if (source === "google" || gclid || gbraid) {
    return {
      label: "Google Ads",
      detalhe: campaign || "Campanha Google",
      corBadge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      categoria: "google_ads",
    };
  }

  if (source === "tiktok" || ttclid) {
    return {
      label: "TikTok Ads",
      detalhe: campaign || "Campanha TikTok",
      corBadge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      categoria: "tiktok_ads",
    };
  }

  if (dispUpper === "APP_ANDROID") {
    return {
      label: "Play Store",
      detalhe: "App Nativo Android",
      corBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      categoria: "play_store",
    };
  }

  if (dispUpper === "APP_IOS") {
    return {
      label: "App Store",
      detalhe: "App Nativo iOS",
      corBadge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      categoria: "play_store",
    };
  }

  if (canalAuto === CanalAquisicao.INDICACAO) {
    return {
      label: "Indicação",
      detalhe: "Outro Motorista",
      corBadge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      categoria: "indicacao",
    };
  }

  if (source === "blog" || cleanReferrer?.includes("van360.com.br/blog")) {
    return {
      label: "Blog Van360",
      detalhe: "Orgânico",
      corBadge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      categoria: "site_organico",
    };
  }

  if (source === "lp" || cleanReferrer?.includes("van360.com.br")) {
    return {
      label: "Site Institucional",
      detalhe: "Direto",
      corBadge: "bg-slate-500/10 text-slate-300 border-slate-500/20",
      categoria: "site_organico",
    };
  }

  if (cleanReferrer?.includes("instagram.com")) {
    return {
      label: "Instagram",
      detalhe: "Orgânico / Link Bio",
      corBadge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      categoria: "site_organico",
    };
  }

  if (cleanReferrer?.includes("google.")) {
    return {
      label: "Google",
      detalhe: "Busca Orgânica",
      corBadge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      categoria: "site_organico",
    };
  }

  return {
    label: "Direto / Orgânico",
    detalhe: "Sem UTMs",
    corBadge: "bg-slate-800 text-slate-400 border-slate-700",
    categoria: "direto",
  };
}
