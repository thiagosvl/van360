export const formatShortName = (fullName?: string, includeSecond?: boolean) => {
  if (!fullName) return "";
  const names = fullName.trim().split(/\s+/);
  if (includeSecond && names.length >= 2) {
    return `${names[0]} ${names[1]}`;
  }
  if (names.length <= 2) return fullName.trim();
  return names[0] || "";
};

export const formatFirstName = (fullName?: string) => {
  if (!fullName) return "N/Inf.";
  const names = fullName.trim().split(/\s+/);
  return names[0] || "N/Inf.";
};

export const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

import { ONBOARDING_MOCK_RESPONSAVEL_NOME, ONBOARDING_MOCK_RESPONSAVEL_TELEFONE } from "../constants";

export const isResponsavelMockNome = (nome?: string | null) => {
  if (!nome) return false;
  
  const normalizedNome = nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents

  return (
    normalizedNome.includes("responsavel nao info") ||
    normalizedNome.includes("responsavel teste") ||
    nome === ONBOARDING_MOCK_RESPONSAVEL_NOME
  );
};

export const isResponsavelMockTelefone = (telefone?: string | null) => {
  if (!telefone) return false;
  return telefone.replace(/\D/g, "") === ONBOARDING_MOCK_RESPONSAVEL_TELEFONE;
};

export const formatNomeResponsavelExibicao = (nome?: string | null) => {
  if (!nome) return "Não informado";
  if (isResponsavelMockNome(nome)) return nome;
  return formatFirstName(nome);
};

export const formatNomeResponsavelCompletoExibicao = (nome?: string | null) => {
  if (!nome) return "Não informado";
  return nome;
};
