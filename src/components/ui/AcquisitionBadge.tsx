import type { ResolvedOrigemAtribuicao } from "@/utils/acquisition-channel.utils";
import { cn } from "@/lib/utils";

interface AcquisitionBadgeProps {
  origem: ResolvedOrigemAtribuicao;
  showDetail?: boolean;
  className?: string;
}

export function AcquisitionBadge({ origem, showDetail = false, className }: AcquisitionBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 flex-wrap", className)}>
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", origem.corBadge)}>
        {origem.label}
      </span>
      {showDetail && origem.detalhe && (
        <span className="font-mono text-xs text-slate-300">
          {origem.detalhe}
        </span>
      )}
    </div>
  );
}
