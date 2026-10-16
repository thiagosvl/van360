import { HeartPulse, MapPin } from "lucide-react";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoEmbarqueCardProps {
  passageiro: PublicRenovacaoResponse["passageiro"];
  responsavel?: PublicRenovacaoResponse["responsavel"];
  enderecoFormatado: string;
}

export function PublicRenovacaoEmbarqueCard({
  passageiro,
  responsavel,
  enderecoFormatado,
}: PublicRenovacaoEmbarqueCardProps) {
  return (
    <article className="bg-white rounded-[24px] border border-border p-5 sm:p-6 shadow-xs space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-foreground" />
        Dados de Embarque
      </h3>

      <div className="bg-muted/30 rounded-[18px] p-3.5 border border-border space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5 text-muted-foreground">
          <MapPin className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-foreground block">Endereço de Embarque:</span>
            <span className="text-muted-foreground block leading-relaxed font-normal">
              {enderecoFormatado || "Endereço não informado"}
            </span>
            {responsavel?.referencia && (
              <span className="text-muted-foreground italic block mt-0.5">
                Ref: {responsavel.referencia}
              </span>
            )}
          </div>
        </div>

        {passageiro.observacoes && (
          <div className="flex items-start gap-2.5 text-muted-foreground pt-2 border-t border-border">
            <HeartPulse className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-foreground block">Cuidados Especiais / Saúde:</span>
              <span className="text-muted-foreground block font-normal leading-relaxed">
                {passageiro.observacoes}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
