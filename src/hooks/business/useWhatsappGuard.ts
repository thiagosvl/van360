import { WHATSAPP_STATUS } from "@/config/constants";
import { useEffect } from "react";
import { useWhatsapp } from "../../hooks/useWhatsapp";

interface UseWhatsappGuardProps {
    isProfissional: boolean;
    onShouldOpen: () => void;
    isLoading?: boolean;
}

export function useWhatsappGuard({ isProfissional, onShouldOpen, isLoading }: UseWhatsappGuardProps) {
    const { state, isLoading: isWhatsappLoading, isFetched, isInitialLoading } = useWhatsapp();

    // Efeito para gatilho
    useEffect(() => {
        // Se ainda está carregando o perfil ou se é o carregamento INICIAL do WhatsApp, esperamos.
        // O isInitialLoading garante que não abriremos o dialog baseados no estado 'UNKNOWN' inicial.
        if (isLoading || isInitialLoading || !isFetched) return;
        if (!isProfissional) return;

        // Se checagem concluiu e status é desconectado/fechado ou conectando (precisa de QR)
        const isConnected = state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.PAIRED;
        
        // Se NÃO estiver conectado, e NÃO estiver em processo de transição (CONNECTING), deve abrir.
        if (!isConnected && state !== WHATSAPP_STATUS.CONNECTING && state !== WHATSAPP_STATUS.CONNECTING_EVO) {
            onShouldOpen();
        }

    }, [isProfissional, state, isLoading, isInitialLoading, isFetched, onShouldOpen]);
}
