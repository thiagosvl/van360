// React
import { useEffect, useRef, useState } from "react";

// React Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Third-party
import type { RealtimeChannel } from "@supabase/supabase-js";

// Components - Features
import { PagamentoSucessoDialog } from "@/components/dialogs/PagamentoSucessoDialog";
import { SelecaoPassageirosDialog } from "@/components/dialogs/SelecaoPassageirosDialog";
import { PagamentoPix } from "@/components/features/pagamento/PagamentoPix";
import { PlanoCard } from "@/components/features/register/PlanoCard";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Services
import { useCalcularPrecoPreview, usePlanos } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { usuarioApi } from "@/services";

// Utils
import { cn } from "@/lib/utils";
import {
  getAssinaturaAtiva,
  getQuantidadeMinimaPersonalizada,
} from "@/utils/domain/plano/planoUtils";
import { toast } from "@/utils/notifications/toast";

// Constants
import {
  ASSINATURA_COBRANCA_STATUS_PAGO,
  PLANO_COMPLETO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";

// Types

// Icons

// Mensagens de downgrade
const MENSAGENS_DOWNGRADE = {
  [`${PLANO_COMPLETO}-${PLANO_ESSENCIAL}`]: {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para o Plano Essencial, você poderá cobrar automaticamente até um número ilimitado de passageiros. Atualmente você tem X passageiros com cobrança automática. A mudança será feita agora e não há cobrança adicional.",
  },
  "subplano-menor": {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para este plano, você poderá cobrar automaticamente até X passageiros. Atualmente você tem Y passageiros com cobrança automática. Você precisará escolher quais continuarão com cobrança automática.",
  },
  "personalizado-para-predefinido": {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para este plano, você poderá cobrar automaticamente até X passageiros. Atualmente você tem Y passageiros com cobrança automática. Você precisará escolher quais continuarão com cobrança automática.",
  },
  "personalizado-reducao": {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para este plano, você poderá cobrar automaticamente até X passageiros. Atualmente você tem Y passageiros com cobrança automática. Você precisará escolher quais continuarão com cobrança automática.",
  },
};

export default function Planos() {
  const { setPageTitle } = useLayout();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading, refreshProfile } = useProfile(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Usar hook do React Query para buscar planos
  const {
    data: planosData = { bases: [], sub: [] },
    refetch: refetchPlanos,
  } = usePlanos({ ativo: "true" }, {
    onError: () => {
      toast.error("plano.erro.carregar");
    },
  });

  const planosDataTyped: { bases: any[]; sub: any[] } = (planosData as
    | { bases: any[]; sub: any[] }
    | undefined) ?? { bases: [], sub: [] };

  const planos = planosDataTyped.bases;
  const subPlanos = planosDataTyped.sub;
  const calcularPrecoPreview = useCalcularPrecoPreview();
  const [selectedPlanoId, setSelectedPlanoId] = useState<string | null>(null);
  const [selectedSubPlanoId, setSelectedSubPlanoId] = useState<string | null>(
    null
  );
  const [quantidadePersonalizada, setQuantidadePersonalizada] =
    useState<string>("");
  const [precoCalculadoPreview, setPrecoCalculadoPreview] = useState<{
    preco: number;
    valorPorCobranca: number;
  } | null>(null);
  const [isCalculandoPreco, setIsCalculandoPreco] = useState(false);
  const [dadosPagamento, setDadosPagamento] = useState<any>(null);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [downgradeInfo, setDowngradeInfo] = useState<{
    planoId: string;
    titulo: string;
    mensagem: string;
  } | null>(null);
  const [selecaoPassageirosDialog, setSelecaoPassageirosDialog] = useState<{
    isOpen: boolean;
    tipo: "upgrade" | "downgrade";
    franquia: number;
    tipoDowngrade?: "subplano" | "personalizado";
    subplanoId?: string;
    quantidadePersonalizada?: number;
    planoId?: string;
    precoAplicado?: number;
    precoOrigem?: string;
    cobrancaId?: string;
  } | null>(null);
  const [pagamentoSucessoDialog, setPagamentoSucessoDialog] = useState<{
    isOpen: boolean;
    nomePlano?: string;
    quantidadeAlunos?: number;
  }>({
    isOpen: false,
  });
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const planosRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setPageTitle("Planos");
  }, [setPageTitle]);

  // Determinar se é upgrade ou downgrade
  const getTipoMudanca = (
    planoAtualSlug: string,
    novoPlanoSlug: string
  ): "upgrade" | "downgrade" | "igual" => {
    const ordem = {
      [PLANO_GRATUITO]: 1,
      [PLANO_ESSENCIAL]: 2,
      [PLANO_COMPLETO]: 3,
    };
    const ordemAtual = ordem[planoAtualSlug] || 0;
    const ordemNova = ordem[novoPlanoSlug] || 0;
    if (ordemNova > ordemAtual) return "upgrade";
    if (ordemNova < ordemAtual) return "downgrade";
    return "igual";
  };

  // Verificar se plano está ativo
  const isPlanoAtivo = (planoId: string) => {
    if (!plano || !profile) return false;

    const assinaturaAtiva = getAssinaturaAtiva(profile);
    if (!assinaturaAtiva) return false;

    // Se o plano atual é um subplano (tem parent), comparar com o parent_id do plano base
    const planoAtual = assinaturaAtiva.planos;
    if (!planoAtual) return false;

    // Se o plano atual tem parent, significa que é subplano, então o plano base é o parent
    if (planoAtual.parent_id) {
      // Está em um subplano, então o plano base Completo está ativo
      const planoCompletoBase = planos.find((p) => p.slug === PLANO_COMPLETO);
      return planoCompletoBase?.id === planoId;
    }

    // Plano base sem subplano
    return planoAtual.id === planoId;
  };

  // Verificar se subplano está ativo
  const isSubPlanoAtivo = (subPlanoId: string) => {
    if (!plano || !profile) return false;

    const assinaturaAtiva = getAssinaturaAtiva(profile);
    if (!assinaturaAtiva) return false;

    const planoAtual = assinaturaAtiva.planos;
    if (!planoAtual) return false;

    const slugPlanoAtual = planoAtual.parent?.slug || planoAtual.slug;
    if (slugPlanoAtual === PLANO_COMPLETO && !planoAtual.parent_id) {
      // É quantidade personalizada, nenhum sub-plano pré-definido está ativo
      return false;
    }

    // Comparar diretamente com o ID do plano atual (só para sub-planos pré-definidos)
    return planoAtual.id === subPlanoId;
  };

  // Verificar se usuário está em quantidade personalizada
  const isQuantidadePersonalizadaAtiva = () => {
    if (!plano || !profile) return false;

    const assinaturaAtiva = getAssinaturaAtiva(profile);
    if (!assinaturaAtiva) return false;

    const planoAtual = assinaturaAtiva.planos;
    if (!planoAtual) return false;

    const slugPlanoAtual = planoAtual.parent?.slug || planoAtual.slug;
    return slugPlanoAtual === PLANO_COMPLETO && !planoAtual.parent_id;
  };

  // Verificar se é o plano principal (não subplano)
  const isPlanoPrincipal = (planoId: string) => {
    const planoData = planos.find((p) => p.id === planoId);
    return planoData?.tipo === "base";
  };

  // Seleção visual automática via query string (sem executar ações)
  useEffect(() => {
    const slugParam = searchParams.get("slug");
    if (
      !slugParam ||
      planos.length === 0 ||
      loading ||
      isProfileLoading ||
      !profile
    )
      return;

    // Calcular planos disponíveis (mesma lógica do componente)
    const assinaturaAtiva = profile?.assinaturas_usuarios?.find(
      (a: any) => a.ativo === true
    );
    const planoAtualDoUsuario = assinaturaAtiva?.planos;
    const slugPlanoAtual =
      planoAtualDoUsuario?.parent?.slug || planoAtualDoUsuario?.slug;

    // Buscar plano base pelo slug - apenas fazer scroll para o plano, sem selecionar
    const planoEncontrado = planos.find((p) => p.slug === slugParam);
    if (planoEncontrado && !dadosPagamento) {
      // Verificar se o plano está disponível para seleção (não está desabilitado)
      const isAtivo =
        isPlanoAtivo(planoEncontrado.id) &&
        isPlanoPrincipal(planoEncontrado.id);

      // Só fazer scroll se não for o plano atual e se não for gratuito
      if (!isAtivo && planoEncontrado.slug !== PLANO_GRATUITO) {
        // Scroll suave para o plano
        setTimeout(() => {
          const planoElement = planosRefs.current[planoEncontrado.id];
          if (planoElement) {
            planoElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, planos.length, loading, isProfileLoading, profile]);

  const handlePlanoSelect = (planoId: string) => {
    if (!plano || !profile?.assinaturas_usuarios) return;

    const planoSelecionado = planos.find((p) => p.id === planoId);
    if (!planoSelecionado) return;

    // Nunca permitir selecionar Gratuito
    if (planoSelecionado.slug === PLANO_GRATUITO) {
      return;
    }

    setSelectedPlanoId(planoId);
    setSelectedSubPlanoId(null);
    setDadosPagamento(null);
    setQuantidadePersonalizada("");
    setPrecoCalculadoPreview(null);

    // Obter slug do plano atual
    const assinaturaAtiva = profile.assinaturas_usuarios.find(
      (a: any) => a.ativo === true
    );
    if (!assinaturaAtiva?.planos) return;

    const planoAtual = assinaturaAtiva.planos;
    const slugAtual = planoAtual.parent?.slug || planoAtual.slug;

    // Verificar tipo de mudança
    const tipoMudanca = getTipoMudanca(slugAtual, planoSelecionado.slug);

    if (tipoMudanca === "downgrade") {
      // Mostrar dialog de confirmação
      const mensagemDowngrade =
        MENSAGENS_DOWNGRADE[`${slugAtual}-${planoSelecionado.slug}`] || {
          titulo: "Confirmar downgrade",
          mensagem: "Tem certeza que deseja fazer downgrade do seu plano?",
        };
      setDowngradeInfo({
        planoId,
        titulo: mensagemDowngrade.titulo,
        mensagem: mensagemDowngrade.mensagem,
      });
      setShowDowngradeDialog(true);
    } else if (tipoMudanca === "upgrade") {
      // Fazer upgrade imediatamente
      handleUpgrade(planoId);
    }
  };

  const handleSubPlanoSelect = async (subPlanoId: string) => {
    if (!plano || !profile?.assinaturas_usuarios) return;

    // Se for o subplano atual, não fazer nada
    if (isSubPlanoAtivo(subPlanoId)) {
      return;
    }

    setSelectedSubPlanoId(subPlanoId);
    setQuantidadePersonalizada("");
    setPrecoCalculadoPreview(null);

    // Verificar se o usuário está no Completo
    const assinaturaAtiva = profile.assinaturas_usuarios.find(
      (a: any) => a.ativo === true
    );
    if (!assinaturaAtiva) return;

    const planoAtualDoUsuario = assinaturaAtiva.planos;
    const slugPlanoAtual =
      planoAtualDoUsuario?.parent?.slug || planoAtualDoUsuario?.slug;
    const estaNoCompleto = slugPlanoAtual === PLANO_COMPLETO;

    const planoCompletoBase = planos.find((p) => p.slug === PLANO_COMPLETO);
    if (planoCompletoBase) {
      setSelectedPlanoId(planoCompletoBase.id);
    }

    const subPlanoNovo = subPlanos.find((s) => s.id === subPlanoId);
    if (!subPlanoNovo) return;

    // Se não está no Completo, sempre será upgrade (não precisa verificar preço)
    if (!estaNoCompleto) {
      handleTrocaSubplano(subPlanoId);
      return;
    }

    const planoAtualDoUsuarioParaSub = assinaturaAtiva.planos;
    const estaEmQuantidadePersonalizada =
      (planoAtualDoUsuarioParaSub?.parent?.slug ||
        planoAtualDoUsuarioParaSub?.slug) === PLANO_COMPLETO &&
      !planoAtualDoUsuarioParaSub?.parent_id;

    const precoAtual = Number(assinaturaAtiva.preco_aplicado || 0);
    const precoNovo = Number(
      subPlanoNovo.promocao_ativa
        ? subPlanoNovo.preco_promocional ?? subPlanoNovo.preco
        : subPlanoNovo.preco
    );

    // Usar a franquia contratada da assinatura para comparação
    const franquiaAtual = assinaturaAtiva.franquia_contratada_cobrancas || 0;
    const franquiaNova = subPlanoNovo.franquia_cobrancas_mes || 0;

    // Verificar se é downgrade: preço menor OU franquia menor OU mudança de personalizado para pré-definido
    const isDowngrade =
      precoNovo < precoAtual ||
      franquiaNova < franquiaAtual ||
      estaEmQuantidadePersonalizada;

    if (isDowngrade) {
      // Downgrade de subplano ou mudança de personalizado para pré-definido
      // Quando está em quantidade personalizada e muda para pré-definido, SEMPRE há redução
      // porque o personalizado exige mínimo = maior sub-plano + 1
      const mensagemDowngrade = estaEmQuantidadePersonalizada
        ? MENSAGENS_DOWNGRADE["personalizado-reducao"]
        : MENSAGENS_DOWNGRADE["subplano-menor"];
      
      // Formatar mensagem com valores reais
      const mensagemFormatada = mensagemDowngrade.mensagem
        .replace("X", franquiaNova.toString())
        .replace("Y", franquiaAtual.toString());
      
      setDowngradeInfo({
        planoId: subPlanoId,
        titulo: mensagemDowngrade.titulo,
        mensagem: mensagemFormatada,
      });
      setShowDowngradeDialog(true);
    } else {
      handleTrocaSubplano(subPlanoId);
    }
  };

  const handleUpgrade = async (planoId: string) => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const result = await usuarioApi.upgradePlano({
        usuario_id: profile.id,
        plano_id: planoId,
      });

      if (result.precisaSelecaoManual) {
        setSelecaoPassageirosDialog({
          isOpen: true,
          tipo: result.tipo || "upgrade",
          franquia: result.franquia || 0,
          planoId: (result as any).planoId,
          precoAplicado: (result as any).precoAplicado,
          precoOrigem: (result as any).precoOrigem,
          cobrancaId: (result as any).cobrancaId,
        });
      } else if (result.qrCodePayload) {
        setDadosPagamento(result);
        setSelectedPlanoId(planoId);
      } else {
        setDadosPagamento(result);
        setSelectedPlanoId(planoId);
      }
    } catch (error: any) {
      toast.error("assinatura.erro.processar", {
        description:
          error.response?.data?.error ||
          "Não foi possível fazer upgrade do plano.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!profile?.id || !downgradeInfo) return;

    try {
      setLoading(true);
      setShowDowngradeDialog(false);

      // Verificar se é downgrade de subplano (dentro do Completo)
      const assinaturaAtiva = profile.assinaturas_usuarios.find(
        (a: any) => a.ativo === true
      );
      const planoAtualDoUsuario = assinaturaAtiva?.planos;
      const slugPlanoAtual =
        planoAtualDoUsuario?.parent?.slug || planoAtualDoUsuario?.slug;
      const estaNoCompleto = slugPlanoAtual === PLANO_COMPLETO;

      // Verificar se o planoId é um subplano (verificar se existe nos subplanos)
      const isSubplano = subPlanos.some((s) => s.id === downgradeInfo.planoId);
      const planoAtual = assinaturaAtiva?.planos;
      const estaEmQuantidadePersonalizada =
        estaNoCompleto &&
        planoAtual &&
        (planoAtual.parent?.slug || planoAtual.slug) === PLANO_COMPLETO &&
        !planoAtual.parent_id;

      // Verificar se é redução de quantidade personalizada
      if (estaEmQuantidadePersonalizada && quantidadePersonalizada) {
        const quantidade = parseInt(quantidadePersonalizada);
        if (!isNaN(quantidade)) {
          // Verificar se é a mesma quantidade já contratada
          const quantidadeAtual = assinaturaAtiva.franquia_contratada_cobrancas || 0;
          if (quantidade === quantidadeAtual) {
            toast.info("assinatura.info.quantidadeIgual", {
              description: `assinatura.info.quantidadeIgualDescricao`,
            });
            return;
          }
          
          const result = await usuarioApi.criarAssinaturaCompletoPersonalizado({
            usuario_id: profile.id,
            quantidade,
          });

          if (result.precisaSelecaoManual) {
            setSelecaoPassageirosDialog({
              isOpen: true,
              tipo: result.tipo || "downgrade",
              franquia: result.franquia || quantidade,
              tipoDowngrade: result.tipo === "downgrade" ? "personalizado" : undefined,
              quantidadePersonalizada: result.tipo === "downgrade" && (result as any).quantidadePersonalizada ? (result as any).quantidadePersonalizada : undefined,
              planoId: (result as any).planoId,
              precoAplicado: (result as any).precoAplicado,
              precoOrigem: (result as any).precoOrigem,
              cobrancaId: (result as any).cobrancaId,
            });
          } else if (result.qrCodePayload) {
            setDadosPagamento(result);
          } else {
            // Atualização imediata (downgrade) - aguardar e atualizar profile antes de redirecionar
            await refreshProfile();
            toast.success("assinatura.sucesso.atualizada");
            setTimeout(() => {
              navigate("/assinatura");
            }, 1000);
          }
          return;
        }
      }

      if (estaNoCompleto && isSubplano) {
        const result = await usuarioApi.trocarSubplano({
          usuario_id: profile.id,
          subplano_id: downgradeInfo.planoId,
        });

        if (result.precisaSelecaoManual) {
          setSelecaoPassageirosDialog({
            isOpen: true,
            tipo: result.tipo || "downgrade",
            franquia: result.franquia || 0,
            tipoDowngrade: result.tipo === "downgrade" ? "subplano" : undefined,
            subplanoId: result.tipo === "downgrade" && (result as any).subplanoId ? (result as any).subplanoId : undefined,
            planoId: (result as any).planoId,
            precoAplicado: (result as any).precoAplicado,
            precoOrigem: (result as any).precoOrigem,
            cobrancaId: (result as any).cobrancaId,
          });
        } else if (result.qrCodePayload) {
          setDadosPagamento(result);
          setSelectedPlanoId(
            planos.find((p) => p.slug === PLANO_COMPLETO)?.id || null
          );
        } else {
          // Atualização imediata (downgrade) - aguardar e atualizar profile antes de redirecionar
          await refreshProfile();
          toast.success("assinatura.sucesso.atualizada");
          setTimeout(() => {
            navigate("/assinatura");
          }, 1000);
        }
      } else {
        // Downgrade de plano base (Completo -> Essencial, etc)
        await usuarioApi.downgradePlano({
          usuario_id: profile.id,
          plano_id: downgradeInfo.planoId,
        });

        // Atualizar profile antes de redirecionar
        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");

        setTimeout(() => {
          navigate("/assinatura");
        }, 1000);
      }
    } catch (error: any) {
      toast.error("assinatura.erro.processar", {
        description:
          error.response?.data?.error ||
          "Não foi possível fazer downgrade do plano.",
      });
    } finally {
      setLoading(false);
      setDowngradeInfo(null);
    }
  };

  const handleTrocaSubplano = async (subPlanoId: string) => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const result = await usuarioApi.trocarSubplano({
        usuario_id: profile.id,
        subplano_id: subPlanoId,
      });

      if (result.precisaSelecaoManual) {
        setSelecaoPassageirosDialog({
          isOpen: true,
          tipo: result.tipo || "upgrade",
          franquia: result.franquia || 0,
          tipoDowngrade: result.tipo === "downgrade" ? "subplano" : undefined,
          subplanoId: result.tipo === "downgrade" && (result as any).subplanoId ? (result as any).subplanoId : subPlanoId,
          planoId: (result as any).planoId,
          precoAplicado: (result as any).precoAplicado,
          precoOrigem: (result as any).precoOrigem,
          cobrancaId: (result as any).cobrancaId,
        });
      } else if (result.qrCodePayload) {
        setDadosPagamento(result);
      } else {
        // Downgrade de subplano - sucesso imediato
        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");
        setTimeout(() => {
          navigate("/assinatura");
        }, 1000);
      }
    } catch (error: any) {
      toast.error("assinatura.erro.processar", {
        description:
          error.response?.data?.error || "Não foi possível trocar o subplano.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Obter maior subplano do Completo dinamicamente
  // Usar utilitários compartilhados
  const getQuantidadeMinima = () => {
    return getQuantidadeMinimaPersonalizada(planos, subPlanos);
  };

  useEffect(() => {
    if (!quantidadePersonalizada || subPlanos.length === 0 || planos.length === 0) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      return;
    }

    const quantidade = parseInt(quantidadePersonalizada);
    if (isNaN(quantidade) || quantidade <= 0) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      return;
    }

    // Verificar quantidade mínima
    const quantidadeMinima = getQuantidadeMinima();
    if (!quantidadeMinima || quantidade < quantidadeMinima) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      return;
    }

    // Debounce: aguardar 500ms antes de buscar
    setIsCalculandoPreco(true);
    const timeoutId = setTimeout(() => {
      calcularPrecoPreview.mutate(quantidade, {
        onSuccess: (resultado) => {
          if (resultado) {
            setPrecoCalculadoPreview({
              preco: resultado.preco,
              valorPorCobranca: resultado.valorPorCobranca,
            });
          } else {
            setPrecoCalculadoPreview(null);
          }
          setIsCalculandoPreco(false);
        },
        onError: (error: any) => {
          toast.error("sistema.erro.calcularPreco", {
            description: error.message || "Não foi possível calcular o preço.",
          });
          setPrecoCalculadoPreview(null);
          setIsCalculandoPreco(false);
        },
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsCalculandoPreco(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantidadePersonalizada, subPlanos, planos]);

  const handleQuantidadePersonalizadaSelect = async () => {
    if (!profile?.id) return;

    const quantidade = parseInt(quantidadePersonalizada);
    const quantidadeMinima = getQuantidadeMinima();

    if (
      isNaN(quantidade) ||
      !quantidadeMinima ||
      quantidade < quantidadeMinima
    ) {
      toast.error("validacao.campoObrigatorio", {
        description: quantidadeMinima
          ? `A quantidade mínima é ${quantidadeMinima} cobranças.`
          : "Não foi possível determinar a quantidade mínima.",
      });
      return;
    }

    const assinaturaAtiva = profile.assinaturas_usuarios.find(
      (a: any) => a.ativo === true
    );
    const estaNoCompleto = assinaturaAtiva
      ? (() => {
          const planoAtualDoUsuario = assinaturaAtiva.planos;
          const slugPlanoAtual =
            planoAtualDoUsuario?.parent?.slug || planoAtualDoUsuario?.slug;
          return slugPlanoAtual === PLANO_COMPLETO;
        })()
      : false;

    // Verificar se está reduzindo quantidade personalizada (downgrade) ou tentando contratar mesma quantidade
    if (estaNoCompleto && assinaturaAtiva) {
      const planoAtual = assinaturaAtiva.planos;
      const estaEmQuantidadePersonalizada =
        (planoAtual?.parent?.slug || planoAtual?.slug) === PLANO_COMPLETO &&
        !planoAtual?.parent_id;

      // Usar a franquia contratada da assinatura, não do plano
      const quantidadeAtual = assinaturaAtiva.franquia_contratada_cobrancas || 0;
      
      // Se for a mesma quantidade, não fazer nada (tanto para personalizado quanto para sub-plano)
      if (quantidade === quantidadeAtual) {
        toast.info("assinatura.info.quantidadeIgual", {
          description: `assinatura.info.quantidadeIgualDescricao`,
        });
        return;
      }

      if (estaEmQuantidadePersonalizada) {
        
        if (quantidade < quantidadeAtual) {
          // Redução de quantidade personalizada - mostrar dialog de confirmação
          const mensagemDowngrade = MENSAGENS_DOWNGRADE["personalizado-reducao"];
          setDowngradeInfo({
            planoId: planos.find((p) => p.slug === PLANO_COMPLETO)?.id || "",
            titulo: mensagemDowngrade.titulo,
            mensagem: mensagemDowngrade.mensagem,
          });
          setShowDowngradeDialog(true);
          return;
        }
      }
    }

    try {
      setLoading(true);
      setSelectedSubPlanoId(null);
      const result = await usuarioApi.criarAssinaturaCompletoPersonalizado({
        usuario_id: profile.id,
        quantidade,
      });

      if (result.precisaSelecaoManual) {
        setSelecaoPassageirosDialog({
          isOpen: true,
          tipo: result.tipo || "upgrade",
          franquia: result.franquia || quantidade,
          tipoDowngrade: result.tipo === "downgrade" ? "personalizado" : undefined,
          quantidadePersonalizada: result.tipo === "downgrade" && (result as any).quantidadePersonalizada ? (result as any).quantidadePersonalizada : undefined,
          planoId: (result as any).planoId,
          precoAplicado: (result as any).precoAplicado,
          precoOrigem: (result as any).precoOrigem,
          cobrancaId: (result as any).cobrancaId,
        });
      } else if (result.qrCodePayload) {
          setDadosPagamento(result);
          setSelectedPlanoId(
            planos.find((p) => p.slug === PLANO_COMPLETO)?.id || null
          );
      } else {
        // Atualização imediata (downgrade) - aguardar e atualizar profile antes de redirecionar
        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");
        setTimeout(() => {
          navigate("/assinatura");
        }, 1500);
      }
    } catch (error: any) {
      // Se o erro for sobre quantidade igual, mostrar toast info ao invés de error
      const errorMessage = error.response?.data?.error || error.message || "";
      if (errorMessage.includes("já possui esta quantidade") || errorMessage.includes("já possui")) {
        toast.info("assinatura.info.quantidadeIgual", {
          description: "Você já está com este plano ativo. Não é necessário fazer alterações.",
        });
      } else {
        toast.error("assinatura.erro.processar", {
          description: errorMessage || "Não foi possível criar o plano personalizado.",
        });
      }
    } finally {
      setLoading(false);
    }
  };


  // Polling de pagamento
  useEffect(() => {
    if (!dadosPagamento?.cobrancaId) return;

    let mounted = true;
    let poller: ReturnType<typeof setInterval> | null = null;

    const checkPaymentStatus = async () => {
      try {
        // @ts-ignore - assinaturas_cobrancas pode não estar nos tipos gerados
        const { data, error } = await (supabase as any)
          .from("assinaturas_cobrancas")
          .select("status")
          .eq("id", dadosPagamento.cobrancaId)
          .maybeSingle();

        if (error) {
          return;
        }

        if (data && (data as any).status === ASSINATURA_COBRANCA_STATUS_PAGO) {
          if (mounted) {
            // Aguardar um pouco para o backend processar a atualização da assinatura
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            // Forçar refresh do profile para garantir que os dados estão atualizados
            await refreshProfile();
            
            // Buscar informações do plano para exibir no dialog
            const planoSelecionado = selectedPlanoId
              ? planos.find((p) => p.id === selectedPlanoId)
              : null;
            const nomePlano = planoSelecionado?.nome;
            
            // Buscar quantidade de passageiros ativados (se disponível)
            let quantidadeAlunos: number | undefined;
            try {
              const assinaturaAtualizada = profile?.assinaturas_usuarios?.find(
                (a: any) => a.ativo === true
              );
              if (assinaturaAtualizada) {
                // Tentar buscar contagem de passageiros com cobrança automática
                // Por enquanto, deixar undefined se não conseguir
              }
            } catch (error) {
              // Ignorar erro
            }
            
            if (mounted) {
              setPagamentoSucessoDialog({
                isOpen: true,
                nomePlano,
                quantidadeAlunos,
              });
            }
          }
        }
      } catch (err) {
        // Erro silencioso - polling continuará tentando
      }
    };

    const setupRealtime = async () => {
      if (!poller) {
        poller = setInterval(() => {
          if (!mounted) return;
          checkPaymentStatus();
        }, 5000);
      }

      try {
        const channel = supabase.channel("public:assinaturas_cobrancas").on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "assinaturas_cobrancas" as any,
            filter: `id=eq.${dadosPagamento.cobrancaId}`,
          },
          async (payload) => {
            try {
              if (
                payload?.new &&
                (payload.new as any).status === ASSINATURA_COBRANCA_STATUS_PAGO
              ) {
                if (mounted) {
                  // Aguardar um pouco para o backend processar a atualização da assinatura
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                  
                  // Forçar refresh do profile para garantir que os dados estão atualizados
                  await refreshProfile();
                  
                  // Buscar informações do plano para exibir no dialog
                  const planoSelecionado = selectedPlanoId
                    ? planos.find((p) => p.id === selectedPlanoId)
                    : null;
                  const nomePlano = planoSelecionado?.nome;
                  
                  // Buscar quantidade de passageiros ativados (se disponível)
                  let quantidadeAlunos: number | undefined;
                  try {
                    const assinaturaAtualizada = profile?.assinaturas_usuarios?.find(
                      (a: any) => a.ativo === true
                    );
                    if (assinaturaAtualizada) {
                      // Tentar buscar contagem de passageiros com cobrança automática
                      // Por enquanto, deixar undefined se não conseguir
                    }
                  } catch (error) {
                    // Ignorar erro
                  }
                  
                  if (mounted) {
                    setPagamentoSucessoDialog({
                      isOpen: true,
                      nomePlano,
                      quantidadeAlunos,
                    });
                  }
                }
              }
            } catch (cbErr) {
              // Erro silencioso no callback realtime
            }
          }
        );

        const subscribeResult = await channel.subscribe();
        const isSubscribed =
          (subscribeResult &&
            (subscribeResult as any).status === "SUBSCRIBED") ||
          (subscribeResult && (subscribeResult as any).status === "ok") ||
          (subscribeResult && (subscribeResult as any).status === "OK");

        if (isSubscribed) {
          realtimeChannelRef.current = channel;
          if (poller) {
            clearInterval(poller);
            poller = null;
          }
          poller = setInterval(() => {
            if (!mounted) return;
            checkPaymentStatus();
          }, 30000);
        }
      } catch (err) {
        // Falha ao inscrever realtime - polling já está ativo como fallback
      }
    };

    checkPaymentStatus();
    setupRealtime();

    return () => {
      mounted = false;
      if (poller) {
        clearInterval(poller);
        poller = null;
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
        realtimeChannelRef.current = null;
      }
    };
  }, [dadosPagamento, navigate, refreshProfile]);

  const pullToRefreshReload = async () => {
    setRefreshing(true);
    await refetchPlanos();
    setRefreshing(false);
  };

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  // Determinar plano atual do usuário
  const assinaturaAtiva = profile?.assinaturas_usuarios?.find(
    (a: any) => a.ativo === true
  );
  const planoAtualDoUsuario = assinaturaAtiva?.planos;
  const slugPlanoAtual =
    planoAtualDoUsuario?.parent?.slug || planoAtualDoUsuario?.slug;
  const estaNoCompleto = slugPlanoAtual === PLANO_COMPLETO;

  // Filtrar planos disponíveis para escolha (nunca mostrar Gratuito como opção)
  const planosDisponiveis = planos.filter((p) => {
    if (p.slug === PLANO_GRATUITO) return false; // Nunca mostrar Gratuito como opção

    if (slugPlanoAtual === PLANO_GRATUITO) {
      return p.slug === PLANO_ESSENCIAL || p.slug === PLANO_COMPLETO;
    }

    if (slugPlanoAtual === PLANO_ESSENCIAL) {
      return p.slug === PLANO_COMPLETO;
    }

    if (slugPlanoAtual === PLANO_COMPLETO) {
      return p.slug === PLANO_COMPLETO || p.slug === PLANO_ESSENCIAL;
    }

    return true; // Fallback
  });

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6 p-0 md:p-6  overflow-visible">
          {/* Resumo do Plano Atual */}
          {planoAtualDoUsuario && (
            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Seu Plano:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {planoAtualDoUsuario?.parent
                      ? planoAtualDoUsuario?.parent.nome
                      : planoAtualDoUsuario?.nome}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Título para escolha de planos */}
          {planosDisponiveis.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {estaNoCompleto ? "Planos disponíveis" : "Gostaria de mais funcionalidades e benefícios?"}
              </h2>
            </div>
          )}

          {/* Planos - Cards unificados (mobile e desktop) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {planosDisponiveis.map((planoItem) => {
              const subPlanosDoPlano =
                planoItem.slug === PLANO_COMPLETO
                  ? subPlanos.filter(
                      (s) => String(s.parent_id) === String(planoItem.id)
                    )
                  : [];
              const isAtivo =
                isPlanoAtivo(planoItem.id) && isPlanoPrincipal(planoItem.id);
              const isDisabled = isAtivo && planoItem.slug !== PLANO_COMPLETO;

              const actionLabel =
                planoItem.slug === PLANO_COMPLETO
                  ? isAtivo
                    ? "Gerenciar plano"
                    : "Ver opções"
                  : isAtivo
                  ? "Plano atual"
                  : "Escolher Plano";

              const actionButtonClassName =
                planoItem.slug === PLANO_COMPLETO
                  ? "bg-blue-600 hover:bg-blue-700"
                  : isAtivo
                  ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
                  : undefined;

              return (
                <div
                  key={planoItem.id}
                  ref={(el) => {
                    planosRefs.current[planoItem.id] = el;
                  }}
                  className="relative"
                >
                  {isAtivo && planoItem.slug !== PLANO_COMPLETO && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 px-2 md:px-3 py-1 md:py-1.5 text-xs font-bold text-white bg-gray-700 rounded-full z-10 shadow-md">
                      Plano atual
                    </div>
                  )}
                  <PlanoCard
                    plano={planoItem}
                    subPlanos={subPlanosDoPlano}
                    isSelected={selectedPlanoId === planoItem.id}
                    onSelect={(id) => {
                      if (isDisabled) return;
                      setSelectedPlanoId(id);
                      if (planoItem.slug !== PLANO_COMPLETO) {
                        setSelectedSubPlanoId(null);
                        setQuantidadePersonalizada("");
                        setPrecoCalculadoPreview(null);
                      }
                    }}
                    selectedSubPlanoId={selectedSubPlanoId}
                    quantidadePersonalizada={quantidadePersonalizada}
                    onSubPlanoSelect={(subPlanoSelecionado) => {
                      if (!subPlanoSelecionado) {
                        setSelectedSubPlanoId(null);
                        return;
                      }
                      setSelectedSubPlanoId(subPlanoSelecionado);
                      setQuantidadePersonalizada("");
                    }}
                    onQuantidadePersonalizadaChange={
                      setQuantidadePersonalizada
                    }
                    precoCalculadoPreview={precoCalculadoPreview?.preco ?? null}
                    valorPorCobranca={
                      precoCalculadoPreview?.valorPorCobranca ?? null
                    }
                    isCalculandoPreco={
                      isCalculandoPreco || calcularPrecoPreview.isPending
                    }
                    getQuantidadeMinima={getQuantidadeMinima}
                    onQuantidadePersonalizadaConfirm={
                      handleQuantidadePersonalizadaSelect
                    }
                    onAvancarStep={() => {
                      if (selectedSubPlanoId) {
                        handleSubPlanoSelect(selectedSubPlanoId);
                      }
                    }}
                    isSubPlanoAtivo={isSubPlanoAtivo}
                    isQuantidadePersonalizadaAtiva={isQuantidadePersonalizadaAtiva()}
                    cardClassName={cn(
                      isDisabled
                        ? "border-gray-400 bg-gray-50 cursor-not-allowed opacity-80"
                        : ""
                    )}
                    actionLabel={actionLabel}
                    actionDisabled={isDisabled || loading}
                    actionButtonClassName={actionButtonClassName}
                    onAction={(e) => {
                      e.stopPropagation();
                      if (planoItem.slug === PLANO_COMPLETO) {
                        setSelectedPlanoId(planoItem.id);
                        planosRefs.current[planoItem.id]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      } else if (!isDisabled) {
                        handlePlanoSelect(planoItem.id);
                      }
                    }}
                    autoAdvanceOnSubPlanoSelect={false}
                  />
                </div>
              );
            })}
          </div>

        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={refreshing || loading} text="Processando..." />

      {selecaoPassageirosDialog && profile?.id && (
        <SelecaoPassageirosDialog
          isOpen={selecaoPassageirosDialog.isOpen}
          onClose={() => setSelecaoPassageirosDialog(null)}
          onConfirm={async (passageiroIds) => {
            try {
              setLoading(true);
              const tipo = selecaoPassageirosDialog.tipo;
              const cobrancaId = selecaoPassageirosDialog.cobrancaId;

              // Se for upgrade e tiver cobrancaId, salvar seleção primeiro
              if (tipo === "upgrade" && cobrancaId) {
                await usuarioApi.salvarSelecaoPassageiros(profile.id!, {
                  cobrancaId,
                  passageiroIds,
                  tipo,
                  franquia: selecaoPassageirosDialog.franquia,
                });
              }

              // Confirmar seleção (gera PIX se for upgrade, ou faz downgrade se for downgrade)
              const resultado = await usuarioApi.confirmarSelecaoPassageiros(
                profile.id!,
                { 
                  passageiroIds, 
                  franquia: selecaoPassageirosDialog.franquia,
                  tipoDowngrade: selecaoPassageirosDialog.tipoDowngrade,
                  subplanoId: selecaoPassageirosDialog.subplanoId,
                  quantidadePersonalizada: selecaoPassageirosDialog.quantidadePersonalizada,
                  tipo,
                  planoId: selecaoPassageirosDialog.planoId,
                  precoAplicado: selecaoPassageirosDialog.precoAplicado,
                  precoOrigem: selecaoPassageirosDialog.precoOrigem,
                  cobrancaId,
                }
              );
              
              const temPagamento = resultado.qrCodePayload;
              
              setSelecaoPassageirosDialog(null);
              
              if (tipo === "downgrade" && resultado.ativados !== undefined) {
                toast.success("assinatura.sucesso.atualizada", {
                  description: `${resultado.ativados} passageiros ativados, ${resultado.desativados} desativados.`,
                });
              }
              
              if (tipo === "upgrade" && temPagamento) {
                // Abrir dialog de pagamento com PIX gerado
                setDadosPagamento(resultado);
              } else {
                await refreshProfile();
                setTimeout(() => {
                  navigate("/assinatura");
                }, 1500);
              }
            } catch (error: any) {
              toast.error("assinatura.erro.processar", {
                description: error.response?.data?.error || "Erro ao confirmar seleção.",
              });
            } finally {
              setLoading(false);
            }
          }}
          tipo={selecaoPassageirosDialog.tipo}
          franquia={selecaoPassageirosDialog.franquia}
          usuarioId={profile.id}
        />
      )}

      {/* Dialog de Pagamento PIX */}
      <Dialog
        open={!!dadosPagamento}
        onOpenChange={(open) => {
          if (!open) {
            // Limpar todas as seleções ao fechar o dialog (apenas pelo X)
            setDadosPagamento(null);
            setSelectedPlanoId(null);
            setSelectedSubPlanoId(null);
            setQuantidadePersonalizada("");
            setPrecoCalculadoPreview(null);
          }
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[95vh] overflow-y-auto"
          onInteractOutside={(e) => {
            // Impedir fechar ao clicar fora
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Impedir fechar com ESC
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            // Impedir fechar ao clicar fora
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">
              Conclua o pagamento para ativar sua assinatura
            </DialogTitle>
          </DialogHeader>
          <PagamentoPix
            dadosPagamento={dadosPagamento}
            titulo="Conclua o pagamento para ativar sua assinatura"
            planos={planos}
            subPlanos={subPlanos}
            selectedPlanoId={selectedPlanoId}
            selectedSubPlanoId={selectedSubPlanoId}
            quantidadePersonalizada={
              quantidadePersonalizada &&
              !isNaN(parseInt(quantidadePersonalizada))
                ? parseInt(quantidadePersonalizada)
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Sucesso após Pagamento */}
      <PagamentoSucessoDialog
        isOpen={pagamentoSucessoDialog.isOpen}
        onClose={() => {
          setPagamentoSucessoDialog({ isOpen: false });
          setDadosPagamento(null);
          setSelectedPlanoId(null);
          setSelectedSubPlanoId(null);
          setQuantidadePersonalizada("");
          setPrecoCalculadoPreview(null);
        }}
        nomePlano={pagamentoSucessoDialog.nomePlano}
        quantidadeAlunos={pagamentoSucessoDialog.quantidadeAlunos}
        onIrParaInicio={() => {
          navigate("/inicio");
        }}
        onIrParaAssinatura={() => {
          navigate("/assinatura");
        }}
      />

      {/* Dialog de Confirmação de Downgrade */}
      {showDowngradeDialog && (
        <AlertDialog
          open={showDowngradeDialog}
          onOpenChange={(open) => {
            // Controlar manualmente - só permitir abrir, não fechar via onOpenChange
            // O fechamento será controlado apenas pelos botões
            if (open === false) {
              // Não fazer nada - deixar os botões controlarem o fechamento
              // Isso evita que o diálogo feche automaticamente e afete o modal de seleção
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {downgradeInfo?.titulo || "Confirmar downgrade"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {downgradeInfo?.mensagem ||
                  "Tem certeza que deseja fazer downgrade do seu plano?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDowngradeDialog(false);
                  // Resetar a seleção do sub-plano que causou o downgrade
                  setSelectedSubPlanoId(null);
                  setDowngradeInfo(null);
                }}
              >
                Cancelar
              </Button>
              <AlertDialogAction onClick={handleDowngrade}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
