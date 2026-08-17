import React, { useState } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { CarteirinhaObservacoes } from "@/components/features/passageiro/carteirinha/CarteirinhaObservacoes";
import { useUpdateObservacoesResponsavelMutation } from "@/hooks/api/useResponsavelAuthApi";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { STORAGE_KEYS } from "@/constants";
import { toast } from "sonner";

interface ResponsavelCarteirinhaObservacoesProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaObservacoes: React.FC<ResponsavelCarteirinhaObservacoesProps> = ({ carteirinha }) => {
  const { token } = useResponsavelAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [obsText, setObsText] = useState(carteirinha.observacoes || "");

  const updateObservacoes = useUpdateObservacoesResponsavelMutation();

  const handleStartEdit = () => {
    setObsText(carteirinha.observacoes || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setObsText(carteirinha.observacoes || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const authToken = token || localStorage.getItem(STORAGE_KEYS.RESPONSAVEL_TOKEN);
    if (!authToken) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    try {
      await updateObservacoes.mutateAsync({
        passageiroId: carteirinha.id,
        observacoes: obsText,
        token: authToken,
      });

      carteirinha.observacoes = obsText;
      setIsEditing(false);
      toast.success("Observações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar observações.");
    }
  };

  return (
    <CarteirinhaObservacoes
      observacoes={carteirinha.observacoes}
      isEditing={isEditing}
      obsText={obsText}
      isSaving={updateObservacoes.isPending}
      onStartEdit={handleStartEdit}
      onCancelEdit={handleCancelEdit}
      onChangeText={setObsText}
      onSave={handleSave}
      canManageOverride={true}
    />
  );
};
