import { openBrowserLink, copyToClipboard } from "@/utils/browser";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { buildPrePassageiroShareMessage, buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { toast } from "@/utils/notifications/toast";
import {
  Check,
  Copy,
  Loader2,
  X,
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
  onDismiss?: () => void;
}

export function QuickRegistrationLink({
  profile,
  pendingCount = 0,
  className,
  onDismiss,
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
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } else {
        toast.error("sistema.erro.falhaCopiar", {
          description: "Não foi possível copiar o link.",
        });
      }
    } finally {
      setIsCopying(false);
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
      }, 1000);
    }
  };

  return (
    <div
      className={cn(
        "relative bg-emerald-500/[0.08] border border-emerald-500/20 rounded-[18px] p-3.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-500",
        className
      )}
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 w-6 h-6 rounded-full bg-white border border-[#e5e5e5] shadow-xs flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-all active:scale-90 z-20 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-[14px] bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:h-5 fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] tracking-tight leading-snug">
            Deixe que os pais cadastrem os alunos!
          </p>
          <p className="text-xs leading-relaxed text-[#737373] mt-0.5">
            Os responsáveis preenchem o cadastro e os dados aparecem no seu aplicativo.
          </p>
        </div>
      </div>

      <div className="flex gap-2 w-full lg:w-auto shrink-0">
        <button
          onClick={handleShareWhatsApp}
          disabled={isSharingWhatsApp}
          className={cn(
            "h-9 sm:h-10 px-4 bg-[#25D366] hover:bg-[#20b858] text-white text-sm font-base rounded-[18px] transition-all shadow-xs active:scale-[0.98] w-full flex md:hidden justify-center items-center gap-2 cursor-pointer",
            isSharingWhatsApp && "opacity-75 cursor-not-allowed pointer-events-none"
          )}
        >
          {isSharingWhatsApp ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Abrindo...</span>
            </>
          ) : (
            <>
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              <span>Enviar link aos pais</span>
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
            "h-9 px-4 text-xs font-semibold rounded-[18px] transition-all shadow-xs hidden md:flex lg:flex-none justify-center items-center gap-2 active:scale-[0.98] cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            isCopied
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-not-allowed pointer-events-none"
              : isCopying
                ? "bg-white text-emerald-700 border border-emerald-200 opacity-75 cursor-not-allowed pointer-events-none"
                : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          )}
        >
          {isCopying ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
              <span>Copiando...</span>
            </>
          ) : isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar link de cadastro</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
