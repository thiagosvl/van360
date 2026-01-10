import { WHATSAPP_STATUS } from "@/config/constants";
import { Loader2, Wifi, WifiOff } from "lucide-react";

interface WhatsappStatusViewProps {
    state: string;
    qrCode: string | null;
    isLoading: boolean;
    instanceName: string | null;
}

export function WhatsappStatusView({ state, qrCode, isLoading, instanceName }: WhatsappStatusViewProps) {
    const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
    const isConnecting = state === WHATSAPP_STATUS.CONNECTING || state === WHATSAPP_STATUS.OPEN.replace("open", "connecting") || (qrCode !== null && !isConnected);

    return (
        <div className="space-y-4">
            {/* Estado: Carregando Inicial ou Ação */}
            {isLoading && !qrCode && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-gray-500">Aguarde...</p>
                </div>
            )}

            {/* Estado: Conectado */}
            {!isLoading && isConnected && (
                <div className="flex flex-col items-center justify-center py-4 gap-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="p-3 bg-green-100 rounded-full">
                        <Wifi className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-green-900">Conectado com Sucesso</h3>
                        <p className="text-sm text-green-700">Instância: {instanceName?.replace("user_", "Motorista ")}</p>
                    </div>
                </div>
            )}

            {/* Estado: Desconectado / Erro */}
            {!isLoading && !isConnected && !isConnecting && (
                <div className="flex flex-col items-center justify-center py-4 gap-3 bg-gray-50 rounded-lg border border-dashed">
                    <div className="p-3 bg-gray-200 rounded-full">
                        <WifiOff className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="text-center px-4">
                        <h3 className="font-semibold text-gray-700">Desconectado</h3>
                        <p className="text-sm text-gray-500">Clique em conectar para gerar o QR Code.</p>
                    </div>
                </div>
            )}

            {/* Estado: QR Code (Conectando) */}
            {!isLoading && isConnecting && qrCode && (
                <div className="flex flex-col items-center justify-center py-4 gap-4">
                    <div className="bg-white p-2 rounded-lg border shadow-sm">
                        {/* Render Image Base64 */}
                        <img src={qrCode} alt="QR Code WhatsApp" className="w-[200px] h-[200px] object-contain" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium animate-pulse text-blue-600">Escaneie com seu WhatsApp...</p>
                        <p className="text-xs text-gray-500 mt-1">Aguardando conexão...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
