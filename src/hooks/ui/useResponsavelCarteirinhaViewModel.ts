import { useState, useEffect, useMemo, useRef } from "react";
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

  const currentYear = new Date().getFullYear();
  const urlAno = Number(searchParams.get("ano"));

  const [selectedYear, setSelectedYearState] = useState<number>(() => {
    if (urlAno && !Number.isNaN(urlAno) && urlAno >= 2020 && urlAno <= 2100) {
      return urlAno;
    }
    return currentYear;
  });

  const passageiroId = passageiroSelecionado?.id || null;
  const { data: rawCarteirinha, isLoading, error, refetch } = useCarteirinhaQuery(passageiroId, token, selectedYear);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>();
    if (Array.isArray(rawCarteirinha?.anos_matriculados) && rawCarteirinha.anos_matriculados.length > 0) {
      rawCarteirinha.anos_matriculados.forEach((a) => {
        const num = Number(a);
        if (!Number.isNaN(num) && num > 0) anos.add(num);
      });
    } else if (rawCarteirinha?.ano_letivo) {
      const num = Number(rawCarteirinha.ano_letivo);
      if (!Number.isNaN(num) && num > 0) anos.add(num);
    }
    return Array.from(anos).sort((a, b) => a - b);
  }, [rawCarteirinha?.anos_matriculados, rawCarteirinha?.ano_letivo]);

  const hasSetInitialYear = useRef(Boolean(urlAno && !Number.isNaN(urlAno) && urlAno >= 2020 && urlAno <= 2100));

  useEffect(() => {
    if (!rawCarteirinha) return;

    if (!hasSetInitialYear.current) {
      hasSetInitialYear.current = true;
      if (anosDisponiveis.includes(currentYear)) {
        setSelectedYearState(currentYear);
      } else if (anosDisponiveis.length > 0) {
        setSelectedYearState(anosDisponiveis[anosDisponiveis.length - 1]);
      } else if (rawCarteirinha.ano_letivo && Number(rawCarteirinha.ano_letivo) > 0) {
        setSelectedYearState(Number(rawCarteirinha.ano_letivo));
      }
      return;
    }

    if (urlAno && anosDisponiveis.includes(urlAno)) {
      if (selectedYear !== urlAno) setSelectedYearState(urlAno);
      return;
    }

    if (anosDisponiveis.length > 0 && !anosDisponiveis.includes(selectedYear)) {
      const target = anosDisponiveis.includes(currentYear)
        ? currentYear
        : anosDisponiveis[anosDisponiveis.length - 1];
      setSelectedYearState(target);
    }
  }, [rawCarteirinha, anosDisponiveis, urlAno, selectedYear, currentYear]);

  const setSelectedYear = (ano: number) => {
    setSelectedYearState(ano);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("ano", String(ano));
      return updated;
    }, { replace: true });
  };

  const carteirinha = useMemo(() => {
    if (!rawCarteirinha) return undefined;
    const mat = (rawCarteirinha.matriculas || []).find((m) => Number(m.ano_letivo) === Number(selectedYear));
    const cobrancasAno = (rawCarteirinha.cobrancas || []).filter(
      (c) => Number(c.ano_letivo ?? c.ano) === Number(selectedYear)
    );
    const recibosAno = (rawCarteirinha.recibos_anuais || []).filter(
      (r) => Number(r.ano) === Number(selectedYear)
    );

    const contratoAno = mat?.contrato !== undefined
      ? mat.contrato
      : (rawCarteirinha.contrato && Number(rawCarteirinha.contrato.ano) === Number(selectedYear) ? rawCarteirinha.contrato : null);

    if (!mat) {
      return {
        ...rawCarteirinha,
        ano_letivo: selectedYear,
        contrato: contratoAno,
        cobrancas: cobrancasAno,
        recibos_anuais: recibosAno,
      };
    }

    return {
      ...rawCarteirinha,
      ano_letivo: mat.ano_letivo,
      ativo: mat.ativo,
      isento: mat.isento ?? rawCarteirinha.isento,
      escola_nome: mat.escola_nome ?? rawCarteirinha.escola_nome,
      veiculo_placa: mat.veiculo_placa ?? rawCarteirinha.veiculo_placa,
      veiculo_modelo: mat.veiculo_modelo ?? rawCarteirinha.veiculo_modelo,
      periodo: mat.periodo ?? rawCarteirinha.periodo,
      modalidade: mat.modalidade ?? rawCarteirinha.modalidade,
      turma: mat.turma ?? rawCarteirinha.turma,
      sala: mat.sala ?? rawCarteirinha.sala,
      nome_professor: mat.nome_professor ?? rawCarteirinha.nome_professor,
      horario_entrada: mat.horario_entrada ?? rawCarteirinha.horario_entrada,
      horario_saida: mat.horario_saida ?? rawCarteirinha.horario_saida,
      valor_cobranca: mat.valor_cobranca ?? rawCarteirinha.valor_cobranca,
      dia_vencimento: mat.dia_vencimento ?? rawCarteirinha.dia_vencimento,
      data_inicio_transporte: mat.data_inicio_transporte ?? rawCarteirinha.data_inicio_transporte,
      data_fim_transporte: mat.data_fim_transporte ?? rawCarteirinha.data_fim_transporte,
      data_inicio_cobranca: mat.data_inicio_cobranca ?? rawCarteirinha.data_inicio_cobranca,
      data_fim_cobranca: mat.data_fim_cobranca ?? rawCarteirinha.data_fim_cobranca,
      contrato: contratoAno,
      cobrancas: cobrancasAno,
      recibos_anuais: recibosAno,
    };
  }, [rawCarteirinha, selectedYear]);

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
        cobrancaDescricao: `Recibo de ${cobranca.mes}/${cobranca.ano}`,
        cobrancaId: cobranca.id,
        mes: cobranca.mes,
        ano: cobranca.ano,
        passageiroId: passageiroSelecionado?.id || carteirinha?.id,
      });
    } else if (reciboUrl) {
      openBrowserLink(reciboUrl);
    }
  };

  const nomeExibicao = carteirinha?.nome || passageiroSelecionado?.nome || "Aluno";

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
    handleVerRecibo,
    refetch,
    refetchPassageiros
  };
}
