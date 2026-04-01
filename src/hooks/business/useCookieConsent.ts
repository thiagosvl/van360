import { useState } from "react";

const STORAGE_KEY = "van360_cookie_consent";

export type CookiePreferences = {
  gtm: boolean;
  clarity: boolean;
};

export function loadSavedPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function persistPreferences(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(() =>
    loadSavedPreferences()
  );

  const saveConsent = (prefs: CookiePreferences) => {
    persistPreferences(prefs);
    const anyRejected = !prefs.gtm || !prefs.clarity;
    if (anyRejected) {
      window.location.reload();
    } else {
      setPreferences(prefs);
    }
  };

  return { preferences, isPending: preferences === null, saveConsent };
}
