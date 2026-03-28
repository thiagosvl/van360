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
import { ContratoStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { phoneMask } from "@/utils/masks";
import {
  calcularIdade,
  formatModalidade,
  formatGenero,
  formatParentesco,
  formatDateToBR,
  formatPeriodo,
} from "@/utils/formatters";
import {
  Bus,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileSignature,
  GraduationCap,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  PowerOff,
  Power,
  Route,
  ShieldCheck,
  ShieldQuestion,
  Trash2,
  User,
  Users,
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
  onContractAction: () => void;
  contratosAtivos?: boolean;
}

/**
 * Componente interno para as ações rápidas (Ligar, WhatsApp, Menu).
 * Centralizado para evitar duplicação e garantir consistência visual.
 */
const ProfileActions = ({
  passageiro,
  onToggleClick,
  onEditClick,
  onDeleteClick,
}: Pick<CarteirinhaInfoProps, "passageiro" | "onToggleClick" | "onEditClick" | "onDeleteClick">) => (
  <div className="flex items-center justify-center gap-3">
    <Button
      size="icon"
      onClick={() => window.open(`tel:${passageiro.telefone_responsavel}`, "_self")}
      className="h-11 w-11 rounded-2xl bg-[#1a3a5c]/5 text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-all shadow-sm hover:shadow-md"
    >
      <Phone className="h-4.5 w-4.5" />
    </Button>
    <Button
      size="icon"
      onClick={() => window.open(`https://wa.me/55${passageiro.telefone_responsavel?.replace(/\D/g, "")}`, "_blank")}
      className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
    >
      <WhatsAppIcon className="h-4.5 w-4.5" />
    </Button>

    {/* Botão de Edição Direta */}
    <Button
      size="icon"
      onClick={onEditClick}
      className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 hover:bg-[#1a3a5c] hover:text-white transition-all shadow-sm hover:shadow-md"
    >
      <Pencil className="h-4.5 w-4.5" />
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="h-11 w-11 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#1a3a5c] transition-all shadow-sm"
        >
          <MoreHorizontal className="h-4.5 w-4.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
        <DropdownMenuItem onClick={onEditClick} className="rounded-xl px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider text-[#1a3a5c] cursor-pointer">
          <Pencil className="h-3.5 w-3.5 mr-2 opacity-60" />
          Editar Cadastro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleClick(!!passageiro.ativo)} className="rounded-xl px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider text-[#1a3a5c] cursor-pointer">
          {passageiro.ativo ? <PowerOff className="h-3.5 w-3.5 mr-2 opacity-60 text-amber-500" /> : <Power className="h-3.5 w-3.5 mr-2 opacity-60 text-emerald-500" />}
          {passageiro.ativo ? "Desativar Passageiro" : "Reativar Passageiro"}
        </DropdownMenuItem>
        <div className="h-px bg-slate-50 my-1" />
        <DropdownMenuItem onClick={onDeleteClick} className="rounded-xl px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider text-rose-500 cursor-pointer">
          <Trash2 className="h-3.5 w-3.5 mr-2 opacity-60" />
          Excluir cadastro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

/**
 * Componente interno para o resumo do perfil (Avatar, Nome, Badges).
 */
const ProfileSummary = ({
  passageiro,
  temCobrancasVencidas,
}: Pick<CarteirinhaInfoProps, "passageiro" | "temCobrancasVencidas">) => (
  <div className="flex flex-col items-center -mt-12 mb-4">
    <div className="h-24 w-24 rounded-[2rem] bg-white p-1.5 shadow-xl">
      <div className={cn(
        "h-full w-full rounded-[1.6rem] bg-slate-100 flex items-center justify-center text-[#1a3a5c] overflow-hidden relative border-2 transition-all",
        passageiro.ativo ? "border-emerald-500/20" : "border-slate-300/20"
      )}>
        <User className="h-10 w-10 opacity-20" />
      </div>
    </div>

    <div className="text-center mt-3">
      <h2 className="text-xl font-headline font-black text-[#1a3a5c] tracking-tight">
        {passageiro.nome}
      </h2>
      {passageiro.nome_responsavel && (
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          {passageiro.nome_responsavel}
        </p>
      )}
    <div className="flex items-center justify-center gap-2 mt-2">
      <Badge variant="outline" className={cn(
        "border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
        passageiro.ativo ? "text-emerald-500 bg-emerald-50" : "text-slate-400 bg-slate-50"
      )}>
        {passageiro.ativo ? "Ativo" : "Inativo"}
      </Badge>
      {temCobrancasVencidas && (
        <Badge className="bg-rose-50 text-rose-500 border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest animate-pulse">
          Possui Débitos
        </Badge>
      )}
    </div>
    </div>
  </div>
);

/**
 * Wrapper de Card para a carteirinha, permitindo variações entre mobile e desktop.
 */
const CarteirinhaCard = ({
  children,
  headerHeight = "h-16",
  className,
}: {
  children: React.ReactNode;
  headerHeight?: "h-16" | "h-24";
  className?: string;
}) => (
  <div className={cn(
    "bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden transition-all relative",
    className
  )}>
    {/* Header gradient */}
    <div className={cn("bg-gradient-to-br from-[#1a3a5c] to-[#002444] relative overflow-hidden", headerHeight)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </div>
    <div className="px-6 pb-5 relative">
      {children}
    </div>
  </div>
);

/**
 * Header da carteirinha: avatar, nome, responsável, badges, botões de ação.
 * Fica sempre visível no topo (mobile e desktop).
 */
export const CarteirinhaHeader = (props: Pick<CarteirinhaInfoProps, "passageiro" | "temCobrancasVencidas" | "onToggleClick" | "onEditClick" | "onDeleteClick">) => {
  return (
    <CarteirinhaCard headerHeight="h-16">
      <ProfileSummary
        passageiro={props.passageiro}
        temCobrancasVencidas={props.temCobrancasVencidas}
      />
      <ProfileActions {...props} />
    </CarteirinhaCard>
  );
};

/**
 * Componente principal que renderiza tudo junto (usado no desktop).
 */
export const CarteirinhaInfo = (props: CarteirinhaInfoProps) => {
  return (
    <CarteirinhaCard headerHeight="h-24">
      <ProfileSummary
        passageiro={props.passageiro}
        temCobrancasVencidas={props.temCobrancasVencidas}
      />
      <div className="mb-6">
        <ProfileActions
          passageiro={props.passageiro}
          onToggleClick={props.onToggleClick}
          onEditClick={props.onEditClick}
          onDeleteClick={props.onDeleteClick}
        />
      </div>
      <CarteirinhaDadosPessoais
        passageiro={props.passageiro}
        isCopiedEndereco={props.isCopiedEndereco}
        isCopiedTelefone={props.isCopiedTelefone}
        onCopyToClipboard={props.onCopyToClipboard}
        onContractAction={props.onContractAction}
        contratosAtivos={props.contratosAtivos}
      />
    </CarteirinhaCard>
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
}: Pick<CarteirinhaInfoProps, "passageiro" | "isCopiedEndereco" | "isCopiedTelefone" | "onCopyToClipboard" | "onContractAction" | "contratosAtivos">) => {
  const getContratoStatusStyles = (status?: ContratoStatus) => {
    if (status === ContratoStatus.ASSINADO)
      return { label: "Assinado", color: "text-emerald-500 bg-emerald-50", icon: ShieldCheck };
    if (status === ContratoStatus.PENDENTE)
      return { label: "Pendente", color: "text-amber-500 bg-amber-50", icon: ShieldQuestion };
    return { label: "Sem Contrato", color: "text-slate-400 bg-slate-50", icon: FileSignature };
  };

  const contratoStyle = getContratoStatusStyles(passageiro.status_contrato);

  const isContractActionDisabled = !contratosAtivos &&
    (passageiro.status_contrato !== ContratoStatus.PENDENTE && passageiro.status_contrato !== ContratoStatus.ASSINADO);


  const getEnderecoFormatado = () => {
    if (!passageiro.logradouro) return "Endereço não informado";
    return `${passageiro.logradouro}, ${passageiro.numero || "S/N"} - ${passageiro.bairro || ""}`;
  };
  const enderecoFormatado = getEnderecoFormatado();

  const handleContratoClick = () => {
    if (isContractActionDisabled) {
      toast.warning("Ative o uso de Contratos", {
        description: "Para gerar novos contratos, primeiro ative o recurso acessando a aba 'Contratos' no menu inferior."
      });
      return;
    }
    onContractAction();
  };

  const RightIcon = (passageiro.status_contrato === ContratoStatus.PENDENTE || passageiro.status_contrato === ContratoStatus.ASSINADO)
    ? ExternalLink
    : Plus;

  return (
    <div className="space-y-3">
      {/* Linha: Período + Modalidade */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Período"
          value={formatPeriodo(passageiro.periodo)}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Modalidade"
          value={passageiro.modalidade ? formatModalidade(passageiro.modalidade) : "-"}
          icon={<Route className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Linha: Escola + Veículo */}
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          label="Escola"
          value={passageiro.escola?.nome || "-"}
          icon={<GraduationCap className="h-3.5 w-3.5" />}
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
          value={passageiro.data_nascimento ? `${formatDateToBR(passageiro.data_nascimento)}` : "-"}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
        <InfoTile
          label="Gênero"
          value={passageiro.genero ? formatGenero(passageiro.genero) : "-"}
          icon={<Users className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Contrato */}
      <div
        onClick={handleContratoClick}
        className={cn(
          "rounded-2xl border border-slate-200 p-3.5 transition-all cursor-pointer group/tile flex items-center justify-between",
          contratoStyle.color
        )}
      >
        <div className="flex items-center gap-2.5">
          <contratoStyle.icon className="h-4 w-4" />
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-widest opacity-60">
              Contrato
            </span>
            <span className="text-sm font-bold">
              {contratoStyle.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 group-hover/tile:opacity-100 transition-opacity bg-black/5 px-2.5 py-1.5 rounded-xl border border-black/5">
          <RightIcon className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none pt-0.5">
            {passageiro.status_contrato === ContratoStatus.PENDENTE || passageiro.status_contrato === ContratoStatus.ASSINADO
              ? "Ver"
              : "Gerar"
            }
          </span>
        </div>
      </div>

      {/* Início do Transporte */}
      {passageiro.data_inicio_transporte && (
        <InfoTile
          label="Início do Transporte"
          value={formatDateToBR(passageiro.data_inicio_transporte)}
          icon={<Calendar className="h-3.5 w-3.5" />}
          fullWidth
        />
      )}

      {/* Representante Legal */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
            Representante Legal
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <span className="block text-sm font-bold text-[#1a3a5c]">
              {passageiro.nome_responsavel}
              <div className="text-[11px] font-medium text-slate-500">
                {formatParentesco(passageiro.parentesco_responsavel)}
              </div>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {phoneMask(passageiro.telefone_responsavel)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopyToClipboard(passageiro.telefone_responsavel || "", "Telefone")}
            className="h-8 w-8 rounded-xl shrink-0 hover:bg-white"
          >
            {isCopiedTelefone
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Copy className="h-3.5 w-3.5 text-slate-400" />
            }
          </Button>
        </div>
      </div>

      {/* Rota de Embarque / Endereço */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
            Rota de Embarque
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
            {isCopiedEndereco
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Copy className="h-3.5 w-3.5 text-slate-400" />
            }
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
  <div className={cn(
    "bg-slate-50/80 rounded-2xl p-3.5 transition-colors hover:bg-slate-100/80",
    fullWidth && "col-span-2"
  )}>
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
    </div>
    <span className="text-sm font-black text-[#1a3a5c] leading-tight block ">
      {value}
    </span>
  </div>
);
