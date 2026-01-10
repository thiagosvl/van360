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

export function WhatsappDialog({ isOpen, onClose, canClose = true }: WhatsappDialogProps) {
  const { state, qrCode, isLoading, connect, disconnect, instanceName, refresh } = useWhatsapp();
  
  // Ref para controlar a tentativa automática e evitar loops
  const hasAttemptedRef = useRef(false);

  // Status derivados
  // Aceita CONNECTED ou open (API Evolution às vezes alterna)
  const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
  
  // Só consideramos conectando se tiver QR code ou status explícito de connecting
  const isConnecting = (state === WHATSAPP_STATUS.CONNECTING || state === "connecting") && qrCode !== null;
  const isDisconnected = !isConnected;

  // 1. Resetar flag quando o dialog fechar
  useEffect(() => {
      if (!isOpen) {
          hasAttemptedRef.current = false;
      }
  }, [isOpen]);

  // 2. Auto-Connect ao abrir (Se desconectado)
  useEffect(() => {
      if (isOpen && isDisconnected && !isConnecting && !isLoading && !hasAttemptedRef.current) {
         hasAttemptedRef.current = true;
         console.log("WhatsappDialog: Iniciando auto-conexão...");
         connect();
      }
  }, [isOpen, isDisconnected, isConnecting, isLoading, connect]);

  // 3. Auto-Close ao conectar com sucesso (se estava aberto)
  useEffect(() => {
      // Se estamos com o dialog aberto, e de repente o status vira conectado...
      if (isOpen && isConnected) {
          toast.success("WhatsApp Conectado com Sucesso!");
          onClose(); // Fecha o dialog automaticamente
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
            Para enviar notificações automáticas aos seus passageiros, é necessário manter seu WhatsApp conectado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
            <WhatsappStatusView 
                state={state}
                qrCode={qrCode}
                isLoading={isLoading}
                instanceName={instanceName}
            />
        </div>

        <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-4 border-t flex flex-row items-center justify-end gap-2">
             <div className="flex-1 text-xs text-gray-500">
                {isLoading ? "Verificando status..." : (isConnected ? "Conexão ativa" : "Aguardando conexão...")}
             </div>

             {isConnected ? (
                <Button variant="destructive" onClick={disconnect} disabled={isLoading}>
                    Desconectar
                </Button>
            ) : (
                <Button 
                    variant="default" 
                    onClick={connect} 
                    disabled={isLoading || isConnecting}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                    {isConnecting ? "Gerando QR..." : "Tentar Novamente"}
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
