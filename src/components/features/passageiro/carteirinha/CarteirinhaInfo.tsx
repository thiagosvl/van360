import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionItem } from "@/types/actions";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useLayout } from "@/contexts/LayoutContext";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { ContratoStatus, TipoResponsavel, ModoCobrancaEnum } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  formatGenero,
  formatModalidade,
  formatPeriodo,
  formatarEnderecoCompleto,
  formatDateToBR,
  formatMonthYearToBR,
  formatFirstName,
} from "@/utils/formatters";
import { moneyMask } from "@/utils/masks";
import { isCadastroPassageiroIncompleto } from "@/utils/domain";
import {
  Check,
  Copy,
  GraduationCap,
  MapPin,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  User,
  Bot,
  BotOff,
  MoreHorizontal,
  Wallet,
  Clock,
  BookOpen,
  DoorClosed,
  Bus,
  Calendar,
  CalendarClock,
  Users,
  Sparkles,
  Bell,
  BellOff,
} from "lucide-react";
import React from "react";

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
  const { can, isSubConta } = usePermissions();
  const canManage = can("passageiros.gerenciar");
  const statusContrato = passageiro.status_contrato?.toString().toLowerCase();
  const isPendente =
    statusContrato === ContratoStatus.PENDENTE ||
    (!!passageiro.contrato_id && !passageiro.status_contrato);

  const isIncomplete = isCadastroPassageiroIncompleto(passageiro);
  const respPrincipal =
    passageiro.responsavel_principal ||
    passageiro.responsaveis?.find((r) => r.tipo === TipoResponsavel.PRINCIPAL) ||
    passageiro.responsaveis?.[0];
  const phoneNumbersOnly = respPrincipal?.telefone?.replace(/\D/g, "");
  const isWhatsAppDisabled =
    isIncomplete ||
    !phoneNumbersOnly ||
    phoneNumbersOnly.length < 10;

  const { financeiro } = useMotoristaFinanceiroApi();
  const modoVan = financeiro?.modo_cobranca || ModoCobrancaEnum.DESATIVADO;
  const modoEfetivo = passageiro.modo_cobranca || modoVan;
  const temLembretesHabilitados =
    !passageiro.isento &&
    modoEfetivo !== ModoCobrancaEnum.DESATIVADO;
  const recebeAvisos =
    !!passageiro.ativo &&
    temLembretesHabilitados &&
    passageiro.enviar_notificacoes !== false;
  const mostrarIconeAvisos =
    !isSubConta &&
    !passageiro.isento &&
    (modoVan !== ModoCobrancaEnum.DESATIVADO || recebeAvisos);

  return (
    <div className="bg-gradient-to-br from-[#122842] via-[#1a385c] to-[#0e2137] text-white rounded-[24px] relative flex flex-col items-center mb-8 shadow-sm border border-white/10 overflow-visible">
      <div className="absolute top-0 left-0 w-full h-[35%] bg-white/5 rounded-t-[24px] pointer-events-none z-0" />
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-7 pb-9">
        <div className="rounded-full bg-white/10 p-1 shadow-sm shrink-0 backdrop-blur-xs">
          <div className="h-16 w-16 rounded-full bg-[#183659] border-2 border-white/20 flex items-center justify-center shadow-xs">
            <User className="w-8 h-8 text-white fill-current" />
          </div>
        </div>

        <div className="text-center mt-3 w-full px-2">
          <h2 className="text-xl md:text-[22px] font-bold text-white tracking-tight leading-snug break-words">
            {passageiro.nome}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pointer-events-none">
          <Badge
            className={cn(
              "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] border-none shadow-2xs",
              passageiro.ativo
                ? "text-emerald-950 bg-emerald-300"
                : "text-rose-950 bg-rose-200"
            )}
          >
            {passageiro.ativo ? "Ativo" : "Inativo"}
          </Badge>
          {mostrarIconeAvisos && (
            <Badge
              className={cn(
                "h-6 w-6 p-0 flex items-center justify-center rounded-full border shadow-2xs pointer-events-auto",
                recebeAvisos
                  ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/20 backdrop-blur-xs"
                  : "border-amber-400/40 text-amber-300 bg-amber-500/20 backdrop-blur-xs"
              )}
              title={recebeAvisos ? "Avisos de cobrança ativos" : "Avisos de cobrança desativados"}
            >
              {recebeAvisos ? (
                <Bell className="h-3.5 w-3.5" />
              ) : (
                <BellOff className="h-3.5 w-3.5" />
              )}
            </Badge>
          )}
          {!passageiro.isento && !isSubConta && temCobrancasVencidas && (
            <Badge className="bg-rose-500 text-white border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[18px] animate-pulse shadow-2xs">
              Possui Débitos
            </Badge>
          )}
        </div>
      </div>

      <div className="absolute -bottom-5 left-0 w-full flex justify-center gap-3 z-20">
        {canManage && (
          <Button
            size="icon"
            onClick={() => onToggleClick(!!passageiro.ativo)}
            className={cn(
              "h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all shadow-md active:scale-95 cursor-pointer",
              passageiro.ativo
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            )}
            title={passageiro.ativo ? "Desativar Aluno" : "Ativar Aluno"}
          >
            {passageiro.ativo ? <PowerOff size={22} className="h-5 w-5" /> : <Power size={22} className="h-5 w-5" />}
          </Button>
        )}
        {canManage && (
          <Button
            size="icon"
            title="Editar"
            onClick={onEditClick}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] transition-all shadow-md border border-[#e5e5e5] active:scale-95 cursor-pointer"
          >
            <Pencil size={20} className="h-5 w-5" />
          </Button>
        )}
        {canManage && (
          <ActionsDropdown
            align="center"
            title={passageiro.nome}
            description="Opções do aluno"
            customTrigger={
              <Button
                size="icon"
                title="Mais opções"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] transition-all shadow-md border border-[#e5e5e5] active:scale-95 cursor-pointer"
              >
                <MoreHorizontal size={20} className="h-5 w-5" />
              </Button>
            }
            actions={[
              ...(isPendente && onEnviarWhatsApp
                ? [
                    {
                      label: "Reenviar Contrato",
                      icon: <WhatsAppIcon className="h-4 w-4 text-[#737373]" />,
                      disabled: isWhatsAppDisabled,
                      onClick: () => {
                        if (isWhatsAppDisabled) return;
                        onEnviarWhatsApp(passageiro);
                      },
                    },
                  ]
                : []),
              ...(temLembretesHabilitados
                ? [
                    {
                      label: passageiro.enviar_notificacoes ? "Desativar Lembretes" : "Ativar Lembretes",
                      icon: passageiro.enviar_notificacoes ? <BotOff className="h-4 w-4 text-[#737373]" /> : <Bot className="h-4 w-4 text-[#737373]" />,
                      onClick: onToggleNotificacoesClick,
                    },
                  ]
                : []),
              {
                label: "Excluir aluno",
                icon: <Trash2 className="h-4 w-4" />,
                isDestructive: true,
                onClick: onDeleteClick,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

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
  return <CarteirinhaTopCard {...props} />;
};

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
      <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 sm:p-6 pb-6">
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

const InfoField = ({
  icon,
  label,
  value,
  fullWidth = false,
  hasBorder = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode | null;
  fullWidth?: boolean;
  hasBorder?: boolean;
}) => {
  const isInvalidOrEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" &&
      (value.trim() === "" || value.trim() === "-" || value.trim() === "—"));

  return (
    <div
      className={cn(
        "min-w-0 space-y-1 text-left",
        fullWidth && "col-span-2 sm:col-span-2",
        hasBorder && "pt-2.5 border-t border-[#e5e5e5]"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-[#737373] shrink-0">{icon}</span>}
        <span className="text-xs font-normal text-[#737373] leading-none">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words",
          isInvalidOrEmpty && "text-[#a3a3a3] font-normal"
        )}
      >
        {isInvalidOrEmpty ? "—" : value}
      </p>
    </div>
  );
};

export const CarteirinhaDadosPessoais = ({
  passageiro,
  isCopiedEndereco,
  onCopyToClipboard,
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
  const {
    openPassageiroFinanceiroDialog,
    openPassageiroEscolaDialog,
    openPassageiroTransporteDialog,
  } = useLayout();
  const { financeiro } = useMotoristaFinanceiroApi();
  const modoVan = financeiro?.modo_cobranca || ModoCobrancaEnum.DESATIVADO;
  const labelModoVan =
    modoVan === ModoCobrancaEnum.AUTOMATICA
      ? "Automática Pix"
      : modoVan === ModoCobrancaEnum.LEMBRETES
        ? "Apenas Lembretes"
        : "Desativado";
  const { can } = usePermissions();
  const canManage = can("passageiros.gerenciar");
  const canViewFinancials = can("financeiro.visualizar") || can("cobrancas.gerenciar") || can("passageiros.cobranca_visualizar") || can("passageiros.gerenciar");
  const respPrincipal =
    passageiro.responsavel_principal ||
    passageiro.responsaveis?.find((r) => r.tipo === TipoResponsavel.PRINCIPAL) ||
    passageiro.responsaveis?.[0];
  const enderecoFormatado = respPrincipal?.logradouro
    ? formatarEnderecoCompleto(respPrincipal)
    : formatarEnderecoCompleto(passageiro);
  const referenciaEmbarque = respPrincipal?.referencia || null;
  const primeiroNomeResp = formatFirstName(respPrincipal?.nome);
  const isIncomplete = isCadastroPassageiroIncompleto(passageiro);

  const valorCobrancaTexto = passageiro.isento
    ? "Isento"
    : (!isIncomplete && passageiro.valor_cobranca && Number(passageiro.valor_cobranca) > 0
      ? moneyMask(passageiro.valor_cobranca)
      : null);

  const diaVencimentoTexto = passageiro.isento
    ? "Isento"
    : (!isIncomplete && passageiro.dia_vencimento
      ? `Dia ${passageiro.dia_vencimento}`
      : null);

  const inicioCobrancaTexto =
    !isIncomplete && passageiro.data_inicio_cobranca
      ? formatMonthYearToBR(passageiro.data_inicio_cobranca)
      : null;

  const fimCobrancaTexto =
    !isIncomplete && passageiro.data_fim_cobranca
      ? formatMonthYearToBR(passageiro.data_fim_cobranca)
      : null;

  const inicioTransporteTexto = passageiro.data_inicio_transporte
    ? formatDateToBR(passageiro.data_inicio_transporte)
    : null;

  const fimTransporteTexto = passageiro.data_fim_transporte
    ? formatDateToBR(passageiro.data_fim_transporte)
    : null;

  return (
    <div className="space-y-6 text-left">
      {canViewFinancials && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Parcelas</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPassageiroFinanceiroDialog({ passageiro })}
              className="h-7 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-2.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer"
            >
              <Pencil className="h-3 w-3 text-[#737373]" />
              <span>Editar</span>
            </Button>
          </div>
          <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InfoField
                icon={<Wallet className="h-3.5 w-3.5" />}
                label="Valor da parcela"
                value={valorCobrancaTexto}
              />
              <InfoField
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Dia de vencimento"
                value={diaVencimentoTexto}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
              <InfoField
                icon={<CalendarClock className="h-3.5 w-3.5" />}
                label="Início das cobranças"
                value={inicioCobrancaTexto}
              />
              <InfoField
                icon={<CalendarClock className="h-3.5 w-3.5" />}
                label="Término das cobranças"
                value={fimCobrancaTexto}
              />
            </div>
            {!passageiro.isento && (
              <div className="pt-2.5 border-t border-[#e5e5e5]">
                <InfoField
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  label="Modelo de cobrança"
                  value={
                    passageiro.modo_cobranca === ModoCobrancaEnum.AUTOMATICA
                      ? "Automática Pix (Individual)"
                      : passageiro.modo_cobranca === ModoCobrancaEnum.LEMBRETES
                        ? "Apenas Lembretes (Individual)"
                        : passageiro.modo_cobranca === ModoCobrancaEnum.DESATIVADO
                          ? "Desativado (Individual)"
                          : `Padrão da Van (${labelModoVan})`
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Escola</h3>
          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPassageiroEscolaDialog({ passageiro })}
              className="h-7 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-2.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer"
            >
              <Pencil className="h-3 w-3 text-[#737373]" />
              <span>Editar</span>
            </Button>
          )}
        </div>
        <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
          <InfoField
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Escola"
            value={passageiro.escola?.nome}
            fullWidth
          />
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
            <InfoField
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Período"
              value={formatPeriodo(passageiro.periodo)}
            />
            <InfoField
              icon={<BookOpen className="h-3.5 w-3.5" />}
              label="Turma"
              value={passageiro.turma}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
            <InfoField
              icon={<DoorClosed className="h-3.5 w-3.5" />}
              label="Sala"
              value={passageiro.sala}
            />
            <InfoField
              icon={<User className="h-3.5 w-3.5" />}
              label="Professor(a)"
              value={passageiro.nome_professor}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Transporte</h3>
          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPassageiroTransporteDialog({ passageiro })}
              className="h-7 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-2.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer"
            >
              <Pencil className="h-3 w-3 text-[#737373]" />
              <span>Editar</span>
            </Button>
          )}
        </div>
        <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InfoField
              icon={<Bus className="h-3.5 w-3.5" />}
              label="Veículo / Placa"
              value={passageiro.veiculo?.placa}
            />
            <InfoField
              icon={<Bus className="h-3.5 w-3.5" />}
              label="Modalidade"
              value={formatModalidade(passageiro.modalidade)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
            <InfoField
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Início do transporte"
              value={inicioTransporteTexto}
            />
            <InfoField
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Término do transporte"
              value={fimTransporteTexto}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
            <InfoField
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Horário de entrada"
              value={passageiro.horario_entrada}
            />
            <InfoField
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Horário de saída"
              value={passageiro.horario_saida}
            />
          </div>
          <div className="pt-2.5 border-t border-[#e5e5e5] flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                <span className="text-xs font-normal text-[#737373]">
                  {primeiroNomeResp ? `Endereço Principal (${primeiroNomeResp})` : "Endereço completo"}
                </span>
              </div>
              <p className="text-xs text-[#0a0a0a] font-semibold leading-tight block break-words whitespace-pre-wrap">
                {enderecoFormatado || <span className="text-[#a3a3a3] font-normal">—</span>}
              </p>
              {referenciaEmbarque && (
                <p className="text-[11px] text-[#737373] font-normal leading-normal mt-1 block break-words">
                  <span className="text-[#a3a3a3]">Referência: </span>{referenciaEmbarque}
                </p>
              )}
            </div>
            {enderecoFormatado && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onCopyToClipboard(enderecoFormatado, "Endereço")}
                className="h-8 w-8 rounded-[12px] shrink-0 hover:bg-[#ffffff] border border-[#e5e5e5]"
                title="Copiar endereço"
              >
                {isCopiedEndereco ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-[#737373]" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Outros Dados</h3>
        <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InfoField
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Data de nascimento"
              value={passageiro.data_nascimento ? formatDateToBR(passageiro.data_nascimento) : null}
            />
            <InfoField
              icon={<Users className="h-3.5 w-3.5" />}
              label="Gênero"
              value={passageiro.genero ? formatGenero(passageiro.genero) : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
