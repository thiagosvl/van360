import { memo } from "react";
import { useSearchParams } from "react-router-dom";
import { NotificacoesTab } from "@/components/features/configuracoes/NotificacoesTab";
import { PerfilTab } from "@/components/features/configuracoes/PerfilTab";
import { PagamentosTab } from "@/components/features/configuracoes/PagamentosTab";
import { usePermissions } from "@/hooks/business/usePermissions";
import { ArrowLeft, Bell, ChevronRight, CreditCard, User } from "lucide-react";

export const Configuracoes = memo(function Configuracoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { isSubConta } = usePermissions();

  const handleSelectTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleGoBack = () => {
    setSearchParams({});
  };

  const renderCurrentView = () => {
    if (tabParam === "notificacoes" && !isSubConta) {
      return <NotificacoesTab />;
    }
    if (tabParam === "perfil") {
      return <PerfilTab />;
    }
    if (tabParam === "pagamentos" && !isSubConta) {
      return <PagamentosTab />;
    }

    // Visão Geral (Hub Principal sem parâmetros)
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Opção 1: Meu Perfil */}
          <button
            type="button"
            onClick={() => handleSelectTab("perfil")}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                  Meu Perfil
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seus dados cadastrais e informações de contato
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Opção 2: Notificações (Apenas Gestor) */}
          {!isSubConta && (
            <button
              type="button"
              onClick={() => handleSelectTab("notificacoes")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                    Notificações
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Lembretes automáticos enviados aos pais e alertas da sua conta
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          )}

          {/* Opção 3: Pagamentos & PIX (Apenas Gestor) */}
          {!isSubConta && (
            <button
              type="button"
              onClick={() => handleSelectTab("pagamentos")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                    Pagamentos & PIX
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Chave PIX e configurações de recebimento das parcelas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const isSubPage = Boolean(tabParam && ["notificacoes", "perfil", "pagamentos"].includes(tabParam));

  return (
    <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
      {/* Botão de Voltar nas Subpáginas */}
      {isSubPage && (
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1a3a5c] transition-colors group w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar para Configurações
        </button>
      )}

      {/* Visão Ativa */}
      {renderCurrentView()}
    </div>
  );
});

export default Configuracoes;
