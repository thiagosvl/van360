import { openBrowserLink, copyToClipboard } from "@/utils/browser";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { buildPrePassageiroShareMessage, buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { toast } from "@/utils/notifications/toast";
import {
  Check,
  Copy,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { useActivityTracker } from "@/hooks/business/useActivityTracker";
import { AtividadeAcao } from "@/types/enums";

interface QuickRegistrationLinkProps {
  profile: { id?: string } | null | undefined;
  pendingCount?: number;
  className?: string;
}

export function QuickRegistrationLink({
  profile,
  pendingCount = 0,
  className,
}: QuickRegistrationLinkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const { trackActivity } = useActivityTracker();

  const handleCopyLink = async () => {
    if (isCopying || isCopied) return;

    if (!profile?.id) {
      toast.error("erro.operacao", {
        description: "ID do usuário não encontrado.",
      });
      return;
    }

    setIsCopying(true);
    trackActivity(AtividadeAcao.LINK_PRECADASTRO_COPIADO, {
      entidadeId: profile.id,
      descricao: "Link de pré-cadastro copiado para a área de transferência.",
    });

    try {
      const link = buildPrepassageiroLink(profile.id);
      const message = buildPrePassageiroShareMessage(link);
      const success = await copyToClipboard(message);
      if (success) {
        setIsCopied(true);
      } else {
        toast.error("sistema.erro.falhaCopiar", {
          description: "Não foi possível copiar o link.",
        });
      }
    } finally {
      setTimeout(() => {
        setIsCopying(false);
        setIsCopied(false);
      }, 3500);
    }
  };

  const handleShareWhatsApp = () => {
    if (isSharingWhatsApp) return;
    if (!profile?.id) return;

    setIsSharingWhatsApp(true);
    trackActivity(AtividadeAcao.LINK_PRECADASTRO_COMPARTILHADO, {
      entidadeId: profile.id,
      descricao: "Link de pré-cadastro compartilhado via WhatsApp.",
    });

    try {
      const link = buildPrepassageiroLink(profile.id);
      const message = buildPrePassageiroShareMessage(link);
      const url = buildWhatsAppUrl(null, message);
      openBrowserLink(url);
    } finally {
      setTimeout(() => {
        setIsSharingWhatsApp(false);
      }, 3500);
    }
  };

  return (
    <div className={cn("mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500", className)}>
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-emerald-950 tracking-tight leading-snug">Deixe os pais preencherem o cadastro!</p>
          <p className="text-[11px] text-emerald-700">
            Envie este link para os responsáveis. Eles preenchem o cadastro e os dados aparecem no seu aplicativo. Depois, você só precisa preencher o valor e dia do vencimento de cada aluno.
          </p>
        </div>
      </div>

      <div className="flex gap-2 w-full lg:w-auto shrink-0">
        <button
          onClick={handleShareWhatsApp}
          disabled={isSharingWhatsApp}
          className={cn(
            "h-11 px-4 bg-[#25D366] hover:bg-[#20b858] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-green-200/50 flex-1 lg:flex-none flex justify-center items-center gap-2 active:scale-95 cursor-pointer",
            isSharingWhatsApp && "opacity-75 cursor-not-allowed pointer-events-none"
          )}
        >
          {isSharingWhatsApp ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Abrindo...</span>
            </>
          ) : (
            <>
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              <span>WhatsApp</span>
            </>
          )}
        </button>
        <button
          onClick={(e) => {
            e.currentTarget.blur();
            handleCopyLink();
          }}
          disabled={isCopying || isCopied}
          className={cn(
            "h-11 px-4 text-[13px] font-bold rounded-xl transition-all shadow-sm flex-1 lg:flex-none flex justify-center items-center gap-2 active:scale-95 cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            isCopied
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed pointer-events-none"
              : isCopying
                ? "bg-white text-emerald-700 border border-emerald-200 opacity-75 cursor-not-allowed pointer-events-none"
                : "bg-white text-emerald-700 border border-emerald-200 hover:bg-white hover:border-emerald-300 hover:text-emerald-800"
          )}
        >
          {isCopying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
              <span>Copiando...</span>
            </>
          ) : isCopied ? (
            <>
              <Check className="h-4 w-4 text-emerald-700" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
