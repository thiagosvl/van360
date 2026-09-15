import { UserType } from "@/types/enums";

/**
 * Formata o tipo de perfil do usuário para exibição amigável na interface.
 * Tanto o Motorista principal quanto o Motorista Auxiliar são exibidos como "Motorista".
 * O Monitor é exibido como "Monitor".
 */
export function formatUserRoleLabel(tipo?: string | UserType): string {
  switch (tipo) {
    case UserType.MOTORISTA_AUXILIAR:
      return "Motorista";
    case UserType.MONITOR:
      return "Monitor";
    case UserType.MOTORISTA:
      return "Motorista";
    default:
      return "Motorista";
  }
}

export function getDriverDisplayName(usuario?: {
  cpfcnpj?: string | null;
  apelido?: string | null;
  razao_social?: string | null;
  nome?: string | null;
} | null): string {
  if (!usuario) return "";
  if (usuario.apelido && usuario.apelido.trim()) {
    return usuario.apelido.trim();
  }
  const doc = usuario.cpfcnpj;
  const isCnpj = doc ? doc.replace(/\D/g, "").length > 11 : false;
  if (isCnpj && usuario.razao_social && usuario.razao_social.trim()) {
    return usuario.razao_social.trim();
  }
  return usuario.nome || usuario.razao_social || "";
}

