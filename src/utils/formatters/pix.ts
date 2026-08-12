import { cpfCnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { TipoChavePix } from "@/types/enums";

export function formatarChavePix(chave?: string | null, tipo?: string | null): string {
  if (!chave || chave.trim() === "") return "—";

  const clean = chave.trim();
  const tipoUpper = (tipo || "").toUpperCase();

  if (tipoUpper === TipoChavePix.TELEFONE) {
    return phoneMask(clean);
  }

  if (
    tipoUpper === TipoChavePix.EVP ||
    tipoUpper === TipoChavePix.ALEATORIA ||
    clean.length === 32
  ) {
    return evpMask(clean);
  }

  if (
    tipoUpper === TipoChavePix.CPF ||
    tipoUpper === TipoChavePix.CNPJ ||
    (!tipoUpper && (/^\d{11}$/.test(clean) || /^\d{14}$/.test(clean)))
  ) {
    return cpfCnpjMask(clean);
  }

  if (/^\d{10,11}$/.test(clean) && !clean.includes("@")) {
    return phoneMask(clean);
  }

  return clean;
}
