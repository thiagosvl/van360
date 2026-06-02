import { useExecucaoDetail } from "../api/useRoutes";
import { useAtualizarParadaStatus, useCancelarExecucao } from "../api/useRouteMutations";
import { toast } from "@/utils/notifications/toast";
import { RouteStopStatus } from "@/types/route";

export function useActiveRouteViewModel({ execucaoId }: { execucaoId: string }) {
  const { data: execucao, isLoading, isError } = useExecucaoDetail(execucaoId);

  const stepMutation = useAtualizarParadaStatus();
  const cancelMutation = useCancelarExecucao();

  const handleStep = async (
    passageiroId: string,
    status: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE,
    onSuccessCallback?: () => void
  ) => {
    if (!execucaoId) return;

    stepMutation.mutate(
      {
        execucaoId,
        passageiroId,
        status
      },
      {
        onSuccess: () => {
          if (onSuccessCallback) onSuccessCallback();
        }
      }
    );
  };

  const handleCancel = async (onSuccessCallback?: () => void) => {
    if (!execucaoId) return;

    cancelMutation.mutate(execucaoId, {
      onSuccess: () => {
        toast.success("Corrida cancelada com sucesso!");
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  const abrirNoWaze = (latitude?: number, longitude?: number, logradouro?: string, numero?: string) => {
    let url = "";

    if (latitude && longitude) {
      // Usar coordenadas exatas para precisão cirúrgica de GPS
      url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    } else if (logradouro) {
      // Fallback para endereço textual estruturado
      const query = `${logradouro}, ${numero || ""}`;
      url = `waze://?q=${encodeURIComponent(query)}&navigate=yes`;
    } else {
      toast.error("Endereço deste passageiro não cadastrado.");
      return;
    }

    // Tentar abrir o aplicativo nativo
    window.open(url, "_system");

    // Fallback para web caso o aplicativo Waze não esteja instalado
    setTimeout(() => {
      if (latitude && longitude) {
        window.open(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`, "_blank");
      }
    }, 1500);
  };

  const abrirNoMaps = (latitude?: number, longitude?: number, logradouro?: string, numero?: string) => {
    let url = "";

    if (latitude && longitude) {
      // O link HTTPS do Google Maps é a melhor prática recomendada de deep linking
      // Ele abre o app nativo do Google Maps tanto em Android quanto iOS de forma automática e transparente
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else if (logradouro) {
      const query = `${logradouro}, ${numero || ""}`;
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    } else {
      toast.error("Endereço deste passageiro não cadastrado.");
      return;
    }

    window.open(url, "_system");
  };

  const paradaAtual = execucao?.paradas?.find((p) => p.status === RouteStopStatus.A_CAMINHO);

  const paradasPendentes = execucao?.paradas?.filter(
    (p) => p.status === RouteStopStatus.PENDENTE
  ) || [];

  const paradasConcluidas = execucao?.paradas?.filter(
    (p) => p.status === RouteStopStatus.EMBARCADO || p.status === RouteStopStatus.AUSENTE
  ) || [];

  return {
    execucao,
    paradaAtual,
    paradasPendentes,
    paradasConcluidas,
    isLoading: isLoading || stepMutation.isPending || cancelMutation.isPending,
    isError,
    handleStep,
    handleCancel,
    abrirNoWaze,
    abrirNoMaps
  };
}
