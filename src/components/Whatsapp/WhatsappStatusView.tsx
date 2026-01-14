import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WHATSAPP_STATUS } from "@/config/constants";
import { cn } from "@/lib/utils";
import { CheckCircle, Copy, Loader2, Monitor, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WhatsappStatusViewProps {
    state: string;
    qrCode: string | null;
    isLoading: boolean;
    instanceName: string | null;
    onConnect?: () => void;
    onRequestPairingCode?: () => Promise<any>;
    userPhone?: string;
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

// --- COMPONENTS ---

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
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-sm sm:text-sm font-bold text-slate-500">3</div>
                    <div className="flex flex-col gap-0.5 sm:gap-1 text-left min-w-0">
                        <p className="text-[14px] sm:text-base font-semibold text-slate-700 leading-tight">
                            <b>Aparelhos conectados</b> {">"} <b>Conectar</b>
                        </p>
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
    userPhone
}: WhatsappStatusViewProps) {
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isRequestingCode, setIsRequestingCode] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("mobile");
    const [timeLeft, setTimeLeft] = useState(60);
    const [retryCount, setRetryCount] = useState(0);

    const autoRequestAttempted = useRef(false);

    const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED;
    const isConnecting = state === WHATSAPP_STATUS.CONNECTING || state === "connecting";

    // Manual trigger listener
    useEffect(() => {
        // Do not auto-request. Only when isRequestingCode becomes true (Manual Click).
        
        // Safety checks
        // Safety checks
        if (!isRequestingCode || isConnected || !onRequestPairingCode || activeTab !== "mobile") {
             return;
        }

        // Se já tem código e ainda tem tempo, não faz nada
        if (pairingCode && timeLeft > 0) return;

        // Start Fetch
        const autoRequest = async () => {
            try {
                const data = await onRequestPairingCode();
                if (data?.pairingCode) {
                    const code = typeof data.pairingCode === 'string' 
                        ? data.pairingCode 
                        : data.pairingCode?.code;
                        
                    setPairingCode(code);
                    setTimeLeft(45);
                }
            } catch (error: any) {
                console.error("Erro ao gerar código:", error);
                toast.error("Ocorreu um erro ao gerar o código. Tente novamente.");
            } finally {
                setIsRequestingCode(false);
            }
        };
        autoRequest();
    }, [activeTab, pairingCode, isRequestingCode, isConnected, onRequestPairingCode, timeLeft]);

    // Timer logic for refreshing the code (Mobile Tab)
    useEffect(() => {
        if (pairingCode && !isConnected && activeTab === "mobile") {
             const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // TIME IS UP: Trigger Auto-Renewal Loop
                        setPairingCode(null);
                        setIsRequestingCode(true); // Loops back to autoRequest
                        return 45;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [pairingCode, isConnected, activeTab]);

    // Auto-trigger QR Code when switching to Desktop tab
    useEffect(() => {
        if (activeTab === "desktop" && !qrCode && !isLoading && !isConnected && onConnect) {
            onConnect();
        }
    }, [activeTab, qrCode, isLoading, isConnected, onConnect]);

    const copyCode = () => {
        if (pairingCode) {
            navigator.clipboard.writeText(pairingCode.replace(/-/g, ""));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        }
    };

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

    if (isLoading && !qrCode && !pairingCode && !isRequestingCode && activeTab === 'mobile') {
         return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 font-medium animate-pulse">Verificando conexão...</p>
            </div>
        );
    }

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
                        setPairingCode(null);
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
                        {/* TUTORIAL SECTION - Always Visible First */}
                        <div className="space-y-4">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 text-center">Como conectar?</h3>
                            <TutorialSteps mode="mobile" />
                        </div>

                        {/* ACTION SECTION - On Demand Generation */}
                        <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-center gap-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-blue-900">Já seguiu os passos acima?</h4>
                                <p className="text-xs text-blue-600/80 max-w-[280px] mx-auto">
                                    Ao clicar em gerar, você terá 45 segundos para digitar o código no seu WhatsApp.
                                </p>
                            </div>
                            
                            <Button 
                                onClick={() => {
                                    setRetryCount(prev => prev + 1);
                                    // Trigger code generation manually
                                    autoRequestAttempted.current = false; 
                                    setIsRequestingCode(true); // Will trigger useEffect to fetch code
                                }} 
                                className="w-full sm:w-auto rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 text-white font-bold transition-all active:scale-95"
                            >
                                Gerar Código de Conexão
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* HEADER SECTION - Code Display */}
                        <div className="space-y-4 text-center">
                            <div className="space-y-1.5 px-2">
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">Insira este código no WhatsApp</h3>
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-500">
                                        <span>Conectando ao número</span>
                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md break-all">
                                            {userPhone ? formatPhone(userPhone) : "do perfil"}
                                        </span>
                                    </div>
                            </div>

                            <div className="relative group px-1 sm:px-0">
                                {isRequestingCode && !pairingCode ? (
                                    <div className="h-[100px] sm:h-[140px] flex items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex-col gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <p className="text-xs text-slate-400 font-medium">Buscando código...</p>
                                    </div>
                                ) : (
                                    <>
                                        {pairingCode && renderCodeBoxes(pairingCode)}
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <div className="flex items-center bg-white border border-slate-100 rounded-full p-1 shadow-sm">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={copyCode} 
                                                    className={cn(
                                                        "gap-2 h-8 rounded-full px-4 text-[11px] sm:text-xs font-bold transition-all",
                                                        isCopied 
                                                            ? "text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700" 
                                                            : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50"
                                                    )}
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <CheckCircle className="h-3.5 w-3.5 animate-in zoom-in duration-300" />
                                                            Copiado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3 w-3" />
                                                            Copiar 
                                                        </>
                                                    )}
                                                </Button>
                                                <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                                                <div className="flex items-center gap-2 px-3 py-1 text-[10px] sm:text-[11px] text-slate-400 font-bold">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(4)].map((_, i) => (
                                                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${i < Math.ceil(timeLeft/15) ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    {timeLeft}s
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => {
                                                setPairingCode(null);
                                                setIsRequestingCode(true);
                                                setTimeLeft(45);
                                            }} 
                                            className="mt-6 text-red-400 hover:text-red-500 hover:bg-red-50 text-xs h-8 px-4 rounded-lg"
                                        >
                                            Cancelar / Gerar Novo
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
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
