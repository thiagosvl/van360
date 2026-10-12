import React from "react";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { formatModalidade, formatPeriodo } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ResponsavelCarteirinhaHeaderProps {
  carteirinha: ResponsavelCarteirinhaData;
}

const formatSalaExibicao = (sala?: string | null) => {
  if (!sala || !sala.trim()) return "";
  const trimmed = sala.trim();
  return /^sala\s*/i.test(trimmed) ? trimmed : `Sala ${trimmed}`;
};

export const ResponsavelCarteirinhaHeader: React.FC<ResponsavelCarteirinhaHeaderProps> = ({ carteirinha }) => {
  const temCobrancasVencidas = carteirinha.cobrancas?.some((c) => c.status === "vencido") ?? false;

  const subtituloPartes: string[] = [];
  if (carteirinha.escola_nome) subtituloPartes.push(carteirinha.escola_nome);
  if (carteirinha.turma) subtituloPartes.push(carteirinha.turma);
  if (carteirinha.sala) {
    const salaFormatada = formatSalaExibicao(carteirinha.sala);
    if (salaFormatada) subtituloPartes.push(salaFormatada);
  }
  const subtituloEscola = subtituloPartes.join(" • ");

  return (
    <div className="bg-gradient-to-br from-[#122842] via-[#1a385c] to-[#0e2137] text-white rounded-[24px] relative flex flex-col items-center mb-6 shadow-sm border border-white/10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[35%] bg-white/5 rounded-t-[24px] pointer-events-none z-0" />
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-7 pb-7">
        <div className="rounded-full bg-white/10 p-1 shadow-sm shrink-0 backdrop-blur-xs">
          <div className="h-16 w-16 rounded-full bg-[#183659] border-2 border-white/20 flex items-center justify-center shadow-xs">
            <User className="w-8 h-8 text-white fill-current" />
          </div>
        </div>

        <div className="text-center mt-3 w-full px-2">
          <h2 className="text-xl md:text-[22px] font-bold text-white tracking-tight leading-snug break-words">
            {carteirinha.nome}
          </h2>
          {subtituloEscola && (
            <p className="text-xs sm:text-sm font-normal text-white/70 mt-1 max-w-md mx-auto truncate">
              {subtituloEscola}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <Badge
            className={cn(
              "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] border-none shadow-2xs",
              carteirinha.ativo
                ? "text-emerald-950 bg-emerald-300"
                : "text-rose-950 bg-rose-200"
            )}
          >
            {carteirinha.ativo ? "Ativo" : "Inativo"}
          </Badge>

          {carteirinha.isento ? (
            <Badge className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] border-none shadow-2xs text-sky-950 bg-sky-200">
              Isento
            </Badge>
          ) : (
            temCobrancasVencidas && (
              <Badge className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] border-none shadow-2xs bg-rose-500 text-white animate-pulse">
                Possui Débitos
              </Badge>
            )
          )}

          {carteirinha.periodo && (
            <Badge className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] border-none shadow-2xs bg-white/15 text-white">
              {formatPeriodo(carteirinha.periodo)}
            </Badge>
          )}

          {carteirinha.modalidade && (
            <Badge className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] border-none shadow-2xs bg-white/15 text-white">
              {formatModalidade(carteirinha.modalidade)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
