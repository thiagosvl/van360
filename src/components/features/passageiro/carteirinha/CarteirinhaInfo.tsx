import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { ContratoStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  formatDateToBR,
  formatFirstName,
  formatarEnderecoCompleto,
  formatGenero,
  formatModalidade,
  formatParentesco,
  formatPeriodo,
} from "@/utils/formatters";
import { cpfMask, phoneMask } from "@/utils/masks";
import { openBrowserLink } from "@/utils/browser";
import { useState, useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSetPrincipalResponsavel, useDeleteResponsavelAdicional } from "@/hooks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassageiroResponsavel } from "@/types/passageiro";
import {
  Bus,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  FileX2,
  GraduationCap,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Route,
  Trash2,
  User,
  Users,
  Bot,
  BotOff,
  Lock,
  Phone,
  IdCard,
  BookOpen,
  MoreHorizontal,
  Send,
  Info,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export interface CarteirinhaInfoProps {
  passageiro: Passageiro;
  temCobrancasVencidas: boolean;
  isCopiedEndereco: boolean;
  isCopiedTelefone: boolean;
  onEditClick: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
  onToggleClick: (statusAtual: boolean) => void;
  onDeleteClick: () => void;
  onToggleNotificacoesClick: () => void;
  onContractAction: () => void;
  onEnviarWhatsApp?: (passageiro: Passageiro) => void;
  contratosAtivos?: boolean;
}

/**
 * Componente interno para as ações rápidas (Ligar, WhatsApp, Menu).
 * Centralizado para evitar duplicação e garantir consistência visual.
 */
/**
 * Componente unificado para o Card Superior da Carteirinha, incluindo Avatar, Textos, Badges e Botões Flutuantes.
 */
const CarteirinhaTopCard = ({
  passageiro,
  temCobrancasVencidas,
  onToggleClick,
  onEditClick,
  onDeleteClick,
  onToggleNotificacoesClick,
  onEnviarWhatsApp,
}: Pick<
  CarteirinhaInfoProps,
  | "passageiro"
  | "temCobrancasVencidas"
  | "onToggleClick"
  | "onEditClick"
  | "onDeleteClick"
  | "onToggleNotificacoesClick"
  | "onEnviarWhatsApp"
>) => {
  const isMobile = useIsMobile();
  const statusContrato = passageiro.status_contrato?.toString().toLowerCase();
  const isPendente =
    statusContrato === ContratoStatus.PENDENTE ||
    (!!passageiro.contrato_id && !passageiro.status_contrato);

  return (
    <div className="bg-[#1a3a5c] rounded-[2rem] relative flex flex-col items-center mb-8 shadow-md">
      {/* Fundo em duas cores (20% mais escuro no topo) */}
      <div className="absolute top-0 left-0 w-full h-[25%] bg-black/15 rounded-t-[2rem] z-0" />

      {/* Conteúdo (Avatar, Textos, Badges) */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-8 pb-10">
        {/* Avatar com triplo aro igual ao design */}
        <div className="rounded-full bg-white p-[3px] shadow-sm shrink-0">
          <div className="rounded-full bg-[#132a42] p-[4px]">
            <div className="h-16 w-16 rounded-full bg-slate-200 border-[3px] border-white flex items-center justify-center">
              <User className="w-8 h-8 text-slate-400 fill-current" />
            </div>
          </div>
        </div>

        {/* Textos */}
        <div className="text-center mt-2 w-full px-2">
          <h2 className="text-xl md:text-[22px] font-bold text-white tracking-tight leading-snug">
            {passageiro.nome}
          </h2>
          {passageiro.nome_responsavel && (
            <p className="text-[13px] md:text-sm text-slate-300/90 font-medium mt-0.5">
              {passageiro.nome_responsavel}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5 pointer-events-none">
          <Badge
            className={cn(
              "border-none px-2 py-0.5 text-[9px] font-bold uppercase",
              passageiro.ativo
                ? "text-emerald-700 bg-[#d8f0e1]"
                : "text-rose-700 bg-rose-100"
            )}
          >
            {passageiro.ativo ? "Ativo" : "Inativo"}
          </Badge>
          {temCobrancasVencidas && (
            <Badge className="bg-[#eedbdf] text-[#9a3843] border-none px-2 py-0.5 text-[9px] font-bold uppercase animate-pulse">
              Possui Débitos
            </Badge>
          )}
          <Badge
            className={cn(
              "border-none px-2 py-0.5 text-[9px] font-bold uppercase",
              passageiro.enviar_notificacoes
                ? "text-emerald-700 bg-[#d8f0e1]"
                : "text-rose-700 bg-rose-100"
            )}
          >
            {passageiro.enviar_notificacoes ? "Lembretes Ativos" : "Lembretes Inativos"}
          </Badge>
        </div>
      </div>

      {/* Action Buttons (floating at the bottom) */}
      <div className="absolute -bottom-6 left-0 w-full flex justify-center gap-3 z-20">
        <Button
          size="icon"
          onClick={() => onToggleClick(!!passageiro.ativo)}
          className={cn(
            "h-12 w-12 rounded-full transition-all shadow-md hover:shadow-lg",
            passageiro.ativo
              ? "bg-[#f04f64] text-white hover:bg-rose-600"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          )}
          title={passageiro.ativo ? "Desativar Passageiro" : "Ativar Passageiro"}
        >
          {passageiro.ativo ? <PowerOff size={28} className="h-7 w-7" /> : <Power size={28} className="h-7 w-7" />}
        </Button>
        <Button
          size="icon"
          onClick={() =>
            openBrowserLink(
              `https://wa.me/55${passageiro.telefone_responsavel?.replace(/\D/g, "")}`
            )
          }
          title="Enviar mensagem no WhatsApp"
          className="h-12 w-12 rounded-full bg-[#25D366] text-white hover:bg-[#1da851] transition-all shadow-md hover:shadow-lg"
        >
          <WhatsAppIcon size={26} className="h-[26px] w-[26px]" />
        </Button>
        <Button
          size="icon"
          title="Editar"
          onClick={onEditClick}
          className="h-12 w-12 rounded-full bg-[#2c7be5] text-white hover:bg-[#1a5bba] transition-all shadow-md hover:shadow-lg"
        >
          <Pencil size={28} className="h-7 w-7" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              title="Mais opções"
              className="h-12 w-12 rounded-full bg-white text-slate-600 hover:bg-slate-100 transition-all shadow-md hover:shadow-lg"
            >
              <MoreHorizontal size={28} className="h-7 w-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-56 rounded-xl border-gray-100 shadow-xl p-1"
          >
            {isPendente && onEnviarWhatsApp && (
              <DropdownMenuItem
                onClick={() => onEnviarWhatsApp(passageiro)}
                className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-gray-700"
              >
                {isMobile ? (
                  <>
                    <WhatsAppIcon className="h-4 w-4 text-slate-400" />
                    Reenviar Contrato
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    Copiar Link para Assinatura do Contrato
                  </>
                )}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={onToggleNotificacoesClick}
              className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-gray-700"
            >
              {passageiro.enviar_notificacoes ? (
                <>
                  <BotOff className="h-4 w-4 text-slate-400" />
                  Desativar Lembretes
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 text-slate-400" />
                  Ativar Lembretes
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onDeleteClick}
              className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5 opacity-60" />
              Excluir passageiro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/**
 * Header da carteirinha: usado isoladamente na versão mobile.
 */
export const CarteirinhaHeader = (
  props: Pick<
    CarteirinhaInfoProps,
    | "passageiro"
    | "temCobrancasVencidas"
    | "onToggleClick"
    | "onEditClick"
    | "onDeleteClick"
    | "onToggleNotificacoesClick"
    | "onEnviarWhatsApp"
  >,
) => {
  return (
    <div className="px-2 pt-2">
      <CarteirinhaTopCard {...props} />
    </div>
  );
};

/**
 * Componente principal que renderiza tudo junto (usado no desktop).
 */
export const CarteirinhaInfo = (props: CarteirinhaInfoProps) => {
  return (
    <div className="space-y-6">
      <CarteirinhaTopCard
        passageiro={props.passageiro}
        temCobrancasVencidas={props.temCobrancasVencidas}
        onToggleClick={props.onToggleClick}
        onEditClick={props.onEditClick}
        onDeleteClick={props.onDeleteClick}
        onToggleNotificacoesClick={props.onToggleNotificacoesClick}
        onEnviarWhatsApp={props.onEnviarWhatsApp}
      />
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-4 md:p-6 pb-6">
        <CarteirinhaDadosPessoais
          passageiro={props.passageiro}
          isCopiedEndereco={props.isCopiedEndereco}
          isCopiedTelefone={props.isCopiedTelefone}
          onCopyToClipboard={props.onCopyToClipboard}
          onContractAction={props.onContractAction}
          contratosAtivos={props.contratosAtivos}
          onEnviarWhatsApp={props.onEnviarWhatsApp}
          onEditClick={props.onEditClick}
        />
      </div>
    </div>
  );
};

/**
 * Dados pessoais detalhados: período, modalidade, escola, veículo, nascimento,
 * gênero, contrato, início transporte, representante legal, endereço, botão editar.
 */
export const CarteirinhaDadosPessoais = ({
  passageiro,
  isCopiedEndereco,
  isCopiedTelefone,
  onCopyToClipboard,
  onContractAction,
  contratosAtivos = true,
  onEnviarWhatsApp,
  onEditClick,
}: Pick<
  CarteirinhaInfoProps,
  | "passageiro"
  | "isCopiedEndereco"
  | "isCopiedTelefone"
  | "onCopyToClipboard"
  | "onContractAction"
  | "contratosAtivos"
  | "onEnviarWhatsApp"
  | "onEditClick"
>) => {
  const setPrincipal = useSetPrincipalResponsavel();
  const deleteResponsavel = useDeleteResponsavelAdicional();
  const { openConfirmationDialog, closeConfirmationDialog, openResponsavelFormDialog } = useLayout();
  const TAB_PRINCIPAL = "principal";
  const [selectedRespId, setSelectedRespId] = useState<string>(TAB_PRINCIPAL);

  useEffect(() => {
    setSelectedRespId(TAB_PRINCIPAL);
  }, [passageiro.id]);

  const responsaveisAdicionais = passageiro.responsaveis || [];
  const hasMultiple = responsaveisAdicionais.length > 0;

  const handleAddNew = () => {
    if (responsaveisAdicionais.length >= 2) {
      toast.warning("Limite de responsáveis atingido", {
        description: "Só é permitido ter no máximo 3 responsáveis por passageiro (1 principal e 2 adicionais).",
      });
      return;
    }
    openResponsavelFormDialog({
      passageiroId: passageiro.id!,
      editingResponsavel: null,
    });
  };

  const isContractActionDisabled =
    !contratosAtivos &&
    passageiro.status_contrato !== ContratoStatus.PENDENTE &&
    passageiro.status_contrato !== ContratoStatus.ASSINADO;

  const getContratoConfig = (status?: ContratoStatus) => {
    if (status === ContratoStatus.ASSINADO) {
      return {
        title: "Contrato Assinado",
        desc: "Documento oficial assinado eletronicamente",
        color: "bg-slate-50 border-slate-200/80 hover:bg-slate-100/30 hover:border-slate-300",
        iconColor: "text-emerald-600 bg-emerald-100/50 border border-emerald-200/20 shadow-sm",
        icon: FileCheck2,
        actionLabel: "Ver Contrato",
        actionColor: "bg-white border border-[#1a3a5c] text-[#1a3a5c] hover:bg-slate-50 shadow-sm shadow-[#1a3a5c]/5",
        actionIcon: ExternalLink,
      };
    }
    if (status === ContratoStatus.PENDENTE) {
      return {
        title: "Assinatura Pendente",
        desc: "Aguardando assinatura do responsável",
        color: "bg-amber-50/40 border-amber-100/80 hover:bg-amber-50 hover:border-amber-200/50",
        iconColor: "text-amber-600 bg-amber-100/50 border border-amber-200/20 shadow-sm",
        icon: Clock,
        actionLabel: "Reenviar Contrato",
        actionColor: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-sm shadow-[#1a3a5c]/10",
        actionIcon: WhatsAppIcon,
      };
    }

    return {
      title: "Não possui contrato",
      desc: isContractActionDisabled
        ? "Você precisa ativar o uso de contratos na sua conta antes de gerar o documento."
        : "Gere o contrato para assinatura do responsável",
      color: isContractActionDisabled
        ? "bg-slate-50/30 border-slate-200/50 opacity-75 cursor-not-allowed"
        : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/30 hover:border-slate-300",
      iconColor: isContractActionDisabled
        ? "text-slate-400 bg-slate-100/80 border border-slate-200/30"
        : "text-[#1a3a5c] bg-[#1a3a5c]/5 border border-[#1a3a5c]/10 shadow-sm",
      icon: FileX2,
      actionLabel: "Gerar Contrato",
      actionColor: isContractActionDisabled
        ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300/20 font-bold"
        : "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-sm shadow-[#1a3a5c]/10",
      actionIcon: isContractActionDisabled ? Lock : Plus,
    };
  };

  const contratoConfig = getContratoConfig(passageiro.status_contrato);

  const getEnderecoFormatado = () => {
    if (!passageiro.logradouro) return "-";
    return `${passageiro.logradouro}, ${passageiro.numero || "S/N"} - ${passageiro.bairro || ""}`;
  };
  const enderecoFormatado = getEnderecoFormatado();

  const handleContratoClick = () => {
    if (isContractActionDisabled) {
      toast.warning("Ative o uso de Contratos", {
        description:
          "Para gerar novos contratos, primeiro ative a funcionalidade acessando a aba 'Contratos'.",
      });
      return;
    }

    if (passageiro.status_contrato === ContratoStatus.PENDENTE && onEnviarWhatsApp) {
      onEnviarWhatsApp(passageiro);
      return;
    }

    onContractAction();
  };

  return (
    <div className="space-y-3 transform-gpu will-change-transform">

      {/* Contrato */}
      <div
        className={cn(
          "rounded-2xl border p-4 transition-all flex flex-col gap-3 group/contrato shrink-0",
          contratoConfig.color
        )}
      >
        <div className="flex items-start gap-3 w-full overflow-hidden">
          <div className={cn("w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5", contratoConfig.iconColor)}>
            <contratoConfig.icon className="h-5 w-5 shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[#1a3a5c] mt-0.5 leading-snug break-words">
              {contratoConfig.title}
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 break-words">
              {contratoConfig.desc}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleContratoClick}
          disabled={isContractActionDisabled && passageiro.status_contrato !== ContratoStatus.PENDENTE && passageiro.status_contrato !== ContratoStatus.ASSINADO}
          className={cn(
            "flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] shrink-0",
            contratoConfig.actionColor
          )}
        >
          <contratoConfig.actionIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{contratoConfig.actionLabel}</span>
        </button>
      </div>

      {/* Responsáveis */}
      <div className="space-y-4 pt-4">
        {/* Header da seção */}
        <div className="flex items-center justify-between text-left min-h-[32px]">
          <h3 className="text-base font-bold text-[#16314f]">Responsáveis</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNew}
            className={cn(
              "h-8 rounded-xl border font-bold text-xs flex items-center gap-1.5 px-3 transition-all",
              responsaveisAdicionais.length >= 2
                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 hover:bg-slate-50 hover:text-slate-400 hover:border-slate-200"
                : "border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] shadow-sm hover:shadow"
            )}
          >
            <Plus className="w-3 h-3" /> Adicionar
          </Button>
        </div>

        <Tabs
          value={selectedRespId}
          onValueChange={setSelectedRespId}
          className="w-full"
        >
          <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1">
            <TabsTrigger
              value="principal"
              className="rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-sm"
            >
              Principal
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

        {/* Exibição dos dados do responsável selecionado */}
        {(() => {
          const isPrincipalTab = selectedRespId === TAB_PRINCIPAL;
          const currentResp = isPrincipalTab
            ? {
              id: TAB_PRINCIPAL,
              nome: passageiro.nome_responsavel,
              telefone: passageiro.telefone_responsavel,
              cpf: passageiro.cpf_responsavel,
              parentesco: passageiro.parentesco_responsavel,
              logradouro: passageiro.logradouro,
              numero: passageiro.numero,
              bairro: passageiro.bairro,
              cidade: passageiro.cidade,
              estado: passageiro.estado,
              cep: passageiro.cep,
              referencia: passageiro.referencia,
            }
            : responsaveisAdicionais.find((r) => r.id === selectedRespId);

          if (!currentResp) return null;

          const respAddress = currentResp.logradouro
            ? formatarEnderecoCompleto(currentResp)
            : null;

          const handleSetPrincipal = () => {
            const firstName = formatFirstName(currentResp.nome);
            openConfirmationDialog({
              title: "Definir como Principal",
              description: (
                <div className="space-y-5 pt-1 text-left">
                  <p className="text-slate-600 text-[13px] leading-relaxed">
                    Deseja definir <strong>{firstName}</strong> como principal responsável?
                    <span className="font-bold block mt-1">
                      As seguintes informações serão atualizadas:
                    </span>
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
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Fique tranquilo! Os dados do responsável atual não serão perdidos, ele apenas deixará de ser o contato prioritário.
                    </p>
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

          return (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-diff-shadow p-4 sm:p-5 space-y-4 animate-in fade-in duration-200 text-left w-full min-w-0">
              {/* Card Header (Name + Edit/Actions) */}
              <div className="flex items-start justify-between gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#16314f] break-words leading-tight">
                    {currentResp.nome}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {isPrincipalTab ? (
                      <Badge className="bg-blue-600/10 text-blue-600 border-none text-[9px] font-bold h-4 px-1.5 rounded-full hover:bg-blue-600/10">
                        {formatParentesco(passageiro.parentesco_responsavel) || "Parentesco não informado"}
                      </Badge>
                    ) : (
                      <Badge className="bg-[#1a3a5c]/5 text-[#1a3a5c] border-none text-[9px] font-bold h-4 px-1.5 rounded-full hover:bg-[#1a3a5c]/5">
                        {formatParentesco(currentResp.parentesco) || "Outro"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Edit and dropdown actions */}
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
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
                    className="h-8 w-8 rounded-full bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  {!isPrincipalTab && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-xl border-gray-100 shadow-xl p-1"
                      >
                        <DropdownMenuItem
                          onClick={handleSetPrincipal}
                          className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-gray-700"
                        >
                          <Check className="h-4 w-4 text-emerald-500" />
                          Definir como Principal
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          Excluir Responsável
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Info stacked list */}
              <div className="space-y-2.5 pt-1 w-full min-w-0">
                {/* WhatsApp Row */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 transition-colors hover:bg-slate-100/80 relative flex items-center justify-between gap-3 w-full min-w-0 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-slate-500"><Phone className="h-3.5 w-3.5" /></span>
                      <span className="text-xs font-normal text-slate-500">Telefone</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 leading-tight block truncate">
                      {phoneMask(currentResp.telefone)}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => {
                      const cleanPhone = currentResp.telefone!.replace(/\D/g, "");
                      const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone;
                      openBrowserLink(`https://wa.me/${formattedPhone}`);
                    }}
                    className="h-8 w-8 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-sm shrink-0 border-none flex items-center justify-center transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* CPF Row */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 transition-colors hover:bg-slate-100/80 w-full min-w-0 text-left">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-slate-500"><IdCard className="h-3.5 w-3.5" /></span>
                    <span className="text-xs font-normal text-slate-500">CPF</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight block truncate">
                    {cpfMask(currentResp.cpf) || '-'}
                  </span>
                </div>

                {/* Address Row */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 transition-colors hover:bg-slate-100/80 w-full min-w-0 text-left">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-slate-500"><MapPin className="h-3.5 w-3.5" /></span>
                    <span className="text-xs font-normal text-slate-500">Endereço</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600 leading-relaxed block break-words whitespace-pre-wrap">
                    {respAddress || '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}


      </div>

      {/* Linha: Escola (full) */}
      <div className="grid grid-cols-1 gap-3">
        <InfoTile
          label="Escola"
          value={passageiro.escola?.nome || "-"}
          icon={<GraduationCap className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Linha: Período + Turma */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Período"
          value={formatPeriodo(passageiro.periodo)}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Turma"
          value={passageiro.turma || "-"}
          icon={<BookOpen className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Linha: Modalidade + Veículo */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Modalidade"
          value={
            passageiro.modalidade
              ? formatModalidade(passageiro.modalidade)
              : "-"
          }
          icon={<Route className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Veículo"
          value={passageiro.veiculo?.placa || "-"}
          icon={<Bus className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Linha: Nascimento + Gênero */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Nascimento"
          value={
            passageiro.data_nascimento
              ? `${formatDateToBR(passageiro.data_nascimento)}`
              : "-"
          }
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Gênero"
          value={passageiro.genero ? formatGenero(passageiro.genero) : "-"}
          icon={<Users className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Linha: Início e Fim do Transporte */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Início Transporte"
          value={passageiro.data_inicio_transporte ? formatDateToBR(passageiro.data_inicio_transporte) : "-"}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Término Transporte"
          value={passageiro.data_fim_transporte ? formatDateToBR(passageiro.data_fim_transporte) : "-"}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Linha: Início e Fim da Cobrança */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Início Cobrança"
          value={passageiro.data_inicio_cobranca ? formatDateToBR(passageiro.data_inicio_cobranca) : "-"}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Término Cobrança"
          value={passageiro.data_fim_cobranca ? formatDateToBR(passageiro.data_fim_cobranca) : "-"}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Endereço */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-normal text-slate-500">
            Endereço
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            {enderecoFormatado}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopyToClipboard(enderecoFormatado, "Endereço")}
            className="h-8 w-8 rounded-xl shrink-0 hover:bg-white"
          >
            {isCopiedEndereco ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-400" />
            )}
          </Button>
        </div>
        {passageiro.referencia && (
          <div className="pt-2 mt-2 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-600 mr-1">Referência:</span>
              {passageiro.referencia}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* Componente auxiliar para tiles de informação */
const InfoTile = ({
  label,
  value,
  icon,
  fullWidth,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div
    className={cn(
      "bg-slate-50/80 rounded-2xl p-3.5 transition-colors hover:bg-slate-100/80",
      fullWidth && "col-span-2",
    )}
  >
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-slate-500">{icon}</span>
      <span className="text-xs font-normal text-slate-500">
        {label}
      </span>
    </div>
    <span className="text-sm font-bold text-[#1a3a5c] leading-tight block break-words whitespace-pre-wrap">
      {value}
    </span>
  </div>
);
