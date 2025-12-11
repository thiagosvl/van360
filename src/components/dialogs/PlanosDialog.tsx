// React
import { useEffect, useRef, useState } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Third-party

// Components - Features
import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { SelecaoPassageirosDialog } from "@/components/dialogs/SelecaoPassageirosDialog";
import { PlanoCard } from "@/components/features/register/PlanoCard";

// Components - UI
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

// Hooks
import { useCalcularPrecoPreview, usePlanos } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Services
import { usuarioApi } from "@/services";

// Utils
import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { getQuantidadeMinimaPersonalizada } from "@/utils/domain/plano/planoStructureUtils";
import { getAssinaturaAtiva } from "@/utils/domain/plano/planoUtils";
import { toast } from "@/utils/notifications/toast";

// Mensagens de downgrade (Mantidas do original)
const MENSAGENS_DOWNGRADE = {
  [`${PLANO_COMPLETO}-${PLANO_ESSENCIAL}`]: {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para o Plano Essencial, você poderá ter Cobrança Automática para até um número ilimitado de passageiros. Atualmente você tem X Passageiros com Cobrança Automática. A mudança será feita agora e não há cobrança adicional.",
  },
  "subplano-menor": {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para este plano, você poderá ter Cobrança Automática para até X passageiros. Atualmente você tem Y Passageiros com Cobrança Automática. Você precisará escolher quais continuarão com Cobrança Automática.",
  },
  "personalizado-para-predefinido": {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para este plano, você poderá ter Cobrança Automática para até X passageiros. Atualmente você tem Y Passageiros com Cobrança Automática. Você precisará escolher quais continuarão com Cobrança Automática.",
  },
  "personalizado-reducao": {
    titulo: "Confirmar mudança de plano?",
    mensagem:
      "Ao mudar para este plano, você poderá ter Cobrança Automática para até X passageiros. Atualmente você tem Y Passageiros com Cobrança Automática. Você precisará escolher quais continuarão com Cobrança Automática.",
  },
};

