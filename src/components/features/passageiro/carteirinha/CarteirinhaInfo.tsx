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
import { formatGenero, formatModalidade, formatPeriodo, formatarEnderecoCompleto, formatDateToBR, formatMonthYearToBR } from "@/utils/formatters";
import { isCadastroPassageiroIncompleto } from "@/utils/domain";
import { formatNomeResponsavelCompletoExibicao } from "@/utils/formatters/name";
import { openBrowserLink } from "@/utils/browser";
import {
  Bus,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Copy,
  GraduationCap,
  MapPin,
  Pencil,
  Power,
  PowerOff,
  Route,
  Trash2,
  User,
  Users,
  Bot,
  BotOff,
  BookOpen,
  MoreHorizontal,
  Wallet,
} from "lucide-react";

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
              {formatNomeResponsavelCompletoExibicao(passageiro.nome_responsavel)}
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
  const getEnderecoFormatado = () => {
    if (!passageiro.logradouro) return "-";
    return formatarEnderecoCompleto(passageiro);
  };
  const enderecoFormatado = getEnderecoFormatado();

  const isIncomplete = isCadastroPassageiroIncompleto(passageiro);

  const valorCobrancaFormatado =
    !isIncomplete && passageiro.valor_cobranca && Number(passageiro.valor_cobranca) > 0
      ? Number(passageiro.valor_cobranca).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
      : "-";

  const diaVencimentoFormatado =
    !isIncomplete && passageiro.dia_vencimento
      ? `Dia ${passageiro.dia_vencimento}`
      : "-";

  const inicioCobrancaFormatado =
    !isIncomplete && passageiro.data_inicio_cobranca
      ? formatMonthYearToBR(passageiro.data_inicio_cobranca)
      : "-";

  const fimCobrancaFormatado =
    !isIncomplete && passageiro.data_fim_cobranca
      ? formatMonthYearToBR(passageiro.data_fim_cobranca)
      : "-";

  return (
    <div className="space-y-3 transform-gpu will-change-transform pt-2">
      {/* Grupo Escolar & Transporte */}
      <div className="grid grid-cols-1 gap-3">
        <InfoTile
          label="Escola"
          value={passageiro.escola?.nome || "-"}
          icon={<GraduationCap className="h-3.5 w-3.5" />}
        />
      </div>

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

      {/* Grupo Financeiro & Cobrança */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Valor da Parcela"
          value={valorCobrancaFormatado}
          icon={<Wallet className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Dia do Vencimento"
          value={diaVencimentoFormatado}
          icon={<CalendarClock className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Início Cobrança"
          value={inicioCobrancaFormatado}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Término Cobrança"
          value={fimCobrancaFormatado}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Grupo Dados Pessoais */}
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

      {/* Endereço */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-normal text-slate-500">
            Endereço
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-[#1a3a5c] leading-tight block break-words whitespace-pre-wrap">
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

