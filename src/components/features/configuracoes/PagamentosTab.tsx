import { memo, useState, useEffect, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PagamentosTabSkeleton } from "@/components/skeletons";
import { Banner } from "@/components/ui/Banner";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useConfiguracoes } from "@/hooks";
import { useMotoristaFinanceiroApi, useMotoristaFinanceiroExcecoesApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useLayout } from "@/contexts/LayoutContext";
import { MultaJurosConfigForm } from "./MultaJurosConfigForm";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { WizardModalidade } from "@/hooks/ui/useConfigurarCobrancaWizardViewModel";
import { PREVIEW_COBRANCA_MODALIDADE } from "@/components/dialogs/WhatsAppCobrancaPreviewDialog";
import { TipoChavePix, TIPOS_CHAVE_PIX_LABEL } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import {
  CreditCard,
  Percent,
  Bell,
  BellOff,
  Sparkles,
  ReceiptText,
  Loader2,
  Minus,
  Plus,
  CheckCircle2,
  CircleDollarSign,
  Receipt,
  Key,
  Pencil,
} from "lucide-react";

export const MODO_COBRANCA = ModoCobrancaEnum;
export type ModoCobranca = ModoCobrancaEnum;

type ConfigKey =
  | "cobranca_aviso_previo_ativo"
  | "cobranca_vencimento_hoje_ativo"
  | "cobranca_atraso_3_dias_ativo";

