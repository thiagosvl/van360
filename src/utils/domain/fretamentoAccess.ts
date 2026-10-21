import type { Usuario } from "@/types/usuario";

const LIBERADOS_IDS = new Set([
  "58fd357f-f5f6-4d59-b0a2-04ce8a2ddef0",
]);

const LIBERADOS_TELEFONES = new Set([
  "11951186951",
  "5511951186951",
]);

const LIBERADOS_CPFS = new Set([
  "39542391838",
]);

const extrairApenasDigitos = (valor?: string | null): string => {
  if (!valor) return "";
  return valor.replace(/\D/g, "");
};

export const canAccessFretamentos = (
  profile?: Partial<Usuario> | null,
  user?: { id?: string; phone?: string } | null
): boolean => {
  const profileId = profile?.id;
  const authUserId = user?.id;

  if (profileId && LIBERADOS_IDS.has(profileId)) {
    return true;
  }

  if (authUserId && LIBERADOS_IDS.has(authUserId)) {
    return true;
  }

  const telefoneProfile = extrairApenasDigitos(profile?.telefone);
  if (telefoneProfile) {
    if (LIBERADOS_TELEFONES.has(telefoneProfile) || LIBERADOS_TELEFONES.has(telefoneProfile.slice(-11))) {
      return true;
    }
  }

  const telefoneAuth = extrairApenasDigitos(user?.phone);
  if (telefoneAuth) {
    if (LIBERADOS_TELEFONES.has(telefoneAuth) || LIBERADOS_TELEFONES.has(telefoneAuth.slice(-11))) {
      return true;
    }
  }

  const cpfProfile = extrairApenasDigitos(profile?.cpfcnpj);
  if (cpfProfile && LIBERADOS_CPFS.has(cpfProfile)) {
    return true;
  }

  return false;
};
