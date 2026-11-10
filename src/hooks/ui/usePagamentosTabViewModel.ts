import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useConfiguracoes } from "@/hooks/api/useConfiguracoes";
import {
  useMotoristaFinanceiroApi,
  useMotoristaFinanceiroExcecoesApi,
} from "@/hooks/api/useMotoristaFinanceiroApi";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters/currency";
import { PREVIEW_COBRANCA_MODALIDADE } from "@/components/dialogs/WhatsAppCobrancaPreviewDialog";
import { VIDEO_APRESENTACAO_COBRANCA_AUTOMATICA } from "@/constants/tutorials";
import { TipoChavePix, TIPOS_CHAVE_PIX_LABEL } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { Veiculo } from "@/types/veiculo";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";

export const MODO_COBRANCA = ModoCobrancaEnum;
export type ModoCobranca = ModoCobrancaEnum;

export const PAGAMENTOS_SUB_TAB = {
  PIX: "pix",
  ENCARGOS: "encargos",
  ENVIOS: "envios",
} as const;

export type PagamentosSubTab = (typeof PAGAMENTOS_SUB_TAB)[keyof typeof PAGAMENTOS_SUB_TAB];

export const PAGAMENTOS_CONFIG_KEY = {
  AVISO_PREVIO_ATIVO: "cobranca_aviso_previo_ativo",
  DIAS_AVISO_PREVIO: "cobranca_dias_aviso_previo",
  VENCIMENTO_HOJE_ATIVO: "cobranca_vencimento_hoje_ativo",
  ATRASO_3_DIAS_ATIVO: "cobranca_atraso_3_dias_ativo",
} as const;

export type PagamentosConfigKey =
  | typeof PAGAMENTOS_CONFIG_KEY.AVISO_PREVIO_ATIVO
  | typeof PAGAMENTOS_CONFIG_KEY.VENCIMENTO_HOJE_ATIVO
  | typeof PAGAMENTOS_CONFIG_KEY.ATRASO_3_DIAS_ATIVO;

