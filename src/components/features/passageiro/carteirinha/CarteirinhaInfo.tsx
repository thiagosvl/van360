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
import { usePermissions } from "@/hooks/business/usePermissions";
import { ContratoStatus, TipoResponsavel } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  formatGenero,
  formatModalidade,
  formatPeriodo,
  formatarEnderecoCompleto,
  formatDateToBR,
  formatMonthYearToBR,
  formatParentesco,
  formatFirstName,
} from "@/utils/formatters";
import { cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { isCadastroPassageiroIncompleto } from "@/utils/domain";
import { openBrowserLink } from "@/utils/browser";
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
  UserCheck,
  Bot,
  BotOff,
  MoreHorizontal,
  Wallet,
  Clock,
  BookOpen,
  Bus,
  Calendar,
  CalendarClock,
  Users,
  Phone,
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

  return (
    <div className="bg-[#1a3a5c] rounded-[2rem] relative flex flex-col items-center mb-8 shadow-md">
      <div className="absolute top-0 left-0 w-full h-[25%] bg-black/15 rounded-t-[2rem] z-0" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-8 pb-10">
        <div className="rounded-full bg-white p-[3px] shadow-sm shrink-0">
          <div className="rounded-full bg-[#132a42] p-[4px]">
            <div className="h-16 w-16 rounded-full bg-slate-200 border-[3px] border-white flex items-center justify-center">
              <User className="w-8 h-8 text-slate-400 fill-current" />
            </div>
          </div>
        </div>

        <div className="text-center mt-2 w-full px-2">
          <h2 className="text-xl md:text-[22px] font-bold text-white tracking-tight leading-snug">
            {passageiro.nome}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5 pointer-events-none">
          <Badge
            className={cn(
              "border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              passageiro.ativo
                ? "text-emerald-700 bg-[#d8f0e1]"
                : "text-rose-700 bg-rose-100"
            )}
          >
            {passageiro.ativo ? "Ativo" : "Inativo"}
          </Badge>
          {!passageiro.isento && (
            <>
              {!isSubConta && temCobrancasVencidas && (
                <Badge className="bg-[#eedbdf] text-[#9a3843] border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                  Possui Débitos
                </Badge>
              )}
              {!isSubConta && (
                <Badge
                  className={cn(
                    "border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    passageiro.enviar_notificacoes
                      ? "text-emerald-700 bg-[#d8f0e1]"
                      : "text-rose-700 bg-rose-100"
                  )}
                >
                  {passageiro.enviar_notificacoes ? "Lembretes Ativos" : "Lembretes Inativos"}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      <div className="absolute -bottom-6 left-0 w-full flex justify-center gap-3 z-20">
        {canManage && (
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
        )}
        <Button
          size="icon"
          disabled={isWhatsAppDisabled}
          onClick={() => {
            if (isWhatsAppDisabled) return;
            const formattedPhone = phoneNumbersOnly.startsWith("55") ? phoneNumbersOnly : `55${phoneNumbersOnly}`;
            openBrowserLink(
              `https://wa.me/${formattedPhone}`
            );
          }}
          title={isWhatsAppDisabled ? undefined : "Enviar mensagem no WhatsApp"}
          className={cn(
            "h-12 w-12 rounded-full transition-all shadow-md hover:shadow-lg",
            isWhatsAppDisabled
              ? "bg-slate-300 text-slate-400 cursor-not-allowed opacity-40 shadow-none hover:bg-slate-300 pointer-events-none"
              : "bg-[#25D366] text-white hover:bg-[#20b858]"
          )}
        >
          <WhatsAppIcon size={26} className="h-[26px] w-[26px]" />
        </Button>
        {canManage && (
          <Button
            size="icon"
            title="Editar"
            onClick={onEditClick}
            className="h-12 w-12 rounded-full bg-[#2c7be5] text-white hover:bg-[#1a5bba] transition-all shadow-md hover:shadow-lg"
          >
            <Pencil size={28} className="h-7 w-7" />
          </Button>
        )}
        {canManage && (
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
                  disabled={isWhatsAppDisabled}
                  onClick={() => {
                    if (isWhatsAppDisabled) return;
                    onEnviarWhatsApp(passageiro);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg font-medium",
                    isWhatsAppDisabled
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : "cursor-pointer text-gray-700"
                  )}
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
        )}
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
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-xs p-4 md:p-6 pb-6">
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
 * Item de informação padronizado no estilo CarteirinhaResponsaveis
 */
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
        hasBorder && "pt-2.5 border-t border-slate-200/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className="text-xs font-medium text-slate-500 leading-none">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-xs sm:text-sm font-bold text-[#1a3a5c] leading-tight break-words",
          isInvalidOrEmpty && "text-slate-400 font-normal"
        )}
      >
        {isInvalidOrEmpty ? "—" : value}
      </p>
    </div>
  );
};

/**
 * Dados pessoais detalhados: 100% alinhados ao estilo visual de CarteirinhaResponsaveis.
 */
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
  const { can } = usePermissions();
  const canViewFinancials = can("financeiro.visualizar") || can("cobrancas.gerenciar") || can("passageiros.cobranca_visualizar") || can("passageiros.gerenciar");
  const respPrincipal =
    passageiro.responsavel_principal ||
    passageiro.responsaveis?.find((r) => r.tipo === TipoResponsavel.PRINCIPAL) ||
    passageiro.responsaveis?.[0];
  const enderecoFormatado = respPrincipal?.logradouro
    ? formatarEnderecoCompleto(respPrincipal)
    : formatarEnderecoCompleto(passageiro);
  const referenciaEmbarque = respPrincipal?.referencia || passageiro.referencia || null;
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

  const inicioTransporteTexto = passageiro.data_inicio_transporte
    ? formatDateToBR(passageiro.data_inicio_transporte)
    : null;

  const fimTransporteTexto = passageiro.data_fim_transporte
    ? formatDateToBR(passageiro.data_fim_transporte)
    : null;

  const inicioCobrancaTexto =
    !isIncomplete && passageiro.data_inicio_cobranca
      ? formatMonthYearToBR(passageiro.data_inicio_cobranca)
      : null;

  const fimCobrancaTexto =
    !isIncomplete && passageiro.data_fim_cobranca
      ? formatMonthYearToBR(passageiro.data_fim_cobranca)
      : null;

  const cpfResponsavelTexto = !isIncomplete && respPrincipal?.cpf
    ? cpfMask(respPrincipal.cpf)
    : null;

  const telefoneResponsavelTexto = !isIncomplete && respPrincipal?.telefone
    ? phoneMask(respPrincipal.telefone)
    : null;

  return (
    <div className="space-y-6 text-left">
      {/* 1. Bloco: Escola e Transporte */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#16314f]">Escola e Transporte</h3>
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 space-y-3">
          <InfoField
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Escola"
            value={passageiro.escola?.nome}
            fullWidth
          />
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
            <InfoField
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Período"
              value={formatPeriodo(passageiro.periodo)}
            />
            <InfoField
              icon={<Bus className="h-3.5 w-3.5" />}
              label="Modalidade"
              value={formatModalidade(passageiro.modalidade)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
            <InfoField
              icon={<BookOpen className="h-3.5 w-3.5" />}
              label="Turma"
              value={passageiro.turma}
            />
            <InfoField
              icon={<User className="h-3.5 w-3.5" />}
              label="Professor(a)"
              value={passageiro.nome_professor}
            />
          </div>
          <InfoField
            icon={<Bus className="h-3.5 w-3.5" />}
            label="Veículo / Placa"
            value={passageiro.veiculo?.placa}
            fullWidth
            hasBorder
          />
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
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
        </div>
      </div>

      {/* 2. Bloco: Parcelas */}
      {canViewFinancials && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-[#16314f]">Parcelas</h3>
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 space-y-3">
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
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
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
          </div>
        </div>
      )}



      {/* 4. Bloco: Endereço de Embarque */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#16314f]">Endereço de Embarque</h3>
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="text-xs font-medium text-slate-500">
                  {primeiroNomeResp ? `Endereço Principal (${primeiroNomeResp})` : "Endereço completo"}
                </span>
              </div>
              <p className="text-xs text-[#1a3a5c] font-semibold leading-tight block break-words whitespace-pre-wrap">
                {enderecoFormatado || <span className="text-slate-400 font-normal">—</span>}
              </p>
              {referenciaEmbarque && (
                <p className="text-[11px] text-slate-500 font-normal leading-normal mt-1 block break-words">
                  <span className="text-slate-400">Referência: </span>{referenciaEmbarque}
                </p>
              )}
            </div>
            {enderecoFormatado && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onCopyToClipboard(enderecoFormatado, "Endereço")}
                className="h-8 w-8 rounded-xl shrink-0 hover:bg-white border border-slate-200/60"
                title="Copiar endereço"
              >
                {isCopiedEndereco ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Bloco: Outros Dados */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#16314f]">Outros Dados</h3>
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 space-y-3">
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
          {passageiro.observacoes && (
            <div className="pt-2.5 border-t border-slate-200/50 space-y-1">
              <span className="text-xs font-medium text-slate-500 block">Observações</span>
              <p className="text-xs sm:text-sm font-bold text-[#1a3a5c] leading-relaxed whitespace-pre-wrap">
                {passageiro.observacoes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
