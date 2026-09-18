const STORAGE_KEY_IMPERSONATING = "van360_is_impersonating";

export function markAsImpersonating(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_IMPERSONATING, "true");
  } catch {
    return;
  }
}

export function isImpersonating(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY_IMPERSONATING) === "true";
  } catch {
    return false;
  }
}

export function clearImpersonating(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_IMPERSONATING);
  } catch {
    return;
  }
}
