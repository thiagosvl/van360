import React, { useState } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { ResponsavelNotificarAusenciaDialog } from "@/components/dialogs/ResponsavelNotificarAusenciaDialog";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { FileSignature, CalendarOff, ArrowRight, User, Receipt, Users, FileText, ChevronRight } from "lucide-react";
import { openBrowserLink } from "@/utils/browser";
import { TrackingCard } from "@/components/features/tracking/TrackingCard";

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

  const contratoPendente = carteirinha.contrato && carteirinha.contrato.status === "pendente_assinatura";
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
        <button
          type="button"
          onClick={handleAssinarContrato}
          className="w-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl p-4 shadow-sm transition-all active:scale-[0.98] flex items-center justify-between gap-3 text-left border border-amber-400/30 cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block font-bold text-sm sm:text-[15px] leading-tight text-white truncate">
                Assinar Contrato
              </span>
              <span className="text-[11px] sm:text-xs text-amber-100 font-medium block truncate mt-0.5">
                Pendente de assinatura online
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/90 shrink-0" />
        </button>
      )}

      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="text-[15px] sm:text-base font-bold text-[#1a3a5c]">
            Acesso Rápido
          </h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Navegue pelos serviços e informações do aluno.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-slate-100">
            <button
              type="button"
              onClick={() => handleTabClick("parcelas")}
              className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-slate-50/80 active:bg-slate-100 transition-colors group cursor-pointer border-r border-b border-slate-100"
            >
              <Receipt className="w-6 h-6 text-[#1a3a5c] mb-2 group-hover:scale-110 transition-transform stroke-[1.75]" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a3a5c] leading-tight">
                Parcelas
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (temRotas) {
                  setAusenciaDialogOpen(true);
                }
              }}
              disabled={!temRotas}
              className={`flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-colors group border-r border-b border-slate-100 ${
                temRotas
                  ? "hover:bg-slate-50/80 active:bg-slate-100 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <CalendarOff className="w-6 h-6 text-[#1a3a5c] mb-2 group-hover:scale-110 transition-transform stroke-[1.75]" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a3a5c] leading-tight">
                Ausências
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("responsaveis")}
              className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-slate-50/80 active:bg-slate-100 transition-colors group cursor-pointer border-r border-b border-slate-100"
            >
              <Users className="w-6 h-6 text-[#1a3a5c] mb-2 group-hover:scale-110 transition-transform stroke-[1.75]" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a3a5c] leading-tight">
                Responsáveis
              </span>
            </button>

            <button
              type="button"
              onClick={() => temContrato && handleTabClick("contrato")}
              disabled={!temContrato}
              className={`flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-colors group border-r border-b border-slate-100 ${
                temContrato
                  ? "hover:bg-slate-50/80 active:bg-slate-100 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <FileText className="w-6 h-6 text-[#1a3a5c] mb-2 group-hover:scale-110 transition-transform stroke-[1.75]" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a3a5c] leading-tight">
                Contrato
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("dados-pessoais")}
              className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-slate-50/80 active:bg-slate-100 transition-colors group cursor-pointer border-r border-b border-slate-100"
            >
              <User className="w-6 h-6 text-[#1a3a5c] mb-2 group-hover:scale-110 transition-transform stroke-[1.75]" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a3a5c] leading-tight">
                Dados Pessoais
              </span>
            </button>
          </div>
        </div>
      </section>

      {temRotas && (
        <ResponsavelNotificarAusenciaDialog
          open={ausenciaDialogOpen}
          onOpenChange={setAusenciaDialogOpen}
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