interface PlanosDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlanosDialog({ isOpen, onOpenChange }: PlanosDialogProps) {
  const { user } = useSession();
  const { profile, plano, isLoading: isProfileLoading, refreshProfile } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);

  // Usar hook do React Query para buscar planos
  const {
    data: planosData = { bases: [], sub: [] },
  } = usePlanos({ ativo: "true" }, {
    onError: () => {
      toast.error("plano.erro.carregar");
    },
    enabled: isOpen, // Só carrega quando aberto
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
  
  // Dialogs internos
  const [pagamentoDialog, setPagamentoDialog] = useState<{
    isOpen: boolean;
    cobrancaId: string;
    valor: number;
  } | null>(null);
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
  // Pagamento successo dialog removido ou simplificado pois não estamos em rota

  const planosRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams(); // Opcional no dialog, removendo para simplificar

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

    const planoAtual = assinaturaAtiva.planos;
    if (!planoAtual) return false;

    if (planoAtual.parent_id) {
      const planoCompletoBase = planos.find((p) => p.slug === PLANO_COMPLETO);
      return planoCompletoBase?.id === planoId;
    }

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
      return false;
    }

    return planoAtual.id === subPlanoId;
  };

  const isQuantidadePersonalizadaAtiva = () => {
    if (!plano || !profile) return false;

    const assinaturaAtiva = getAssinaturaAtiva(profile);
    if (!assinaturaAtiva) return false;

    const planoAtual = assinaturaAtiva.planos;
    if (!planoAtual) return false;

    const slugPlanoAtual = planoAtual.parent?.slug || planoAtual.slug;
    return slugPlanoAtual === PLANO_COMPLETO && !planoAtual.parent_id;
  };

  // Handlers (Copy-paste adaptado)
  const handlePlanoSelect = (planoId: string) => {
    if (!plano || !profile?.assinaturas_usuarios) return;

    const planoSelecionado = planos.find((p) => p.id === planoId);
    if (!planoSelecionado) return;

    if (planoSelecionado.slug === PLANO_GRATUITO) {
      return;
    }

    setSelectedPlanoId(planoId);
    setSelectedSubPlanoId(null);
    setPagamentoDialog(null);
    setQuantidadePersonalizada("");
    setPrecoCalculadoPreview(null);

    const assinaturaAtiva = profile.assinaturas_usuarios.find(
      (a: any) => a.ativo === true
    );
    if (!assinaturaAtiva?.planos) return;

    const planoAtual = assinaturaAtiva.planos;
    const slugAtual = planoAtual.parent?.slug || planoAtual.slug;

    const tipoMudanca = getTipoMudanca(slugAtual, planoSelecionado.slug);

    if (tipoMudanca === "downgrade") {
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
      handleUpgrade(planoId);
    }
  };

   const handleSubPlanoSelect = async (subPlanoId: string) => {
    if (!plano || !profile?.assinaturas_usuarios) return;
    if (isSubPlanoAtivo(subPlanoId)) return;

    setSelectedSubPlanoId(subPlanoId);
    setQuantidadePersonalizada("");
    setPrecoCalculadoPreview(null);

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

    const franquiaAtual = assinaturaAtiva.franquia_contratada_cobrancas || 0;
    const franquiaNova = subPlanoNovo.franquia_cobrancas_mes || 0;

    const isDowngrade =
      precoNovo < precoAtual ||
      franquiaNova < franquiaAtual ||
      estaEmQuantidadePersonalizada;

    if (isDowngrade) {
      const mensagemDowngrade = estaEmQuantidadePersonalizada
        ? MENSAGENS_DOWNGRADE["personalizado-reducao"]
        : MENSAGENS_DOWNGRADE["subplano-menor"];
      
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
      } else if (result.qrCodePayload && (result as any).cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String((result as any).cobrancaId),
          valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
        });
        setSelectedPlanoId(planoId);
      } else {
        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");
        setTimeout(() => onOpenChange(false), 500); // Fechar dialog no sucesso imediato
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

      const assinaturaAtiva = profile.assinaturas_usuarios.find(
        (a: any) => a.ativo === true
      );
      const planoAtualDoUsuario = assinaturaAtiva?.planos;
      const slugPlanoAtual =
        planoAtualDoUsuario?.parent?.slug || planoAtualDoUsuario?.slug;
      const estaNoCompleto = slugPlanoAtual === PLANO_COMPLETO;

      const isSubplano = subPlanos.some((s) => s.id === downgradeInfo.planoId);
      const planoAtual = assinaturaAtiva?.planos;
      const estaEmQuantidadePersonalizada =
        estaNoCompleto &&
        planoAtual &&
        (planoAtual.parent?.slug || planoAtual.slug) === PLANO_COMPLETO &&
        !planoAtual.parent_id;

      if (estaEmQuantidadePersonalizada && quantidadePersonalizada) {
        const quantidade = parseInt(quantidadePersonalizada);
        if (!isNaN(quantidade)) {
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
          } else if (result.qrCodePayload && (result as any).cobrancaId) {
            setPagamentoDialog({
              isOpen: true,
              cobrancaId: String((result as any).cobrancaId),
              valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
            });
          } else {
            await refreshProfile();
            toast.success("assinatura.sucesso.atualizada");
            setTimeout(() => onOpenChange(false), 500);
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
        } else if (result.qrCodePayload && (result as any).cobrancaId) {
          setPagamentoDialog({
            isOpen: true,
            cobrancaId: String((result as any).cobrancaId),
            valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
          });
          setSelectedPlanoId(
            planos.find((p) => p.slug === PLANO_COMPLETO)?.id || null
          );
        } else {
          await refreshProfile();
          toast.success("assinatura.sucesso.atualizada");
          setTimeout(() => onOpenChange(false), 500);
        }
      } else {
        await usuarioApi.downgradePlano({
          usuario_id: profile.id,
          plano_id: downgradeInfo.planoId,
        });

        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");
        setTimeout(() => onOpenChange(false), 500);
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
      } else if (result.qrCodePayload && (result as any).cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String((result as any).cobrancaId),
          valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
        });
      } else {
        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");
        setTimeout(() => onOpenChange(false), 500);
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

  const getQuantidadeMinima = () => {
    return getQuantidadeMinimaPersonalizada(planos, subPlanos);
  };

  // Effect para preço preview
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

    const quantidadeMinima = getQuantidadeMinima();
    if (!quantidadeMinima || quantidade < quantidadeMinima) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      return;
    }

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

    if (estaNoCompleto && assinaturaAtiva) {
      const planoAtual = assinaturaAtiva.planos;
      const estaEmQuantidadePersonalizada =
        (planoAtual?.parent?.slug || planoAtual?.slug) === PLANO_COMPLETO &&
        !planoAtual?.parent_id;

      const quantidadeAtual = assinaturaAtiva.franquia_contratada_cobrancas || 0;
      
      if (quantidade === quantidadeAtual) {
        toast.info("assinatura.info.quantidadeIgual", {
          description: `assinatura.info.quantidadeIgualDescricao`,
        });
        return;
      }

      if (estaEmQuantidadePersonalizada) {
        if (quantidade < quantidadeAtual) {
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
      } else if (result.qrCodePayload && (result as any).cobrancaId) {
          setPagamentoDialog({
            isOpen: true,
            cobrancaId: String((result as any).cobrancaId),
            valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
          });
          setSelectedPlanoId(
            planos.find((p) => p.slug === PLANO_COMPLETO)?.id || null
          );
      } else {
        await refreshProfile();
        toast.success("assinatura.sucesso.atualizada");
        setTimeout(() => onOpenChange(false), 500);
      }
    } catch (error: any) {
      toast.error("assinatura.erro.processar", {
        description:
          error.response?.data?.error ||
          "Não foi possível contratar a quantidade personalizada.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Planos e Preços</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <div 
                key={plano.id} 
                ref={(el) => (planosRefs.current[plano.id] = el)}
                className="flex"
              >
                <PlanoCard
                  plano={plano}
                  subPlanos={subPlanos}
                  isSelected={selectedPlanoId === plano.id}
                  onSelect={() => handlePlanoSelect(plano.id)}
                  // Props específicas para Plano Completo (Customizável)
                  isSubPlanoAtivo={isSubPlanoAtivo}
                  onSubPlanoSelect={(id) => id ? handleSubPlanoSelect(id) : setSelectedSubPlanoId(null)}
                  selectedSubPlanoId={selectedSubPlanoId}
                  quantidadePersonalizada={quantidadePersonalizada}
                  onQuantidadePersonalizadaChange={setQuantidadePersonalizada}
                  onQuantidadePersonalizadaConfirm={handleQuantidadePersonalizadaSelect}
                  precoCalculadoPreview={precoCalculadoPreview?.preco ?? null}
                  valorPorCobranca={precoCalculadoPreview?.valorPorCobranca ?? null}
                  isCalculandoPreco={isCalculandoPreco}
                  isQuantidadePersonalizadaAtiva={isQuantidadePersonalizadaAtiva()}
                />
              </div>
            ))}
          </div>
        </div>

      </DialogContent>
    </Dialog>

    <LoadingOverlay active={loading} text="Processando..." />

    {/* DIALOGS AUXILIARES (Renderizados fora do Dialog principal para evitar problemas de stack/overflow) */}
    {/* Pagamento Dialog */}
    {pagamentoDialog && (
      <PagamentoAssinaturaDialog
        isOpen={pagamentoDialog.isOpen}
        onClose={() => setPagamentoDialog(null)}
        cobrancaId={pagamentoDialog.cobrancaId}
        valor={pagamentoDialog.valor}
        onPaymentSuccess={() => {
          setPagamentoDialog(null);
          // onSuccess é chamado após pagamento confirmado, mas o webhook pode demorar
          // Ideal seria mostrar a tela de sucesso
          toast.success("Pagamento identificado! Atualizando seu plano...");
          setTimeout(() => {
              refreshProfile().then(() => onOpenChange(false));
          }, 2000);
        }}
      />
    )}

    {/* Seleção de Passageiros Dialog (Upgrade/Downgrade complexo) */}
    {selecaoPassageirosDialog && (
      <SelecaoPassageirosDialog
        isOpen={selecaoPassageirosDialog.isOpen}
        onClose={() => setSelecaoPassageirosDialog(null)}
        tipo={selecaoPassageirosDialog.tipo}
        franquia={selecaoPassageirosDialog.franquia}
        usuarioId={profile?.id || ""}
        onConfirm={async (ids) => {
            if (!profile?.id) return;
            try {
                setLoading(true);
                const result = await usuarioApi.confirmarSelecaoPassageiros(profile.id, {
                    passageiroIds: ids,
                    franquia: selecaoPassageirosDialog.franquia,
                    tipoDowngrade: selecaoPassageirosDialog.tipoDowngrade,
                    subplanoId: selecaoPassageirosDialog.subplanoId,
                    quantidadePersonalizada: selecaoPassageirosDialog.quantidadePersonalizada,
                    tipo: selecaoPassageirosDialog.tipo,
                    planoId: selecaoPassageirosDialog.planoId,
                    precoAplicado: selecaoPassageirosDialog.precoAplicado,
                    precoOrigem: selecaoPassageirosDialog.precoOrigem,
                });

                if (result.qrCodePayload && result.cobrancaId) {
                    setSelecaoPassageirosDialog(null);
                    setPagamentoDialog({
                        isOpen: true,
                        cobrancaId: String(result.cobrancaId),
                        valor: Number(result.preco_aplicado || result.valor || 0),
                    });
                } else {
                    setSelecaoPassageirosDialog(null);
                    await refreshProfile();
                    toast.success("assinatura.sucesso.atualizada");
                    setTimeout(() => onOpenChange(false), 500);
                }
            } catch (error: any) {
                toast.error("Erro ao confirmar seleção", {
                    description: error.response?.data?.error || "Ocorreu um erro ao processar sua solicitação."
                });
            } finally {
                setLoading(false);
            }
        }}
      />
    )}

    {/* Downgrade Confirmation Dialog */}
    <AlertDialog
      open={showDowngradeDialog}
      onOpenChange={setShowDowngradeDialog}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{downgradeInfo?.titulo}</AlertDialogTitle>
          <AlertDialogDescription>
            {downgradeInfo?.mensagem}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleDowngrade}
            className="bg-red-600 hover:bg-red-700"
          >
            Confirmar Downgrade
          </AlertDialogAction>
          <Button
            variant="ghost"
            onClick={() => setShowDowngradeDialog(false)}
          >
            Cancelar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>


    </>
  );
}
