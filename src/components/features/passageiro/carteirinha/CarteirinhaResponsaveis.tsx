import { useState, useEffect } from "react";
import { Plus, Check, MoreVertical, Pencil, Trash2, Phone, MapPin, IdCard, MessageSquare, FileText, Info, UserCheck, Users, Copy, KeyRound, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { formatFirstName, formatParentesco, formatarEnderecoCompleto, isResponsavelMockTelefone, formatNomeResponsavelCompletoExibicao } from "@/utils/formatters";
import { phoneMask, cpfMask } from "@/utils/masks";
import { openBrowserLink } from "@/utils/browser";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { useSetPrincipalResponsavel, useDeleteResponsavelAdicional } from "@/hooks";
import { useResetPinResponsavelMutation } from "@/hooks/api/useResponsavelAuthApi";
import { isCadastroPassageiroIncompleto, isResponsavelIncompleto } from "@/utils/domain";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/business/usePermissions";

export interface CarteirinhaResponsaveisProps {
  passageiro: Passageiro;
  onEditClick: () => void;
}

export const CarteirinhaResponsaveis = ({ passageiro, onEditClick }: CarteirinhaResponsaveisProps) => {
  const { can } = usePermissions();
  const canManage = can("passageiros.gerenciar");
  const setPrincipal = useSetPrincipalResponsavel();
  const deleteResponsavel = useDeleteResponsavelAdicional();
  const resetPin = useResetPinResponsavelMutation();
  const { openConfirmationDialog, closeConfirmationDialog, openResponsavelFormDialog } = useLayout();
  const TAB_PRINCIPAL = "principal";
  const [selectedRespId, setSelectedRespId] = useState<string>(TAB_PRINCIPAL);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    setSelectedRespId(TAB_PRINCIPAL);
  }, [passageiro.id]);

  const responsaveisAdicionais = passageiro.responsaveis || [];
  const hasMultiple = responsaveisAdicionais.length > 0;

  const handleAddNew = () => {
    openResponsavelFormDialog({
      passageiroId: passageiro.id!,
      editingResponsavel: null,
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

      {hasMultiple && (
        <Tabs value={selectedRespId} onValueChange={setSelectedRespId} className="w-full mt-4">
          <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1">
            <TabsTrigger
              value="principal"
              className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-sm"
            >
              Responsável Financeiro
            </TabsTrigger>
            {responsaveisAdicionais.map((resp) => (
              <TabsTrigger
                key={resp.id}
                value={resp.id!}
                className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-sm"
              >
                {formatParentesco(resp.parentesco) || formatFirstName(resp.nome)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {(() => {
        const isPrincipalTab = selectedRespId === TAB_PRINCIPAL;
        const currentResp = isPrincipalTab
          ? {
            id: TAB_PRINCIPAL,
            nome: passageiro.nome_responsavel,
            telefone: passageiro.telefone_responsavel,
            cpf: passageiro.cpf_responsavel,
            email: passageiro.email_responsavel,
            parentesco: passageiro.parentesco_responsavel,
            pin_acesso: passageiro.pin_acesso,
            logradouro: passageiro.logradouro,
            numero: passageiro.numero,
            bairro: passageiro.bairro,
            cidade: passageiro.cidade,
            estado: passageiro.estado,
            cep: passageiro.cep,
            referencia: passageiro.referencia,
            complemento: passageiro.complemento,
          }
          : responsaveisAdicionais.find((r) => r.id === selectedRespId);

        if (!currentResp) return null;

        const respAddress = currentResp.logradouro ? formatarEnderecoCompleto(currentResp) : null;
        const respParentesco = isPrincipalTab
          ? formatParentesco(passageiro.parentesco_responsavel)
          : formatParentesco(currentResp.parentesco);

        const handleSetPrincipal = () => {
          if (isCadastroPassageiroIncompleto(passageiro)) {
            toast.error("Complete o cadastro do passageiro antes de alterar o responsável principal.");
            return;
          }

          if (isResponsavelIncompleto(currentResp.nome, currentResp.telefone)) {
            toast.error("Dados do responsável incompletos.", {
              description: "Preencha o nome e o telefone deste responsável antes de defini-lo como principal.",
            });
            return;
          }

          const firstName = formatFirstName(currentResp.nome);
          openConfirmationDialog({
            title: "Definir como Principal",
            description: (
              <div className="space-y-5 pt-1 text-left">
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  Deseja definir <strong>{firstName}</strong> como principal responsável?
                  <span className="font-bold block mt-1">As seguintes informações serão atualizadas:</span>
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-100/10">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800">Notificações WhatsApp</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Lembretes de pagamento e avisos de rota serão enviados apenas para este contato.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-100/10">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800">Contratos e Documentos</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Futuros contratos e documentos gerados utilizarão os dados deste novo responsável.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c] shrink-0 shadow-sm border border-[#1a3a5c]/5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800">Endereço Principal do Passageiro</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Por padrão, será utilizado o endereço deste responsável para rotas.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/40 text-left">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">Fique tranquilo! Os dados do responsável atual não serão perdidos, ele apenas deixará de ser o contato prioritário.</p>
                </div>
              </div>
            ),
            confirmText: "Sim, definir",
            cancelText: "Cancelar",
            variant: "default",
            onConfirm: async () => {
              await setPrincipal.mutateAsync({
                passageiroId: passageiro.id!,
                responsavelId: currentResp.id!,
              });
              setSelectedRespId(TAB_PRINCIPAL);
              closeConfirmationDialog();
            },
          });
        };

        const handleDelete = () => {
          openConfirmationDialog({
            title: "Excluir Responsável",
            description: `Tem certeza que deseja excluir o responsável "${formatFirstName(currentResp.nome)}"? Esta ação não pode ser desfeita.`,
            confirmText: "Excluir",
            cancelText: "Cancelar",
            variant: "destructive",
            onConfirm: async () => {
              await deleteResponsavel.mutateAsync({
                responsavelId: currentResp.id!,
                passageiroId: passageiro.id!,
              });
              setSelectedRespId(TAB_PRINCIPAL);
              closeConfirmationDialog();
            },
          });
        };
        const handleResetPin = () => {
          openConfirmationDialog({
            title: "Resetar PIN do Responsável",
            description: (
              <div className="space-y-3 pt-1 text-left">
                <p className="text-slate-600 text-xs leading-relaxed">
                  Tem certeza que deseja resetar o PIN de <strong>{formatFirstName(currentResp.nome)}</strong>?
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
                  💡 <strong>Como orientar o responsável:</strong><br />
                  Basta ele acessar o app novamente com o telefone (<strong>{phoneMask(currentResp.telefone)}</strong>) para cadastrar um novo PIN de 4 dígitos.
                </div>
              </div>
            ),
            confirmText: "Resetar PIN",
            cancelText: "Cancelar",
            variant: "destructive",
            onConfirm: async () => {
              await resetPin.mutateAsync({
                passageiroId: passageiro.id!,
                responsavelId: isPrincipalTab ? undefined : currentResp.id,
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
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (isPrincipalTab) {
                        onEditClick();
                      } else {
                        openResponsavelFormDialog({
                          passageiroId: passageiro.id!,
                          editingResponsavel: currentResp as PassageiroResponsavel,
                        });
                      }
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
                    {isResponsavelMockTelefone(currentResp.telefone) ? "—" : (phoneMask(currentResp.telefone) || "—")}
                  </span>
                </div>
                {!isResponsavelMockTelefone(currentResp.telefone) && currentResp.telefone && (
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      const cleanPhone = currentResp.telefone!.replace(/\D/g, "");
                      const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;
                      openBrowserLink(`https://wa.me/${formattedPhone}`);
                    }}
                    className="h-7 w-7 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs shrink-0 border-none flex items-center justify-center transition-all cursor-pointer"
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
              <div className="pt-2.5 border-t border-slate-200/50 space-y-2.5 min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs font-normal text-slate-500">Endereço</span>
                    </div>
                    <p className="text-xs text-[#1a3a5c] font-semibold leading-tight block break-words whitespace-pre-wrap">
                      {respAddress || "—"}
                    </p>
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

                <div className="pt-2 border-t border-slate-200/40 space-y-1">
                  <span className="text-xs font-medium text-slate-500 block">Ponto de referência</span>
                  <p className="text-xs text-[#1a3a5c] font-semibold leading-tight block break-words whitespace-pre-wrap">
                    {currentResp.referencia || <span className="text-slate-400 font-normal">—</span>}
                  </p>
                </div>

                {/* Linha 6: Acesso ao App */}
                <div className="pt-2.5 border-t border-slate-200/50 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Smartphone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs font-semibold text-[#1a3a5c]">Acesso ao App</span>
                    </div>

                    {!isResponsavelMockTelefone(currentResp.telefone) && currentResp.telefone && (
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
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-100 shadow-xl p-1">
                          <DropdownMenuItem
                            onClick={() => {
                              const cleanPhone = currentResp.telefone!.replace(/\D/g, "");
                              const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;
                              const respNome = formatFirstName(currentResp.nome);
                              const passNome = formatFirstName(passageiro.nome);
                              const mensagem = `Olá, ${respNome}! Acesse a carteirinha digital do(a) ${passNome} no Van360 pelo link: https://van360.com.br/login. No seu primeiro acesso, informe o seu telefone (${phoneMask(currentResp.telefone)}) e crie a sua senha PIN de 4 dígitos.`;
                              openBrowserLink(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(mensagem)}`);
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-gray-700"
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                            <span>{currentResp.pin_acesso ? "Reenviar Instruções WhatsApp" : "Enviar Convite WhatsApp"}</span>
                          </DropdownMenuItem>

                          {canManage && currentResp.pin_acesso && (
                            <DropdownMenuItem
                              onClick={handleResetPin}
                              className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer"
                            >
                              <KeyRound className="h-4 w-4" />
                              <span>Resetar PIN de Acesso</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Telefone para Login (WhatsApp):</span>
                    <span className="text-xs font-bold text-[#1a3a5c] leading-tight block break-words">
                      {isResponsavelMockTelefone(currentResp.telefone) || !currentResp.telefone
                        ? "Telefone não cadastrado"
                        : phoneMask(currentResp.telefone)}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="w-full block py-1.5 px-3 rounded-lg text-[11px] font-normal bg-slate-100/70 text-slate-600 border border-slate-200/60 leading-tight">
                      {currentResp.pin_acesso ? (
                        <span>O responsável <strong className="font-semibold text-slate-700">já acessou</strong> o app.</span>
                      ) : (
                        <span>O responsável <strong className="font-semibold text-slate-700">ainda não acessou</strong> o app.</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
