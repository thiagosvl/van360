import { toast } from "sonner";
import { ResponsavelDadosComplementaresDialog } from "@/components/dialogs/ResponsavelDadosComplementaresDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { CarteirinhaSkeleton } from "@/components/skeletons/CarteirinhaSkeleton";
import { ArrowLeftRight, CalendarOff, FileText, LayoutDashboard, LogOut, MoreVertical, Receipt, User, Users } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabNav, AppTabItem } from "@/components/ui/AppTabNav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { AnoLetivoSelect } from "@/components/common/AnoLetivoSelect";
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
    selectedYear,
    setSelectedYear,
    anosDisponiveis,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    nomeExibicao,
    isMissingComplementares,
    handleLogout,
    handleSwitchPassageiro,
    handleRefresh,
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

  const tabItems = React.useMemo<AppTabItem[]>(() => [
    {
      value: "geral",
      label: "Geral",
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      value: "parcelas",
      label: "Parcelas",
      icon: <Receipt className="w-3.5 h-3.5" />,
    },
    {
      value: "dados-pessoais",
      label: "Dados Pessoais",
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      value: "ausencias",
      label: "Ausências",
      icon: <CalendarOff className="w-3.5 h-3.5" />,
      disabled: (carteirinha?.rotas || []).length === 0,
      title: (carteirinha?.rotas || []).length === 0 ? "Aluno não possui rota atribuída" : undefined,
    },
    {
      value: "contrato",
      label: "Contrato",
      icon: <FileText className="w-3.5 h-3.5" />,
      disabled: !carteirinha?.contrato,
      title: !carteirinha?.contrato ? "Aluno não possui contrato" : undefined,
    },
    {
      value: "responsaveis",
      label: "Responsáveis",
      icon: <Users className="w-3.5 h-3.5" />,
    },
  ], [carteirinha]);

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

          <h1 className="text-sm sm:text-base font-bold text-[#0a0a0a] tracking-tight">
            Carteirinha Digital
          </h1>

          <div className="flex items-center gap-2">
            {anosDisponiveis.length > 0 && (
              <AnoLetivoSelect
                ano={selectedYear}
                onChangeAno={setSelectedYear}
                anosDisponiveis={anosDisponiveis}
                className="h-9"
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Menu de opções"
                >
                  <MoreVertical className="h-4.5 w-4.5 text-[#0a0a0a]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-[18px] p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                {passageiros.length > 1 && (
                  <>
                    <DropdownMenuItem
                      onClick={handleSwitchPassageiro}
                      className="rounded-[12px] py-2.5 px-3 text-xs font-medium cursor-pointer text-[#0a0a0a] flex items-center gap-2.5 focus:bg-[#f5f5f5]"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-[#737373]" />
                      <span>Trocar de Aluno</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-[12px] py-2.5 px-3 text-xs font-medium cursor-pointer text-[#e7000b] focus:text-[#e7000b] focus:bg-rose-50 flex items-center gap-2.5"
                >
                  <LogOut className="h-4 w-4 text-[#e7000b]" />
                  <span>Sair da Conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <ResponsavelCarteirinhaHeader carteirinha={carteirinha} />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <AppTabNav
                  items={tabItems}
                  activeTab={activeTab}
                  layout="auto"
                  autoScrollToActive
                />

                <TabsContent value="geral" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaGeral carteirinha={carteirinha} onRefresh={refetch} onSelectTab={setActiveTab} />
                </TabsContent>

                <TabsContent value="parcelas" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaCobrancas carteirinha={carteirinha} />
                </TabsContent>

                <TabsContent value="dados-pessoais" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaDadosPessoais carteirinha={carteirinha} />
                </TabsContent>

                <TabsContent value="ausencias" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaAusencias carteirinha={carteirinha} onRefresh={refetch} />
                </TabsContent>

                <TabsContent value="contrato" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaContrato carteirinha={carteirinha} />
                </TabsContent>

                <TabsContent value="responsaveis" className="mt-5 outline-none space-y-5">
                  <ResponsavelCarteirinhaResponsaveis carteirinha={carteirinha} onRefresh={refetch} />
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
