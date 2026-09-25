import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { getDriverDisplayName } from "@/utils/formatters/user";
import { formatShortName } from "@/utils/formatters/name";
import { getStudentPreposition } from "@/utils/formatters";
import { Receipt } from "lucide-react";

export interface ReciboPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  passageiroNome?: string;
}

export function ReciboPreviewDialog({
  isOpen,
  onClose,
  driverName: customDriverName,
  passageiroNome = "Bianca",
}: ReciboPreviewDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const activeDriverName =
    customDriverName ||
    getDriverDisplayName(profile, { fallback: "Thiago Barros" });

  const driverLogoName =
    profile?.apelido?.trim() ||
    profile?.razao_social?.trim() ||
    (profile?.nome ? formatShortName(profile.nome, true) : "") ||
    activeDriverName ||
    "Tio da Van";

  const studentFirstName = passageiroNome.trim().split(" ")[0] || "Bianca";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Recibo digital"
        subtitle="Modelo do comprovante enviado aos pais"
        icon={<Receipt className="w-5 h-5 text-emerald-600" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-2.5 min-[360px]:p-3 sm:p-4 bg-slate-100/60 flex flex-col items-center overflow-y-auto">
        <div className="w-full relative rounded-2xl bg-[#efeae2] p-3 min-[360px]:p-5 border border-slate-200/80 shadow-inner overflow-hidden flex flex-col items-end">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000000 0.75px, transparent 0.75px)",
              backgroundSize: "12px 12px",
            }}
          />

          <div className="relative z-10 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-[#54656f] opacity-60">
              <svg viewBox="0 0 20 20" height="18" width="18" fill="currentColor">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 7.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm6 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm-6 3a4 4 0 006 0 .75.75 0 011.06 1.06 5.5 5.5 0 01-8.12 0 .75.75 0 011.06-1.06z" />
              </svg>
              <svg viewBox="0 0 20 20" height="18" width="18" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="relative max-w-[235px] min-[360px]:max-w-[245px] w-full bg-[#d9fdd3] rounded-l-[10px] rounded-b-[10px] rounded-tr-none p-1 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21] mr-1">
              <svg
                viewBox="0 0 8 13"
                height="13"
                width="8"
                className="absolute -right-2 top-0 pointer-events-none drop-shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
              >
                <path
                  opacity="0.13"
                  fill="#000000"
                  d="M6.467 3.568L0 12.193V1h5.188c1.77 0 2.338 1.156 1.279 2.568z"
                />
                <path
                  fill="#d9fdd3"
                  d="M6.467 2.568L0 11.193V0h5.188c1.77 0 2.338 1.156 1.279 2.568z"
                />
              </svg>

              <div className="w-full bg-white rounded-[8px] p-3 border border-slate-100/80 shadow-xs text-slate-800 flex flex-col min-h-[315px]">
                <div className="flex items-start justify-between pb-1">
                  {profile?.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Seu Logo"
                      className="max-h-8 max-w-[100px] object-contain rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center shadow-2xs">
                      <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none">
                        Seu
                      </span>
                      <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none mt-0.5">
                        Logo
                      </span>
                    </div>
                  )}
                  <span className="text-[6.5px] font-mono text-[#94a3b8] mt-1">
                    ID: fe178c09
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="text-[12px] font-bold text-[#0f172a] tracking-tight leading-tight">
                    Recibo de Pagamento
                  </h3>
                  <div className="mt-2">
                    <p className="text-[7.5px] font-bold text-[#334155] leading-tight">
                      {activeDriverName} • CPF 115.075.268-01
                    </p>
                    <p className="text-[7px] text-[#64748b] leading-tight mt-0.5">
                      Prestação de Serviços de Transporte Escolar
                    </p>
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-[#f1f5f9] py-2 px-3 rounded-xl text-center mt-3.5 mb-3">
                  <span className="text-[6.5px] font-semibold text-[#64748b] uppercase tracking-wider block">
                    VALOR PAGO
                  </span>
                  <span className="text-[18px] font-bold text-[#1e293b] block my-0.5 leading-tight tracking-tight">
                    R$ 140,00
                  </span>
                  <span className="text-[6.5px] text-[#94a3b8] font-medium block leading-none">
                    PIX
                  </span>
                </div>

                <div className="space-y-0.5 text-[7.5px] mt-2 mb-1">
                  <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b] shrink-0 font-normal">Pagador</span>
                    <span className="font-semibold text-[#1e293b] text-right truncate ml-1.5">Thiago Silva</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b] shrink-0 font-normal">Aluno</span>
                    <span className="font-semibold text-[#1e293b] text-right truncate ml-1.5">{studentFirstName}</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b] shrink-0 font-normal">CPF/CNPJ</span>
                    <span className="font-semibold text-[#1e293b] text-right ml-1.5">373.355.144-36</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b] shrink-0 font-normal">Data do Pagamento</span>
                    <span className="font-semibold text-[#1e293b] text-right ml-1.5">22/09/2026</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b] shrink-0 font-normal">Mês de Referência</span>
                    <span className="font-semibold text-[#1e293b] text-right ml-1.5 whitespace-nowrap">Parcela de Setembro/2026</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between text-[6px] text-[#94a3b8]">
                  <span>Recibo digital gerado pela plataforma Van360.</span>
                  <img
                    src="/assets/logo-van360.webp"
                    alt="Van360"
                    className="h-3 object-contain opacity-40"
                  />
                </div>
              </div>

              <div className="px-1.5 pt-1.5 pb-0.5 flex items-end justify-between gap-1.5 text-[#111b21]">
                <span className="text-[10px] min-[360px]:text-[10.5px] font-normal leading-tight truncate">
                  Segue o recibo {getStudentPreposition(undefined, studentFirstName)} {studentFirstName} referente a Set/26
                </span>
                <div className="flex items-center gap-0.5 shrink-0 text-[9px] text-[#667781] select-none ml-auto">
                  <span>16:37</span>
                  <svg viewBox="0 0 16 11" height="8" width="12" className="text-[#53bdeb] fill-current">
                    <path d="M11.15 1.08L5.7 6.53 3.85 4.68 2.79 5.74 5.7 8.65 12.21 2.14 11.15 1.08zM14.33 2.14L7.82 8.65 6.94 7.77 5.88 8.83 7.82 10.77 15.39 3.2 14.33 2.14z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] min-[360px]:text-xs text-slate-500 text-center mt-2.5 min-[360px]:mt-3 max-w-[340px] leading-snug min-[360px]:leading-relaxed">
          Com o Van360, os recibos são gerados automaticamente e enviados aos pais pelo WhatsApp em um toque.
        </p>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default ReciboPreviewDialog;
