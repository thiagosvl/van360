import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConnectionState, WHATSAPP_STATUS } from "../config/constants";
import { useLayoutSafe } from "../contexts/LayoutContext";
import { whatsappApi } from "../services/api/whatsapp.api";
import { PixKeyStatus } from "../types/enums";

import { supabase } from "../integrations/supabase/client";
import { useProfile } from "./business/useProfile";
import { useSession } from "./business/useSession";


export function useWhatsapp(options?: { enablePolling?: boolean }) {
  const queryClient = useQueryClient();
  const [localQrCode, setLocalQrCode] = useState<string | null>(null);
  const pairingCodeRequestInProgressRef = useRef(false); // Prevenir requisições simultâneas
  
  const { user } = useSession();
  const { is_profissional, profile } = useProfile(user?.id);
  
  // Safe check for Layout context (in case hook is used outside provider)
  const layout = useLayoutSafe();
  const isPixKeyDialogOpen = layout?.isPixKeyDialogOpen ?? false;

  const [mutationPairingData, setMutationPairingData] = useState<{ code: string, expiresAt: string } | null>(null);

  // Realtime listener for connection status
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`whatsapp_status_sync_${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usuarios",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          // Só invalida se houver mudança REAL no status ou pairing code
          const oldStatus = payload.old?.whatsapp_status;
          const newStatus = payload.new?.whatsapp_status;
          const oldCode = payload.old?.pairing_code;
          const newCode = payload.new?.pairing_code;

          if (oldStatus !== newStatus || oldCode !== newCode) {
              console.log("Realtime Status Sync: Atualizando cache.", { oldStatus, newStatus });
              queryClient.invalidateQueries({ 
                queryKey: ["whatsapp-status"],
                refetchType: "all"
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient]);


  // Consulta de Status
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: whatsappApi.getStatus,
    // SÓ busca status se tiver chave PIX validada. Se não tiver, nem tenta.
    // Isso evita requests de pairing/status rodando no fundo enquanto o dialog de PIX aparece.
    enabled: !!user?.id && !!profile?.id && is_profissional && !isPixKeyDialogOpen && (profile?.status_chave_pix === PixKeyStatus.VALIDADA),
    staleTime: 5000, 
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
    mutationFn: async () => {
        console.log("[WhatsApp] Iniciando conexão...");
        return await whatsappApi.connect();
    },
    onSuccess: (data) => {
        console.log("[WhatsApp] Conexão iniciada com sucesso.", { state: data.instance?.state, hasQr: !!data.qrcode?.base64 });
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
        console.error("[WhatsApp] Erro na conexão:", error);
        const errorMsg = error?.response?.data?.error || error?.message || "Erro desconhecido";
        toast.error("Erro ao iniciar conexão: " + errorMsg);
    }
  });

  // Mutation: Disconnect
  const disconnectMutation = useMutation({
    mutationFn: async () => {
        console.log("[WhatsApp] Solicitando desconexão...");
        return await whatsappApi.disconnect();
    },
    onSuccess: () => {
        console.log("[WhatsApp] Desconectado com sucesso.");
        toast.success("Desconectado com sucesso.");
        setLocalQrCode(null);
        queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
    },
    onError: (error: any) => {
        console.error("[WhatsApp] Erro ao desconectar:", error);
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
        console.warn("[WhatsApp] Requisição de Pairing Code ignorada (já em progresso)");
        throw new Error("Requisição de código já em progresso. Aguarde...");
      }

      // TRAVA DE SEGURANÇA: Bloqueia fluxo se PIX não estiver validado (redundância)
      if (profile?.status_chave_pix !== PixKeyStatus.VALIDADA) {
          console.warn("[WhatsApp] Tentativa de conexão sem Chave Pix validada");
          throw new Error("Chave PIX não validada. Configure sua chave antes de conectar.");
      }
      
      console.log("[WhatsApp] Solicitando Pairing Code...");
      pairingCodeRequestInProgressRef.current = true;
      try {
        return await whatsappApi.requestPairingCode();
      } finally {
        pairingCodeRequestInProgressRef.current = false;
      }
    },
    onSuccess: (data: any) => {
        console.log("[WhatsApp] Pairing Code recebido:", data);
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
        console.error("[WhatsApp] Erro ao obter Pairing Code:", error);
        const msg = error?.response?.data?.error || error?.message || "Erro desconhecido";
        toast.error("Erro ao gerar código: " + msg);
    }
  });

  // VALOR FINAL: Prioriza o dado da mutação (mais rápido) e cai pro DB (mais estável)
  const pairingCode = mutationPairingData?.code || (statusData as any)?.pairing_code;
  const pairingCodeExpiresAt = mutationPairingData?.expiresAt || (statusData as any)?.pairing_code_expires_at;

  // Permissão de interação: Segue a mesma lógica do query principal
  const canInteract = !!user?.id && !!profile?.id && is_profissional && !isPixKeyDialogOpen && (profile?.status_chave_pix === PixKeyStatus.VALIDADA);

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
    // Só expõe as funções se tiver permissão de interação. 
    // Isso evita que a UI tente "auto-corrigir" estados desconhecidos chamando funções que vão falhar.
    connect: canInteract ? () => connectMutation.mutate() : undefined,
    disconnect: canInteract ? () => disconnectMutation.mutate() : undefined,
    requestPairingCode: canInteract ? pairingCodeMutation.mutateAsync : undefined,
    refresh: refetch
  };
}