export const PagamentosTab = memo(function PagamentosTab() {
  const { user } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const { configuracoes, isLoading: isConfigLoading, updateConfiguracoes } = useConfiguracoes();
  const { financeiro, isLoading: isFinanceiroLoading, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();
  const { resumoExcecoes } = useMotoristaFinanceiroExcecoesApi();

  const {
    openWhatsAppCobrancaPreviewDialog,
    openEditarPixDialog,
    openConfigurarCobrancaWizardDialog,
    openConfirmarMudancaModoVanDialog,
  } = useLayout();

  const [isChangingModo, setIsChangingModo] = useState(false);
  const [changingTargetModo, setChangingTargetModo] = useState<ModoCobranca | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

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

  const temChavePix = Boolean(financeiro?.chave_pix_repasse || profile?.chave_pix);

  const chavePixDisplay = useMemo(() => {
    const tipo = (financeiro?.tipo_chave_pix || profile?.tipo_chave_pix || null) as TipoChavePix | null;
    const chave = financeiro?.chave_pix_repasse || profile?.chave_pix || "";
    if (!chave || !tipo) return null;

    let chaveFormatada = chave;
    if (tipo === TipoChavePix.CPF) chaveFormatada = cpfMask(chave);
    else if (tipo === TipoChavePix.CNPJ) chaveFormatada = cnpjMask(chave);
    else if (tipo === TipoChavePix.TELEFONE) chaveFormatada = phoneMask(chave);
    else if (tipo === TipoChavePix.ALEATORIA) chaveFormatada = evpMask(chave);

    const tipoLabel = TIPOS_CHAVE_PIX_LABEL[tipo] || tipo;

    return { tipo: tipoLabel, chave: chaveFormatada };
  }, [financeiro?.tipo_chave_pix, financeiro?.chave_pix_repasse, profile?.tipo_chave_pix, profile?.chave_pix]);

  const taxaEfetiva = financeiro?.taxa_efetiva ?? 2.9;
  const taxaFormatada = formatCurrency(taxaEfetiva);
  const enviarRecibo = financeiro?.enviar_recibo_automatico ?? true;

  const modoServidor: ModoCobranca = useMemo(() => {
    return (financeiro?.modo_cobranca as ModoCobranca) || MODO_COBRANCA.DESATIVADO;
  }, [financeiro?.modo_cobranca]);

  const [modoVisual, setModoVisual] = useState<ModoCobranca>(modoServidor);

  useEffect(() => {
    setModoVisual(modoServidor);
  }, [modoServidor]);

  const totalExcecoesDivergentes = (modo: ModoCobranca) => {
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
  };

  const { count: quantidadeExcecoesAtuais } = useMemo(() => {
    return totalExcecoesDivergentes(modoVisual);
  }, [resumoExcecoes?.excecoes, modoVisual]);

  const executarTrocaModo = async (novoModo: ModoCobranca, aplicarATodos?: boolean) => {
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

    openConfigurarCobrancaWizardDialog({
      modalidade: novoModo as WizardModalidade,
      aplicar_a_todos: aplicarATodos,
      onSuccess: () => {
        setModoVisual(novoModo);
      },
    });
  };

  const handleSelectModo = async (novoModo: ModoCobranca) => {
    if (isBusy) return;
    if (novoModo === modoVisual) return;

    const { count: totalDivergentes, detalhes: detalhesDivergentes } = totalExcecoesDivergentes(novoModo);

    if (totalDivergentes > 0) {
      const modoLabels: Record<ModoCobranca, string> = {
        [MODO_COBRANCA.DESATIVADO]: "Desativado (manual)",
        [MODO_COBRANCA.LEMBRETES]: "Apenas lembretes no WhatsApp",
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
  };

  const handlePixSaved = async () => {
    if (modoVisual === MODO_COBRANCA.AUTOMATICA && financeiro?.modo_cobranca !== ModoCobrancaEnum.AUTOMATICA) {
      try {
        await updateFinanceiro({ modo_cobranca: ModoCobrancaEnum.AUTOMATICA });
        toast.success("Chave Pix salva e baixa automática ativada!");
      } catch {
        toast.error("Chave salva, mas não foi possível ativar a cobrança automática.");
      }
    }
  };

  const handleToggleAviso = async (key: ConfigKey, currentValue: boolean) => {
    if (isBusy) return;
    setUpdatingKey(key);
    try {
      await updateConfiguracoes({ [key]: !currentValue });
    } catch {
      toast.error("Não foi possível atualizar a configuração de envio.");
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleDiasStep = (delta: number) => {
    if (isBusy) return;

    const nextVal = Math.max(1, Math.min(5, localDias + delta));
    if (nextVal === localDias) return;

    setLocalDias(nextVal);
    isDirtyRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setUpdatingKey("cobranca_dias_aviso_previo");
      try {
        await updateConfiguracoes({ cobranca_dias_aviso_previo: nextVal });
      } catch {
        setLocalDias(diasServidor);
        toast.error("Não foi possível alterar os dias de antecedência.");
      } finally {
        setUpdatingKey(null);
        isDirtyRef.current = false;
      }
    }, 600);
  };

  if (isLoading) {
    return <PagamentosTabSkeleton />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
        <div className="hidden sm:flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <CreditCard className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Cobranças & Pix
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Lembretes aos pais, chave Pix, baixa automática, repasse e recibos
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
            Como você deseja cobrar os pais?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleSelectModo(MODO_COBRANCA.DESATIVADO)}
              className={cn(
                "p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] border text-left transition-all flex flex-col justify-between gap-2 sm:gap-3 cursor-pointer relative disabled:opacity-60 disabled:cursor-not-allowed",
                modoVisual === MODO_COBRANCA.DESATIVADO
                  ? "border-2 border-primary bg-primary/[0.02] shadow-xs"
                  : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]/70 hover:border-[#737373]/30"
              )}
            >
              <div className="space-y-1.5 sm:space-y-2.5 w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] flex items-center justify-center border transition-colors shrink-0",
                        modoVisual === MODO_COBRANCA.DESATIVADO
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
                      )}
                    >
                      <BellOff className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-snug">
                      Não cobrar os pais
                    </h4>
                  </div>

                  {changingTargetModo === MODO_COBRANCA.DESATIVADO ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[18px] bg-primary/10 text-primary border border-primary/20 text-[11px] sm:text-xs font-medium shrink-0">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      Ativando...
                    </span>
                  ) : modoVisual === MODO_COBRANCA.DESATIVADO ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[18px] bg-primary/10 text-primary border border-primary/20 text-[11px] sm:text-xs font-medium shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ativo
                    </span>
                  ) : (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#e5e5e5] bg-[#fafafa] shrink-0" />
                  )}
                </div>

                <p className="text-xs text-[#737373] leading-relaxed">
                  Sem mensagens aos pais. Você lembra e recebe manualmente.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleSelectModo(MODO_COBRANCA.LEMBRETES)}
              className={cn(
                "p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] border text-left transition-all flex flex-col justify-between gap-2 sm:gap-3 cursor-pointer relative disabled:opacity-60 disabled:cursor-not-allowed",
                modoVisual === MODO_COBRANCA.LEMBRETES
                  ? "border-2 border-primary bg-primary/[0.02] shadow-xs"
                  : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]/70 hover:border-[#737373]/30"
              )}
            >
              <div className="space-y-1.5 sm:space-y-2.5 w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] flex items-center justify-center border transition-colors shrink-0",
                        modoVisual === MODO_COBRANCA.LEMBRETES
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
                      )}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-snug">
                      Apenas lembretes no WhatsApp
                    </h4>
                  </div>

                  {changingTargetModo === MODO_COBRANCA.LEMBRETES ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[18px] bg-primary/10 text-primary border border-primary/20 text-[11px] sm:text-xs font-medium shrink-0">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      Ativando...
                    </span>
                  ) : modoVisual === MODO_COBRANCA.LEMBRETES ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[18px] bg-primary/10 text-primary border border-primary/20 text-[11px] sm:text-xs font-medium shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ativo
                    </span>
                  ) : (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#e5e5e5] bg-[#fafafa] shrink-0" />
                  )}
                </div>

                <p className="text-xs text-[#737373] leading-relaxed">
                  Avisos antes e no vencimento. Baixa manual por você.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleSelectModo(MODO_COBRANCA.AUTOMATICA)}
              className={cn(
                "p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] border text-left transition-all flex flex-col justify-between gap-2 sm:gap-3 cursor-pointer relative disabled:opacity-60 disabled:cursor-not-allowed",
                modoVisual === MODO_COBRANCA.AUTOMATICA
                  ? "border-2 border-emerald-600 bg-emerald-50/40 shadow-xs"
                  : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]/70 hover:border-[#737373]/30"
              )}
            >
              <div className="space-y-1.5 sm:space-y-2.5 w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] flex items-center justify-center border transition-colors shrink-0",
                        modoVisual === MODO_COBRANCA.AUTOMATICA
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-snug">
                      Cobrança & Baixa Automática
                    </h4>
                  </div>

                  {changingTargetModo === MODO_COBRANCA.AUTOMATICA ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[18px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[11px] sm:text-xs font-medium shrink-0">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      Ativando...
                    </span>
                  ) : modoVisual === MODO_COBRANCA.AUTOMATICA ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[18px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[11px] sm:text-xs font-medium shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ativo
                    </span>
                  ) : (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#e5e5e5] bg-[#fafafa] shrink-0" />
                  )}
                </div>

                <p className="text-xs text-[#737373] leading-relaxed">
                  Pix com baixa automática e repasse. Taxa de {taxaFormatada}/parcela.
                </p>
              </div>
            </button>
          </div>

          {quantidadeExcecoesAtuais > 0 && (
            <Banner
              variant="info"
              description={`Você possui ${quantidadeExcecoesAtuais} ${
                quantidadeExcecoesAtuais === 1
                  ? "aluno com regra diferente do padrão da van"
                  : "alunos com regras diferentes do padrão da van"
              }. Alterações no padrão podem manter ou unificar essas regras.`}
            />
          )}
        </div>
      </div>

      {modoVisual !== MODO_COBRANCA.DESATIVADO && (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                <CreditCard className="w-5 h-5 text-[#0a0a0a]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                  {modoVisual === MODO_COBRANCA.AUTOMATICA
                    ? "Chave Pix para Repasse (Obrigatória)"
                    : "Chave Pix de Recebimento (Opcional)"}
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  {modoVisual === MODO_COBRANCA.AUTOMATICA
                    ? "Sua conta bancária onde o dinheiro dos pagamentos recebidos será repassado."
                    : "Chave Pix enviada aos pais nos lembretes do WhatsApp."}
                </p>
              </div>
            </div>
          </div>

          {modoVisual === MODO_COBRANCA.AUTOMATICA ? (
            chavePixDisplay ? (
              <Banner
                variant="success"
                description="Chave Pix de repasse configurada. Assim que o responsável pagar via Pix, a baixa na parcela é instantânea e o repasse é depositado diretamente na conta desta chave."
              />
            ) : (
              <Banner
                variant="warning"
                description="Obrigatório para repasse: cadastre sua chave Pix para habilitar o recebimento automático. O dinheiro das parcelas pagas pelos pais será transferido para ela."
              />
            )
          ) : (
            <Banner
              variant="info"
              description={
                chavePixDisplay
                  ? "Sua chave Pix cadastrada será enviada aos responsáveis nos lembretes de cobrança para pagamento direto."
                  : "Opcional: cadastre sua chave Pix se desejar que ela seja enviada nos lembretes do WhatsApp. Se preferir não cadastrar, o lembrete será enviado apenas com o valor e a data de vencimento."
              }
            />
          )}

          {chavePixDisplay ? (
            <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-[14px] bg-white text-[#737373] flex items-center justify-center border border-[#e5e5e5] shrink-0">
                  <Key className="w-4.5 h-4.5 text-[#0a0a0a]" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-xs font-medium text-[#737373] block">
                    Chave Pix ({chavePixDisplay.tipo})
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight truncate">
                    {chavePixDisplay.chave}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  openEditarPixDialog({
                    onSuccess: handlePixSaved,
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-[18px] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs font-medium transition-colors cursor-pointer border border-[#e5e5e5] shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Pencil className="w-3.5 h-3.5 text-[#737373]" />
                Alterar Chave Pix
              </button>
            </div>
          ) : (
            <div className="bg-[#fafafa] rounded-[18px] border border-dashed border-[#e5e5e5] p-5 sm:p-6 text-center space-y-3">
              <div className="h-10 w-10 rounded-[14px] bg-white text-[#737373] flex items-center justify-center border border-[#e5e5e5] mx-auto">
                <Key className="w-5 h-5 text-[#0a0a0a]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#0a0a0a]">
                  Nenhuma chave Pix configurada
                </h4>
                <p className="text-xs text-[#737373] max-w-sm mx-auto">
                  {modoVisual === MODO_COBRANCA.AUTOMATICA
                    ? "Cadastre sua chave Pix para poder receber os repasses automáticos das parcelas pagas."
                    : "Cadastre uma chave Pix caso queira que ela seja enviada nos lembretes do WhatsApp."}
                </p>
              </div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  openEditarPixDialog({
                    onSuccess: handlePixSaved,
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 rounded-[18px] bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Key className="w-3.5 h-3.5" />
                Cadastrar Chave Pix
              </button>
            </div>
          )}
        </div>
      )}

      {modoVisual !== MODO_COBRANCA.DESATIVADO && (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#e5e5e5] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                <ReceiptText className="w-5 h-5 text-[#0a0a0a]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                  Lembretes no WhatsApp
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  Defina em quais momentos os pais receberão a notificação da parcela
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={() =>
                openWhatsAppCobrancaPreviewDialog({
                  modalidade:
                    modoVisual === MODO_COBRANCA.AUTOMATICA
                      ? PREVIEW_COBRANCA_MODALIDADE.AUTOMATICA
                      : PREVIEW_COBRANCA_MODALIDADE.LEMBRETE,
                })
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-[18px] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs font-medium transition-colors cursor-pointer border border-[#e5e5e5] shrink-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
              {modoVisual === MODO_COBRANCA.AUTOMATICA
                ? "Ver demonstração da cobrança"
                : "Ver demonstração do lembrete"}
            </button>
          </div>

          <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
            <div className="space-y-2 pt-1 first:pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                    Lembrete antes do vencimento
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Avisa os pais com antecedência para lembrarem da parcela.
                  </p>
                </div>

                <div className="shrink-0">
                  <Switch
                    id="switch-cobranca-aviso-previo-ativo"
                    checked={configuracoes?.cobranca_aviso_previo_ativo ?? true}
                    loading={updatingKey === "cobranca_aviso_previo_ativo"}
                    disabled={isBusy}
                    onCheckedChange={() =>
                      handleToggleAviso(
                        "cobranca_aviso_previo_ativo",
                        configuracoes?.cobranca_aviso_previo_ativo ?? true
                      )
                    }
                  />
                </div>
              </div>

              {(configuracoes?.cobranca_aviso_previo_ativo ?? true) && (
                <div className="space-y-2 pt-0.5">
                  <div className="space-y-1.5 max-w-xs">
                    <span className="text-[11px] sm:text-xs font-medium text-[#737373] block">
                      Dias de antecedência:
                    </span>
                    <div className="flex items-center justify-between bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-1 shadow-none">
                      <button
                        type="button"
                        disabled={localDias <= 1 || isBusy}
                        onClick={() => handleDiasStep(-1)}
                        className="w-7 h-7 flex items-center justify-center rounded-[14px] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-[#e5e5e5]"
                        title="Diminuir antecedência"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-medium text-[#0a0a0a] px-2 text-center select-none flex items-center justify-center gap-1.5 min-w-[90px]">
                        {updatingKey === "cobranca_dias_aviso_previo" ? (
                          <Loader2 className="w-3 h-3 text-[#0a0a0a] animate-spin" />
                        ) : null}
                        <span>
                          {localDias} {localDias === 1 ? "dia antes" : "dias antes"}
                        </span>
                      </span>
                      <button
                        type="button"
                        disabled={localDias >= 5 || isBusy}
                        onClick={() => handleDiasStep(1)}
                        className="w-7 h-7 flex items-center justify-center rounded-[14px] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-[#e5e5e5]"
                        title="Aumentar antecedência"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                    Lembrete no dia do vencimento
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Envia mensagem na data exata em que a parcela vence.
                  </p>
                </div>

                <div className="shrink-0">
                  <Switch
                    id="switch-cobranca-vencimento-hoje-ativo"
                    checked={configuracoes?.cobranca_vencimento_hoje_ativo ?? true}
                    loading={updatingKey === "cobranca_vencimento_hoje_ativo"}
                    disabled={isBusy}
                    onCheckedChange={() =>
                      handleToggleAviso(
                        "cobranca_vencimento_hoje_ativo",
                        configuracoes?.cobranca_vencimento_hoje_ativo ?? true
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                    Lembrete de atraso (3 dias após)
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Avisa o responsável caso a parcela continue pendente após 3 dias.
                  </p>
                </div>

                <div className="shrink-0">
                  <Switch
                    id="switch-cobranca-atraso-3-dias-ativo"
                    checked={configuracoes?.cobranca_atraso_3_dias_ativo ?? true}
                    loading={updatingKey === "cobranca_atraso_3_dias_ativo"}
                    disabled={isBusy}
                    onCheckedChange={() =>
                      handleToggleAviso(
                        "cobranca_atraso_3_dias_ativo",
                        configuracoes?.cobranca_atraso_3_dias_ativo ?? true
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modoVisual === MODO_COBRANCA.AUTOMATICA && (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
          <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Taxa do Pix e Liquidação
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Custo de processamento retido na liquidação e repasse para sua conta
              </p>
            </div>
          </div>

          <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                Taxa por cobrança recebida via Pix
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Cobrada exclusivamente na liquidação e descontada do repasse depositado na sua chave Pix. Sem mensalidade, taxa de emissão ou cancelamento.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold text-sm">
              <span>{taxaFormatada}</span>
              <span className="text-[10px] font-normal text-emerald-600">/ por liquidação</span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="space-y-0.5 min-w-0 pr-2">
                <label htmlFor="switch-enviar-recibo" className="text-xs sm:text-sm font-medium text-[#0a0a0a] flex items-center gap-2 cursor-pointer">
                  <Receipt className="w-4 h-4 text-[#737373]" />
                  Enviar recibo automático no WhatsApp?
                </label>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Envia o comprovante oficial para o WhatsApp do responsável assim que o pagamento Pix for confirmado.
                </p>
              </div>
              <Switch
                id="switch-enviar-recibo"
                checked={enviarRecibo}
                disabled={isBusy}
                onCheckedChange={async (checked) => {
                  try {
                    await updateFinanceiro({ enviar_recibo_automatico: checked });
                    toast.success(
                      checked ? "Recibo automático ativado." : "Recibo automático desativado."
                    );
                  } catch {
                    toast.error("Não foi possível atualizar o envio de recibo.");
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}


      {modoVisual === MODO_COBRANCA.AUTOMATICA && (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Multa e Juros por Atraso
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Configure os encargos automáticos incidentes no QR Code Pix para pagamentos após o vencimento.
              </p>
            </div>
          </div>

          <MultaJurosConfigForm />
        </div>
      )}
    </div>
  );
});
