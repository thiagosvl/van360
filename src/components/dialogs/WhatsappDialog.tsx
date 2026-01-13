import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { WhatsappStatusView } from "@/components/Whatsapp/WhatsappStatusView";
import { WHATSAPP_STATUS } from "@/config/constants";
import { useWhatsapp } from "@/hooks/useWhatsapp";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface WhatsappDialogProps {
    isOpen: boolean;
    onClose: () => void;
    canClose?: boolean;
    userPhone?: string;
}

export function WhatsappDialog({ isOpen, onClose, canClose = true, userPhone }: WhatsappDialogProps) {
  const { state, qrCode, isLoading, connect, disconnect, instanceName, requestPairingCode } = useWhatsapp();
  
  // Ref para controlar a tentativa automática e evitar loops
  const hasAttemptedRef = useRef(false);
  const wasConnectedOnOpenRef = useRef(false);

  // Status derivados
  // Aceita CONNECTED ou open (API Evolution às vezes alterna)
  const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
  
  // 0. Capturar estado inicial ao abrir
  useEffect(() => {
      if (isOpen) {
          wasConnectedOnOpenRef.current = isConnected;
      }
  }, [isOpen]);

  // 1. Resetar flag quando o dialog fechar
  useEffect(() => {
      if (!isOpen) {
          hasAttemptedRef.current = false;
          wasConnectedOnOpenRef.current = false;
      }
  }, [isOpen]);

  // REMOVED: Auto-Connect (Mobile First approach suggests waiting for user interaction)

  // 3. Auto-Close ao conectar com sucesso (se estava aberto e NÃO estava conectado antes)
  useEffect(() => {
      if (isOpen && isConnected && !wasConnectedOnOpenRef.current) {
          toast.success("WhatsApp Conectado com Sucesso!");
          onClose();
      }
  }, [isOpen, isConnected, onClose]);

  // Permitir fechar se estiver conectado (fallback), ou se prop canClose permitir
  const effectiveCanClose = canClose || isConnected;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && effectiveCanClose) {
            onClose();
        }
    }}>
      <DialogContent className={`sm:max-w-md ${!effectiveCanClose ? "[&>button]:hidden" : ""}`} onPointerDownOutside={(e) => !effectiveCanClose && e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
             <DialogTitle>Conexão WhatsApp Necessária</DialogTitle>
          </div>
          <DialogDescription>
            Para enviar notificações automáticas aos responsáiveis dos passageiros, é necessário manter seu WhatsApp conectado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
            <WhatsappStatusView 
                state={state}
                qrCode={qrCode}
                isLoading={isLoading}
                instanceName={instanceName}
                onConnect={connect}
                onRequestPairingCode={requestPairingCode}
            />
        </div>

        <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-4 border-t flex flex-row items-center justify-end gap-2">
             <div className="flex-1 text-xs text-gray-500">
                {isLoading ? "Verificando status..." : (isConnected ? "Conexão ativa" : "Aguardando conexão...")}
             </div>

             {isConnected && (
                <Button variant="destructive" onClick={disconnect} disabled={isLoading}>
                    Desconectar
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
