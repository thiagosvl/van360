import { BAAS_FEATURE_FLAGS } from "@/constants/featureFlags";

export interface UserIdentifiable {
  email?: string | null;
  telefone?: string | null;
}

export function isUserInBaaSWhitelist(user?: UserIdentifiable | null): boolean {
  if (!BAAS_FEATURE_FLAGS.ENABLED || !user) {
    return false;
  }

  const rawEmail = user.email?.trim().toLowerCase();
  if (rawEmail) {
    const isEmailAllowed = BAAS_FEATURE_FLAGS.WHITELIST_EMAILS.some(
      (allowed) => allowed.trim().toLowerCase() === rawEmail
    );
    if (isEmailAllowed) {
      return true;
    }
  }

  const rawPhone = (user.telefone || "").replace(/\D/g, "");
  if (rawPhone) {
    const isPhoneAllowed = BAAS_FEATURE_FLAGS.WHITELIST_PHONES.some((allowed) => {
      const cleanAllowed = allowed.replace(/\D/g, "");
      return cleanAllowed && (rawPhone === cleanAllowed || rawPhone.endsWith(cleanAllowed) || cleanAllowed.endsWith(rawPhone));
    });
    if (isPhoneAllowed) {
      return true;
    }
  }

  return false;
}
