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
