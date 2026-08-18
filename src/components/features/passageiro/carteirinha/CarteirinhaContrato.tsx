import { FileCheck2, Clock, FileX2, Plus, ExternalLink, Wand2, Pencil, CheckCircle2, UploadCloud, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { isResponsavelIncompleto, obterStatusConfiguracaoContrato, StatusConfiguracaoContrato } from "@/utils/domain";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useLayout } from "@/contexts/LayoutContext";

interface CarteirinhaContratoProps {
  passageiro: Passageiro;
  contratosAtivos?: boolean;
  onContractAction: () => void;
  onDeleteContrato?: () => void;
  onEnviarWhatsApp?: (passageiro: Passageiro) => void;
  onEditClick?: () => void;
}

export const CarteirinhaContrato = ({
  passageiro,
  contratosAtivos = true,
  onContractAction,
  onDeleteContrato,
  onEnviarWhatsApp,
  onEditClick,
}: CarteirinhaContratoProps) => {
  const { can } = usePermissions();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { openContractSetupDialog, openImportarContratoDialog } = useLayout();

  const canManage = can("contratos.gerenciar");

  if (!canManage) {
    return null;
  }

  const resp = passageiro.responsavel_principal;
  const isMissingResponsible = isResponsavelIncompleto(
    resp?.nome,
    resp?.telefone
  );

  const statusConfig = obterStatusConfiguracaoContrato(profile);
  const isContratoConfigurado = statusConfig !== StatusConfiguracaoContrato.NAO_CONFIGURADO;
  const isContratoAtivo = statusConfig === StatusConfiguracaoContrato.ATIVO;

  const handleNoContractClick = () => {
    if (isMissingResponsible) {
      onEditClick?.();
      return;
    }

    if (!isContratoConfigurado || !isContratoAtivo) {
      openContractSetupDialog({
        forceOpen: true,
        onSuccess: (usarContratos) => {
          if (usarContratos) {
            onContractAction();
          }
        },
      });
      return;
    }

    onContractAction();
  };

  const getContratoConfig = (status?: ContratoStatus) => {
    if (status === ContratoStatus.ASSINADO) {
      const isImportado = passageiro.contrato_provider === ContratoProvider.IMPORTADO;
      return {
        title: isImportado ? "Contrato Importado" : "Contrato Assinado",
        desc: isImportado
          ? "Documento em PDF importado e arquivado"
          : "Documento oficial assinado eletronicamente",
        color: "bg-slate-50/80 border-slate-100/80 hover:bg-slate-100/50 hover:border-slate-200/80",
        iconColor: isImportado
          ? "text-blue-600 bg-blue-100/50 border border-blue-200/20 shadow-xs"
          : "text-emerald-600 bg-emerald-100/50 border border-emerald-200/20 shadow-xs",
        icon: FileCheck2,
        actionLabel: "Ver Contrato",
        actionColor: "bg-white border border-[#1a3a5c] text-[#1a3a5c] hover:bg-slate-50 shadow-xs shadow-[#1a3a5c]/5",
        actionIcon: ExternalLink,
        onClick: onContractAction,
      };
    }

    if (status === ContratoStatus.PENDENTE) {
      return {
        title: "Assinatura Pendente",
        desc: "Aguardando assinatura do responsável",
        color: "bg-amber-50/40 border-amber-100/80 hover:bg-amber-50 hover:border-amber-200/50",
        iconColor: "text-amber-600 bg-amber-100/50 border border-amber-200/20 shadow-xs",
        icon: Clock,
        actionLabel: "Reenviar Contrato",
        actionColor: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-xs shadow-[#1a3a5c]/10",
        actionIcon: WhatsAppIcon,
        onClick: () => onEnviarWhatsApp?.(passageiro),
      };
    }

    if (isMissingResponsible) {
      return {
        title: "Não possui contrato",
        desc: "Complete o cadastro do responsável para poder emitir contratos.",
        color: "bg-amber-50/40 border-amber-100/80",
        iconColor: "text-amber-600 bg-amber-100/50 border border-amber-200/30 shadow-xs",
        icon: Pencil,
        actionLabel: "Completar Cadastro",
        actionColor: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-xs shadow-[#1a3a5c]/10",
        actionIcon: Pencil,
        onClick: handleNoContractClick,
      };
    }

    if (!isContratoConfigurado) {
      return {
        title: "Não possui contrato",
        desc: "Configure sua assinatura e modelo para começar a gerar contratos.",
        color: "bg-slate-50/80 border-slate-100/80",
        iconColor: "text-[#1a3a5c] bg-blue-100/50 border border-blue-200/30 shadow-xs",
        icon: FileX2,
        actionLabel: "Configurar & Gerar",
        actionColor: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-xs shadow-[#1a3a5c]/10",
        actionIcon: Wand2,
        onClick: handleNoContractClick,
      };
    }

    if (!isContratoAtivo) {
      return {
        title: "Não possui contrato",
        desc: "O uso de contratos está desativado na sua conta.",
        color: "bg-slate-50/80 border-slate-100/80",
        iconColor: "text-slate-500 bg-slate-100 border border-slate-200/50 shadow-xs",
        icon: FileX2,
        actionLabel: "Reativar & Gerar",
        actionColor: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-xs shadow-[#1a3a5c]/10",
        actionIcon: CheckCircle2,
        onClick: handleNoContractClick,
      };
    }

    return {
      title: "Não possui contrato",
      desc: "Gere o contrato para assinatura do responsável.",
      color: "bg-slate-50/80 border-slate-100/80",
      iconColor: "text-[#1a3a5c] bg-[#1a3a5c]/5 border border-[#1a3a5c]/10 shadow-xs",
      icon: FileX2,
      actionLabel: "Gerar Contrato",
      actionColor: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-xs shadow-[#1a3a5c]/10",
      actionIcon: Plus,
      onClick: handleNoContractClick,
    };
  };

  const contratoConfig = getContratoConfig(passageiro.status_contrato);
  const hasContract =
    passageiro.status_contrato === ContratoStatus.ASSINADO ||
    passageiro.status_contrato === ContratoStatus.PENDENTE;

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
          <div
            className={cn(
              "w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-black/5",
              contratoConfig.iconColor
            )}
          >
            <contratoConfig.icon className="h-5 w-5 shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[#1a3a5c] mt-0.5 leading-snug break-words">
              {contratoConfig.title}
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 break-words font-medium">
              {contratoConfig.desc}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={contratoConfig.onClick}
            className={cn(
              "flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg text-[13px] font-bold transition-all duration-200 shadow-xs hover:shadow active:scale-[0.99] shrink-0 cursor-pointer",
              contratoConfig.actionColor
            )}
          >
            <contratoConfig.actionIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{contratoConfig.actionLabel}</span>
          </button>

          {!hasContract && (
            <button
              type="button"
              onClick={() => openImportarContratoDialog({ passageiroId: passageiro.id, passageiro })}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-lg text-[12px] font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 transition-all duration-200 shadow-xs active:scale-[0.99] shrink-0 cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Importar Contrato</span>
            </button>
          )}

          {hasContract && onDeleteContrato && (
            <button
              type="button"
              onClick={onDeleteContrato}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-lg text-[12px] font-bold text-red-600 bg-red-50/40 hover:bg-red-50 border border-red-100 transition-all duration-200 shadow-xs active:scale-[0.99] shrink-0 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span>Excluir Contrato</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
