import type { Usuario } from "@/types/usuario";

export const canAccessFretamentos = (
  _profile?: Partial<Usuario> | null,
  _user?: { id?: string; phone?: string } | null
): boolean => {
  return true;
};
