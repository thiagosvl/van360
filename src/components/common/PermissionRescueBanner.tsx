import React from "react";
import { Banner } from "@/components/ui/Banner";
import { BellOff, MapPinOff, Settings } from "lucide-react";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { Capacitor } from "@capacitor/core";
import { PermissionRescueType, UserType } from "@/types/enums";

interface PermissionRescueBannerProps {
  type: PermissionRescueType;
  role?: UserType.RESPONSAVEL | UserType.MOTORISTA;
  className?: string;
  onDismiss?: () => void;
}

export function PermissionRescueBanner({
  type,
  role = UserType.MOTORISTA,
  className,
  onDismiss,
}: PermissionRescueBannerProps) {
  const { openDeviceSettings } = useAppPermissions();

  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  let title = "";
  let description = "";
  let icon = <Settings className="w-5 h-5" />;

  if (type === PermissionRescueType.PUSH) {
    title = "Notificações desativadas";
    description =
      role === UserType.RESPONSAVEL
        ? "Ative as notificações para ser avisado quando a van estiver a caminho e quando seu filho embarcar ou desembarcar."
        : "Ative as notificações para receber alertas de novas solicitações de passageiros, avisos de pagamentos e mensagens operacionais.";
    icon = <BellOff className="w-5 h-5 text-amber-600" />;
  } else if (type === PermissionRescueType.LOCATION) {
    title = "Localização (GPS) desativada";
    description =
      "Ative a permissão de localização para transmitir o trajeto da van em tempo real aos responsáveis durante as rotas.";
    icon = <MapPinOff className="w-5 h-5 text-amber-600" />;
  } else {
    title = "Notificações e GPS desativados";
    description =
      "Habilite as permissões nas configurações do aparelho para receber alertas operacionais e transmitir o trajeto da van aos responsáveis.";
    icon = <Settings className="w-5 h-5 text-amber-600" />;
  }

  return (
    <Banner
      variant="warning"
      icon={icon}
      title={title}
      description={description}
      className={className}
      onDismiss={onDismiss}
      action={{
        label: "Configurar no Aparelho",
        onClick: () => {
          openDeviceSettings();
        },
      }}
    />
  );
}
