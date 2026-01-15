import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
  const pairingCodeRequestInProgressRef = useRef(false); // Prevenir requisições simultâneas
  
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
        () => {
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
    staleTime: 3000, 
    refetchInterval: false, 
    refetchOnWindowFocus: false, // Evita requisições extras ao focar na janela
  });

  // Sync: Transição suave de Mutation State -> Server State
  useEffect(() => {
     // Se já temos o código vindo do servidor, limpamos o estado local para evitar inconsistências
     if ((statusData as any)?.pairing_code) {
         setMutationPairingData(null);
     }
     // Se conectou, limpamos qualquer código pendente
     if ((statusData as any)?.whatsapp_status === WHATSAPP_STATUS.CONNECTED) {
         setMutationPairingData(null);
     }
  }, [(statusData as any)?.pairing_code, (statusData as any)?.whatsapp_status]);

  const state = (statusData?.state || WHATSAPP_STATUS.UNKNOWN) as ConnectionState;
  const instanceName = statusData?.instanceName || null;
  const isFetched = statusData !== undefined;

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
        const errorMsg = error?.response?.data?.error || error?.message || "Erro desconhecido";
        toast.error("Erro ao iniciar conexão: " + errorMsg);
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
    onError: (error: any) => {
        const errorMsg = error?.response?.data?.error || error?.message || "Erro desconhecido";
        toast.error("Erro ao desconectar: " + errorMsg);
    }
  });

  // Mutation: Request Pairing Code
  // Com proteção contra requisições simultâneas
  const pairingCodeMutation = useMutation({
    mutationFn: async () => {
      // Se já há uma requisição em progresso, não fazer outra
      if (pairingCodeRequestInProgressRef.current) {
        throw new Error("Requisição de código já em progresso. Aguarde...");
      }
      
      pairingCodeRequestInProgressRef.current = true;
      try {
        return await whatsappApi.requestPairingCode();
      } finally {
        pairingCodeRequestInProgressRef.current = false;
      }
    },
    onSuccess: (data: any) => {
        if (data.pairingCode?.code) {
            setLocalQrCode(null);
            // Buffer local para exibição instantânea antes do Realtime/Refetch
            setMutationPairingData({
                code: data.pairingCode.code,
                expiresAt: new Date(Date.now() + 60000).toISOString()
            });
            toast.success("Código de pareamento gerado! Digite no seu WhatsApp.");
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
  const pairingCode = mutationPairingData?.code || (statusData as any)?.pairing_code;
  const pairingCodeExpiresAt = mutationPairingData?.expiresAt || (statusData as any)?.pairing_code_expires_at;

  return {
    state,
    qrCode: localQrCode,
    isFetched,
    isInitialLoading: isLoading && !isFetched,
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
