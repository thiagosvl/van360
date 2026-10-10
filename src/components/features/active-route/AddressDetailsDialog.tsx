import { useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MapPin, User } from "lucide-react";
import { GoogleMapsIcon } from "@/components/icons/GoogleMapsIcon";
import { WazeIcon } from "@/components/icons/WazeIcon";
import { RouteNodeType } from "@/types/route";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { TipoResponsavel } from "@/types/enums";
import { Escola } from "@/types/escola";
import { NavigationApp } from "@/constants";
import { openExternalNavigation } from "@/utils/browser";
import { formatFirstName, formatParentesco, formatarEnderecoCompleto, formatarEnderecoParcialRota, formatShortName } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface AddressDialogData {
  open: boolean;
  title: string;
  address: string;
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
    const seenIds = new Set<string>();

    let principalObj: PassageiroResponsavel | null = null;

    if (pass.responsavel_principal && (pass.responsavel_principal.nome || pass.responsavel_principal.id)) {
      principalObj = {
        ...pass.responsavel_principal,
        id: pass.responsavel_principal.id || "resp-principal",
        responsavel_id: pass.responsavel_principal.id || pass.responsavel_principal.responsavel_id,
        tipo: TipoResponsavel.PRINCIPAL,
      };
      list.push(principalObj);
      if (principalObj.id) seenIds.add(principalObj.id);
      if (principalObj.responsavel_id) seenIds.add(principalObj.responsavel_id);
    }

    const rawList = (pass.responsaveis || []).filter((r): r is PassageiroResponsavel => Boolean(r && (r.nome || r.id)));

    for (const r of rawList) {
      const rId = r.id || r.responsavel_id;
      if (rId && seenIds.has(rId)) {
        continue;
      }

      if (rId) seenIds.add(rId);
      if (r.id) seenIds.add(r.id);
      if (r.responsavel_id) seenIds.add(r.responsavel_id);

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
  const parentescoLabel = formattedParentesco;

  const rawAddress = activeResp?.logradouro
    ? (formatarEnderecoCompleto(activeResp) || formatarEnderecoParcialRota(activeResp))
    : (allResponsaveis[0]?.logradouro ? formatarEnderecoCompleto(allResponsaveis[0]) : (addressDialogData.address !== "Sem endereço cadastrado" ? addressDialogData.address : ""));

  const hasValidAddress = Boolean(rawAddress && rawAddress.trim() && rawAddress !== "Sem endereço cadastrado");
  const activeAddress = hasValidAddress ? rawAddress : "";

  const activeTabValue = activeResp?.id || activeResp?.responsavel_id || allResponsaveis[0]?.id || "principal";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          safeCloseDialog(() => {
            onClose();
            if (allResponsaveis[0]?.id) {
              setSelectedDialogRespTab(allResponsaveis[0].id);
            }
          });
        }
      }}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Endereços do Aluno"
        subtitle="Consulte os endereços e pontos de navegação"
        icon={<MapPin className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => {
          safeCloseDialog(() => {
            onClose();
            if (allResponsaveis[0]?.id) {
              setSelectedDialogRespTab(allResponsaveis[0].id);
            }
          });
        }}
      />

      <BaseDialog.Body className="space-y-3.5 text-left pt-2 pb-4">
        <div className="flex items-center justify-start gap-2.5 py-1 text-left border-b border-[#e5e5e5] pb-3">
          <div className="w-8 h-8 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-normal text-[#737373] block leading-none mb-0.5">Aluno</span>
            <h3 className="text-sm font-semibold text-[#0a0a0a] tracking-tight">
              {formatShortName(pass?.nome || addressDialogData.title, true)}
            </h3>
          </div>
        </div>

        {allResponsaveis.length > 1 && (
          <div className="w-full min-w-0">
            <Tabs
              value={activeTabValue}
              onValueChange={setSelectedDialogRespTab}
              className="w-full min-w-0"
            >
              <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full sm:w-fit overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
                <TabsList className="bg-transparent min-h-[36px] sm:min-h-[38px] p-0 gap-1 border-0 w-max sm:w-auto flex">
                  {allResponsaveis.map((resp) => {
                    const tabId = resp.id || resp.responsavel_id || "principal";
                    const isPrincipal = resp.tipo === TipoResponsavel.PRINCIPAL;
                    const label = formatParentesco(resp.parentesco) || formatFirstName(resp.nome) || (isPrincipal ? "Responsável Principal" : "Outro Responsável");
                    return (
                      <TabsTrigger
                        key={tabId}
                        value={tabId}
                        className={cn(
                          "rounded-[18px] min-h-[30px] sm:min-h-[32px] px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                          "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                          "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
                        )}
                      >
                        <span>{label}</span>
                        {isPrincipal && <span className="text-[10px] opacity-75 font-normal">(Principal)</span>}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            </Tabs>
          </div>
        )}

        {!isPrincipalTab && activeResp && (
          <Banner
            variant="warning"
            title="Aviso de endereço alternativo:"
            description={
              <>
                Você está visualizando o endereço de <strong className="font-semibold">{formatFirstName(activeResp.nome)}</strong> ({parentescoLabel}).
              </>
            }
          />
        )}

        {!hasValidAddress ? (
          <Banner
            variant="warning"
            title="Endereço não cadastrado"
            description="Este aluno ainda não possui endereço residencial informado no cadastro."
          />
        ) : (
          <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-4 rounded-[20px] space-y-3.5 text-left">
            <div className="flex items-center justify-between gap-2 border-b border-[#e5e5e5] pb-2.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0a0a0a]" />
                <span className="text-xs uppercase font-medium text-[#737373]">
                  Endereço
                </span>
              </div>
              {activeRespFirstName && (
                <span className="text-[10px] font-normal px-2.5 py-0.5 rounded-[18px] bg-white border border-[#e5e5e5] text-[#0a0a0a]">
                  {activeRespFirstName} ({parentescoLabel})
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-normal text-[#0a0a0a] leading-relaxed break-words">
              {activeAddress}
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#e5e5e5]">
              <Button
                type="button"
                onClick={() => openNavigation(NavigationApp.GOOGLE_MAPS, activeAddress)}
                className="h-11 border-none bg-[#1A73E8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-[18px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] w-full cursor-pointer"
              >
                <GoogleMapsIcon className="w-4 h-4 shrink-0" />
                <span>Maps</span>
              </Button>
              <Button
                type="button"
                onClick={() => openNavigation(NavigationApp.WAZE, activeAddress)}
                className="h-11 border-none bg-[#33CCFF] hover:bg-[#28b6e6] text-[#000000] font-medium text-xs rounded-[18px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] w-full cursor-pointer"
              >
                <WazeIcon className="w-4 h-4 fill-current text-[#000000] shrink-0" />
                <span>Waze</span>
              </Button>
            </div>
          </div>
        )}
      </BaseDialog.Body>
    </BaseDialog>
  );
}