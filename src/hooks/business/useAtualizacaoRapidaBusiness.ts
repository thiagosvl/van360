import { useCallback, useMemo, useState } from "react";
import { Passageiro } from "@/types/passageiro";
import { PassageiroBatchUpdateItem } from "@/services/api/passageiro.api";

type EditableField = "escola_id" | "veiculo_id" | "turma" | "periodo" | "valor_cobranca" | "dia_vencimento" | "ativo";

export function useAtualizacaoRapidaBusiness() {
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<PassageiroBatchUpdateItem>>>({});

  const updateField = useCallback((
    passageiroId: string,
    field: EditableField,
    value: PassageiroBatchUpdateItem[EditableField],
    original: Passageiro
  ) => {
    setPendingChanges((prev) => {
      const currentChanges = { ...(prev[passageiroId] || {}) };
      const originalValue = original[field as keyof Passageiro];

      const isSameAsOriginal = originalValue === value ||
        (value === null && (originalValue === null || originalValue === undefined || originalValue === ""));

      if (isSameAsOriginal) {
        delete currentChanges[field];
      } else {
        currentChanges[field] = value as never;
      }

      if (Object.keys(currentChanges).length === 0) {
        const next = { ...prev };
        delete next[passageiroId];
        return next;
      }

      return {
        ...prev,
        [passageiroId]: currentChanges,
      };
    });
  }, []);

  const applyBulk = useCallback((
    selectedIds: string[],
    field: EditableField,
    value: PassageiroBatchUpdateItem[EditableField],
    originalMap: Map<string, Passageiro>
  ) => {
    setPendingChanges((prev) => {
      const next = { ...prev };

      for (const id of selectedIds) {
        const original = originalMap.get(id);
        if (!original) continue;

        const currentChanges = { ...(next[id] || {}) };
        const originalValue = original[field as keyof Passageiro];

        const isSameAsOriginal = originalValue === value ||
          (value === null && (originalValue === null || originalValue === undefined || originalValue === ""));

        if (isSameAsOriginal) {
          delete currentChanges[field];
        } else {
          currentChanges[field] = value as never;
        }

        if (Object.keys(currentChanges).length === 0) {
          delete next[id];
        } else {
          next[id] = currentChanges;
        }
      }

      return next;
    });
  }, []);

  const discardChanges = useCallback(() => {
    setPendingChanges({});
  }, []);

  const isDirty = useCallback((passageiroId: string): boolean => {
    const changes = pendingChanges[passageiroId];
    return Boolean(changes && Object.keys(changes).length > 0);
  }, [pendingChanges]);

  const getEffectiveValue = useCallback(<K extends EditableField>(
    passageiro: Passageiro,
    field: K
  ): Passageiro[K] | PassageiroBatchUpdateItem[K] => {
    const passageiroId = passageiro.id;
    if (passageiroId && pendingChanges[passageiroId]?.[field] !== undefined) {
      return pendingChanges[passageiroId][field] as PassageiroBatchUpdateItem[K];
    }
    return passageiro[field as keyof Passageiro] as Passageiro[K];
  }, [pendingChanges]);

  const changedItemsList = useMemo((): PassageiroBatchUpdateItem[] => {
    const result: PassageiroBatchUpdateItem[] = [];

    for (const [id, changes] of Object.entries(pendingChanges)) {
      if (Object.keys(changes).length > 0) {
        result.push({
          id,
          ...changes,
        });
      }
    }

    return result;
  }, [pendingChanges]);

  const dirtyCount = changedItemsList.length;

  return {
    pendingChanges,
    updateField,
    applyBulk,
    discardChanges,
    isDirty,
    getEffectiveValue,
    changedItemsList,
    dirtyCount,
  };
}
