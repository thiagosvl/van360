import { Car } from "lucide-react";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoHeaderProps {
  motorista: PublicRenovacaoResponse["motorista"];
  anoDestino: number;
}

export function PublicRenovacaoHeader({ motorista, anoDestino }: PublicRenovacaoHeaderProps) {
  return (
    <header className="bg-white rounded-[24px] border border-border p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
      {motorista.logo_url ? (
        <img
          src={motorista.logo_url}
          alt={motorista.apelido || motorista.nome}
          className="w-12 h-12 rounded-[14px] object-cover border border-border shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-[14px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
          <Car className="w-6 h-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
          Transporte Escolar • {anoDestino}
        </span>
        <h1 className="text-base sm:text-lg font-semibold text-foreground truncate leading-tight mt-0.5">
          {motorista.apelido || motorista.nome}
        </h1>
      </div>
    </header>
  );
}
