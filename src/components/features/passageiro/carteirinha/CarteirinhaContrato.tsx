import {
  FileCheck2,
  Clock,
  Plus,
  Eye,
  Wand2,
  CheckCircle2,
  UploadCloud,
  Trash2,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Passageiro } from "@/types/passageiro";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  obterStatusConfiguracaoContrato,
  StatusConfiguracaoContrato,
  obterUrlDocumentoContrato,
} from "@/utils/domain";
import { openBrowserLink } from "@/utils/browser";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
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
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { openImportarContratoDialog } = useLayout();

  const canManage = can("contratos.gerenciar");

  if (!canManage) {
    return null;
  }

  const statusConfig = obterStatusConfiguracaoContrato(profile);
  const isContratoConfigurado = statusConfig !== StatusConfiguracaoContrato.NAO_CONFIGURADO;
  const isContratoAtivo = statusConfig === StatusConfiguracaoContrato.ATIVO;

  const handleNoContractClick = () => {
    if (!isContratoConfigurado || !isContratoAtivo) {
      const returnUrl = encodeURIComponent(
        `${ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", passageiro.id)}?tab=contrato`
      );
      navigate(`${ROUTES.PRIVATE.MOTORISTA.CONTRACT_SETUP}?returnTo=${returnUrl}`);
      return;
    }
    onContractAction();
  };

  const status = passageiro.status_contrato;
  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE;
  const isImportado = passageiro.contrato_provider === ContratoProvider.IMPORTADO;
  const hasContract = isAssinado || isPendente;

  const urlContrato = obterUrlDocumentoContrato(passageiro);
  const tokenAcesso = passageiro.token_acesso;
  const linkAssinatura = tokenAcesso
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/assinar/${tokenAcesso}`
    : null;

  const urlParaVisualizar = urlContrato || linkAssinatura;

  const handleVisualizar = () => {
    if (urlParaVisualizar) {
      openBrowserLink(urlParaVisualizar);
    } else {
      onContractAction();
    }
  };

  const renderBadge = () => {
    if (isImportado) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium border bg-sky-500/[0.08] text-sky-700 border-sky-500/20">
          Importado
        </span>
      );
    }

    if (isAssinado) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium border bg-emerald-500/[0.08] text-emerald-700 border-emerald-500/20">
          Assinado
        </span>
      );
    }

    if (isPendente) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium border bg-amber-500/[0.08] text-amber-700 border-amber-500/20">
          Pendente
        </span>
      );
    }

    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium border bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]">
        Sem Contrato
      </span>
    );
  };

  return (
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 flex flex-col gap-4 transform-gpu will-change-transform">
      <div className="flex items-center justify-between text-left min-h-[32px] gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Contrato</h3>
        {renderBadge()}
      </div>

      <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 sm:p-5 border border-[#e5e5e5] flex flex-col gap-4 text-left w-full min-w-0">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-[14px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 shadow-xs">
            {isAssinado ? (
              <FileCheck2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : isPendente ? (
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            ) : !isContratoConfigurado ? (
              <Wand2 className="h-5 w-5 text-[#0a0a0a] shrink-0" />
            ) : !isContratoAtivo ? (
              <CheckCircle2 className="h-5 w-5 text-[#737373] shrink-0" />
            ) : (
              <FileSignature className="h-5 w-5 text-[#0a0a0a] shrink-0" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-[#0a0a0a] leading-snug">
              {isImportado
                ? "Contrato assinado em PDF"
                : isAssinado
                  ? "Contrato digital assinado"
                  : isPendente
                    ? "Aguardando assinatura"
                    : !isContratoConfigurado
                      ? "Contratos não configurados"
                      : !isContratoAtivo
                        ? "Uso de contratos desativado"
                        : "Aluno sem contrato"}
            </span>
            <p className="text-xs text-[#737373] leading-relaxed mt-0.5 font-normal">
              {isImportado
                ? "Documento assinado anexado à carteirinha do aluno."
                : isAssinado
                  ? "Documento oficial assinado eletronicamente com validade jurídica."
                  : isPendente
                    ? "Minuta gerada. O responsável precisa assinar digitalmente pelo celular."
                    : !isContratoConfigurado
                      ? "Configure modelo e assinatura para começar a emitir contratos."
                      : !isContratoAtivo
                        ? "O módulo de contratos está pausado nas suas preferências."
                        : "Emita um contrato digital para formalizar a prestação de serviços com o responsável."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full pt-3 border-t border-[#e5e5e5]">
          {isPendente && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleVisualizar}
                className="h-10 sm:h-11 px-4 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.99] text-[#0a0a0a] hover:text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#737373]/50 text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center"
              >
                <Eye className="w-4 h-4 text-[#0a0a0a]" />
                <span>Ver Contrato Gerado</span>
              </Button>

              {onEnviarWhatsApp && (
                <Button
                  type="button"
                  onClick={() => onEnviarWhatsApp(passageiro)}
                  className="h-10 sm:h-11 px-4 rounded-[18px] bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Reenviar no WhatsApp</span>
                </Button>
              )}
            </>
          )}

          {isAssinado && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleVisualizar}
                className="h-10 sm:h-11 px-4 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.99] text-[#0a0a0a] hover:text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#737373]/50 text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center"
              >
                <Eye className="w-4 h-4 text-[#0a0a0a]" />
                <span>Ver Contrato Assinado</span>
              </Button>

              {onEnviarWhatsApp && (
                <Button
                  type="button"
                  onClick={() => onEnviarWhatsApp(passageiro)}
                  className="h-10 sm:h-11 px-4 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.99] text-[#0a0a0a] hover:text-[#0a0a0a] border border-[#e5e5e5] text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </Button>
              )}
            </>
          )}

          {!hasContract && (
            <>
              <Button
                type="button"
                onClick={handleNoContractClick}
                className="h-10 sm:h-11 px-4 rounded-[18px] bg-primary hover:bg-primary/90 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center"
              >
                {!isContratoConfigurado ? (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Configurar & Gerar</span>
                  </>
                ) : !isContratoAtivo ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reativar & Gerar</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Gerar Contrato</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => openImportarContratoDialog({ passageiroId: passageiro.id, passageiro })}
                className="h-10 sm:h-11 px-4 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.99] text-[#0a0a0a] border border-[#e5e5e5] text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center"
              >
                <UploadCloud className="w-4 h-4 text-[#737373]" />
                <span>Importar Contrato (PDF)</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {hasContract && onDeleteContrato && (
        <div className="flex items-center justify-end px-1">
          <button
            type="button"
            onClick={onDeleteContrato}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e7000b] hover:text-[#c4000a] transition-colors py-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Contrato</span>
          </button>
        </div>
      )}
    </div>
  );
};
