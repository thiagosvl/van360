import { MembroEquipe } from "@/types/equipe";
import { UserType } from "@/types/enums";
import { phoneMask } from "@/utils/masks";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Car, Phone } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

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
      <div className="flex justify-between items-center mb-1.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none">
          {isMonitor ? "Monitor" : "Motorista"}
        </span>

        <StatusBadge status={membro.ativo !== false} />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight break-words w-full min-w-0 mt-0.5">
        {primaryName}
      </h2>

      {secondaryName && (
        <p className="text-xs font-normal text-[#737373] mt-0.5 leading-snug line-clamp-1 break-words w-full min-w-0">
          {secondaryName}
        </p>
      )}

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
