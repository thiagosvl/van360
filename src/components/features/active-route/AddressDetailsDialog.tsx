import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, User, AlertTriangle, Route, School, Home } from "lucide-react";
import { GoogleMapsIcon } from "@/components/icons/GoogleMapsIcon";
import { WazeIcon } from "@/components/icons/WazeIcon";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { Escola } from "@/types/escola";
import { NavigationApp } from "@/constants";
import { openExternalNavigation } from "@/utils/browser";
import { formatFirstName, formatParentesco, formatarEnderecoCompleto, formatarEnderecoParcialRota, formatShortName } from "@/utils/formatters";

const TAB_PRINCIPAL = "principal";

export interface AddressDialogData {
  open: boolean;
  title: string;
  address: string;
  latitude?: number;
  longitude?: number;
  sentido?: string | null;
  escolaNome?: string | null;
  tipoNo?: RouteNodeType | null;
  passageiro?: Passageiro | null;
  escola?: Escola | null;
}

interface AddressDetailsDialogProps {
  addressDialogData: AddressDialogData;
  onClose: () => void;
  selectedDialogRespTab: string;
  setSelectedDialogRespTab: (tab: string) => void;
}

export function AddressDetailsDialog({
  addressDialogData,
  onClose,
  selectedDialogRespTab,
  setSelectedDialogRespTab,
}: AddressDetailsDialogProps) {
  const isOpen = addressDialogData.open && addressDialogData.tipoNo === RouteNodeType.PASSAGEIRO;

  const openNavigation = (app: NavigationApp, address: string, lat?: number, lng?: number) => {
    openExternalNavigation(app, address, lat, lng);
  };

  const pass = addressDialogData.passageiro;
  const isPrincipal = selectedDialogRespTab === TAB_PRINCIPAL;
  const respObj = !isPrincipal ? pass?.responsaveis?.find((r: any) => r.id === selectedDialogRespTab) : null;

  let activeRespName = isPrincipal ? pass?.responsavel_principal?.nome : respObj?.nome;
  let rawParentesco = isPrincipal ? pass?.responsavel_principal?.parentesco : respObj?.parentesco;
  let activeAddress = addressDialogData.address;

  if (pass) {
    if (isPrincipal) {
      const respP = pass.responsavel_principal;
      activeAddress = respP?.logradouro ? (formatarEnderecoCompleto(respP) || formatarEnderecoParcialRota(respP)) : addressDialogData.address;
    } else if (respObj) {
      activeAddress = respObj.logradouro
        ? (formatarEnderecoCompleto(respObj) || formatarEnderecoParcialRota(respObj))
        : (pass.responsavel_principal?.logradouro ? formatarEnderecoCompleto(pass.responsavel_principal) : addressDialogData.address);
    }
  }

  const activeRespFirstName = activeRespName ? formatFirstName(activeRespName) : "";
  const formattedParentesco = rawParentesco ? formatParentesco(rawParentesco) : "";
  const parentescoLabel = (formattedParentesco && formattedParentesco.trim().length > 0)
    ? formattedParentesco
    : (isPrincipal ? "Financeiro" : "Responsável");

  const isVolta = addressDialogData.sentido === RouteSentido.VOLTANDO;
  const casaAddress = activeAddress;
  const escolaNome = addressDialogData.escolaNome;

  const saindoDe = isVolta ? escolaNome : casaAddress;
  const chegandoEm = isVolta ? casaAddress : escolaNome;

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setSelectedDialogRespTab(TAB_PRINCIPAL);
        }
      }}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Endereços do Passageiro"
        icon={<MapPin className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => {
          onClose();
          setSelectedDialogRespTab(TAB_PRINCIPAL);
        }}
      />

      <BaseDialog.Body className="space-y-3.5 text-left pt-2 pb-4">
        {/* Nome e Avatar Inline do Passageiro */}
        <div className="flex items-center justify-start gap-2.5 py-1 text-left border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-full bg-[#1a3a5c]/5 border border-[#1a3a5c]/10 flex items-center justify-center text-[#1a3a5c] shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block leading-none mb-0.5">Passageiro</span>
            <h3 className="text-sm font-bold text-[#1a3a5c] tracking-tight">
              {formatShortName(pass?.nome || addressDialogData.title, true)}
            </h3>
          </div>
        </div>

        {/* Tabs de Responsáveis Adicionais */}
        {pass?.responsaveis && pass.responsaveis.length > 0 && (
          <div className="w-full min-w-0">
            <Tabs value={selectedDialogRespTab} onValueChange={setSelectedDialogRespTab} className="w-full min-w-0">
              <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1 w-full min-w-0 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <TabsTrigger
                  value={TAB_PRINCIPAL}
                  className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Responsável Financeiro
                </TabsTrigger>
                {pass.responsaveis.map((resp: any) => (
                  <TabsTrigger
                    key={resp.id}
                    value={resp.id!}
                    className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {formatParentesco(resp.parentesco) || formatFirstName(resp.nome)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Alerta de Atenção para Responsável Alternativo */}
        {!isPrincipal && respObj && (
          <Banner
            variant="warning"
            title="Aviso de endereço alternativo:"
            description={
              <>
                Você está visualizando o endereço de <strong className="font-bold">{formatFirstName(respObj.nome)}</strong> ({parentescoLabel}).
              </>
            }
          />
        )}

        {/* Card de Endereço Ativo (Com Waze e Google Maps) */}
        <div className="bg-slate-50/80 border border-slate-100/80 p-4 rounded-2xl space-y-3.5 text-left">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1a3a5c]" />
              <span className="text-xs uppercase font-semibold text-slate-500">
                Endereço
              </span>
            </div>
            {activeRespFirstName && (
              <span className="text-[10px] font-normal tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                {activeRespFirstName} ({parentescoLabel})
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-normal text-[#1a3a5c] leading-relaxed break-words">
            {activeAddress || <span className="text-slate-400 font-normal">—</span>}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
            <Button
              type="button"
              onClick={() => openNavigation(NavigationApp.GOOGLE_MAPS, activeAddress)}
              className="h-11 border-none bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] w-full cursor-pointer"
            >
              <GoogleMapsIcon className="w-4 h-4 shrink-0" />
              <span>Maps</span>
            </Button>
            <Button
              type="button"
              onClick={() => openNavigation(NavigationApp.WAZE, activeAddress)}
              className="h-11 border-none bg-[#33CCFF] hover:bg-[#28b6e6] text-[#000000] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] w-full cursor-pointer"
            >
              <WazeIcon className="w-4 h-4 fill-current text-[#000000] shrink-0" />
              <span>Waze</span>
            </Button>
          </div>
        </div>

        {/* Trajeto da Rota */}
        <div className="bg-slate-50/80 border border-slate-100/80 p-4 rounded-2xl space-y-3.5 text-left">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Route className="w-4 h-4 text-[#1a3a5c]" />
              <span className="text-xs font-bold uppercase text-slate-500">
                Trajeto da rota
              </span>
            </div>
            <span className="text-[10px] font-normal tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {isVolta ? "Voltando" : "Indo"}
            </span>
          </div>

          <div className="relative pl-1 space-y-4 pt-1 text-xs">
            <div className="flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-[#1a3a5c] shadow-xs z-10">
                {isVolta ? <School className="w-4 h-4" /> : <Home className="w-4 h-4" />}
              </div>
              <div className="absolute left-[13px] top-7 bottom-[-16px] w-[2px] bg-slate-300 border-l border-dashed border-slate-300" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-500 block">
                  Ponto de partida
                </span>
                <p className="text-xs sm:text-sm font-normal text-[#1a3a5c] leading-relaxed break-words">
                  {saindoDe || <span className="text-slate-400 font-normal">—</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-[#1a3a5c] shadow-xs z-10">
                {isVolta ? <Home className="w-4 h-4" /> : <School className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-500 block">
                  Destino final
                </span>
                <p className="text-xs sm:text-sm font-normal text-[#1a3a5c] leading-relaxed break-words">
                  {chegandoEm || <span className="text-slate-400 font-normal">—</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}