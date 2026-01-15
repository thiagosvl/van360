import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConnectionState, WHATSAPP_STATUS } from "../config/constants";
import { whatsappApi } from "../services/api/whatsapp.api";

import { supabase } from "../integrations/supabase/client";
import { useProfile } from "./business/useProfile";
import { useSession } from "./business/useSession";

import { useLayout } from "../contexts/LayoutContext";

export function useWhatsapp(options?: { enablePolling?: boolean }) {
  const queryClient = useQueryClient();
  const [localQrCode, setLocalQrCode] = useState<string | null>(null);
  
  const { user } = useSession();
  const { isProfissional } = useProfile(user?.id);
  
  // Safe check for Layout context (in case hook is used outside provider)
  let isPixKeyDialogOpen = false;
  try {
      /* eslint-disable-next-line react-hooks/rules-of-hooks */
      const layout = useLayout();
      isPixKeyDialogOpen = layout.isPixKeyDialogOpen;
  } catch (e) {
      // Ignore if outside layout
  }

  const [mutationPairingData, setMutationPairingData] = useState<{ code: string, expiresAt: string } | null>(null);

  // Realtime listener for connection status
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("whatsapp_status_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "usuarios",
          filter: `auth_uid=eq.${user.id}`,
        },
        (payload) => {
          // Quando houver mudança no banco, limpar o buffer local e forçar refetch
          setMutationPairingData(null);
          
          // Refetch imediato com refetchType: "all" para garantir sincronização
          queryClient.invalidateQueries({ 
            queryKey: ["whatsapp-status"],
            refetchType: "all"
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Consulta de Status
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: whatsappApi.getStatus,
    enabled: !!user?.id && isProfissional && !isPixKeyDialogOpen,
    staleTime: 3000, // Reduzido para 3s para melhor sincronização
    refetchInterval: false, // Polling removido definitivamente
    refetchOnWindowFocus: true,
  });

  const state = (statusData?.state || WHATSAPP_STATUS.UNKNOWN) as ConnectionState;
  const instanceName = statusData?.instanceName || null;

  // Mutation: Connect
  const connectMutation = useMutation({
    mutationFn: whatsappApi.connect,
    onSuccess: (data) => {
        if (data.qrcode?.base64) {
            setLocalQrCode(data.qrcode.base64);
            toast.info("Escaneie o QR Code para conectar.");
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
    onSuccess: (data: any) => {
        if (data.pairingCode?.code) {
            setLocalQrCode(null);
            // Buffer local para exibição instantânea antes do Realtime/Refetch
            setMutationPairingData({
                code: data.pairingCode.code,
                expiresAt: new Date(Date.now() + 60000).toISOString()
            });
        }
        // Refetch imediato para sincronizar com o banco
        queryClient.invalidateQueries({ 
          queryKey: ["whatsapp-status"],
          refetchType: "all"
        });
        return data; 
    },
    onError: (error: any) => {
        const msg = error?.response?.data?.error || error?.message || "Erro desconhecido";
        toast.error("Erro ao gerar código: " + msg);
    }
  });

  // VALOR FINAL: Prioriza o dado da mutação (mais rápido) e cai pro DB (mais estável)
  const pairingCode = mutationPairingData?.code || (statusData as any)?.pairingCode;
  const pairingCodeExpiresAt = mutationPairingData?.expiresAt || (statusData as any)?.pairingCodeExpiresAt;

  return {
    state,
    qrCode: localQrCode,
    isLoading: isLoading || connectMutation.isPending || disconnectMutation.isPending || pairingCodeMutation.isPending,
    instanceName,
    pairingCode,
    pairingCodeExpiresAt,
    userPhone: (statusData as any)?.telefone || (useProfile(user?.id) as any)?.profile?.telefone,
    connect: () => connectMutation.mutate(),
    disconnect: () => disconnectMutation.mutate(),
    requestPairingCode: pairingCodeMutation.mutateAsync,
    refresh: refetch
  };
}
