import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { useCarteirinhaQuery } from "@/hooks/api/useResponsavelAuthApi";
import { useLayoutSafe } from "@/contexts/LayoutContext";
import { openBrowserLink } from "@/utils/browser";
import { ResponsavelCobrancaItem } from "@/types/responsavel";

export function useResponsavelCarteirinhaViewModel() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, passageiros, passageiroSelecionado, logout, refetchPassageiros } = useResponsavelAuth();
  const layoutContext = useLayoutSafe();
  const openReceiptDialog = layoutContext?.openReceiptDialog;
  const setPageTitle = layoutContext?.setPageTitle;

  useEffect(() => {
    if (setPageTitle) {
      setPageTitle("Carteirinha Digital");
    }
  }, [setPageTitle]);

  const validTabs = ["geral", "dados-pessoais", "parcelas", "ausencias", "responsaveis", "contrato"];
  const urlTab = searchParams.get("tab");
  const initialTab = urlTab && validTabs.includes(urlTab) ? urlTab : "geral";
  const [activeTab, setActiveTabState] = useState(initialTab);

  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("tab", tab);
      return updated;
    });
  };

  const passageiroId = passageiroSelecionado?.id || null;
  const { data: carteirinha, isLoading, error, refetch } = useCarteirinhaQuery(passageiroId, token);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const handleSwitchPassageiro = () => {
    navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      refetchPassageiros()
    ]);
  };

  const handleVerRecibo = (reciboUrl: string, cobranca: ResponsavelCobrancaItem) => {
    if (openReceiptDialog && reciboUrl) {
      openReceiptDialog({
        receiptUrl: reciboUrl,
        cobrancaDescricao: `Recibo de ${cobranca.mes}/${cobranca.ano}`
      });
    } else if (reciboUrl) {
      openBrowserLink(reciboUrl);
    }
  };

  const nomeExibicao = carteirinha?.nome || passageiroSelecionado?.nome || "Passageiro";

  const responsavelLogado = (() => {
    if (!carteirinha) return null;
    const logadoId = carteirinha.responsavel_logado_id;
    if (logadoId && carteirinha.responsavel_principal?.id === logadoId) {
      return carteirinha.responsavel_principal;
    }
    if (logadoId && carteirinha.responsaveis) {
      const adicional = carteirinha.responsaveis.find((r) => r.id === logadoId);
      if (adicional) return adicional;
    }
    return carteirinha.responsavel_principal || null;
  })();

  const isMissingComplementares = Boolean(
    carteirinha &&
    responsavelLogado &&
    (!responsavelLogado.cpf || responsavelLogado.cpf.trim() === "" ||
     !responsavelLogado.email || responsavelLogado.email.trim() === "" ||
     !responsavelLogado.cep || responsavelLogado.cep.trim() === "" ||
     !responsavelLogado.logradouro || responsavelLogado.logradouro.trim() === "")
  );

  return {
    token,
    passageiroId,
    passageiros,
    passageiroSelecionado,
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
  };
}
