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
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-[24px] p-4 shadow-sm transition-all active:scale-[0.99] flex items-center justify-between gap-3 text-left border border-primary/20 cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-[18px] bg-white/20 flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block font-semibold text-sm sm:text-[15px] leading-tight text-white truncate">
                Assinar Contrato
              </span>
              <span className="text-[11px] sm:text-xs text-white/80 font-normal block truncate mt-0.5">
                Pendente de assinatura online
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/90 shrink-0" />
        </button>
      )}

      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="text-[15px] sm:text-base font-semibold text-[#0a0a0a]">
            Acesso Rápido
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Navegue pelos serviços e informações do aluno.
          </p>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-[#e5e5e5]">
            <button
              type="button"
              onClick={() => handleTabClick("parcelas")}
              className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-[#fafafa] active:bg-[#f5f5f5] transition-colors group cursor-pointer border-r border-b border-[#e5e5e5]"
            >
              <Receipt className="w-6 h-6 text-[#0a0a0a] mb-2 group-hover:text-primary group-hover:scale-105 transition-all stroke-[1.75]" />
              <span className="text-xs sm:text-[13px] font-medium text-[#0a0a0a] group-hover:text-primary leading-tight transition-colors">
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
              className={`flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-colors group border-r border-b border-[#e5e5e5] ${
                temRotas
                  ? "hover:bg-[#fafafa] active:bg-[#f5f5f5] cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <CalendarOff className="w-6 h-6 text-[#0a0a0a] mb-2 group-hover:text-primary group-hover:scale-105 transition-all stroke-[1.75]" />
              <span className="text-xs sm:text-[13px] font-medium text-[#0a0a0a] group-hover:text-primary leading-tight transition-colors">
                Ausências
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("responsaveis")}
              className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-[#fafafa] active:bg-[#f5f5f5] transition-colors group cursor-pointer border-r border-b border-[#e5e5e5]"
            >
              <Users className="w-6 h-6 text-[#0a0a0a] mb-2 group-hover:text-primary group-hover:scale-105 transition-all stroke-[1.75]" />
              <span className="text-xs sm:text-[13px] font-medium text-[#0a0a0a] group-hover:text-primary leading-tight transition-colors">
                Responsáveis
              </span>
            </button>

            <button
              type="button"
              onClick={() => temContrato && handleTabClick("contrato")}
              disabled={!temContrato}
              className={`flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-colors group border-r border-b border-[#e5e5e5] ${
                temContrato
                  ? "hover:bg-[#fafafa] active:bg-[#f5f5f5] cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <FileText className="w-6 h-6 text-[#0a0a0a] mb-2 group-hover:text-primary group-hover:scale-105 transition-all stroke-[1.75]" />
              <span className="text-xs sm:text-[13px] font-medium text-[#0a0a0a] group-hover:text-primary leading-tight transition-colors">
                Contrato
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("dados-pessoais")}
              className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-[#fafafa] active:bg-[#f5f5f5] transition-colors group cursor-pointer border-b border-[#e5e5e5]"
            >
              <User className="w-6 h-6 text-[#0a0a0a] mb-2 group-hover:text-primary group-hover:scale-105 transition-all stroke-[1.75]" />
              <span className="text-xs sm:text-[13px] font-medium text-[#0a0a0a] group-hover:text-primary leading-tight transition-colors">
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
