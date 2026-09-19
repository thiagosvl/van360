import { useCallback, useMemo, useState } from "react";
import { Passageiro } from "@/types/passageiro";
import { PassageiroBatchUpdateItem } from "@/services/api/passageiro.api";

type EditableField = "escola_id" | "veiculo_id" | "turma" | "periodo" | "valor_cobranca" | "dia_vencimento" | "ativo";

function isFieldValueEqual(
  originalValue: unknown,
  newValue: unknown,
  isNumeric: boolean
): boolean {
  if (isNumeric) {
    const numOrig = originalValue ? Number(originalValue) : null;
    const numNew = newValue ? Number(newValue) : null;
    return numOrig === numNew;
  }
  return (
    originalValue === newValue ||
    (newValue === null && (originalValue === null || originalValue === undefined || originalValue === ""))
  );
}

function resolvePendingChanges(
  current: Partial<PassageiroBatchUpdateItem>,
  field: EditableField,
  value: PassageiroBatchUpdateItem[EditableField],
  originalValue: unknown
): Partial<PassageiroBatchUpdateItem> | null {
  const isNumeric = field === "valor_cobranca" || field === "dia_vencimento";
  const isEqual = isFieldValueEqual(originalValue, value, isNumeric);

  const next = { ...current };
  if (isEqual) {
    delete next[field];
  } else {
    Object.assign(next, { [field]: value });
  }

  return Object.keys(next).length === 0 ? null : next;
}

export function useAtualizacaoRapidaBusiness() {
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<PassageiroBatchUpdateItem>>>({});

  const updateField = useCallback((
    passageiroId: string,
    field: EditableField,
    value: PassageiroBatchUpdateItem[EditableField],
    original: Passageiro
  ) => {
    setPendingChanges((prev) => {
      const updated = resolvePendingChanges(
        prev[passageiroId] || {},
        field,
        value,
        original[field as keyof Passageiro]
      );

      const next = { ...prev };
      if (!updated) {
        delete next[passageiroId];
      } else {
        next[passageiroId] = updated;
      }
      return next;
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

        const updated = resolvePendingChanges(
          next[id] || {},
          field,
          value,
          original[field as keyof Passageiro]
        );

        if (!updated) {
          delete next[id];
        } else {
          next[id] = updated;
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
