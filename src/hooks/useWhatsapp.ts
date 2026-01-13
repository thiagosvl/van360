import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConnectionState, WHATSAPP_STATUS } from "../config/constants";
import { whatsappApi } from "../services/api/whatsapp.api";

import { useProfile } from "./business/useProfile";
import { useSession } from "./business/useSession";

export function useWhatsapp() {
  const queryClient = useQueryClient();
  const [localQrCode, setLocalQrCode] = useState<string | null>(null);
  
  const { user } = useSession();
  const { isProfissional } = useProfile(user?.id);

  // Consulta de Status (Deduped e Cached por 10s)
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: whatsappApi.getStatus,
    enabled: !!user?.id && isProfissional,
    staleTime: 10000, 
    refetchInterval: (query) => {
        const data = query.state.data;
        const state = data?.state as string;
        
        // Se estiver conectado, polling lento (30s) só para garantir que não caiu
        if (state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED) return 30000;
        
        // Se temos QR Code na tela, precisamos de velocidade máxima para fechar o dialog ao escanear
        if (localQrCode) return 2000;

        // Se o backend diz "connecting" mas sem QR, é um estado de transição/recuperação
        if (state === "connecting" || state === WHATSAPP_STATUS.CONNECTING) return 5000;
        
        // Se estiver desconectado, polling médio (10s)
        return 10000;
    }
  });

  const state = (statusData?.state || WHATSAPP_STATUS.UNKNOWN) as ConnectionState;
  const instanceName = statusData?.instanceName || null;

  // Atualizar QR Local se a conexão for estabelecida
  useEffect(() => {
    if (state === WHATSAPP_STATUS.OPEN) {
        setLocalQrCode(null);
    }
  }, [state]);

  // Mutation: Connect
  const connectMutation = useMutation({
    mutationFn: whatsappApi.connect,
    onSuccess: (data) => {
        if (data.qrcode?.base64) {
            setLocalQrCode(data.qrcode.base64);
            toast.info("Escaneie o QR Code para conectar.");
            // Força refetch imediato e inicia polling via refetchInterval
            queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
        } else if (data.instance?.state === "open") {
            toast.success("WhatsApp já está conectado!");
            queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
        }
    },
    onError: (error: any) => {
        toast.error("Erro ao iniciar conexão: " + (error.response?.data?.error || "Erro desconhecido"));
    }
  });

  // Mutation: Disconnect
  const disconnectMutation = useMutation({
    mutationFn: whatsappApi.disconnect,
    onSuccess: () => {
        toast.success("Desconectado com sucesso.");
        setLocalQrCode(null);
        queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
    },
    onError: () => {
        toast.error("Erro ao desconectar.");
    }
  });

  // Mutation: Request Pairing Code
  const pairingCodeMutation = useMutation({
    mutationFn: whatsappApi.requestPairingCode,
    onSuccess: (data) => {
        if (data.pairingCode) {
            setLocalQrCode(null); // Clear QR if exists
        }
        return data;
    },
    onError: (error: any) => {
        toast.error("Erro ao gerar código: " + (error.response?.data?.error || "Erro desconhecido"));
    }
  });

  return {
    state,
    qrCode: localQrCode,
    isLoading: isLoading || connectMutation.isPending || disconnectMutation.isPending || pairingCodeMutation.isPending,
    instanceName,
    connect: () => connectMutation.mutate(),
    disconnect: () => disconnectMutation.mutate(),
    requestPairingCode: pairingCodeMutation.mutateAsync, // Async to allow awaiting result in UI
    refresh: refetch
  };
}
