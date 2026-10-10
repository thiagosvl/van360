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
import { Banner } from "@/components/ui/Banner";
import { AppPermissionStatus, PermissionRescueType, UserType } from "@/types/enums";

import { useLayoutSafe } from "@/contexts/LayoutContext";

export const ResponsavelCarteirinhaBase: React.FC = () => {
  const navigate = useNavigate();
  const { pushStatus, requestPushPermission } = useAppPermissions();
  const layoutContext = useLayoutSafe();
  const setPageTitle = layoutContext?.setPageTitle;

  const {
    token,
    passageiroId,
    passageiros,
    carteirinha,
    responsavelLogado,
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
    if (setPageTitle) {
      setPageTitle("Carteirinha Digital");
    }
    document.title = "Carteirinha Digital | Van360";
  }, [setPageTitle, nomeExibicao]);

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
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col">
      <header className="border-b border-[#e5e5e5] bg-white px-4 sm:px-6 lg:px-8 pt-[calc(0.875rem+var(--safe-area-top))] pb-3.5 sticky top-0 z-50 shadow-xs">
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
                className="flex items-center gap-1.5 rounded-[18px] border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Trocar Aluno</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-[#737373]" />
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
            <Banner
              variant="danger"
              title="Erro ao carregar os dados"
              description="Não foi possível carregar os dados do aluno. Tente atualizar a página."
            />
          ) : (
            <>
              {/* Header do Aluno */}
              <ResponsavelCarteirinhaHeader carteirinha={carteirinha} />

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar bg-[#f5f5f5] border border-[#e5e5e5] p-1 rounded-[22px]">
                  <TabsList ref={tabListRef} className="flex min-w-full w-max md:w-full md:grid md:grid-cols-6 min-h-[38px] sm:min-h-[42px] bg-transparent p-0 gap-1 text-xs sm:text-sm">
                    <TabsTrigger
                      value="geral"
                      className="rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
                    >
                      Geral
                    </TabsTrigger>
                    <TabsTrigger
                      value="parcelas"
                      className="rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
                    >
                      Parcelas
                    </TabsTrigger>
                    <TabsTrigger
                      value="ausencias"
                      disabled={(carteirinha.rotas || []).length === 0}
                      title={(carteirinha.rotas || []).length === 0 ? "Aluno não possui rota atribuída" : undefined}
                      className="rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
                    >
                      Ausências
                    </TabsTrigger>
                    <TabsTrigger
                      value="responsaveis"
                      className="rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
                    >
                      Responsáveis
                    </TabsTrigger>
                    <TabsTrigger
                      value="contrato"
                      disabled={!carteirinha.contrato}
                      title={!carteirinha.contrato ? "Aluno não possui contrato" : undefined}
                      className="rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
                    >
                      Contrato
                    </TabsTrigger>
                    <TabsTrigger
                      value="dados-pessoais"
                      className="rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
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
          initialCpf={responsavelLogado?.cpf || ""}
          initialEmail={responsavelLogado?.email || ""}
          initialCep={responsavelLogado?.cep || ""}
          initialLogradouro={responsavelLogado?.logradouro || ""}
          initialNumero={responsavelLogado?.numero || ""}
          initialComplemento={responsavelLogado?.complemento || ""}
          initialBairro={responsavelLogado?.bairro || ""}
          initialCidade={responsavelLogado?.cidade || ""}
          initialEstado={responsavelLogado?.estado || ""}
          initialReferencia={responsavelLogado?.referencia || ""}
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
