import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { usePassageiroActions } from "@/hooks/ui/usePassageiroActions";
import { Passageiro } from "@/types/passageiro";
import { memo } from "react";

interface PassageiroActionsMenuProps {
  passageiro: Passageiro;
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleStatus: (passageiro: Passageiro) => void;
  onDelete: (passageiro: Passageiro) => void;
  onEnviarWhatsApp?: (passageiro: Passageiro) => void;
  usarContratos?: boolean;
}

export const PassageiroActionsMenu = memo(function PassageiroActionsMenu({
  onEnviarWhatsApp,
  usarContratos,
  ...props
}: PassageiroActionsMenuProps) {
  const actions = usePassageiroActions({
    ...props,
    onEnviarWhatsApp,
    usarContratos,
  });

  return (
    <ActionsDropdown actions={actions} />
  );
});
