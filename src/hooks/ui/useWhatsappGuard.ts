import { WHATSAPP_STATUS } from "@/config/constants";
import { useEffect } from "react";
import { useLayoutSafe } from "../../contexts/LayoutContext";
import { useWhatsapp } from "../../hooks/useWhatsapp";

interface UseWhatsappGuardProps {
    isProfissional: boolean;
    onShouldOpen: () => void;
    isLoading?: boolean;
    isPixKeyDialogOpen?: boolean;
}

export function useWhatsappGuard({ isProfissional, onShouldOpen, isLoading, isPixKeyDialogOpen: isPixKeyDialogOpenProp }: UseWhatsappGuardProps) {
    const { state, isLoading: isWhatsappLoading, isFetched, isInitialLoading } = useWhatsapp();
    const layout = useLayoutSafe();
    const isPixKeyDialogOpen = isPixKeyDialogOpenProp ?? layout?.isPixKeyDialogOpen ?? false;

    useEffect(() => {
        if (isLoading || isInitialLoading || !isFetched || isPixKeyDialogOpen) return;
        if (!isProfissional) return;

        const isConnected = state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.PAIRED;
        
        if (!isConnected && state !== WHATSAPP_STATUS.CONNECTING && state !== WHATSAPP_STATUS.CONNECTING_EVO) {
            onShouldOpen();
        }

    }, [isProfissional, state, isLoading, isInitialLoading, isFetched, onShouldOpen, isPixKeyDialogOpen]);
}
