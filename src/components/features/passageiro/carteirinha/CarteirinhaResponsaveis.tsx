import { useState, useEffect, useMemo } from "react";
import { Plus, Check, MoreVertical, Pencil, Trash2, Phone, MapPin, IdCard, MessageSquare, FileText, Info, UserCheck, Users, Copy, KeyRound, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { cn } from "@/lib/utils";
import { formatFirstName, formatParentesco, formatarEnderecoCompleto, formatNomeResponsavelCompletoExibicao } from "@/utils/formatters";
import { phoneMask, cpfMask } from "@/utils/masks";
import { openBrowserLink } from "@/utils/browser";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { useSetPrincipalResponsavel, useDeleteResponsavelAdicional } from "@/hooks";
import {
  useResetPinResponsavelMutation,
  useSetPrincipalResponsavelResponsavelMutation,
  useDeleteResponsavelResponsavelMutation,
} from "@/hooks/api/useResponsavelAuthApi";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/business/usePermissions";
import { TipoResponsavel } from "@/types/enums";
import { UnifiedEmptyState } from "@/components/empty";
import { STORAGE_KEYS, BASE_DOMAIN } from "@/constants";
import { PLAY_STORE_URL } from "@/utils/detectPlatform";

export interface CarteirinhaResponsaveisProps {
  passageiro: Passageiro;
  onEditClick: () => void;
  canManageOverride?: boolean;
  hideAppAccess?: boolean;
  hideAddress?: boolean;
  hideWhatsappButton?: boolean;
  hideEditButton?: boolean;
  isResponsavelPortal?: boolean;
  onRefresh?: () => void;
}

export const CarteirinhaResponsaveis = ({
  passageiro,
  onEditClick,
  canManageOverride,
  hideAppAccess = false,
  hideAddress = false,
  hideWhatsappButton = false,
  hideEditButton = false,
  isResponsavelPortal = false,
  onRefresh,
}: CarteirinhaResponsaveisProps) => {
  const { can } = usePermissions();
  const canManage = canManageOverride !== undefined ? canManageOverride : can("passageiros.gerenciar");
  const setPrincipal = useSetPrincipalResponsavel();
  const deleteResponsavel = useDeleteResponsavelAdicional();
  const setPrincipalPortal = useSetPrincipalResponsavelResponsavelMutation();
  const deleteResponsavelPortal = useDeleteResponsavelResponsavelMutation();
  const resetPin = useResetPinResponsavelMutation();
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openResponsavelFormDialog,
    openDefinirResponsavelPrincipalDialog,
  } = useLayout();

  // Lista unificada e deduplicada de responsáveis
  const allResponsaveis: PassageiroResponsavel[] = useMemo(() => {
    const list: PassageiroResponsavel[] = [];
    const seenKeys = new Set<string>();

    let principalObj: PassageiroResponsavel | null = null;
    if (passageiro.responsavel_principal?.nome || passageiro.responsavel_principal?.id) {
      const pId = passageiro.responsavel_principal.id || passageiro.responsavel_principal.responsavel_id || "resp-principal-key";
      principalObj = {
        id: pId,
        responsavel_id: passageiro.responsavel_principal.id || passageiro.responsavel_principal.responsavel_id,
        passageiro_id: passageiro.id,
        nome: passageiro.responsavel_principal.nome || "",
        telefone: passageiro.responsavel_principal.telefone || "",
        cpf: passageiro.responsavel_principal.cpf || "",
        email: passageiro.responsavel_principal.email || undefined,
        parentesco: passageiro.responsavel_principal.parentesco,
        logradouro: passageiro.responsavel_principal.logradouro || null,
        numero: passageiro.responsavel_principal.numero || null,
        bairro: passageiro.responsavel_principal.bairro || null,
        cidade: passageiro.responsavel_principal.cidade || null,
        estado: passageiro.responsavel_principal.estado || null,
        cep: passageiro.responsavel_principal.cep || null,
        referencia: passageiro.responsavel_principal.referencia || null,
        complemento: passageiro.responsavel_principal.complemento || null,
        pin_acesso: passageiro.responsavel_principal.pin_acesso,
        tipo: TipoResponsavel.PRINCIPAL,
      };
    }

    if (principalObj) {
      list.push(principalObj);
      if (principalObj.id) seenKeys.add(principalObj.id);
      if (principalObj.responsavel_id) seenKeys.add(principalObj.responsavel_id);
      if (principalObj.cpf) seenKeys.add(`cpf-${principalObj.cpf.replace(/\D/g, "")}`);
      if (principalObj.telefone) seenKeys.add(`tel-${principalObj.telefone.replace(/\D/g, "")}`);
    }

    const rawList = (passageiro.responsaveis || []).filter((r): r is PassageiroResponsavel => Boolean(r && (r.nome || r.id)));

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
        if (principalObj && (isPrincipal || (cleanTel && cleanTel === `tel-${principalObj.telefone?.replace(/\D/g, "")}`))) {
          if (!principalObj.pin_acesso && r.pin_acesso) principalObj.pin_acesso = r.pin_acesso;
          if (!principalObj.logradouro && r.logradouro) principalObj.logradouro = r.logradouro;
          if (!principalObj.parentesco && r.parentesco) principalObj.parentesco = r.parentesco;
        }
        continue;
      }

      const keyId = r.id || r.responsavel_id || `r-${r.cpf ? r.cpf.replace(/\D/g, "") : r.nome}`;
      seenKeys.add(keyId);
      if (cleanCpf) seenKeys.add(cleanCpf);
      if (cleanTel) seenKeys.add(cleanTel);
      if (r.id) seenKeys.add(r.id);
      if (r.responsavel_id) seenKeys.add(r.responsavel_id);

      list.push({
        ...r,
        id: keyId,
        tipo: r.tipo || TipoResponsavel.ADICIONAL,
      });
    }

    return list.sort((a, b) => (a.tipo === TipoResponsavel.PRINCIPAL ? -1 : b.tipo === TipoResponsavel.PRINCIPAL ? 1 : 0));
  }, [passageiro]);

  const principalResp = useMemo(
    () => allResponsaveis.find((r) => r.tipo === TipoResponsavel.PRINCIPAL) || allResponsaveis[0],
    [allResponsaveis]
  );

  const [selectedRespId, setSelectedRespId] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    if (principalResp?.id) {
      setSelectedRespId((prev) => {
        if (prev && allResponsaveis.some((r) => r.id === prev || r.responsavel_id === prev)) {
          return prev;
        }
        return principalResp.id!;
      });
    }
  }, [passageiro.id, principalResp?.id, allResponsaveis]);

  const handleAddNew = () => {
    openResponsavelFormDialog({
      passageiroId: passageiro.id!,
      editingResponsavel: null,
      isResponsavelPortal,
      onSuccess: onRefresh,
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-5 flex flex-col gap-4 transform-gpu will-change-transform">
      <div className="flex items-center justify-between text-left min-h-[32px]">
        <h3 className="text-base font-bold text-[#16314f]">Responsáveis</h3>
        {canManage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNew}
            className={cn(
              "h-8 rounded-lg border font-bold text-xs flex items-center gap-1.5 px-3 transition-all border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] shadow-sm hover:shadow"
            )}
          >
            <Plus className="w-3 h-3" /> Adicionar
          </Button>
        )}
      </div>

      {allResponsaveis.length > 1 && (
        <Tabs value={selectedRespId || principalResp?.id} onValueChange={setSelectedRespId} className="w-full mt-2">
          <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1">
            {allResponsaveis.map((resp) => {
              const isPrincipal = resp.tipo === TipoResponsavel.PRINCIPAL;
              const label = formatParentesco(resp.parentesco) || formatFirstName(resp.nome) || (isPrincipal ? "Responsável Financeiro" : "Outro Responsável");
              return (
                <TabsTrigger
                  key={resp.id}
                  value={resp.id!}
                  className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-sm flex items-center gap-1.5"
                >
                  {label}
                  {isPrincipal && <span className="text-[10px] opacity-75 font-normal">(Principal)</span>}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {(() => {
        const currentResp = allResponsaveis.find((r) => r.id === selectedRespId) || principalResp || allResponsaveis[0];

        if (!currentResp) {
          return (
            <UnifiedEmptyState
              icon={Users}
              title="Nenhum responsável cadastrado"
              description="Complete o cadastro do passageiro ou clique em Adicionar para cadastrar o responsável principal."
              className="my-1 border-slate-200/80 bg-slate-50/50"
            />
          );
        }

        const isPrincipalTab = currentResp.tipo === TipoResponsavel.PRINCIPAL || currentResp.id === principalResp?.id;

        const respAddress = currentResp.logradouro
          ? formatarEnderecoCompleto(currentResp)
          : null;
        const respReferencia = currentResp.referencia || null;

        const respParentesco = isPrincipalTab
          ? (formatParentesco(currentResp.parentesco) || "Responsável Principal")
          : (formatParentesco(currentResp.parentesco) || "Outro Responsável");

        const handleSetPrincipal = () => {
          const targetResponsavelId = currentResp.responsavel_id || currentResp.id;
          if (!targetResponsavelId) return;

          openDefinirResponsavelPrincipalDialog({
            responsavelNome: currentResp.nome,
            passageiroNome: passageiro.nome,
            onConfirm: async () => {
              if (isResponsavelPortal) {
                const authToken = localStorage.getItem(STORAGE_KEYS.RESPONSAVEL_TOKEN) || "";
                await setPrincipalPortal.mutateAsync({
                  passageiroId: passageiro.id!,
                  responsavelId: targetResponsavelId,
                  token: authToken,
                });
              } else {
                await setPrincipal.mutateAsync({
                  passageiroId: passageiro.id!,
                  responsavelId: targetResponsavelId,
                });
              }
              if (onRefresh) onRefresh();
            },
          });
        };

        const handleDelete = () => {
          const deleteTargetId = currentResp.responsavel_id || currentResp.id;
          if (!deleteTargetId || !passageiro.id) return;

          openConfirmationDialog({
            title: "Excluir Responsável",
            description: `Tem certeza que deseja excluir o responsável "${formatFirstName(currentResp.nome)}"? Esta ação não pode ser desfeita.`,
            confirmText: "Excluir",
            cancelText: "Cancelar",
            variant: "destructive",
            onConfirm: async () => {
              if (isResponsavelPortal) {
                const authToken = localStorage.getItem(STORAGE_KEYS.RESPONSAVEL_TOKEN) || "";
                await deleteResponsavelPortal.mutateAsync({
                  passageiroId: passageiro.id!,
                  responsavelId: deleteTargetId,
                  token: authToken,
                });
              } else {
                await deleteResponsavel.mutateAsync({
                  responsavelId: deleteTargetId,
                  passageiroId: passageiro.id!,
                });
              }
              if (onRefresh) onRefresh();
              closeConfirmationDialog();
            },
          });
        };

        const handleResetPin = () => {
          const resetTargetRespId = currentResp.responsavel_id || currentResp.id;

          openConfirmationDialog({
            title: "Resetar PIN do Responsável",
            description: (
              <div className="space-y-3 pt-1 text-left">
                <p className="text-slate-600 text-xs leading-relaxed">
                  Tem certeza que deseja resetar o PIN de <strong>{formatFirstName(currentResp.nome)}</strong>?
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  O responsável precisará cadastrar um novo PIN no próximo acesso pelo aplicativo.
                </p>
              </div>
            ),
            confirmText: "Sim, resetar PIN",
            cancelText: "Cancelar",
            variant: "destructive",
            onConfirm: async () => {
              await resetPin.mutateAsync({
                passageiroId: passageiro.id!,
                responsavelId: resetTargetRespId
              });
              toast.success("PIN resetado! O responsável cadastrará um novo PIN no próximo acesso.");
              closeConfirmationDialog();
            },
          });
        };

        return (
          <div className="space-y-3 animate-in fade-in duration-200 text-left w-full min-w-0">
            {/* Header de ações fora do card */}
            <div className="flex items-center justify-between gap-3 min-w-0 px-1">
              <span className="text-xs font-semibold text-slate-500">
                {respParentesco || "Outro Responsável"}
              </span>
              {canManage && !hideEditButton && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      openResponsavelFormDialog({
                        passageiroId: passageiro.id!,
                        editingResponsavel: currentResp as PassageiroResponsavel,
                        isResponsavelPortal,
                        onSuccess: onRefresh,
                      });
                    }}
                    className="h-8 w-8 rounded-full bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                    title="Editar Responsável"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!isPrincipalTab && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-100 shadow-xl p-1">
                        <DropdownMenuItem onClick={handleSetPrincipal} className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-gray-700">
                          <Check className="h-4 w-4 text-emerald-500" /> Definir como Principal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4 text-red-500" /> Excluir Responsável
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>

            {/* Card interno com dados estruturados */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 space-y-3 text-left w-full min-w-0">
              {/* Linha 1: Nome do responsável */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-normal text-slate-500">Nome do responsável</span>
                </div>
                <span className="text-xs font-bold text-[#1a3a5c] leading-tight block break-words whitespace-pre-wrap">
                  {formatNomeResponsavelCompletoExibicao(currentResp.nome) || "—"}
                </span>
              </div>

              {/* Linha 2: Telefone */}
              <div className="pt-2.5 border-t border-slate-200/50 flex items-center justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs font-normal text-slate-500">Telefone / WhatsApp</span>
                  </div>
                  <span className="text-xs font-bold text-[#1a3a5c] leading-tight block break-words whitespace-pre-wrap">
                    {phoneMask(currentResp.telefone) || "—"}
                  </span>
                </div>
                {!hideWhatsappButton && currentResp.telefone && (
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      const cleanPhone = currentResp.telefone!.replace(/\D/g, "");
                      const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;
                      openBrowserLink(`https://wa.me/${formattedPhone}`);
                    }}
                    className="h-7 w-7 rounded-full bg-[#25D366] hover:bg-[#20b858] text-white shadow-xs shrink-0 border-none flex items-center justify-center transition-all cursor-pointer"
                    title="Abrir no WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Linha 4: CPF */}
              <div className="pt-2.5 border-t border-slate-200/50 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <IdCard className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-normal text-slate-500">CPF</span>
                </div>
                <span className="text-xs font-bold text-[#1a3a5c] leading-tight block break-words whitespace-pre-wrap">
                  {cpfMask(currentResp.cpf) || "—"}
                </span>
              </div>

              {/* Linha 5: E-mail */}
              <div className="pt-2.5 border-t border-slate-200/50 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-normal text-slate-500">E-mail</span>
                </div>
                <span className="text-xs font-bold text-[#1a3a5c] leading-tight block break-words whitespace-pre-wrap">
                  {currentResp.email || "—"}
                </span>
              </div>

              {/* Linha 5: Endereço */}
              {!hideAddress && (
                <div className="pt-2.5 border-t border-slate-200/50 min-w-0">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="text-xs font-normal text-slate-500">Endereço</span>
                      </div>
                      <p className="text-xs text-[#1a3a5c] font-semibold leading-tight block break-words whitespace-pre-wrap">
                        {respAddress || "—"}
                      </p>
                      {respReferencia && (
                        <p className="text-[11px] text-slate-500 font-normal leading-normal mt-1 block break-words">
                          <span className="text-slate-400">Referência: </span>{respReferencia}
                        </p>
                      )}
                    </div>
                    {respAddress && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyAddress(respAddress)}
                        className="h-7 w-7 rounded-xl shrink-0 hover:bg-white border border-slate-200/60"
                        title="Copiar endereço"
                      >
                        {copiedAddress === respAddress ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Linha 6: Acesso ao App */}
              {!hideAppAccess && (
                <div className="pt-2.5 border-t border-slate-200/50 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Smartphone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs font-normal text-slate-500">Acesso ao App</span>
                    </div>

                    {currentResp.telefone && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                            title="Opções de acesso"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60 rounded-xl border-gray-100 shadow-xl p-1">
                          <DropdownMenuItem
                            onClick={() => {
                              const cleanPhone = currentResp.telefone!.replace(/\D/g, "");
                              const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;
                              const respNome = formatFirstName(currentResp.nome);
                              const passNome = formatFirstName(passageiro.nome);
                              const appAndroidLink = PLAY_STORE_URL;
                              const webLoginLink = `${BASE_DOMAIN}/login`;

                              const mensagem = `Olá, ${respNome}! Você foi convidado(a) para acompanhar a rotina escolar de *${passNome}* pelo aplicativo *Van360*!\n\n📲 *Baixe o app para Android:* ${appAndroidLink}\n🌐 *Ou acesse pelo navegador:* ${webLoginLink}`;

                              openBrowserLink(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(mensagem)}`);
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-gray-700"
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                            <span>Convidar para usar o app</span>
                          </DropdownMenuItem>

                          {canManage && Boolean(currentResp.pin_acesso) && (
                            <DropdownMenuItem
                              onClick={handleResetPin}
                              className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-red-600 focus:text-red-600"
                            >
                              <KeyRound className="h-4 w-4 text-red-500" />
                              <span>Resetar PIN de Acesso</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs text-[#1a3a5c] leading-tight block break-words">
                      <span className="font-bold">Login: </span>
                      <span className="font-bold">
                        {!currentResp.telefone ? "Telefone não cadastrado" : phoneMask(currentResp.telefone)}
                      </span>
                    </div>
                    <div className="text-xs text-[#1a3a5c] leading-tight block break-words">
                      <span className="font-bold">PIN de acesso: </span>
                      <span className={currentResp.pin_acesso ? "font-normal text-slate-700" : "font-normal text-slate-500"}>
                        {currentResp.pin_acesso
                          ? "Definido pelo responsável"
                          : "Não definido (será criado no 1º acesso)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
