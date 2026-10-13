import React, { useState } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { ResponsavelNotificarAusenciaDialog } from "@/components/dialogs/ResponsavelNotificarAusenciaDialog";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { FileSignature, CalendarOff, ArrowRight, User, Receipt, Users, FileText, ChevronRight } from "lucide-react";
import { openBrowserLink } from "@/utils/browser";
import { TrackingCard } from "@/components/features/tracking/TrackingCard";
import { cn } from "@/lib/utils";

import { ContratoStatus } from "@/types/enums";
import { safeCloseDialog } from "@/hooks";

interface ResponsavelCarteirinhaGeralProps {
  carteirinha: ResponsavelCarteirinhaData;
  onRefresh?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const ResponsavelCarteirinhaGeral: React.FC<ResponsavelCarteirinhaGeralProps> = ({
  carteirinha,
  onRefresh,
  onSelectTab,
}) => {
  const { token } = useResponsavelAuth();
  const [ausenciaDialogOpen, setAusenciaDialogOpen] = useState(false);

  const contratoPendente = carteirinha.contrato?.status === ContratoStatus.PENDENTE;
  const temRotas = (carteirinha.rotas || []).length > 0;
  const temContrato = Boolean(carteirinha.contrato);

  const handleAssinarContrato = () => {
    if (carteirinha.contrato?.token_acesso) {
      openBrowserLink(`${window.location.origin}/assinar/${carteirinha.contrato.token_acesso}`);
    }
  };

  const handleTabClick = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <TrackingCard
        passageiroId={carteirinha.id}
        passageiroNome={carteirinha.nome}
      />

      {contratoPendente && (
        <div className="bg-white rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.06] to-transparent p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-[16px] bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-700">
              <FileSignature className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="block font-semibold text-sm sm:text-base text-[#0a0a0a] leading-tight truncate">
                Assinatura Pendente
              </span>
              <span className="text-xs text-[#737373] mt-0.5 block">
                O contrato de transporte escolar está pronto para assinatura.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAssinarContrato}
            className="h-10 px-4 rounded-[18px] bg-primary hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer shrink-0"
          >
            <span>Assinar Agora</span>
          </button>
        </div>
      )}

      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="text-[15px] sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
            Acesso Rápido
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Navegue pelos serviços e informações do aluno.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleTabClick("parcelas")}
            className="flex flex-col items-center justify-center p-2 min-[360px]:p-2.5 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xs hover:shadow-xs hover:border-[#d4d4d4] active:scale-[0.97] transition-all group cursor-pointer w-full aspect-square text-center gap-1.5 relative hover:bg-[#fafafa]"
          >
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 relative">
              <Receipt className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] min-[360px]:text-xs font-medium leading-[1.2] text-center w-full px-0.5 line-clamp-2 transition-colors text-[#171717] group-hover:text-primary">
              Parcelas
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("dados-pessoais")}
            className="flex flex-col items-center justify-center p-2 min-[360px]:p-2.5 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xs hover:shadow-xs hover:border-[#d4d4d4] active:scale-[0.97] transition-all group cursor-pointer w-full aspect-square text-center gap-1.5 relative hover:bg-[#fafafa]"
          >
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 relative">
              <User className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] min-[360px]:text-xs font-medium leading-[1.2] text-center w-full px-0.5 line-clamp-2 transition-colors text-[#171717] group-hover:text-primary">
              Dados Pessoais
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("ausencias")}
            disabled={!temRotas}
            title={!temRotas ? "Aluno não possui rota atribuída" : undefined}
            className={cn(
              "flex flex-col items-center justify-center p-2 min-[360px]:p-2.5 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xs transition-all group w-full aspect-square text-center gap-1.5 relative",
              temRotas
                ? "hover:shadow-xs hover:border-[#d4d4d4] active:scale-[0.97] cursor-pointer hover:bg-[#fafafa]"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-200 relative",
              temRotas
                ? "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
                : "bg-[#f5f5f5] text-[#737373]"
            )}>
              <CalendarOff className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 stroke-[1.75]" />
            </div>
            <span className={cn(
              "text-[11px] min-[360px]:text-xs font-medium leading-[1.2] text-center w-full px-0.5 line-clamp-2 transition-colors",
              temRotas ? "text-[#171717] group-hover:text-primary" : "text-[#737373]"
            )}>
              Ausências
            </span>
          </button>

          <button
            type="button"
            onClick={() => temContrato && handleTabClick("contrato")}
            disabled={!temContrato}
            title={!temContrato ? "Aluno não possui contrato" : undefined}
            className={cn(
              "flex flex-col items-center justify-center p-2 min-[360px]:p-2.5 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xs transition-all group w-full aspect-square text-center gap-1.5 relative",
              temContrato
                ? "hover:shadow-xs hover:border-[#d4d4d4] active:scale-[0.97] cursor-pointer hover:bg-[#fafafa]"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-200 relative",
              temContrato
                ? "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
                : "bg-[#f5f5f5] text-[#737373]"
            )}>
              <FileText className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 stroke-[1.75]" />
            </div>
            <span className={cn(
              "text-[11px] min-[360px]:text-xs font-medium leading-[1.2] text-center w-full px-0.5 line-clamp-2 transition-colors",
              temContrato ? "text-[#171717] group-hover:text-primary" : "text-[#737373]"
            )}>
              Contrato
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("responsaveis")}
            className="flex flex-col items-center justify-center p-2 min-[360px]:p-2.5 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xs hover:shadow-xs hover:border-[#d4d4d4] active:scale-[0.97] transition-all group cursor-pointer w-full aspect-square text-center gap-1.5 relative hover:bg-[#fafafa]"
          >
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 relative">
              <Users className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] min-[360px]:text-xs font-medium leading-[1.2] text-center w-full px-0.5 line-clamp-2 transition-colors text-[#171717] group-hover:text-primary">
              Responsáveis
            </span>
          </button>
        </div>
      </section>

      {temRotas && (
        <ResponsavelNotificarAusenciaDialog
          open={ausenciaDialogOpen}
          onOpenChange={(val) => {
            if (!val) {
              safeCloseDialog(() => setAusenciaDialogOpen(false));
            } else {
              setAusenciaDialogOpen(true);
            }
          }}
          passageiroId={carteirinha.id}
          passageiroNome={carteirinha.nome}
          rotas={carteirinha.rotas || []}
          token={token || ""}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
