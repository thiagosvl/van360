import React from "react";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { formatModalidade, formatPeriodo } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ResponsavelCarteirinhaHeaderProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaHeader: React.FC<ResponsavelCarteirinhaHeaderProps> = ({ carteirinha }) => {
  const temCobrancasVencidas = carteirinha.cobrancas?.some(c => c.status === "vencido") ?? false;

  return (
    <div className="bg-gradient-to-br from-[#122842] via-[#1a385c] to-[#0e2137] text-white rounded-[24px] relative flex flex-col items-center mb-6 shadow-sm overflow-hidden border border-white/10">
      <div className="absolute top-0 left-0 w-full h-[35%] bg-white/5 rounded-t-[24px] pointer-events-none z-0" />
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
        <div className="rounded-full bg-white/10 p-1 shrink-0 backdrop-blur-xs">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#183659] border-2 border-white/20 flex items-center justify-center overflow-hidden text-white shadow-xs">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" />
          </div>
        </div>

        <div className="text-center mt-3 w-full px-2">
          <h2 className="text-xl md:text-[22px] font-semibold text-white tracking-tight leading-snug">
            {carteirinha.nome}
          </h2>
          {carteirinha.escola_nome && (
            <p className="text-xs sm:text-sm font-normal text-white/70 mt-1">
              {carteirinha.escola_nome} {carteirinha.turma ? `• ${carteirinha.turma}` : ""} {carteirinha.sala ? `• Sala ${carteirinha.sala}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <Badge
            className={cn(
              "rounded-[18px] border-none px-3 py-1 text-[11px] font-medium tracking-tight",
              carteirinha.ativo
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
            )}
          >
            {carteirinha.ativo ? "Ativo" : "Inativo"}
          </Badge>

          {carteirinha.isento ? (
            <Badge className="rounded-[18px] border-none px-3 py-1 text-[11px] font-medium tracking-tight bg-sky-500/20 text-sky-300">
              Isento
            </Badge>
          ) : (
            temCobrancasVencidas && (
              <Badge className="rounded-[18px] border-none px-3 py-1 text-[11px] font-medium tracking-tight bg-[#e7000b]/20 text-[#ff6b6b]">
                Possui Débitos
              </Badge>
            )
          )}

          {carteirinha.periodo && (
            <Badge className="rounded-[18px] border-none px-3 py-1 text-[11px] font-medium tracking-tight bg-white/10 text-white">
              {formatPeriodo(carteirinha.periodo)}
            </Badge>
          )}

          {carteirinha.modalidade && (
            <Badge className="rounded-[18px] border-none px-3 py-1 text-[11px] font-medium tracking-tight bg-white/10 text-white">
              {formatModalidade(carteirinha.modalidade)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
