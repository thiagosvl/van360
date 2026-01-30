import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useContratoActions } from "@/hooks/ui/useContratoActions";
import { memo } from "react";

interface ContratoActionsMenuProps {
  item: any; // Pode ser Contrato ou Passageiro
  tipo: 'contrato' | 'passageiro';
  status?: string;
  onVerPassageiro: (id: string) => void;
  onCopiarLink?: (token: string) => void;
  onBaixarPDF?: (id: string) => void;
  onReenviarNotificacao?: (id: string) => void;
  onExcluir?: (id: string) => void;
  onSubstituir?: (id: string) => void;
  onGerarContrato?: (passageiroId: string) => void;
  onVisualizarLink?: (token: string) => void;
}

export const ContratoActionsMenu = memo(function ContratoActionsMenu(props: ContratoActionsMenuProps) {
  const actions = useContratoActions(props);

  return <ActionsDropdown actions={actions} />;
});
