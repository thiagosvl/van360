import React from "react";
import { FileCheck2, Clock, FileX2, ExternalLink, FileSignature } from "lucide-react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { ContratoStatus } from "@/types/enums";
import { cn } from "@/lib/utils";
import { openBrowserLink } from "@/utils/browser";
import { useNavigate } from "react-router-dom";

interface ResponsavelCarteirinhaContratoProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaContrato: React.FC<ResponsavelCarteirinhaContratoProps> = ({ carteirinha }) => {
  const navigate = useNavigate();
  const contrato = carteirinha.contrato;
  const status = contrato?.status;

  if (!contrato || !status) {
    return (
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0a0a0a]">Contrato</h3>
        </div>
        <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
            <FileX2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-semibold text-[#0a0a0a]">Aluno sem contrato</span>
            <p className="text-xs text-[#737373] mt-0.5">
              Não há contratos vinculados a este aluno no momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isAssinado = status === ContratoStatus.ASSINADO;
  const pdfUrl = contrato.contrato_final_url || contrato.minuta_url || contrato.pdf_url || contrato.documento_url;

  const handleAction = () => {
    if (isAssinado) {
      if (pdfUrl) {
        openBrowserLink(pdfUrl);
      }
    } else {
      if (contrato.token_acesso) {
        openBrowserLink(`${window.location.origin}/assinar/${contrato.token_acesso}`);
      } else if (pdfUrl) {
        openBrowserLink(pdfUrl);
      }
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#0a0a0a]">Contrato de Transporte</h3>
      </div>

      <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-4 transition-all flex flex-col gap-3">
        <div className="flex items-start gap-3 w-full">
          <div
            className={cn(
              "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border",
              isAssinado
                ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-700 bg-amber-500/10 border-amber-500/20"
            )}
          >
            {isAssinado ? <FileCheck2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-[#0a0a0a] mt-0.5 leading-snug">
              {isAssinado ? "Contrato Assinado" : "Assinatura Pendente"}
            </span>
            <p className="text-xs text-[#737373] mt-0.5">
              {isAssinado
                ? "Documento assinado digitalmente e em conformidade."
                : "Seu contrato está aguardando assinatura. Clique abaixo para assinar online."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className={cn(
            "flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-[18px] text-xs font-medium transition-all shadow-xs active:scale-[0.99] cursor-pointer",
            isAssinado
              ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white"
              : "bg-primary hover:bg-primary-hover text-white shadow-sm"
          )}
        >
          {isAssinado ? (
            <>
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Visualizar Contrato</span>
            </>
          ) : (
            <>
              <FileSignature className="h-3.5 w-3.5" />
              <span>Assinar Contrato Agora</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
