import { useState } from "react";
import { CookieBanner } from "@/components/features/CookieBanner";
import { CookiePreferencesDialog } from "@/components/features/CookiePreferencesDialog";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { CookiePreferences, useCookieConsent } from "@/hooks/business/useCookieConsent";

const DEFAULT_PREFERENCES: CookiePreferences = { gtm: true, clarity: true };

export function CookieConsentGlobal() {
  useAnalyticsInjector({ gtm: true, clarity: true });

  const { preferences, isPending, saveConsent } = useCookieConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <>
      <CookieBanner
        isPending={isPending}
        onAccept={() => saveConsent({ gtm: true, clarity: true })}
        onReject={() => saveConsent({ gtm: false, clarity: false })}
        onCustomize={() => setPrefsOpen(true)}
      />
      <CookiePreferencesDialog
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        onSave={saveConsent}
        currentPreferences={preferences ?? DEFAULT_PREFERENCES}
      />
    </>
  );
}
