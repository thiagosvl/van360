import { MembroEquipe } from "@/types/equipe";
import { UserType } from "@/types/enums";
import { phoneMask } from "@/utils/masks";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Car, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipeSummaryProps {
  membro: MembroEquipe;
}

export function EquipeSummary({ membro }: EquipeSummaryProps) {
  const isMonitor = membro.tipo === UserType.MONITOR;
  const hasApelido = Boolean(membro.apelido && membro.apelido.trim().length > 0);
  const primaryName = hasApelido ? membro.apelido : membro.nome;
  const secondaryName = hasApelido ? membro.nome : null;
  const veiculoDescricao = membro.veiculos
    ? [membro.veiculos.marca, membro.veiculos.modelo].filter(Boolean).map((s) => s?.trim()).filter(Boolean).join(" ")
    : "";

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="pr-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight break-words w-full min-w-0">
          {primaryName}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-1.5 w-full min-w-0">
        <div
          className={cn(
            "px-2 py-0.5 rounded-[12px] text-[10px] font-semibold uppercase tracking-wider shrink-0 border transition-colors",
            membro.ativo !== false
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
          )}
        >
          {membro.ativo !== false ? "Ativo" : "Inativo"}
        </div>

        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none shrink-0">
          {isMonitor ? "Monitor" : "Motorista"}
        </span>

        {secondaryName && (
          <div className="flex items-center gap-1.5 min-w-0 text-[#737373] flex-1">
            <span className="text-xs text-[#737373]/60">•</span>
            <p className="text-xs font-normal leading-snug truncate">
              {secondaryName}
            </p>
          </div>
        )}
      </div>

      {(membro.telefone || membro.veiculos) && (
        <div className="mt-2.5 pt-2.5 border-t border-[#e5e5e5]/80 space-y-1.5 text-xs text-[#737373] w-full min-w-0">
          {membro.veiculos && (
            <div className="flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-[#737373] shrink-0" />
              <span className="truncate">
                <span className="text-[#0a0a0a] font-semibold">
                  {formatarPlacaExibicao(membro.veiculos.placa)}
                </span>
                {veiculoDescricao && (
                  <span className="text-[#737373] font-normal ml-1">
                    ({veiculoDescricao})
                  </span>
                )}
              </span>
            </div>
          )}
          {membro.telefone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#737373] shrink-0" />
              <span>{phoneMask(membro.telefone)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
