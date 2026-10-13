import { useState, useEffect, useMemo } from "react";
import { Plus, Check, MoreVertical, Pencil, Trash2, Phone, MapPin, IdCard, UserCheck, Users, Copy, KeyRound, Smartphone, Mail, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ActionItem } from "@/types/actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { cn } from "@/lib/utils";
import { formatFirstName, formatParentesco, formatarEnderecoCompleto, formatNomeResponsavelCompletoExibicao } from "@/utils/formatters";
import { phoneMask, cpfMask } from "@/utils/masks";
import { openBrowserLink } from "@/utils/browser";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { useSetPrincipalResponsavel, useDeleteResponsavelAdicional, useToggleNotificacoesRotaResponsavel } from "@/hooks";
import {
  useResetPinResponsavelMutation,
  useSetPrincipalResponsavelResponsavelMutation,
  useDeleteResponsavelResponsavelMutation,
} from "@/hooks/api/useResponsavelAuthApi";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/business/usePermissions";
import { TipoResponsavel } from "@/types/enums";
import { UnifiedEmptyState } from "@/components/empty";
import { STORAGE_KEYS } from "@/constants";
import { buildResponsavelAppInviteUrl } from "@/utils/whatsappTemplates";

export interface CarteirinhaResponsaveisProps {
  passageiro: Passageiro;
  onEditClick: () => void;
  canManageOverride?: boolean;
  hideAppAccess?: boolean;
  hideAddress?: boolean;
  hideWhatsappButton?: boolean;
  hideEditButton?: boolean;
  hideNotificacoesRota?: boolean;
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
  hideNotificacoesRota = false,
  isResponsavelPortal = false,
  onRefresh,
}: CarteirinhaResponsaveisProps) => {
  const { can } = usePermissions();
  const canManage = canManageOverride !== undefined ? canManageOverride : can("passageiros.gerenciar");
  const setPrincipal = useSetPrincipalResponsavel();
  const deleteResponsavel = useDeleteResponsavelAdicional();
  const toggleNotificacoesRota = useToggleNotificacoesRotaResponsavel();
  const setPrincipalPortal = useSetPrincipalResponsavelResponsavelMutation();
  const deleteResponsavelPortal = useDeleteResponsavelResponsavelMutation();
  const resetPin = useResetPinResponsavelMutation();
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openResponsavelFormDialog,
    openDefinirResponsavelPrincipalDialog,
  } = useLayout();

  // Lista unificada e deduplicada de responsáveis por ID único
  const allResponsaveis: PassageiroResponsavel[] = useMemo(() => {
    const list: PassageiroResponsavel[] = [];
    const seenIds = new Set<string>();

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
        notificacoes_rota_habilitadas: passageiro.responsavel_principal.notificacoes_rota_habilitadas !== false,
      };
      list.push(principalObj);
      if (principalObj.id) seenIds.add(principalObj.id);
      if (principalObj.responsavel_id) seenIds.add(principalObj.responsavel_id);
    }

    const rawList = (passageiro.responsaveis || []).filter((r): r is PassageiroResponsavel => Boolean(r && (r.nome || r.id)));

    for (const r of rawList) {
      const rId = r.id || r.responsavel_id;
      if (rId && seenIds.has(rId)) {
        if (principalObj && (r.id === principalObj.id || r.responsavel_id === principalObj.responsavel_id)) {
          if (!principalObj.pin_acesso && r.pin_acesso) principalObj.pin_acesso = r.pin_acesso;
          if (!principalObj.logradouro && r.logradouro) principalObj.logradouro = r.logradouro;
          if (!principalObj.parentesco && r.parentesco) principalObj.parentesco = r.parentesco;
          if (r.notificacoes_rota_habilitadas !== undefined) {
            principalObj.notificacoes_rota_habilitadas = r.notificacoes_rota_habilitadas !== false;
          }
        }
        continue;
      }

      if (rId) seenIds.add(rId);
      if (r.id) seenIds.add(r.id);
      if (r.responsavel_id) seenIds.add(r.responsavel_id);

      list.push({
        ...r,
        id: rId || r.id,
        tipo: r.tipo || (list.length === 0 ? TipoResponsavel.PRINCIPAL : TipoResponsavel.ADICIONAL),
        notificacoes_rota_habilitadas: r.notificacoes_rota_habilitadas !== false,
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
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 flex flex-col gap-4 transform-gpu will-change-transform">
      <div className="flex items-center justify-between text-left min-h-[32px]">
        <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Responsáveis</h3>
        {!isResponsavelPortal && canManage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNew}
            className="h-8 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-3.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#0a0a0a]" /> Adicionar
          </Button>
        )}
      </div>

      {allResponsaveis.length > 1 && (
        <Tabs value={selectedRespId || principalResp?.id} onValueChange={setSelectedRespId} className="w-full">
          <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full sm:w-fit overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
            <TabsList className="bg-transparent min-h-[36px] sm:min-h-[38px] p-0 gap-1 border-0 w-max sm:w-auto flex">
              {allResponsaveis.map((resp) => {
                const isPrincipal = resp.tipo === TipoResponsavel.PRINCIPAL;
                const label = formatParentesco(resp.parentesco) || formatFirstName(resp.nome) || "Responsável";
                return (
                  <TabsTrigger
                    key={resp.id}
                    value={resp.id!}
                    className={cn(
                      "rounded-[18px] min-h-[32px] sm:min-h-[34px] px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                      "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                      "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
                    )}
                  >
                    <span>{label}</span>
                    {isPrincipal && (
                      <span className="text-[10px] opacity-75 font-normal">
                        (Principal)
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </Tabs>
      )}

      {(() => {
        const currentResp = allResponsaveis.find((r) => r.id === selectedRespId) || principalResp || allResponsaveis[0];

        if (!currentResp) {
          return (
            <UnifiedEmptyState
              icon={Users}
              title="Nenhum responsável cadastrado"
              description="Complete o cadastro do aluno ou clique em Adicionar para cadastrar o responsável principal."
              className="my-1 border-[#e5e5e5] bg-[#f5f5f5]"
            />
          );
        }

        const isPrincipalTab = currentResp.tipo === TipoResponsavel.PRINCIPAL || currentResp.id === principalResp?.id;

        const isOwnProfile = Boolean(
          passageiro.responsavel_logado_id &&
          (currentResp.id === passageiro.responsavel_logado_id || currentResp.responsavel_id === passageiro.responsavel_logado_id)
        );

        const canEditCurrent = isResponsavelPortal ? isOwnProfile : (canManage && !hideEditButton);
        const canShowDropdown = !isResponsavelPortal && canManage;

        const respAddress = currentResp.logradouro
          ? formatarEnderecoCompleto(currentResp)
          : null;
        const respReferencia = currentResp.referencia || null;

        const respParentesco = formatParentesco(currentResp.parentesco) || formatFirstName(currentResp.nome) || (isPrincipalTab ? "Responsável Principal" : "Responsável");

        const handleSetPrincipal = () => {
          const targetResponsavelId = currentResp.responsavel_id || currentResp.id;
          if (!targetResponsavelId) return;

          if (!currentResp.logradouro || currentResp.logradouro.trim() === "") {
            toast.error("Para definir este responsável como principal, é necessário cadastrar um endereço para ele primeiro.");
            return;
          }

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
            },
          });
        };

        const handleToggleNotificacoesRota = () => {
          const targetRespId = currentResp.responsavel_id || currentResp.id;
          if (!targetRespId || !passageiro.id) return;
          const isAtivo = currentResp.notificacoes_rota_habilitadas !== false;

          openConfirmationDialog({
            title: isAtivo ? "Desativar notificações de rota?" : "Ativar notificações de rota?",
            description: isAtivo
              ? `Deseja desativar o envio de notificações de rota para ${formatFirstName(currentResp.nome)}? Ele(a) deixará de receber avisos de embarque, desembarque e van a caminho.`
              : `Deseja ativar o envio de notificações de rota para ${formatFirstName(currentResp.nome)}? Ele(a) passará a receber avisos de embarque, desembarque e van a caminho.`,
            confirmText: isAtivo ? "Desativar" : "Ativar",
            cancelText: "Cancelar",
            variant: isAtivo ? "destructive" : "default",
            onConfirm: async () => {
              await toggleNotificacoesRota.mutateAsync({
                passageiroId: passageiro.id!,
                responsavelId: targetRespId,
                status: !isAtivo,
              });
              closeConfirmationDialog();
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
              closeConfirmationDialog();
            },
          });
        };

        const handleResetPin = () => {
          const resetTargetRespId = currentResp.responsavel_id || currentResp.id;
          if (!resetTargetRespId) return;

          openConfirmationDialog({
            title: "Resetar Senha de Acesso",
            description: `Deseja realmente resetar a senha de acesso do(a) ${formatFirstName(currentResp.nome)}? No próximo login com o número ${phoneMask(currentResp.telefone)}, será solicitado o cadastro de uma nova senha de 4 dígitos.`,
            confirmText: "Sim, Resetar",
            cancelText: "Cancelar",
            variant: "destructive",
            onConfirm: async () => {
              await resetPin.mutateAsync({
                passageiroId: passageiro.id!,
                responsavelId: resetTargetRespId
              });
              toast.success("Senha resetada! O responsável cadastrará uma nova senha no próximo acesso.");
              closeConfirmationDialog();
            },
          });
        };

        return (
          <div className="space-y-3 animate-in fade-in duration-200 text-left w-full min-w-0">
            {/* Header de ações fora do card */}
            <div className="flex items-center justify-between gap-3 min-w-0 px-1">
              <span className="text-xs font-semibold text-[#737373]">
                {respParentesco || "Outro Responsável"}
              </span>
              {(canEditCurrent || canShowDropdown) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {canEditCurrent && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openResponsavelFormDialog({
                          passageiroId: passageiro.id!,
                          editingResponsavel: currentResp as PassageiroResponsavel,
                          isResponsavelPortal,
                          onSuccess: onRefresh,
                        });
                      }}
                      className="h-7 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-2.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer"
                    >
                      <Pencil className="h-3 w-3 text-[#737373]" />
                      <span>Editar</span>
                    </Button>
                  )}
                  {canShowDropdown && (
                    <ActionsDropdown
                      align="end"
                      title={currentResp.nome}
                      description="Opções do responsável"
                      triggerClassName="h-7 w-7 rounded-[12px] bg-white text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center transition-colors cursor-pointer"
                      actions={[
                        ...(!isPrincipalTab
                          ? [
                            {
                              label: "Definir como Principal",
                              icon: <Check className="h-4 w-4 text-[#737373]" />,
                              onClick: handleSetPrincipal,
                            },
                          ]
                          : []),
                        ...(!hideNotificacoesRota
                          ? [
                            {
                              label:
                                currentResp.notificacoes_rota_habilitadas !== false
                                  ? "Desativar Notificações de Rota"
                                  : "Ativar Notificações de Rota",
                              description: "Alertas de embarque e desembarque",
                              icon:
                                currentResp.notificacoes_rota_habilitadas !== false ? (
                                  <BellOff className="h-4 w-4 text-[#737373]" />
                                ) : (
                                  <Bell className="h-4 w-4 text-[#737373]" />
                                ),
                              onClick: handleToggleNotificacoesRota,
                            },
                          ]
                          : []),
                        ...(!isPrincipalTab
                          ? [
                            {
                              label: "Excluir Responsável",
                              icon: <Trash2 className="h-4 w-4 text-[#e7000b]" />,
                              isDestructive: true,
                              onClick: handleDelete,
                            },
                          ]
                          : []),
                      ]}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3 text-left w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                    <span className="text-xs font-normal text-[#737373] leading-none">Nome do responsável</span>
                  </div>
                  <p className={cn(
                    "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words",
                    !currentResp.nome && "text-[#a3a3a3] font-normal"
                  )}>
                    {formatNomeResponsavelCompletoExibicao(currentResp.nome) || "—"}
                  </p>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                    <span className="text-xs font-normal text-[#737373] leading-none">Telefone / WhatsApp</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words",
                      !currentResp.telefone && "text-[#a3a3a3] font-normal"
                    )}>
                      {phoneMask(currentResp.telefone) || "—"}
                    </p>
                    {!hideWhatsappButton && currentResp.telefone && (
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => {
                          const cleanPhone = currentResp.telefone!.replace(/\D/g, "");
                          const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;
                          openBrowserLink(`https://wa.me/${formattedPhone}`);
                        }}
                        className="h-6 w-6 rounded-[8px] bg-[#25D366] hover:bg-[#20b858] text-white shadow-2xs shrink-0 border-none flex items-center justify-center transition-all cursor-pointer"
                        title="Abrir no WhatsApp"
                      >
                        <WhatsAppIcon className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                    <span className="text-xs font-normal text-[#737373] leading-none">CPF</span>
                  </div>
                  <p className={cn(
                    "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words",
                    !currentResp.cpf && "text-[#a3a3a3] font-normal"
                  )}>
                    {cpfMask(currentResp.cpf) || "—"}
                  </p>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                    <span className="text-xs font-normal text-[#737373] leading-none">E-mail</span>
                  </div>
                  <p className={cn(
                    "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words",
                    !currentResp.email && "text-[#a3a3a3] font-normal"
                  )}>
                    {currentResp.email || "—"}
                  </p>
                </div>
              </div>

              {!hideAddress && (
                <div className="pt-2.5 border-t border-[#e5e5e5] min-w-0">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                        <span className="text-xs font-normal text-[#737373] leading-none">Endereço</span>
                      </div>
                      <p className={cn(
                        "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words whitespace-pre-wrap",
                        !respAddress && "text-[#a3a3a3] font-normal"
                      )}>
                        {respAddress || "—"}
                      </p>
                      {respReferencia && (
                        <p className="text-[11px] text-[#737373] font-normal leading-normal mt-1 block break-words">
                          <span className="text-[#a3a3a3]">Referência: </span>{respReferencia}
                        </p>
                      )}
                    </div>
                    {!isResponsavelPortal && respAddress && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyAddress(respAddress)}
                        className="h-7 w-7 rounded-[10px] shrink-0 hover:bg-white border border-[#e5e5e5]"
                        title="Copiar endereço"
                      >
                        {copiedAddress === respAddress ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#737373]" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {(!hideNotificacoesRota || !hideAppAccess) && (
                <div className={cn(
                  "pt-2.5 border-t border-[#e5e5e5]",
                  !hideNotificacoesRota && !hideAppAccess
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-0"
                    : "block"
                )}>
                  {!hideNotificacoesRota && (
                    <div className={cn(
                      "min-w-0 space-y-1.5",
                      !hideAppAccess && "sm:pr-4"
                    )}>
                      <div className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                        <span className="text-xs font-normal text-[#737373] leading-none">Notificações de Rota</span>
                      </div>
                      <div className="flex items-center">
                        {currentResp.notificacoes_rota_habilitadas !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium bg-emerald-500/[0.08] text-emerald-700 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Ativas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            Inativas
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {!hideAppAccess && (
                    <div className={cn(
                      "min-w-0 space-y-1",
                      !hideNotificacoesRota && "border-t sm:border-t-0 sm:border-l border-[#e5e5e5] pt-2.5 sm:pt-0 sm:pl-4"
                    )}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                          <span className="text-xs font-normal text-[#737373] leading-none">Acesso ao App</span>
                        </div>

                        {currentResp.telefone && (
                          <ActionsDropdown
                            align="end"
                            title="Acesso ao Aplicativo"
                            description={currentResp.nome}
                            triggerClassName="h-6 w-6 rounded-[8px] bg-white text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center transition-colors cursor-pointer"
                            actions={[
                              {
                                label: "Convidar para usar o app",
                                description: "Enviar link de convite por WhatsApp",
                                icon: <WhatsAppIcon className="h-4 w-4" />,
                                onClick: () => {
                                  const url = buildResponsavelAppInviteUrl({
                                    telefoneResponsavel: currentResp.telefone || "",
                                    nomeResponsavel: currentResp.nome,
                                    nomePassageiro: passageiro.nome,
                                  });
                                  openBrowserLink(url);
                                },
                              },
                              ...(canManage && Boolean(currentResp.pin_acesso)
                                ? [
                                  {
                                    label: "Resetar Senha de Acesso",
                                    description: "Redefinir PIN de acesso do responsável",
                                    icon: <KeyRound className="h-4 w-4 text-[#e7000b]" />,
                                    isDestructive: true,
                                    onClick: handleResetPin,
                                  },
                                ]
                                : []),
                            ]}
                          />
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words">
                        Login: {!currentResp.telefone ? "Não cadastrado" : phoneMask(currentResp.telefone)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
