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
    <div className="bg-[#1a3a5c] rounded-[2rem] relative flex flex-col items-center mb-6 shadow-md">
      <div className="absolute top-0 left-0 w-full h-[25%] bg-black/15 rounded-t-[2rem] z-0" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-8 pb-8">
        <div className="rounded-full bg-white p-[3px] shadow-xs shrink-0">
          <div className="rounded-full bg-[#132a42] p-[4px]">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-200 border-[3px] border-white flex items-center justify-center overflow-hidden">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 fill-current" />
            </div>
          </div>
        </div>

        <div className="text-center mt-2 w-full px-2">
          <h2 className="text-xl md:text-[22px] font-bold text-white tracking-tight leading-snug">
            {carteirinha.nome}
          </h2>
          {carteirinha.escola_nome && (
            <p className="text-xs sm:text-sm font-medium text-slate-300/90 mt-1">
              {carteirinha.escola_nome} {carteirinha.turma ? `• ${carteirinha.turma}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
          <Badge
            className={cn(
              "border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              carteirinha.ativo
                ? "text-emerald-700 bg-[#d8f0e1]"
                : "text-rose-700 bg-rose-100"
            )}
          >
            {carteirinha.ativo ? "Ativo" : "Inativo"}
          </Badge>

          {carteirinha.isento ? (
            <Badge className="border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
              Isento
            </Badge>
          ) : (
            temCobrancasVencidas && (
              <Badge className="bg-[#eedbdf] text-[#9a3843] border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Possui Débitos
              </Badge>
            )
          )}

          {carteirinha.periodo && (
            <Badge className="border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/15 text-white">
              {formatPeriodo(carteirinha.periodo)}
            </Badge>
          )}

          {carteirinha.modalidade && (
            <Badge className="border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/15 text-white">
              {formatModalidade(carteirinha.modalidade)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
