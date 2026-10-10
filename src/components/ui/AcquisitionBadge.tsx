import type { ResolvedOrigemAtribuicao } from "@/utils/acquisition-channel.utils";
import { AtribuicaoCategoria } from "@/types/enums";
import { ORIGEM_ATRIBUICAO_LABELS } from "@/utils/acquisition-channel.utils";
import { cn } from "@/lib/utils";

export const CATEGORIA_BADGE_STYLES: Record<AtribuicaoCategoria, string> = {
  [AtribuicaoCategoria.META_ADS]: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  [AtribuicaoCategoria.GOOGLE_ADS]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  [AtribuicaoCategoria.TIKTOK_ADS]: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  [AtribuicaoCategoria.PLAY_STORE]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [AtribuicaoCategoria.SITE_ORGANICO]: "bg-black/5 text-[#0a0a0a] border-[#e5e5e5]",
  [AtribuicaoCategoria.INDICACAO]: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  [AtribuicaoCategoria.DIRETO]: "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]",
};

export const ORIGEM_BADGE_STYLES: Partial<Record<string, string>> = {
  [ORIGEM_ATRIBUICAO_LABELS.FACEBOOK_ADS]: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30",
  [ORIGEM_ATRIBUICAO_LABELS.FACEBOOK_ORGANICO]: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30",
  [ORIGEM_ATRIBUICAO_LABELS.SITE_INSTITUCIONAL]: "bg-black/5 text-[#0a0a0a] border-[#e5e5e5]",
};

interface AcquisitionBadgeProps {
  origem: ResolvedOrigemAtribuicao;
  showDetail?: boolean;
  className?: string;
}

export function AcquisitionBadge({ origem, showDetail = false, className }: AcquisitionBadgeProps) {
  const badgeStyle =
    origem.corBadge ||
    ORIGEM_BADGE_STYLES[origem.label] ||
    CATEGORIA_BADGE_STYLES[origem.categoria] ||
    CATEGORIA_BADGE_STYLES[AtribuicaoCategoria.DIRETO];

  return (
    <div className={cn("inline-flex items-center gap-1.5 flex-wrap", className)}>
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", badgeStyle)}>
        {origem.label}
      </span>
      {showDetail && origem.detalhe && (
        <span className="font-mono text-xs text-[#737373]">
          {origem.detalhe}
        </span>
      )}
    </div>
  );
}

