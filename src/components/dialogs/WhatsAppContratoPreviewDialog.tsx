import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { getDriverDisplayName } from "@/utils/formatters/user";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WhatsAppMessageContainer, WhatsAppActionButton } from "@/components/ui/WhatsAppMessageContainer";
import { ExternalLink } from "lucide-react";

export interface WhatsAppContratoPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  passageiroNome?: string;
}

export function WhatsAppContratoPreviewDialog({
  isOpen,
  onClose,
  driverName: customDriverName,
  passageiroNome = "Bianca",
}: WhatsAppContratoPreviewDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const studentFirstName = passageiroNome.trim().split(" ")[0] || "Bianca";

  const activeDriverName =
    customDriverName ||
    getDriverDisplayName(profile, { fallback: "Tio(a) da Van" });

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Contrato digital"
        subtitle="Exemplo de mensagem enviada aos pais"
        icon={<WhatsAppIcon className="w-5 h-5 text-emerald-600" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-3 sm:p-4 bg-slate-100/60 flex flex-col items-center overflow-y-auto">
        <WhatsAppMessageContainer
          driverName={activeDriverName}
          time="16:50"
          actionButton={
            <WhatsAppActionButton
              label="Assinar Contrato"
              icon={
                <ExternalLink className="w-[18px] h-[18px] stroke-[#00a884] stroke-[1.6]" />
              }
            />
          }
          footerNote="Os pais recebem o link diretamente no WhatsApp e assinam pelo celular em menos de 1 minuto."
        >
          <p>
            Olá Mariana, o contrato de prestação de serviços de transporte escolar de {studentFirstName} já está pronto para assinatura digital.
          </p>

          <p>
            A assinatura é rápida, feita pelo celular e garante a vaga e a segurança do transporte.
          </p>
        </WhatsAppMessageContainer>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default WhatsAppContratoPreviewDialog;
