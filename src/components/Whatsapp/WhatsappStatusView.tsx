import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WHATSAPP_STATUS } from "@/config/constants";
import { Copy, Loader2, Monitor, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WhatsappStatusViewProps {
    state: string;
    qrCode: string | null;
    isLoading: boolean;
    instanceName: string | null;
    onConnect?: () => void;
    onRequestPairingCode?: (phone: string) => Promise<any>;
}

export function WhatsappStatusView({ 
    state, 
    qrCode, 
    isLoading, 
    instanceName, 
    onConnect, 
    onRequestPairingCode 
}: WhatsappStatusViewProps) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isRequestingCode, setIsRequestingCode] = useState(false);
    const [activeTab, setActiveTab] = useState("mobile"); // Controlled Tab State

    const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
    const isConnecting = (state === WHATSAPP_STATUS.CONNECTING || state === WHATSAPP_STATUS.OPEN.replace("open", "connecting") || (qrCode !== null && !isConnected));

    // Auto-trigger QR Code when switching to Desktop tab
    useEffect(() => {
        if (activeTab === "desktop" && !qrCode && !isLoading && !isConnected && onConnect) {
            onConnect();
        }
    }, [activeTab, qrCode, isLoading, isConnected, onConnect]);

    const handleRequestCode = async () => {
        if (!phoneNumber) return toast.error("Digite o número do celular");
        if (!onRequestPairingCode) return;

        setIsRequestingCode(true);
        setPairingCode(null);
        try {
            const data = await onRequestPairingCode(phoneNumber);
            if (data?.pairingCode) {
                setPairingCode(data.pairingCode);
                toast.success("Código gerado! Digite no seu WhatsApp.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsRequestingCode(false);
        }
    };

    const copyCode = () => {
        if (pairingCode) {
            navigator.clipboard.writeText(pairingCode);
            toast.success("Código copiado!");
        }
    };

    // --- RENDERIZADO ---

    if (isLoading && !qrCode && !pairingCode && !isRequestingCode && activeTab === 'mobile') {
         // Only full block loading if we are NOT in desktop tab waiting for QR
         // If we are in desktop, the tab content handles the loading state UI
         return (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-500">Verificando status...</p>
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-6 gap-3 bg-green-50 rounded-xl border border-green-100">
                <div className="p-4 bg-white rounded-full shadow-sm">
                    <Wifi className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-lg text-green-900">Conectado!</h3>
                    <p className="text-sm text-green-700">Instância ativa: {instanceName?.replace("user_", "Driver ")}</p>
                </div>
            </div>
        );
    }

    // Se estiver desconectado ou conectando, mostramos as opções (Abas)
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="mobile" className="flex gap-2">
                    <Smartphone className="h-4 w-4" /> No Celular
                </TabsTrigger>
                <TabsTrigger value="desktop" className="flex gap-2">
                    <Monitor className="h-4 w-4" /> PC/Tablet
                </TabsTrigger>
            </TabsList>

            {/* ABA MOBILE (CÓDIGO) */}
            <TabsContent value="mobile" className="space-y-4">
                {!pairingCode ? (
                    <div className="flex flex-col gap-4 py-2">
                        <div className="space-y-2 text-center">
                            <h4 className="font-semibold text-gray-900">Conectar com Código</h4>
                            <p className="text-xs text-gray-500">
                                Digite seu número com DDD para receber o código de pareamento.
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Ex: 11999998888" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="text-center text-lg tracking-widest"
                                maxLength={15}
                            />
                        </div>
                        
                        <Button 
                            onClick={handleRequestCode} 
                            disabled={isRequestingCode || !phoneNumber}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isRequestingCode ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                            {isRequestingCode ? "Gerando..." : "Gerar Código"}
                        </Button>

                        <div className="text-xs text-gray-400 text-center px-4">
                            No seu WhatsApp vá em: <br/> 
                            <b>Dispositivos Conectados {">"} Conectar {">"} Conectar com número</b>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in">
                        <p className="text-sm font-medium text-gray-600">Digite este código no seu WhatsApp:</p>
                        
                        <div className="flex items-center justify-center gap-3 w-full">
                            <div className="text-3xl font-mono font-bold tracking-[0.2em] text-blue-600 bg-blue-50 px-6 py-3 rounded-xl border border-blue-100 shadow-sm">
                                {pairingCode?.toUpperCase()}
                            </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={copyCode} className="gap-2">
                            <Copy className="h-4 w-4" /> Copiar Código
                        </Button>

                        <Button variant="ghost" size="sm" onClick={() => setPairingCode(null)} className="text-xs text-gray-400 mt-2">
                            Tentar outro número
                        </Button>
                    </div>
                )}
            </TabsContent>

            {/* ABA DESKTOP (QR CODE) */}
            <TabsContent value="desktop" className="space-y-4">
                 {qrCode ? (
                    <div className="flex flex-col items-center justify-center py-2 gap-4">
                        <div className="bg-white p-2 rounded-lg border shadow-sm relative">
                            <img src={qrCode} alt="QR Code" className="w-[200px] h-[200px] object-contain opacity-90" />
                            {/* Overlay de carregando se for refresh */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 animate-pulse">Escaneie com a câmera do WhatsApp</p>
                    </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                         {/* Se estiver carregando (mas sem QR ainda), mostra loader */}
                         {isLoading ? (
                            <>
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                                <p className="text-sm text-gray-500">Gerando QR Code...</p>
                            </>
                         ) : (
                             <>
                                <div className="p-4 bg-gray-100 rounded-full">
                                    <WifiOff className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">QR Code não disponível</p>
                                    <p className="text-xs text-gray-500">Tentando gerar automaticamente...</p>
                                </div>
                                <Button onClick={onConnect} variant="outline" size="sm" className="mt-2">
                                    Tentar Novamente
                                </Button>
                             </>
                         )}
                     </div>
                 )}
            </TabsContent>
        </Tabs>
    );
}
