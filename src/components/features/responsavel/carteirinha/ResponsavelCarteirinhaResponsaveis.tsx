import React, { useMemo } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { CarteirinhaResponsaveis } from "@/components/features/passageiro/carteirinha/CarteirinhaResponsaveis";
import { mapearCarteirinhaParaPassageiro } from "@/utils/domain/carteirinhaConverter";

interface ResponsavelCarteirinhaResponsaveisProps {
  carteirinha: ResponsavelCarteirinhaData;
  onRefresh?: () => void;
}

export const ResponsavelCarteirinhaResponsaveis: React.FC<ResponsavelCarteirinhaResponsaveisProps> = ({
  carteirinha,
  onRefresh,
}) => {
  const passageiroConvertido = useMemo(() => mapearCarteirinhaParaPassageiro(carteirinha), [carteirinha]);

  return (
    <CarteirinhaResponsaveis
      passageiro={passageiroConvertido}
      onEditClick={() => {}}
      canManageOverride={true}
      hideAppAccess={true}
      hideAddress={true}
      hideWhatsappButton={true}
      hideEditButton={true}
      isResponsavelPortal={true}
      onRefresh={onRefresh}
    />
  );
};
