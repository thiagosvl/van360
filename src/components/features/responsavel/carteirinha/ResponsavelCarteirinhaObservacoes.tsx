import React from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { CarteirinhaObservacoes } from "@/components/features/passageiro/carteirinha/CarteirinhaObservacoes";

interface ResponsavelCarteirinhaObservacoesProps {
  carteirinha: ResponsavelCarteirinhaData;
}

export const ResponsavelCarteirinhaObservacoes: React.FC<ResponsavelCarteirinhaObservacoesProps> = ({ carteirinha }) => {
  return (
    <CarteirinhaObservacoes
      observacoes={carteirinha.observacoes}
      isEditing={false}
      obsText={carteirinha.observacoes || ""}
      isSaving={false}
      onStartEdit={() => {}}
      onCancelEdit={() => {}}
      onChangeText={() => {}}
      onSave={() => {}}
      canManageOverride={false}
    />
  );
};
