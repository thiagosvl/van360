import { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePublicRenovacao, useResponderPublicRenovacao } from "@/hooks/api/useRenovacoes";
import { RenovacaoStatus, ContratoStatus } from "@/types/enums";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { useLayout } from "@/contexts/LayoutContext";

export function usePublicRenovacaoViewModel() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { openEditarDadosPublicosRenovacaoDialog } = useLayout();

  const { data, isLoading, error } = usePublicRenovacao(token);
  const { mutateAsync: responder, isPending: isResponding } = useResponderPublicRenovacao(token);

  const [confirmRecusaOpen, setConfirmRecusaOpen] = useState(false);
  const [contractData, setContractData] = useState<{ token_acesso: string; link_assinatura: string } | null>(null);

  const isCicloConcluido = Boolean(data?.concluido);
  const isConfirmed = data?.status === RenovacaoStatus.CONFIRMADO;
  const isRecused = data?.status === RenovacaoStatus.RECUSADO;
  const isContratoAssinado = Boolean(data?.contrato?.status === ContratoStatus.ASSINADO);

  const activeContractToken = useMemo(() => {
    if (isContratoAssinado) return null;
    return contractData?.token_acesso || (data?.contrato?.status === ContratoStatus.PENDENTE ? data?.contrato?.token_acesso : null);
  }, [isContratoAssinado, contractData, data?.contrato]);

  const signedContractToken = useMemo(() => {
    return isContratoAssinado ? data?.contrato?.token_acesso : null;
  }, [isContratoAssinado, data?.contrato]);

  const temContratoDigital = Boolean(data?.contrato?.usar_contratos || activeContractToken || isContratoAssinado);
  const isPendente = !isCicloConcluido && !isConfirmed && !isRecused;
  const isConfirmadoComContratoPendente = !isCicloConcluido && isConfirmed && Boolean(activeContractToken);
  const hasPendingAction = isPendente || isConfirmadoComContratoPendente;

  const temCondicoesAlteradas = useMemo(() => {
    const cond = data?.condicoes;
    return Boolean(
      cond?.valor?.alterado ||
      cond?.dia_vencimento?.alterado ||
      cond?.escola?.alterado ||
      cond?.periodo?.alterado ||
      cond?.modalidade?.alterado
    );
  }, [data?.condicoes]);

  const enderecoFormatado = useMemo(() => {
    const resp = data?.responsavel;
    if (!resp) return "";
    return [
      resp.logradouro ? `${resp.logradouro}${resp.numero ? `, ${resp.numero}` : ""}` : null,
      resp.complemento || null,
      resp.bairro || null,
      resp.cidade && resp.estado ? `${resp.cidade} - ${resp.estado}` : (resp.cidade || null),
    ].filter(Boolean).join(", ");
  }, [data?.responsavel]);

  const handleConfirmar = useCallback(async () => {
    try {
      const response = await responder({
        status: RenovacaoStatus.CONFIRMADO,
      });
      if (response?.contrato?.token_acesso) {
        toast.success("Renovação confirmada! Abrindo contrato para assinatura...");
        navigate(ROUTES.PUBLIC.SIGN_CONTRACT.replace(":token", response.contrato.token_acesso));
        return;
      }
      if (response?.contrato) {
        setContractData({
          token_acesso: response.contrato.token_acesso,
          link_assinatura: response.contrato.link_assinatura,
        });
      }
      toast.success("Renovação confirmada com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente ou fale com o motorista.";
      toast.error("Erro ao confirmar renovação", { description: msg });
    }
  }, [responder, navigate]);

  const handleRecusar = useCallback(async () => {
    try {
      await responder({
        status: RenovacaoStatus.RECUSADO,
      });
      setConfirmRecusaOpen(false);
      toast.info("Resposta registrada. A vaga não será renovada.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente ou fale com o motorista.";
      toast.error("Erro ao registrar resposta", { description: msg });
    }
  }, [responder]);

  const handleNavigateToContract = useCallback((contractToken: string) => {
    navigate(ROUTES.PUBLIC.SIGN_CONTRACT.replace(":token", contractToken));
  }, [navigate]);

  const handleOpenEditarDados = useCallback(() => {
    if (!data) return;
    openEditarDadosPublicosRenovacaoDialog({
      token: token || "",
      responsavel: data.responsavel,
      passageiro: data.passageiro,
      condicoes: data.condicoes,
      escolasDisponiveis: data.escolas_disponiveis || [],
    });
  }, [data, token, openEditarDadosPublicosRenovacaoDialog]);

  return {
    data,
    token,
    isLoading,
    error,
    isResponding,
    confirmRecusaOpen,
    setConfirmRecusaOpen,
    isCicloConcluido,
    isConfirmed,
    isRecused,
    isContratoAssinado,
    activeContractToken,
    signedContractToken,
    temContratoDigital,
    isPendente,
    isConfirmadoComContratoPendente,
    hasPendingAction,
    temCondicoesAlteradas,
    enderecoFormatado,
    handleConfirmar,
    handleRecusar,
    handleNavigateToContract,
    handleOpenEditarDados,
  };
}
