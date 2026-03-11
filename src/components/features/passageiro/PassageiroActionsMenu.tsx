import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { usePassageiroActions } from "@/hooks/ui/usePassageiroActions";
import { Passageiro } from "@/types/passageiro";
import { memo } from "react";

interface PassageiroActionsMenuProps {
  passageiro: Passageiro;
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleCobrancaAutomatica: (passageiro: Passageiro) => void;
  onToggleStatus: (passageiro: Passageiro) => void;
  onDelete: (passageiro: Passageiro) => void;
  onOpenUpgradeDialog?: (passageiroId?: string) => void;
  onGenerateContract?: (passageiro: Passageiro) => void;
}

export const PassageiroActionsMenu = memo(function PassageiroActionsMenu({
  passageiro,
  onHistorico,
  onEdit,
  onToggleCobrancaAutomatica,
  onToggleStatus,
  onDelete,
  onOpenUpgradeDialog,
  onGenerateContract,
}: PassageiroActionsMenuProps) {
  const actions = usePassageiroActions({
    passageiro,
    onHistorico,
    onEdit,
    onToggleCobrancaAutomatica,
    onToggleStatus,
    onDelete,
    onOpenUpgradeDialog,
    onGenerateContract,
  });

  return <ActionsDropdown actions={actions} />;
});
