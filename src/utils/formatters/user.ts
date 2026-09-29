import { UserType } from "@/types/enums";
import { formatShortName } from "./name";

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

export function getDriverDisplayName(
  usuario?: {
    cpfcnpj?: string | null;
    apelido?: string | null;
    razao_social?: string | null;
    nome?: string | null;
    nomeMotorista?: string | null;
  } | null,
  options?: {
    shortName?: boolean;
    fallback?: string;
  }
): string {
  if (!usuario) return options?.fallback || "";
  if (usuario.apelido && usuario.apelido.trim()) {
    return usuario.apelido.trim();
  }
  const doc = usuario.cpfcnpj;
  const isCnpj = doc ? doc.replace(/\D/g, "").length > 11 : false;
  if (isCnpj && usuario.razao_social && usuario.razao_social.trim()) {
    return usuario.razao_social.trim();
  }
  const baseName = usuario.nome || usuario.nomeMotorista || usuario.razao_social || "";
  if (options?.shortName && baseName) {
    return formatShortName(baseName, true) || baseName;
  }
  return baseName || options?.fallback || "";
}

