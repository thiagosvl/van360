import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ContratoStatus, PassageiroPeriodo } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { phoneMask } from "@/utils/masks";
import {
  ExternalLink,
  FileCheck,
  FileSignature,
  FileText,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Power,
  PowerOff,
  ShieldCheck,
  ShieldQuestion,
  User,
  Trash2,
} from "lucide-react";

interface CarteirinhaInfoProps {
  passageiro: Passageiro;
  temCobrancasVencidas: boolean;
  isCopiedEndereco: boolean;
  isCopiedTelefone: boolean;
  onEditClick: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
  onToggleClick: (statusAtual: boolean) => void;
  onDeleteClick: () => void;
  onContractAction: () => void;
}

export const CarteirinhaInfo = ({
  passageiro,
  temCobrancasVencidas,
  isCopiedEndereco,
  isCopiedTelefone,
  onEditClick,
  onCopyToClipboard,
  onToggleClick,
  onDeleteClick,
  onContractAction,
}: CarteirinhaInfoProps) => {
  const getPeriodoLabel = (periodo?: PassageiroPeriodo) => {
    switch (periodo) {
      case PassageiroPeriodo.MANHA:
        return "Manhã";
      case PassageiroPeriodo.TARDE:
        return "Tarde";
      case PassageiroPeriodo.NOITE:
        return "Noite";
      case PassageiroPeriodo.INTEGRAL:
        return "Integral";
      default:
        return "-";
    }
  };

  const getContratoStatusStyles = (status?: ContratoStatus) => {
    if (status === ContratoStatus.ASSINADO)
      return {
        label: "Assinado",
        color: "text-emerald-500 bg-emerald-50",
        icon: ShieldCheck,
      };
    if (status === ContratoStatus.PENDENTE)
      return {
        label: "Pendente",
        color: "text-amber-500 bg-amber-50",
        icon: ShieldQuestion,
      };
    return {
      label: "Sem Contrato",
      color: "text-slate-400 bg-slate-50",
      icon: FileSignature,
    };
  };

  const contratoStyle = getContratoStatusStyles(passageiro.status_contrato);

  const getEnderecoFormatado = () => {
    if (!passageiro.logradouro) return "Endereço não informado";
    return `${passageiro.logradouro}, ${passageiro.numero || "S/N"} - ${passageiro.bairro || ""}`;
  };

  const enderecoFormatado = getEnderecoFormatado();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden group/card transition-all relative">
      <div className="h-24 bg-gradient-to-br from-[#1a3a5c] to-[#002444] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="px-6 pb-8 relative">
        <div className="flex flex-col items-center -mt-12 mb-6">
          <div className="relative group/avatar">
            <div className="h-24 w-24 rounded-[2rem] bg-white p-1.5 shadow-xl transition-transform group-hover/avatar:scale-105 duration-500">
              <div className="h-full w-full rounded-[1.6rem] bg-slate-100 flex items-center justify-center text-[#1a3a5c] overflow-hidden relative group-hover/avatar:shadow-inner transition-all">
                <User className="h-10 w-10 opacity-20" />
                <div
                  className={cn(
                    "absolute inset-0 border-2 rounded-[1.6rem] transition-all duration-700",
                    passageiro.ativo ? "border-emerald-500/30 group-hover/avatar:border-emerald-500" : "border-slate-300/30 group-hover/avatar:border-slate-300"
                  )}
                />
              </div>
            </div>
            <div className={cn(
              "absolute bottom-0 right-0 h-7 w-7 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center",
              passageiro.ativo ? "bg-emerald-500" : "bg-slate-400"
            )}>
              {passageiro.ativo ? <Power className="h-3 w-3 text-white" /> : <PowerOff className="h-3 w-3 text-white" />}
            </div>
          </div>

          <div className="text-center mt-4">
            <h2 className="text-xl font-headline font-black text-[#1a3a5c] tracking-tight">
              {passageiro.nome}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                "border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                passageiro.ativo ? "text-emerald-500 bg-emerald-50" : "text-slate-400 bg-slate-50"
              )}>
                {passageiro.ativo ? "Ativo" : "Inativo"}
              </Badge>
              {temCobrancasVencidas && (
                <Badge className="bg-rose-50 text-rose-500 border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest animate-pulse">
                  Possui Débitos
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            size="icon"
            onClick={() => window.open(`tel:${passageiro.telefone_responsavel}`, "_self")}
            className="h-12 w-12 rounded-2xl bg-[#1a3a5c]/5 text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-all shadow-sm hover:shadow-md"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => window.open(`https://wa.me/55${passageiro.telefone_responsavel?.replace(/\D/g, "")}`, "_blank")}
            className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#1a3a5c] transition-all shadow-sm"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
              <DropdownMenuItem onClick={onEditClick} className="rounded-xl px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#1a3a5c] cursor-pointer">
                <Pencil className="h-3.5 w-3.5 mr-2 opacity-60" />
                Editar Cadastro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleClick(!!passageiro.ativo)} className="rounded-xl px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#1a3a5c] cursor-pointer">
                {passageiro.ativo ? <PowerOff className="h-3.5 w-3.5 mr-2 opacity-60 text-amber-500" /> : <Power className="h-3.5 w-3.5 mr-2 opacity-60 text-emerald-500" />}
                {passageiro.ativo ? "Desativar Passageiro" : "Reativar Passageiro"}
              </DropdownMenuItem>
              <div className="h-px bg-slate-50 my-1" />
              <DropdownMenuItem onClick={onDeleteClick} className="rounded-xl px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-rose-500 cursor-pointer">
                <Trash2 className="h-3.5 w-3.5 mr-2 opacity-60" />
                Remover cadastro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-50/80 rounded-2xl p-4 transition-colors hover:bg-slate-100/80">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
              Período
            </span>
            <span className="text-sm font-black text-[#1a3a5c]">
              {getPeriodoLabel(passageiro.periodo)}
            </span>
          </div>

          <div
            onClick={onContractAction}
            className={cn(
              "rounded-2xl p-4 transition-all cursor-pointer group/tile",
              contratoStyle.color
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-60">
                Contrato
              </span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover/tile:opacity-40 transition-opacity" />
            </div>
            <div className="flex items-center gap-2">
              <contratoStyle.icon className="h-4 w-4" />
              <span className="text-sm font-black">
                {contratoStyle.label}
              </span>
            </div>
          </div>

          <div className="col-span-2 bg-slate-50/80 rounded-2xl p-4 transition-colors hover:bg-slate-100/80">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
              Representante Legal
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-black text-[#1a3a5c]">
                  {passageiro.nome_responsavel}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {phoneMask(passageiro.telefone_responsavel)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(passageiro.telefone_responsavel || "", "Telefone")}
                className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider px-3 hover:bg-white"
              >
                {isCopiedTelefone ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="col-span-2 bg-slate-50/80 rounded-2xl p-4 transition-colors hover:bg-slate-100/80">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                Rota de Embarque
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                {enderecoFormatado}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopyToClipboard(enderecoFormatado, "Endereço")}
                className="h-8 w-8 rounded-xl shrink-0 hover:bg-white"
              >
                {isCopiedEndereco ? <FileCheck className="h-4 w-4 text-emerald-500" /> : <FileText className="h-4 w-4 text-slate-400" />}
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={onEditClick}
          className="w-full h-14 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md text-[#1a3a5c] font-black uppercase tracking-[0.15em] text-[10px] group/edit transition-all"
        >
          <Pencil className="h-4 w-4 mr-2 group-hover/edit:rotate-12 transition-transform" />
          Gerenciar Cadastro
        </Button>
      </div>
    </div>
  );
};
