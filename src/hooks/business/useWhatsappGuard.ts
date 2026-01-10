import { WHATSAPP_STATUS } from "@/config/constants";
import { useEffect } from "react";
import { useWhatsapp } from "../../hooks/useWhatsapp";

interface UseWhatsappGuardProps {
    isProfissional: boolean;
    onShouldOpen: () => void;
    isLoading?: boolean;
}

export function useWhatsappGuard({ isProfissional, onShouldOpen, isLoading }: UseWhatsappGuardProps) {
    const { state, isLoading: isWhatsappLoading, refresh } = useWhatsapp();

    // Efeito para verificar status ao montar
    // OBS: O useWhatsapp ja faz refresh no mount, nao precisamos duplicar.
    
    // Efeito para gatilho
    useEffect(() => {
        if (isLoading || isWhatsappLoading) return;
        if (!isProfissional) return;

        // Se checagem concluiu e status é desconectado/fechado ou conectando (precisa de QR)
        const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
        
        // Se NÃO estiver conectado, deve abrir
        // OBS: "connecting" também deve abrir, pois geralmente significa tentativa de conectar
        if (!isConnected) {
            onShouldOpen();
        }

    }, [isProfissional, state, isLoading, isWhatsappLoading, onShouldOpen]);
}
