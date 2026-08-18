import { useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, User, Route, School, Home } from "lucide-react";
import { GoogleMapsIcon } from "@/components/icons/GoogleMapsIcon";
import { WazeIcon } from "@/components/icons/WazeIcon";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { TipoResponsavel } from "@/types/enums";
import { Escola } from "@/types/escola";
import { NavigationApp } from "@/constants";
import { openExternalNavigation } from "@/utils/browser";
import { formatFirstName, formatParentesco, formatarEnderecoCompleto, formatarEnderecoParcialRota, formatShortName } from "@/utils/formatters";

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

  const allResponsaveis: PassageiroResponsavel[] = useMemo(() => {
    if (!pass) return [];
    const list: PassageiroResponsavel[] = [];
    const seenKeys = new Set<string>();

    let principalObj: PassageiroResponsavel | null = null;

    if (pass.responsavel_principal && (pass.responsavel_principal.nome || pass.responsavel_principal.id)) {
      principalObj = {
        ...pass.responsavel_principal,
        id: pass.responsavel_principal.id || "resp-principal",
        responsavel_id: pass.responsavel_principal.id || pass.responsavel_principal.responsavel_id,
        tipo: TipoResponsavel.PRINCIPAL,
      };
      list.push(principalObj);
      if (principalObj.id) seenKeys.add(principalObj.id);
      if (principalObj.responsavel_id) seenKeys.add(principalObj.responsavel_id);
      if (principalObj.cpf) seenKeys.add(`cpf-${principalObj.cpf.replace(/\D/g, "")}`);
      if (principalObj.telefone) seenKeys.add(`tel-${principalObj.telefone.replace(/\D/g, "")}`);
    }

    const rawList = (pass.responsaveis || []).filter((r): r is PassageiroResponsavel => Boolean(r && (r.nome || r.id)));

    for (const r of rawList) {
      const cleanCpf = r.cpf ? `cpf-${r.cpf.replace(/\D/g, "")}` : null;
      const cleanTel = r.telefone ? `tel-${r.telefone.replace(/\D/g, "")}` : null;
      const isPrincipal = r.tipo === TipoResponsavel.PRINCIPAL;

      if (
        (r.id && seenKeys.has(r.id)) ||
        (r.responsavel_id && seenKeys.has(r.responsavel_id)) ||
        (cleanCpf && seenKeys.has(cleanCpf)) ||
        (cleanTel && seenKeys.has(cleanTel)) ||
        (principalObj && isPrincipal)
      ) {
        continue;
      }

      const keyId = r.id || r.responsavel_id || `r-${r.cpf ? r.cpf.replace(/\D/g, "") : r.nome}`;
      seenKeys.add(keyId);
      if (cleanCpf) seenKeys.add(cleanCpf);
      if (cleanTel) seenKeys.add(cleanTel);
      if (r.id) seenKeys.add(r.id);
      if (r.responsavel_id) seenKeys.add(r.responsavel_id);

      list.push(r);
    }

    return list.sort((a, b) => (a.tipo === TipoResponsavel.PRINCIPAL ? -1 : b.tipo === TipoResponsavel.PRINCIPAL ? 1 : 0));
  }, [pass]);

  const activeResp = useMemo(() => {
    if (!allResponsaveis || allResponsaveis.length === 0) return null;
    return allResponsaveis.find(
      (r) => r.id === selectedDialogRespTab || r.responsavel_id === selectedDialogRespTab
    ) || allResponsaveis[0];
  }, [allResponsaveis, selectedDialogRespTab]);

  const isPrincipalTab = activeResp?.tipo === TipoResponsavel.PRINCIPAL || activeResp?.id === allResponsaveis[0]?.id;

  const activeRespFirstName = activeResp?.nome ? formatFirstName(activeResp.nome) : "";
  const rawParentesco = activeResp?.parentesco;
  const formattedParentesco = rawParentesco ? formatParentesco(rawParentesco) : "";
  const parentescoLabel = formattedParentesco || (isPrincipalTab ? "Responsável Principal" : "Responsável");

  const activeAddress = activeResp?.logradouro
    ? (formatarEnderecoCompleto(activeResp) || formatarEnderecoParcialRota(activeResp))
    : (addressDialogData.address || (allResponsaveis[0]?.logradouro ? formatarEnderecoCompleto(allResponsaveis[0]) : ""));

  const isVolta = addressDialogData.sentido === RouteSentido.VOLTANDO;
  const casaAddress = activeAddress;
  const escolaNome = addressDialogData.escolaNome;

  const saindoDe = isVolta ? escolaNome : casaAddress;
  const chegandoEm = isVolta ? casaAddress : escolaNome;

  const activeTabValue = activeResp?.id || activeResp?.responsavel_id || allResponsaveis[0]?.id || "principal";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          if (allResponsaveis[0]?.id) {
            setSelectedDialogRespTab(allResponsaveis[0].id);
          }
        }
      }}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Endereços do Passageiro"
        icon={<MapPin className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => {
          onClose();
          if (allResponsaveis[0]?.id) {
            setSelectedDialogRespTab(allResponsaveis[0].id);
          }
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

        {/* Tabs de Responsáveis (Principal e Adicionais) */}
        {allResponsaveis.length > 1 && (
          <div className="w-full min-w-0">
            <Tabs
              value={activeTabValue}
              onValueChange={setSelectedDialogRespTab}
              className="w-full min-w-0"
            >
              <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1 w-full min-w-0 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {allResponsaveis.map((resp) => {
                  const tabId = resp.id || resp.responsavel_id || "principal";
                  const isPrincipal = resp.tipo === TipoResponsavel.PRINCIPAL;
                  const label = formatParentesco(resp.parentesco) || formatFirstName(resp.nome) || (isPrincipal ? "Responsável Principal" : "Outro Responsável");
                  return (
                    <TabsTrigger
                      key={tabId}
                      value={tabId}
                      className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{label}</span>
                      {isPrincipal && <span className="text-[10px] opacity-75 font-normal">(Principal)</span>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Alerta de Atenção para Responsável Alternativo */}
        {!isPrincipalTab && activeResp && (
          <Banner
            variant="warning"
            title="Aviso de endereço alternativo:"
            description={
              <>
                Você está visualizando o endereço de <strong className="font-bold">{formatFirstName(activeResp.nome)}</strong> ({parentescoLabel}).
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