import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WHATSAPP_STATUS } from "@/config/constants";
import { Check, Loader2, Monitor, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WhatsappStatusViewProps {
    state: string;
    qrCode: string | null;
    isLoading: boolean;
    instanceName: string | null;
    onConnect?: () => void;
    onRequestPairingCode?: () => Promise<any>;
    userPhone?: string;
    pairingCode?: string | null;
    pairingCodeExpiresAt?: string | null;
}

const formatPhone = (phone: string) => {
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("55") && clean.length > 11) {
        clean = clean.slice(2);
    }
    if (clean.length === 11) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    if (clean.length === 10) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return phone;
};

const TutorialSteps = ({ mode }: { mode: 'mobile' | 'desktop' }) => {
    return (
        <div className="space-y-4 sm:space-y-6 bg-slate-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 overflow-hidden">
            <div className="space-y-4 sm:space-y-5">
                <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-sm sm:text-sm font-bold text-slate-500">1</div>
                    <div className="flex flex-col gap-0.5 sm:gap-1 text-left min-w-0">
                        <p className="text-[14px] sm:text-base font-semibold text-slate-700">Abra o WhatsApp no celular</p>
                        <p className="text-[12px] sm:text-sm text-slate-400">Mantenha o app atualizado</p>
                    </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-sm sm:text-sm font-bold text-slate-500">2</div>
                    <div className="flex flex-col gap-0.5 sm:gap-1 text-left min-w-0">
                        <p className="text-[14px] sm:text-base font-semibold text-slate-700 leading-tight">
                            Vá em <b>Mais opções</b> ou <b>Configurações</b>
                        </p>
                        <p className="text-[12px] sm:text-sm text-slate-400">Menu ⋮ no Android ou ⚙️ no iPhone</p>
                    </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-blue-100 bg-blue-50 flex items-center justify-center text-sm sm:text-sm font-bold text-blue-600 shadow-sm">4</div>
                    <div className="flex flex-col gap-0.5 sm:gap-1 text-left min-w-0">
                        <p className="text-[14px] sm:text-base font-semibold text-slate-700 leading-tight">
                            {mode === 'mobile' 
                                ? "Selecione 'Conectar com número'" 
                                : "Escaneie o QR Code acima"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function WhatsappStatusView({ 
    state, 
    qrCode, 
    isLoading, 
    instanceName, 
    onConnect, 
    onRequestPairingCode,
    userPhone,
    pairingCode,
    pairingCodeExpiresAt
}: WhatsappStatusViewProps) {
    const [isRequestingCode, setIsRequestingCode] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("mobile");
    const [timeLeft, setTimeLeft] = useState(0); // Inicia com 0, calculado via Effect

    const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
    const isConnecting = state === WHATSAPP_STATUS.CONNECTING || state === "connecting";

    // 1. SMART TIMER: Calcula o tempo real restante baseado na expiração do banco
    useEffect(() => {
        if (!pairingCode || !pairingCodeExpiresAt) {
            setTimeLeft(0);
            return;
        }

        const calculateTimeLeft = () => {
             const expiry = new Date(pairingCodeExpiresAt).getTime();
             const now = Date.now();
             const diff = Math.max(0, Math.ceil((expiry - now) / 1000));
             return diff;
        };

        // Set initial
        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            // AUTO-RENEWAL STRATEGY (Updated based on Manus IA):
            // A Evolution API RENOVA o Pairing Code automaticamente e envia webhook.
            // O Frontend deve ser PASSIVO e aguardar o webhook.
            // Só forçamos uma nova requisição se o ciclo parecer ter morrido (ex: 20s após expiração sem novidades).
            
            const now = Date.now();
            const expiry = pairingCodeExpiresAt ? new Date(pairingCodeExpiresAt).getTime() : 0;
            const secondsPastExpiry = (now - expiry) / 1000;

            if (secondsPastExpiry > 20 && activeTab === 'mobile' && !isRequestingCode && !isConnected) {
                // Failsafe: Se passou muito tempo e nada chegou, forçamos.
                console.log("Auto-renew failsafe triggered");
                handleAutoRenew();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [pairingCode, pairingCodeExpiresAt, activeTab, isRequestingCode, isConnected]);

    const lastRequestTime = useRef<number>(0);

    useEffect(() => {
        if (pairingCode) {
            lastRequestTime.current = 0;
        }
    }, [pairingCode]);

    useEffect(() => {
         if (!isLoading) {
             if (activeTab === 'mobile' && !pairingCode && !isRequestingCode && !isConnected && onRequestPairingCode) {
                 const now = Date.now();
                 // Cooldown de 10s para evitar loop enquanto o pairingCode (prop) não atualiza via Realtime
                 if (now - lastRequestTime.current > 10000) {
                    handleAutoRenew();
                 }
             }
         }
    }, [activeTab, pairingCode, isRequestingCode, isConnected, isLoading]);

    const handleAutoRenew = async () => {
        if (isRequestingCode || !onRequestPairingCode) return;
        
        lastRequestTime.current = Date.now();
        setIsRequestingCode(true);
        try {
            await onRequestPairingCode();
        } catch (e) {
            console.error(e);
            lastRequestTime.current = 0; // Permitir retry rápido em erro
        } finally {
            setIsRequestingCode(false);
        }
    };
    
    // ... existing copyCode logic ...

    const copyCode = () => {
        if (pairingCode) {
            navigator.clipboard.writeText(pairingCode.replace(/-/g, ""));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        }
    };
    
    // ... existing renderCodeBoxes ...

    const renderCodeBoxes = (code: string) => {
        const cleanCode = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        const chars = cleanCode.split("");
        const displayChars = chars.length === 8 ? chars : Array(8).fill("");
        
        const firstHalf = displayChars.slice(0, 4);
        const secondHalf = displayChars.slice(4, 8);

        const Box = ({ char, index }: { char: string, index: number }) => (
            <div 
                key={index}
                className="w-6 h-9 min-[360px]:w-7 min-[360px]:h-10 min-[400px]:w-8 min-[400px]:h-11 sm:w-11 sm:h-14 flex items-center justify-center border-2 border-slate-200 rounded-lg min-[360px]:rounded-xl bg-white text-sm min-[360px]:text-base min-[400px]:text-lg sm:text-2xl font-bold text-slate-800 shadow-sm transition-all group-hover:border-blue-200"
            >
                {char}
            </div>
        );

        return (
            <div className="flex items-center justify-center gap-0.5 min-[400px]:gap-1 sm:gap-3 py-3 min-[400px]:py-4 sm:py-8 bg-slate-50/50 rounded-2xl min-[360px]:rounded-[32px] border border-slate-100 px-1 sm:px-6 group overflow-hidden">
                <div className="flex gap-0.5 min-[360px]:gap-1 sm:gap-2">
                    {firstHalf.map((c, i) => <Box key={`h1-${i}`} char={c} index={i} />)}
                </div>
                <div className="text-base sm:text-xl font-light text-slate-300 mx-0.5 sm:mx-1">—</div>
                <div className="flex gap-0.5 min-[360px]:gap-1 sm:gap-2">
                    {secondHalf.map((c, i) => <Box key={`h2-${i}`} char={c} index={i} />)}
                </div>
            </div>
        );
    };

    if (isLoading && !qrCode && !pairingCode && activeTab === 'mobile') {
         return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 min-h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <div className="text-center space-y-1">
                    <p className="text-sm text-slate-500 font-medium animate-pulse">Iniciando conexão segura...</p>
                    <p className="text-xs text-slate-400">Aguarde a geração do seu código único.</p>
                </div>
            </div>
        );
    }
    
    // ... Tabs ...


    if (isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-4 bg-green-50/30 rounded-3xl border border-green-100/50 animate-in fade-in zoom-in duration-500">
                <div className="p-5 bg-white rounded-full shadow-sm border border-green-50">
                    <Wifi className="h-10 w-10 text-green-500" />
                </div>
                <div className="text-center space-y-1 px-4">
                    <h3 className="font-bold text-xl text-slate-800">WhatsApp Conectado!</h3>
                    <p className="text-sm text-green-600 font-medium">Pronto para enviar notificações.</p>
                </div>

            </div>
        );
    }

    // Só exibe "Conectando..." se NÃO estivermos no meio do processo de solicitar um código (loop)
    if (isConnecting && !pairingCode && !isRequestingCode) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <div className="text-center space-y-1">
                     <p className="text-sm font-bold text-slate-700 animate-pulse">Conectando ao WhatsApp...</p>
                     <p className="text-xs text-slate-400">Isso pode levar alguns segundos.</p>
                </div>
                 
                 <Button 
                    variant="outline" 
                    className="mt-6 border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all font-semibold rounded-xl"
                    onClick={() => {
                        // Forçar nova geração de código (Backend faz o Clean Slate)
                        setIsRequestingCode(true);
                    }}
                 >
                    Problemas? Gerar Novo Código
                 </Button>
            </div>
        );
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-8 p-1 sm:p-1.5 bg-slate-100 rounded-xl sm:rounded-2xl shrink-0">
                <TabsTrigger value="mobile" className="flex gap-1.5 sm:gap-2 py-1.5 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg sm:rounded-xl transition-all font-bold text-slate-600 text-[12px] min-[360px]:text-[13px] sm:text-sm tracking-tight">
                    <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> No Celular
                </TabsTrigger>
                <TabsTrigger value="desktop" className="flex gap-1.5 sm:gap-2 py-1.5 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg sm:rounded-xl transition-all font-bold text-slate-600 text-[12px] min-[360px]:text-[13px] sm:text-sm tracking-tight">
                    <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> PC/Tablet
                </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-0.5 -mr-0.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <TabsContent value="mobile" className="space-y-4 sm:space-y-8 pb-4 mt-0">
                {!pairingCode && !isRequestingCode ? (
                    <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* TUTORIAL SECTION */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <TutorialSteps mode="mobile" />
                            </h3>
                        </div>

                        {/* ACTION SECTION */}
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex flex-col items-center text-center gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-blue-900">Já seguiu os passos acima?</p>
                                <p className="text-xs text-blue-700/70 max-w-[240px]">Ao clicar em gerar, você terá 60 segundos para digitar o código no seu WhatsApp.</p>
                            </div>
                            <Button 
                                onClick={handleAutoRenew}
                                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            >
                                Gerar Código de Conexão
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-6 animate-in zoom-in-95 duration-500 min-h-[300px]">
                        {pairingCode ? (
                            <>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">Insira este código no WhatsApp</h3>
                                    <p className="text-sm text-slate-500">
                                        Conectando ao número <span className="font-bold text-blue-600 tracking-wide">{formatPhone(userPhone || "")}</span>
                                    </p>
                                </div>

                                <div className="relative group w-full px-4" onClick={copyCode}>
                                    {renderCodeBoxes(pairingCode)}
                                    
                                    <div className={`absolute inset-0 bg-blue-600/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 rounded-[32px] mx-4 ${isCopied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                        <div className="flex items-center gap-2 text-white font-bold">
                                            <Check className="h-5 w-5" />
                                            Copiado!
                                        </div>
                                    </div>
                                    
                                    {!isCopied && (
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Clique para copiar</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full max-w-[280px] space-y-3 pt-4">
                                    <div className="flex items-center justify-between text-xs mb-1 px-1">
                                        <span className="font-medium text-slate-500">Expira em</span>
                                        <span className={`font-mono font-bold ${timeLeft < 15 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${timeLeft < 15 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(timeLeft / 60) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 leading-relaxed px-4">
                                        {timeLeft > 0 
                                            ? "O código é renovado automaticamente pela Evolution API" 
                                            : "Aguardando renovação automática..."}
                                    </p>
                                </div>

                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleAutoRenew} 
                                    className="mt-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 text-xs h-8 px-4 rounded-lg"
                                >
                                    Gerar Novo Código
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <div className="relative">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Smartphone className="h-5 w-5 text-blue-400 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-semibold text-slate-700 animate-pulse">Solicitando código oficial...</p>
                                    <p className="text-xs text-slate-400 max-w-[200px]">Aguardando resposta da Evolution API para o número {formatPhone(userPhone || "")}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </TabsContent>

            <TabsContent value="desktop" className="space-y-6 sm:space-y-8 pb-4">
                 {qrCode ? (
                    <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col items-center justify-center gap-6">
                            <div className="bg-white p-3 sm:p-4 rounded-3xl border-4 border-slate-50 shadow-xl relative overflow-hidden group">
                                <img src={qrCode} alt="QR Code" className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] object-contain transition-transform group-hover:scale-105 duration-500" />
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center space-y-2">
                                 <p className="text-sm font-bold text-slate-700 animate-pulse">Escaneie com seu WhatsApp</p>
                                 <p className="text-[10px] sm:text-xs text-slate-400">O código será atualizado automaticamente.</p>
                            </div>
                        </div>
                        
                        <TutorialSteps mode="desktop" />
                    </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center py-12 gap-5 text-center px-4">
                         {isLoading ? (
                            <>
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-700">Gerando QR Code...</p>
                                    <p className="text-xs text-slate-400">Isso pode levar alguns segundos.</p>
                                </div>
                            </>
                         ) : (
                             <>
                                <div className="p-6 bg-slate-50 rounded-full">
                                    <WifiOff className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-700">QR Code não disponível</p>
                                    <p className="text-xs text-slate-400">Não conseguimos gerar o código no momento.</p>
                                </div>
                                <Button onClick={onConnect} variant="outline" className="mt-2 rounded-xl h-10 px-6 border-slate-200 hover:bg-slate-50 transition-all font-semibold">
                                    Tentar Novamente
                                </Button>
                             </>
                         )}
                     </div>
                 )}
            </TabsContent>
        </div>
    </Tabs>
);
}
