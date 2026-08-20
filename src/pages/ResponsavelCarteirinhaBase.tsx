import { toast } from "sonner";
import { ResponsavelDadosComplementaresDialog } from "@/components/dialogs/ResponsavelDadosComplementaresDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { CarteirinhaSkeleton } from "@/components/skeletons/CarteirinhaSkeleton";
import { ArrowLeftRight, LogOut } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResponsavelCarteirinhaViewModel } from "@/hooks/ui/useResponsavelCarteirinhaViewModel";
import { ROUTES } from "@/constants/routes";

import {
  ResponsavelCarteirinhaHeader,
  ResponsavelCarteirinhaCobrancas,
  ResponsavelCarteirinhaResponsaveis,
  ResponsavelCarteirinhaAusencias,
  ResponsavelCarteirinhaGeral,
  ResponsavelCarteirinhaDadosPessoais,
  ResponsavelCarteirinhaContrato
} from "@/components/features/responsavel/carteirinha";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { PermissionRescueBanner } from "@/components/common/PermissionRescueBanner";
import { AppPermissionStatus, PermissionRescueType, UserType } from "@/types/enums";

export const ResponsavelCarteirinhaBase: React.FC = () => {
  const navigate = useNavigate();
  const { pushStatus, requestPushPermission } = useAppPermissions();
  const {
    token,
    passageiroId,
    passageiros,
    carteirinha,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    nomeExibicao,
    isMissingComplementares,
    handleLogout,
    handleSwitchPassageiro,
    handleRefresh,
    handleVerRecibo,
    refetch,
    refetchPassageiros
  } = useResponsavelCarteirinhaViewModel();

  React.useEffect(() => {
    if (pushStatus === AppPermissionStatus.PROMPT) {
      requestPushPermission();
    }
  }, [pushStatus, requestPushPermission]);

  const tabListRef = React.useRef<HTMLDivElement>(null);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setTimeout(() => {
      const activeEl = tabListRef.current?.querySelector(`[data-state="active"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }, 50);
  };

  React.useEffect(() => {
    if (activeTab) {
      setTimeout(() => {
        const activeEl = tabListRef.current?.querySelector(`[data-state="active"]`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 100);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800 flex flex-col">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 pt-[calc(0.875rem+var(--safe-area-top))] pb-3.5 sticky top-0 z-50 shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto cursor-pointer"
              onClick={() => navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME)}
            />
          </div>

          <div className="flex items-center gap-2">
            {passageiros.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchPassageiro}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-[#1a3a5c] hover:bg-blue-100 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[#1a3a5c]" />
                <span className="hidden sm:inline">Trocar Passageiro</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6 pb-[calc(2.5rem+var(--safe-area-bottom))]">
          {pushStatus === AppPermissionStatus.DENIED && (
            <PermissionRescueBanner type={PermissionRescueType.PUSH} role={UserType.RESPONSAVEL} />
          )}

          {isLoading ? (
            <div className="py-2">
              <CarteirinhaSkeleton />
            </div>
          ) : error || !carteirinha ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 text-sm font-medium text-center">
              Erro ao carregar os dados do passageiro. Tente atualizar a página.
            </div>
          ) : (
            <>
              {/* Header do Aluno */}
              <ResponsavelCarteirinhaHeader carteirinha={carteirinha} />

              {/* Abas com Scroll Lateral no Mobile e Grid no Desktop */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar bg-slate-200/50 p-1 rounded-[1.25rem]">
                  <TabsList ref={tabListRef} className="flex min-w-full w-max md:w-full md:grid md:grid-cols-6 min-h-[44px] bg-transparent p-0 gap-1 text-[13px]">
                    <TabsTrigger
                      value="geral"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Geral
                    </TabsTrigger>
                    <TabsTrigger
                      value="parcelas"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Parcelas
                    </TabsTrigger>
                    <TabsTrigger
                      value="ausencias"
                      disabled={(carteirinha.rotas || []).length === 0}
                      title={(carteirinha.rotas || []).length === 0 ? "Passageiro não possui rota atribuída" : undefined}
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center"
                    >
                      Ausências
                    </TabsTrigger>
                    <TabsTrigger
                      value="responsaveis"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Responsáveis
                    </TabsTrigger>
                    <TabsTrigger
                      value="contrato"
                      disabled={!carteirinha.contrato}
                      title={!carteirinha.contrato ? "Passageiro não possui contrato" : undefined}
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center"
                    >
                      Contrato
                    </TabsTrigger>
                    <TabsTrigger
                      value="dados-pessoais"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Dados Pessoais
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="geral" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaGeral carteirinha={carteirinha} onRefresh={refetch} onSelectTab={handleTabChange} />
                </TabsContent>

                <TabsContent value="dados-pessoais" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaDadosPessoais carteirinha={carteirinha} />
                </TabsContent>

                <TabsContent value="parcelas" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaCobrancas carteirinha={carteirinha} />
                </TabsContent>

                <TabsContent value="ausencias" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaAusencias carteirinha={carteirinha} onRefresh={refetch} />
                </TabsContent>

                <TabsContent value="responsaveis" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaResponsaveis carteirinha={carteirinha} onRefresh={refetch} />
                </TabsContent>

                <TabsContent value="contrato" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaContrato carteirinha={carteirinha} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </PullToRefreshWrapper>

      {passageiroId && token && (
        <ResponsavelDadosComplementaresDialog
          open={isMissingComplementares}
          passageiroId={passageiroId}
          passageiroNome={nomeExibicao}
          initialCpf={carteirinha?.responsavel_principal?.cpf || ""}
          initialEmail={carteirinha?.responsavel_principal?.email || ""}
          initialCep={carteirinha?.responsavel_principal?.cep || ""}
          initialLogradouro={carteirinha?.responsavel_principal?.logradouro || ""}
          initialNumero={carteirinha?.responsavel_principal?.numero || ""}
          initialComplemento={carteirinha?.responsavel_principal?.complemento || ""}
          initialBairro={carteirinha?.responsavel_principal?.bairro || ""}
          initialCidade={carteirinha?.responsavel_principal?.cidade || ""}
          initialEstado={carteirinha?.responsavel_principal?.estado || ""}
          initialReferencia={carteirinha?.responsavel_principal?.referencia || ""}
          token={token}
          onSuccess={async () => {
            await Promise.all([refetch(), refetchPassageiros()]);
            toast.success("Dados cadastrais atualizados com sucesso!");
          }}
        />
      )}
    </div>
  );
};
