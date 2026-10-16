import { Car } from "lucide-react";
import { getInitials } from "@/utils/formatters";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoHeaderProps {
  motorista: PublicRenovacaoResponse["motorista"];
  anoDestino: number;
}

export function PublicRenovacaoHeader({ motorista, anoDestino }: PublicRenovacaoHeaderProps) {
  const displayName = motorista.apelido || motorista.nome;
  const initials = getInitials(displayName);

  return (
    <header className="bg-white rounded-[24px] border border-border p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
      {motorista.logo_url ? (
        <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0 bg-white select-none">
          <img
            src={motorista.logo_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border font-semibold text-base select-none">
          {initials || <Car className="w-5 h-5" />}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
          Transporte Escolar
        </span>
        <h1 className="text-base sm:text-lg font-semibold text-foreground truncate leading-tight mt-0.5">
          {displayName}
        </h1>
      </div>
    </header>
  );
}
