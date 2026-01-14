import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConnectionState, WHATSAPP_STATUS } from "../config/constants";
import { whatsappApi } from "../services/api/whatsapp.api";

import { supabase } from "../integrations/supabase/client";
import { useProfile } from "./business/useProfile";
import { useSession } from "./business/useSession";

import { useLayout } from "../contexts/LayoutContext";

export function useWhatsapp() {
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
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // Quando houver qualquer mudança no registro do usuário, invalidamos o status do WhatsApp
          // O backend é a fonte da verdade definitiva (Evolution API), mas o DB local reflete o estado.
          queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Consulta de Status (Deduped e Cached por 10s)
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: whatsappApi.getStatus,
    enabled: !!user?.id && isProfissional && !isPixKeyDialogOpen, // Pause if Pix Dialog is open
    enabled: !!user?.id && isProfissional && !isPixKeyDialogOpen, // Pause if Pix Dialog is open
    staleTime: Infinity, // Realtime will invalidate this
    refetchOnWindowFocus: true, // Good backup
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
        // Normalize checking if we have a code
        return data; 
    },
    onError: (error: any) => {
        const msg = error?.response?.data?.error || error?.message || "Erro desconhecido";
        toast.error("Erro ao gerar código: " + msg);
    }
  });

  return {
    state,
    qrCode: localQrCode,
    isLoading: isLoading || connectMutation.isPending || disconnectMutation.isPending || pairingCodeMutation.isPending,
    instanceName,
    userPhone: (statusData as any)?.telefone || (useProfile(user?.id) as any)?.profile?.telefone,
    connect: () => connectMutation.mutate(),
    disconnect: () => disconnectMutation.mutate(),
    requestPairingCode: pairingCodeMutation.mutateAsync, // Async to allow awaiting result in UI
    refresh: refetch
  };
}
