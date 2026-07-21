import { FileCheck2, Clock, FileX2, Lock, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { ContratoStatus } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface CarteirinhaContratoProps {
  passageiro: Passageiro;
  contratosAtivos?: boolean;
  onContractAction: () => void;
  onEnviarWhatsApp?: (passageiro: Passageiro) => void;
}

import { isResponsavelMockNome } from "@/utils/formatters/name";

export const CarteirinhaContrato = ({
  passageiro,
  contratosAtivos = true,
  onContractAction,
  onEnviarWhatsApp,
}: CarteirinhaContratoProps) => {
  const isMissingResponsible = isResponsavelMockNome(passageiro.nome_responsavel) || !passageiro.nome_responsavel;

  const isContractActionDisabled =
    (!contratosAtivos || isMissingResponsible) &&
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
        ? isMissingResponsible
          ? "Complete o cadastro do responsável para gerar o contrato."
          : "Você precisa ativar o uso de contratos na sua conta antes de gerar o documento."
        : "Gere o contrato para assinatura do responsável",
      color: isContractActionDisabled
        ? "bg-slate-50/30 border-slate-200/50 opacity-75 cursor-not-allowed"
        : "bg-white border-slate-200/80",
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

  const handleContratoClick = () => {
    if (isContractActionDisabled) {
      if (isMissingResponsible) {
        toast.warning("Cadastro Incompleto", {
          description: "Para gerar novos contratos, é necessário informar os dados do responsável.",
        });
      } else {
        toast.warning("Ative o uso de Contratos", {
          description:
            "Para gerar novos contratos, primeiro ative a funcionalidade acessando a aba 'Contratos'.",
        });
      }
      return;
    }

    if (passageiro.status_contrato === ContratoStatus.PENDENTE && onEnviarWhatsApp) {
      onEnviarWhatsApp(passageiro);
      return;
    }

    onContractAction();
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between text-left">
        <h3 className="text-base font-bold text-[#16314f]">Contrato</h3>
      </div>

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
            "flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg text-[13px] font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] shrink-0",
            contratoConfig.actionColor
          )}
        >
          <contratoConfig.actionIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{contratoConfig.actionLabel}</span>
        </button>
      </div>
    </div>
  );
};

