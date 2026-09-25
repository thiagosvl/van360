import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { getDriverDisplayName } from "@/utils/formatters/user";
import { WhatsAppShowcaseEmulator, ShowcaseTabType } from "@/components/features/demonstracoes/WhatsAppShowcaseEmulator";

export interface WhatsAppShowcaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ShowcaseTabType;
  driverName?: string;
  passageiroNome?: string;
}

export function WhatsAppShowcaseDialog({
  isOpen,
  onClose,
  initialTab = "cobranca",
  driverName: customDriverName,
  passageiroNome = "Bianca",
}: WhatsAppShowcaseDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const activeDriverName =
    customDriverName ||
    getDriverDisplayName(profile, { fallback: "Tio Thiago" });

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Demonstrações do WhatsApp"
        subtitle="Veja como seus clientes recebem mensagens profissionais no celular"
        icon={<WhatsAppIcon className="w-5 h-5 text-emerald-600" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-3 sm:p-5 bg-slate-50/50 overflow-y-auto">
        <WhatsAppShowcaseEmulator
          initialTab={initialTab}
          driverName={activeDriverName}
          passageiroNome={passageiroNome}
          logoUrl={profile?.logo_url}
          userChavePix={profile?.chave_pix}
          layoutMode="tabs"
        />
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default WhatsAppShowcaseDialog;
