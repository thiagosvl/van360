import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { WhatsappStatusView } from "@/components/Whatsapp/WhatsappStatusView";
import { WHATSAPP_STATUS } from "@/config/constants";
import { useWhatsapp } from "@/hooks/useWhatsapp";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface WhatsappDialogProps {
    isOpen: boolean;
    onClose: () => void;
    canClose?: boolean;
    userPhone?: string;
}

export function WhatsappDialog({ isOpen, onClose, canClose = true, userPhone }: WhatsappDialogProps) {
  const { state, qrCode, isLoading, connect, disconnect, instanceName, requestPairingCode, userPhone: hookPhone } = useWhatsapp();
  
  const displayPhone = userPhone || hookPhone;

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
  }, [isOpen, isConnected]);

  // 1. Resetar flag quando o dialog fechar
  useEffect(() => {
      if (!isOpen) {
          hasAttemptedRef.current = false;
          wasConnectedOnOpenRef.current = false;
      }
  }, [isOpen]);

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
      <DialogContent 
        className="w-full max-w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden h-full max-h-[96vh] sm:h-auto sm:max-h-[90vh] flex flex-col bg-white sm:rounded-3xl border-0 shadow-2xl" 
        onPointerDownOutside={(e) => !effectiveCanClose && e.preventDefault()}
        hideCloseButton={!effectiveCanClose}
      >
        <DialogHeader className="p-6 shrink-0 border-b bg-white relative">
          {!effectiveCanClose && (
             <div className="absolute right-4 top-4">
                 <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
             </div>
          )}
          <div className="flex items-center gap-2">
             <DialogTitle className="text-xl font-bold text-slate-900">Conexão WhatsApp</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500">
            Conecte seu aparelho para habilitar notificações.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden px-6 py-4">
            <WhatsappStatusView 
                state={state}
                qrCode={qrCode}
                isLoading={isLoading}
                instanceName={instanceName}
                onConnect={connect}
                onRequestPairingCode={requestPairingCode}
                userPhone={displayPhone}
            />
        </div>

      </DialogContent>
    </Dialog>
  );
}
