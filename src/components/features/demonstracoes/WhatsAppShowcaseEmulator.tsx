import { useState, useRef, useEffect } from "react";
import { BellRing, Receipt, FileText, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppMessageContainer, WhatsAppActionButton } from "@/components/ui/WhatsAppMessageContainer";
import { cn } from "@/lib/utils";

export type ShowcaseTabType = "cobranca" | "recibo" | "contrato";

export interface WhatsAppShowcaseEmulatorProps {
  initialTab?: ShowcaseTabType;
  driverName?: string;
  passageiroNome?: string;
  logoUrl?: string | null;
  userChavePix?: string | null;
  layoutMode?: "grid_on_desktop" | "tabs";
  className?: string;
}

const TABS: { id: ShowcaseTabType; label: string; icon: typeof BellRing }[] = [
  { id: "cobranca", label: "Cobrança Automática", icon: BellRing },
  { id: "recibo", label: "Recibos", icon: Receipt },
  { id: "contrato", label: "Contratos", icon: FileText },
];

interface CobrancaContentProps {
  driverName: string;
  studentFirstName: string;
  pixMode: "com_pix" | "sem_pix";
  onPixModeChange: (mode: "com_pix" | "sem_pix") => void;
}

function CobrancaShowcaseContent({
  driverName,
  studentFirstName,
  pixMode,
  onPixModeChange,
}: CobrancaContentProps) {
  return (
    <div className="w-full flex flex-col items-center sm:items-start xl:items-center animate-in fade-in duration-200">
      <WhatsAppMessageContainer
        driverName={driverName}
        time="16:22"
        actionButton={
          pixMode === "com_pix" ? (
            <WhatsAppActionButton
              label="Copiar código Pix"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="w-[18px] h-[18px] stroke-[#00a884] fill-none stroke-[1.6]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              }
            />
          ) : undefined
        }
      >
        <p>
          Olá Thiago, a parcela do transporte escolar de {studentFirstName} no valor de R$ 140,00 vence HOJE.
        </p>
        <p>
          Por favor, efetue o pagamento para manter o transporte em dia.
        </p>
        <p className="italic text-[#54656f] text-[11px] min-[360px]:text-[12px] leading-[15px] min-[360px]:leading-[16px]">
          Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.
        </p>
      </WhatsAppMessageContainer>

      <Tabs
        value={pixMode}
        onValueChange={(val) => onPixModeChange(val as "com_pix" | "sem_pix")}
        className="w-full max-w-[260px] min-[360px]:max-w-[280px] xl:max-w-[300px] mt-2.5 mx-auto sm:mx-0 xl:mx-auto"
      >
        <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 h-auto gap-1 border-0">
          <TabsTrigger
            value="com_pix"
            className="text-[11.5px] min-[360px]:text-xs font-medium py-1 px-2.5 rounded-lg transition-all text-slate-500 hover:text-slate-700 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 data-[state=active]:font-semibold data-[state=active]:shadow-none border border-transparent data-[state=active]:border-slate-200/70 cursor-pointer"
          >
            Com Chave Pix
          </TabsTrigger>
          <TabsTrigger
            value="sem_pix"
            className="text-[11.5px] min-[360px]:text-xs font-medium py-1 px-2.5 rounded-lg transition-all text-slate-500 hover:text-slate-700 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 data-[state=active]:font-semibold data-[state=active]:shadow-none border border-transparent data-[state=active]:border-slate-200/70 cursor-pointer"
          >
            Sem Chave Pix
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

interface ReciboContentProps {
  driverName: string;
  studentFirstName: string;
  logoUrl?: string | null;
}

function ReciboShowcaseContent({
  driverName,
  studentFirstName,
  logoUrl,
}: ReciboContentProps) {
  return (
    <div className="w-full flex flex-col items-center sm:items-start xl:items-center animate-in fade-in duration-200">
      <div className="w-full max-w-[310px] xl:max-w-[320px] mx-auto sm:mx-0 xl:mx-auto relative rounded-[24px] bg-[#efeae2] p-2.5 min-[360px]:p-3 border border-slate-200/90 shadow-inner overflow-hidden flex flex-col items-start min-h-[350px] xl:min-h-[440px] justify-start">
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/whatsapp-wallpaper.png')",
          }}
        />

        <div
          className="relative w-full max-w-[258px] xl:max-w-[276px] bg-white rounded-r-[7.5px] rounded-b-[7.5px] rounded-tl-none p-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21] ml-1.5"
          style={{
            fontFamily:
              "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <svg
            viewBox="0 0 8 13"
            height="13"
            width="8"
            className="absolute -left-2 top-0 pointer-events-none drop-shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
          >
            <path
              opacity="0.13"
              fill="#000000"
              d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
            />
            <path
              fill="#ffffff"
              d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"
            />
          </svg>

          <div className="w-full bg-[#f8fafc] rounded-[8px] p-2.5 sm:p-3 border border-slate-100 shadow-xs text-slate-800 flex flex-col min-h-[295px]">
            <div className="flex items-start justify-between pb-1">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Seu Logo"
                  className="max-h-8 max-w-[90px] object-contain rounded"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center shadow-2xs">
                  <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none">
                    Seu
                  </span>
                  <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none mt-0.5">
                    Logo
                  </span>
                </div>
              )}
              <span className="text-[6.5px] font-mono text-[#94a3b8] mt-1">
                ID: fe178c09
              </span>
            </div>

            <div className="mt-2">
              <h3 className="text-[11.5px] font-bold text-[#0f172a] tracking-tight leading-tight">
                Recibo de Pagamento
              </h3>
              <div className="mt-1.5">
                <p className="text-[7.5px] font-bold text-[#334155] leading-tight">
                  {driverName} • Transporte Escolar
                </p>
                <p className="text-[7px] text-[#64748b] leading-tight mt-0.5">
                  Prestação de Serviços de Transporte Escolar
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#f1f5f9] py-1.5 px-2.5 rounded-xl text-center mt-2.5 mb-2.5 shadow-2xs">
              <span className="text-[6.5px] font-semibold text-[#64748b] uppercase tracking-wider block">
                VALOR PAGO
              </span>
              <span className="text-[17px] font-bold text-[#1e293b] block my-0.5 leading-tight tracking-tight">
                R$ 140,00
              </span>
              <span className="text-[6.5px] text-[#94a3b8] font-medium block leading-none">
                PIX
              </span>
            </div>

            <div className="space-y-0.5 text-[7.5px] mt-1 mb-1">
              <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] shrink-0 font-normal">Pagador</span>
                <span className="font-semibold text-[#1e293b] text-right truncate ml-1.5">Thiago Silva</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] shrink-0 font-normal">Aluno</span>
                <span className="font-semibold text-[#1e293b] text-right truncate ml-1.5">{studentFirstName}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] shrink-0 font-normal">Data</span>
                <span className="font-semibold text-[#1e293b] text-right ml-1.5">22/09/2026</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] shrink-0 font-normal">Referência</span>
                <span className="font-semibold text-[#1e293b] text-right ml-1.5 whitespace-nowrap">Parcela de Setembro</span>
              </div>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between text-[6px] text-[#94a3b8]">
              <span>Recibo digital via Van360.</span>
              <img
                src="/assets/logo-van360.webp"
                alt="Van360"
                className="h-2.5 object-contain opacity-40"
              />
            </div>
          </div>

          <div className="px-1.5 pt-1.5 pb-0.5 flex items-end justify-between gap-1.5 text-[#111b21]">
            <span className="text-[10px] font-normal leading-tight truncate text-[#111b21]">
              Recibo de Set/26 - {studentFirstName}
            </span>
            <span className="shrink-0 text-[9px] text-[#667781] select-none ml-auto">
              16:37
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ContratoContentProps {
  driverName: string;
  studentFirstName: string;
}

function ContratoShowcaseContent({
  driverName,
  studentFirstName,
}: ContratoContentProps) {
  return (
    <div className="w-full flex flex-col items-center sm:items-start xl:items-center animate-in fade-in duration-200">
      <WhatsAppMessageContainer
        driverName={driverName}
        time="16:50"
        actionButton={
          <WhatsAppActionButton
            label="Assinar Contrato"
            icon={
              <ExternalLink className="w-[18px] h-[18px] stroke-[#00a884] stroke-[1.6]" />
            }
          />
        }
      >
        <p>
          Olá Mariana, o contrato de prestação de serviços de transporte escolar de {studentFirstName} já está pronto para assinatura digital.
        </p>
        <p>
          A assinatura é rápida, feita pelo celular e garante a vaga e a segurança do transporte.
        </p>
      </WhatsAppMessageContainer>
    </div>
  );
}

export function WhatsAppShowcaseEmulator({
  initialTab = "cobranca",
  driverName = "Tio Thiago",
  passageiroNome = "Bianca",
  logoUrl,
  userChavePix,
  className,
  layoutMode = "grid_on_desktop",
}: WhatsAppShowcaseEmulatorProps) {
  const [activeTab, setActiveTab] = useState<ShowcaseTabType>(initialTab);
  const [pixMode, setPixMode] = useState<"com_pix" | "sem_pix">("com_pix");
  const tabsListRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const studentFirstName = passageiroNome.trim().split(" ")[0] || "Bianca";
  const currentIndex = TABS.findIndex((t) => t.id === activeTab);

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    setActiveTab(TABS[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % TABS.length;
    setActiveTab(TABS[nextIndex].id);
  };

  useEffect(() => {
    if (!tabsListRef.current) return;
    const activeEl = tabsListRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    if (touchStartY.current === null || touchEndY.current === null) return;

    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current - touchEndY.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const isGridDesktop = layoutMode === "grid_on_desktop";

  return (
    <div className={cn("w-full flex flex-col items-center sm:items-start xl:items-center", className)}>
      {isGridDesktop && (
        <div className="hidden xl:grid xl:grid-cols-3 gap-6 w-full items-start">
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-3 self-center">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#008069] flex items-center justify-center border border-emerald-100/80 shadow-2xs">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-[#1a3a5c] text-[14.5px] tracking-tight">
                Cobrança Automática
              </h4>
            </div>
            <CobrancaShowcaseContent
              driverName={driverName}
              studentFirstName={studentFirstName}
              pixMode={pixMode}
              onPixModeChange={setPixMode}
            />
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-3 self-center">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#008069] flex items-center justify-center border border-emerald-100/80 shadow-2xs">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-[#1a3a5c] text-[14.5px] tracking-tight">
                Recibos
              </h4>
            </div>
            <ReciboShowcaseContent
              driverName={driverName}
              studentFirstName={studentFirstName}
              logoUrl={logoUrl}
            />
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-3 self-center">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#008069] flex items-center justify-center border border-emerald-100/80 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-[#1a3a5c] text-[14.5px] tracking-tight">
                Contratos
              </h4>
            </div>
            <ContratoShowcaseContent
              driverName={driverName}
              studentFirstName={studentFirstName}
            />
          </div>
        </div>
      )}

      <div className={cn("w-full flex flex-col items-center sm:items-start xl:items-center", isGridDesktop && "xl:hidden")}>
        <div className="w-full mb-3">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as ShowcaseTabType)}
            className="w-full"
          >
            <TabsList
              ref={tabsListRef}
              className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1 w-full min-w-0 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    data-tab-id={tab.id}
                    className="rounded-full border border-slate-200/90 bg-white text-slate-600 px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-[#008069] data-[state=active]:text-white data-[state=active]:border-[#008069] transition-all shadow-2xs flex items-center gap-1.5 shrink-0 select-none cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div
          className="w-full flex flex-col items-center sm:items-start xl:items-center touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {activeTab === "cobranca" && (
            <CobrancaShowcaseContent
              driverName={driverName}
              studentFirstName={studentFirstName}
              pixMode={pixMode}
              onPixModeChange={setPixMode}
            />
          )}

          {activeTab === "recibo" && (
            <ReciboShowcaseContent
              driverName={driverName}
              studentFirstName={studentFirstName}
              logoUrl={logoUrl}
            />
          )}

          {activeTab === "contrato" && (
            <ContratoShowcaseContent
              driverName={driverName}
              studentFirstName={studentFirstName}
            />
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3.5 w-full max-w-[310px] xl:max-w-[320px] mx-auto sm:mx-0 xl:mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-label={`Ir para ${tab.label}`}
              className={cn(
                "h-1.5 rounded-full transition-all cursor-pointer",
                activeTab === tab.id ? "w-6 bg-[#008069]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
