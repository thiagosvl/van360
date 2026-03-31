import { ActionSheet, ActionSheetItem } from "@/components/common/ActionSheet";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Usuario } from "@/types/usuario";
import { isMobilePlatform } from "@/utils/detectPlatform";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { Copy, CopyCheck, MessageCircle, UserPlus } from "lucide-react";
import { useState } from "react";

interface PassengerOnboardingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualRegistration: () => void;
  profile?: Usuario | null;
}

export function PassengerOnboardingDrawer({
  open,
  onOpenChange,
  onManualRegistration,
  profile,
}: PassengerOnboardingDrawerProps) {
  const [copied, setCopied] = useState(false);
  const isMobile = isMobilePlatform();

  const getRegistrationLink = () => {
    if (!profile?.id) return "";
    return buildPrepassageiroLink(profile.id);
  };

  const handleShareLink = () => {
    const link = getRegistrationLink();
    if (!link) return;

    // Copia silenciosamente, apenas feedback visual no ícone
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      // Reset visual state after 2s
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    const link = getRegistrationLink();
    if (!link) return;

    const text = encodeURIComponent(`Olá! Aqui está o link para o cadastro do passageiro na nossa van: ${link}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;

    window.open(whatsappUrl, "_blank");
  };

  const actions: ActionSheetItem[] = [
    ...(isMobile ? [{
      label: "Enviar Link para os Pais",
      icon: <WhatsAppIcon className="h-4 w-4 text-green-600" />,
      onClick: handleWhatsAppShare,
      className: "text-green-600 font-bold",
      hasSeparatorAfter: true,
    }] : []),
    {
      label: copied ? "Link Copiado!" : "Copiar Link de Cadastro",
      icon: copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />,
      onClick: handleShareLink,
    },
    {
      label: "Cadastrar Manualmente",
      icon: <UserPlus className="h-4 w-4" />,
      onClick: onManualRegistration,
    }
  ];

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cadastrar Passageiro"
      actions={actions}
    />
  );
}
