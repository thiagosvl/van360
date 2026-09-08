import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useContratoActions } from "@/hooks/ui/useContratoActions";
import { memo } from "react";

import { ContratoListItem } from "@/types/contract";

interface ContratoActionsMenuProps {
  item: ContratoListItem;
  tipo: 'contrato' | 'passageiro';
  status?: string;
  isDesativado?: boolean;
  usarContratos?: boolean;
  onVerPassageiro: (id: string) => void;
  onCopiarLink?: (token: string) => void;
  onEnviarWhatsApp?: () => void;
  onExcluir?: (id: string) => void;
  onSubstituir?: (id: string) => void;
  onGerarContrato?: (passageiroId: string) => void;
  onCompletarCadastro?: (passageiroId: string, item?: ContratoListItem) => void;
  onVisualizarLink?: (token: string) => void;
  onVisualizarFinal?: (url: string) => void;
}

import { ContratoSummary } from "./ContratoSummary";

export const ContratoActionsMenu = memo(function ContratoActionsMenu(props: ContratoActionsMenuProps) {
  const actions = useContratoActions(props);

  return (
    <ActionsDropdown 
      actions={actions} 
      header={<ContratoSummary item={props.item} />}
    />
  );
});
