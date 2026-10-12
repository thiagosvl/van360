import React from "react";
import { FileCheck2, Clock, FileX2, Eye, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { ContratoStatus } from "@/types/enums";
import { openBrowserLink } from "@/utils/browser";

interface ResponsavelCarteirinhaContratoProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaContrato: React.FC<ResponsavelCarteirinhaContratoProps> = ({ carteirinha }) => {
  const contrato = carteirinha.contrato;
  const status = contrato?.status;

  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE || (!!contrato && !status);
  const hasContract = Boolean(contrato && (isAssinado || isPendente));

  const pdfUrl =
    contrato?.contrato_final_url ||
    contrato?.minuta_url ||
    contrato?.pdf_url ||
    contrato?.documento_url;

  const handleVisualizar = () => {
    if (pdfUrl) {
      openBrowserLink(pdfUrl);
    }
  };

  const handleAssinar = () => {
    if (contrato?.token_acesso) {
      openBrowserLink(`${window.location.origin}/assinar/${contrato.token_acesso}`);
    } else if (pdfUrl) {
      openBrowserLink(pdfUrl);
    }
  };

  const renderBadge = () => {
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
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 flex flex-col gap-4 transform-gpu will-change-transform text-left">
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
            ) : (
              <FileX2 className="h-5 w-5 text-[#737373] shrink-0" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-[#0a0a0a] leading-snug">
              {isAssinado
                ? "Contrato digital assinado"
                : isPendente
                  ? "Aguardando assinatura"
                  : "Aluno sem contrato"}
            </span>
            <p className="text-xs text-[#737373] leading-relaxed mt-0.5 font-normal">
              {isAssinado
                ? "Documento oficial assinado eletronicamente com validade jurídica."
                : isPendente
                  ? "Contrato gerado. Toque abaixo para assinar digitalmente pelo celular com validade jurídica."
                  : "Não há contratos de transporte ativos vinculados a este aluno no momento."}
            </p>
          </div>
        </div>

        {hasContract && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full pt-3 border-t border-[#e5e5e5]">
            {isAssinado && (
              <Button
                type="button"
                variant="outline"
                onClick={handleVisualizar}
                disabled={!pdfUrl}
                className="h-10 sm:h-11 px-4 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.99] text-[#0a0a0a] hover:text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#737373]/50 text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center w-full"
              >
                <Eye className="w-4 h-4 text-[#0a0a0a]" />
                <span>Ver Contrato Assinado</span>
              </Button>
            )}

            {isPendente && (
              <Button
                type="button"
                onClick={handleAssinar}
                className="h-10 sm:h-11 px-4 rounded-[18px] bg-primary hover:bg-primary/90 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold gap-2 transition-all shadow-xs shrink-0 cursor-pointer flex-1 justify-center w-full"
              >
                <FileSignature className="w-4 h-4" />
                <span>Assinar Contrato Agora</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