export function usePagamentosTabViewModel() {
  const { user } = useSession();
  const { isLoading: isProfileLoading } = useProfile(user?.id);
  const { configuracoes, isLoading: isConfigLoading, updateConfiguracoes } = useConfiguracoes();
  const { financeiro, isLoading: isFinanceiroLoading, updateFinanceiro, isUpdating } =
    useMotoristaFinanceiroApi();
  const { resumoExcecoes } = useMotoristaFinanceiroExcecoesApi();

  const {
    openWhatsAppCobrancaPreviewDialog,
    openEditarPixDialog,
    openEditarPixVeiculoDialog,
    openConfirmarMudancaModoVanDialog,
    openVideoStoriesDialog,
  } = useLayout();

  const { data: veiculosData } = useVeiculos({ usuarioId: user?.id });
  const veiculos = useMemo(() => veiculosData?.list || [], [veiculosData?.list]);
  const temMultiplosVeiculos = veiculos.length > 1;
  const temVeiculoComChavePropria = veiculos.some((v) =>
    Boolean(v.chave_pix && v.chave_pix.trim() !== "")
  );
  const deveExibirChavesPorVeiculo = veiculos.length > 0;

  const configSectionRef = useRef<HTMLDivElement | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<PagamentosSubTab>(PAGAMENTOS_SUB_TAB.PIX);
  const [isChangingModo, setIsChangingModo] = useState(false);
  const [changingTargetModo, setChangingTargetModo] = useState<ModoCobranca | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const scrollToConfigSection = useCallback(() => {
    setTimeout(() => {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 180);
  }, []);

  const isBusy =
    isChangingModo ||
    isUpdating ||
    isConfigLoading ||
    isFinanceiroLoading ||
    updatingKey !== null;

  const diasPadrao = configuracoes?.dias_aviso_vencimento_padrao_sistema ?? 2;
  const diasServidor = configuracoes?.cobranca_dias_aviso_previo ?? diasPadrao;
  const [localDias, setLocalDias] = useState<number>(diasServidor);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!isDirtyRef.current) {
      setLocalDias(diasServidor);
    }
  }, [diasServidor]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const isLoading = isProfileLoading || isFinanceiroLoading || isConfigLoading;

  const chavePixDisplay = useMemo(() => {
    const tipo = (financeiro?.tipo_chave_pix || null) as TipoChavePix | null;
    const chave = financeiro?.chave_pix_repasse || "";
    if (!chave || !tipo) return null;

    let chaveFormatada = chave;
    if (tipo === TipoChavePix.CPF) chaveFormatada = cpfMask(chave);
    else if (tipo === TipoChavePix.CNPJ) chaveFormatada = cnpjMask(chave);
    else if (tipo === TipoChavePix.TELEFONE) chaveFormatada = phoneMask(chave);
    else if (tipo === TipoChavePix.ALEATORIA) chaveFormatada = evpMask(chave);

    const tipoLabel = TIPOS_CHAVE_PIX_LABEL[tipo] || tipo;

    return { tipo: tipoLabel, chave: chaveFormatada };
  }, [financeiro?.tipo_chave_pix, financeiro?.chave_pix_repasse]);

  const taxaEfetiva = financeiro?.taxa_efetiva ?? 2.5;
  const taxaFormatada = formatCurrency(taxaEfetiva);
  const enviarRecibo = financeiro?.enviar_recibo_automatico ?? true;

  const modoServidor: ModoCobranca = useMemo(() => {
    return (financeiro?.modo_cobranca as ModoCobranca) || MODO_COBRANCA.DESATIVADO;
  }, [financeiro?.modo_cobranca]);

  const [modoVisual, setModoVisual] = useState<ModoCobranca>(modoServidor);

  useEffect(() => {
    setModoVisual(modoServidor);
  }, [modoServidor]);

  useEffect(() => {
    if (modoVisual !== MODO_COBRANCA.AUTOMATICA && activeSubTab === PAGAMENTOS_SUB_TAB.ENCARGOS) {
      setActiveSubTab(PAGAMENTOS_SUB_TAB.PIX);
    }
  }, [modoVisual, activeSubTab]);

  const totalExcecoesDivergentes = useCallback(
    (modo: ModoCobranca) => {
      if (!resumoExcecoes?.excecoes) return { count: 0, detalhes: {} };
      const exc = resumoExcecoes.excecoes;
      let count = 0;
      const detalhes: { desativado?: number; lembretes?: number; automatica?: number } = {};

      if (modo !== MODO_COBRANCA.DESATIVADO && exc.DESATIVADO > 0) {
        count += exc.DESATIVADO;
        detalhes.desativado = exc.DESATIVADO;
      }
      if (modo !== MODO_COBRANCA.LEMBRETES && exc.LEMBRETES > 0) {
        count += exc.LEMBRETES;
        detalhes.lembretes = exc.LEMBRETES;
      }
      if (modo !== MODO_COBRANCA.AUTOMATICA && exc.AUTOMATICA > 0) {
        count += exc.AUTOMATICA;
        detalhes.automatica = exc.AUTOMATICA;
      }

      return { count, detalhes };
    },
    [resumoExcecoes?.excecoes]
  );

  const { count: quantidadeExcecoesAtuais } = useMemo(() => {
    return totalExcecoesDivergentes(modoVisual);
  }, [totalExcecoesDivergentes, modoVisual]);

  const executarTrocaModo = useCallback(
    async (novoModo: ModoCobranca, aplicarATodos?: boolean) => {
      if (novoModo === MODO_COBRANCA.DESATIVADO) {
        setChangingTargetModo(MODO_COBRANCA.DESATIVADO);
        setIsChangingModo(true);
        try {
          await updateFinanceiro({
            modo_cobranca: ModoCobrancaEnum.DESATIVADO,
            aplicar_a_todos: aplicarATodos,
          });
          setModoVisual(MODO_COBRANCA.DESATIVADO);

          toast.success(
            aplicarATodos
              ? "Envio de avisos desativado para todos os alunos."
              : "Envio de avisos da van desativado."
          );
        } catch {
          setModoVisual(modoServidor);
          toast.error("Não foi possível alterar a modalidade de cobrança.");
        } finally {
          setIsChangingModo(false);
          setChangingTargetModo(null);
        }
        return;
      }

      if (novoModo === MODO_COBRANCA.LEMBRETES) {
        setChangingTargetModo(MODO_COBRANCA.LEMBRETES);
        setIsChangingModo(true);
        try {
          await updateFinanceiro({
            modo_cobranca: ModoCobrancaEnum.LEMBRETES,
            aplicar_a_todos: aplicarATodos,
          });
          setModoVisual(MODO_COBRANCA.LEMBRETES);
          scrollToConfigSection();

          toast.success(
            aplicarATodos
              ? "Lembretes no WhatsApp ativados para todos os alunos."
              : "Lembretes no WhatsApp ativados."
          );
        } catch {
          setModoVisual(modoServidor);
          toast.error("Não foi possível ativar os lembretes no WhatsApp.");
        } finally {
          setIsChangingModo(false);
          setChangingTargetModo(null);
        }
        return;
      }

      openEditarPixDialog({
        isActivatingAutomatica: true,
        aplicarATodos,
        onSuccess: () => {
          setModoVisual(MODO_COBRANCA.AUTOMATICA);
          scrollToConfigSection();
        },
      });
    },
    [
      updateFinanceiro,
      modoServidor,
      openEditarPixDialog,
      scrollToConfigSection,
    ]
  );

  const handleSelectModo = useCallback(
    async (novoModo: ModoCobranca) => {
      if (isBusy) return;
      if (novoModo === modoVisual) return;

      const { count: totalDivergentes, detalhes: detalhesDivergentes } =
        totalExcecoesDivergentes(novoModo);

      if (totalDivergentes > 0) {
        const modoLabels: Record<ModoCobranca, string> = {
          [MODO_COBRANCA.DESATIVADO]: "Desativado (manual)",
          [MODO_COBRANCA.LEMBRETES]: "Lembretes Automáticos no WhatsApp",
          [MODO_COBRANCA.AUTOMATICA]: "Cobrança & Baixa Automática",
        };

        openConfirmarMudancaModoVanDialog({
          quantidadeExcecoes: totalDivergentes,
          novoModoLabel: modoLabels[novoModo] || novoModo,
          detalhesExcecoes: detalhesDivergentes,
          onConfirmar: (aplicarATodos: boolean) => {
            setTimeout(() => {
              void executarTrocaModo(novoModo, aplicarATodos);
            }, 150);
          },
        });
        return;
      }

      await executarTrocaModo(novoModo);
    },
    [isBusy, modoVisual, totalExcecoesDivergentes, openConfirmarMudancaModoVanDialog, executarTrocaModo]
  );

  const handleOpenEditarPixPadrao = useCallback(() => {
    openEditarPixDialog();
  }, [openEditarPixDialog]);

  const handleOpenEditarPixVeiculo = useCallback(
    (veiculo: Veiculo) => {
      openEditarPixVeiculoDialog({ veiculo });
    },
    [openEditarPixVeiculoDialog]
  );

  const handleOpenPreviewCobranca = useCallback(
    (modoOverride?: ModoCobranca) => {
      const targetModo = modoOverride ?? modoVisual;
      openWhatsAppCobrancaPreviewDialog({
        modalidade:
          targetModo === MODO_COBRANCA.AUTOMATICA
            ? PREVIEW_COBRANCA_MODALIDADE.AUTOMATICA
            : PREVIEW_COBRANCA_MODALIDADE.LEMBRETE,
      });
    },
    [openWhatsAppCobrancaPreviewDialog, modoVisual]
  );

  const handleWatchVideoCobrancaAutomatica = useCallback(() => {
    openVideoStoriesDialog({
      videosData: [VIDEO_APRESENTACAO_COBRANCA_AUTOMATICA],
      title: VIDEO_APRESENTACAO_COBRANCA_AUTOMATICA.title,
      showCta: false,
      loop: false,
    });
  }, [openVideoStoriesDialog]);

  const handleToggleAviso = useCallback(
    async (key: PagamentosConfigKey, currentValue: boolean) => {
      if (isBusy) return;
      setUpdatingKey(key);
      try {
        await updateConfiguracoes({ [key]: !currentValue });
      } catch {
        toast.error("Não foi possível atualizar a configuração de envio.");
      } finally {
        setUpdatingKey(null);
      }
    },
    [isBusy, updateConfiguracoes]
  );

  const handleDiasStep = useCallback(
    (delta: number) => {
      if (isBusy) return;

      const nextVal = Math.max(1, Math.min(5, localDias + delta));
      if (nextVal === localDias) return;

      setLocalDias(nextVal);
      isDirtyRef.current = true;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        setUpdatingKey(PAGAMENTOS_CONFIG_KEY.DIAS_AVISO_PREVIO);
        try {
          await updateConfiguracoes({ [PAGAMENTOS_CONFIG_KEY.DIAS_AVISO_PREVIO]: nextVal });
        } catch {
          setLocalDias(diasServidor);
          toast.error("Não foi possível alterar os dias de antecedência.");
        } finally {
          setUpdatingKey(null);
          isDirtyRef.current = false;
        }
      }, 600);
    },
    [isBusy, localDias, updateConfiguracoes, diasServidor]
  );

  const handleToggleReciboAutomatico = useCallback(
    async (checked: boolean) => {
      try {
        await updateFinanceiro({ enviar_recibo_automatico: checked });
        toast.success(
          checked ? "Recibo automático ativado." : "Recibo automático desativado."
        );
      } catch {
        toast.error("Não foi possível atualizar o envio de recibo.");
      }
    },
    [updateFinanceiro]
  );

  return {
    configSectionRef,
    isLoading,
    isBusy,
    activeSubTab,
    setActiveSubTab,
    modoVisual,
    changingTargetModo,
    updatingKey,
    taxaEfetiva,
    taxaFormatada,
    enviarRecibo,
    quantidadeExcecoesAtuais,
    chavePixDisplay,
    veiculos,
    temMultiplosVeiculos,
    temVeiculoComChavePropria,
    deveExibirChavesPorVeiculo,
    configuracoes,
    localDias,
    handleSelectModo,
    handleOpenEditarPixPadrao,
    handleOpenEditarPixVeiculo,
    handleOpenPreviewCobranca,
    handleWatchVideoCobrancaAutomatica,
    handleToggleAviso,
    handleDiasStep,
    handleToggleReciboAutomatico,
  };
}
