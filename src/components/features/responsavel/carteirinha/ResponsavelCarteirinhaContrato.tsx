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
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-xs p-5 flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#16314f]">Contrato</h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <FileX2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-[#1a3a5c]">Nenhum contrato ativo</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
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
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-xs p-5 flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#16314f]">Contrato de Transporte</h3>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-4 transition-all flex flex-col gap-3",
          isAssinado
            ? "bg-slate-50 border-slate-200/80"
            : "bg-amber-50/40 border-amber-100/80"
        )}
      >
        <div className="flex items-start gap-3 w-full">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-black/5",
              isAssinado
                ? "text-emerald-600 bg-emerald-100/50 border-emerald-200/20"
                : "text-amber-600 bg-amber-100/50 border-amber-200/20"
            )}
          >
            {isAssinado ? <FileCheck2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[#1a3a5c] mt-0.5 leading-snug">
              {isAssinado ? "Contrato Assinado" : "Assinatura Pendente"}
            </span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
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
            "flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow active:scale-[0.99] cursor-pointer",
            isAssinado
              ? "bg-white border border-[#1a3a5c] text-[#1a3a5c] hover:bg-slate-50"
              : "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white"
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
