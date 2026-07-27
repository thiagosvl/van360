import { useEffect } from "react";

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface AttributionData {
  utm?: UtmParams;
  referrer?: string;
}

const STORAGE_KEY = "van360_attribution_metadados";

export function getStoredAttribution(): AttributionData | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as AttributionData;
  } catch {
    return undefined;
  }
}

export function clearStoredAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignorar erros em ambiguidades de storage
  }
}

export function useAttribution(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");
    const utmContent = urlParams.get("utm_content");
    const utmTerm = urlParams.get("utm_term");

    const rawReferrer = document.referrer || undefined;
    const isExternalReferrer = Boolean(rawReferrer && !rawReferrer.startsWith(window.location.origin));

    if (hasUtm || rawReferrer) {
      const existing = getStoredAttribution() || {};

      const utm: UtmParams = {
        source: utmSource || existing.utm?.source,
        medium: utmMedium || existing.utm?.medium,
        campaign: utmCampaign || existing.utm?.campaign,
        content: utmContent || existing.utm?.content,
        term: utmTerm || existing.utm?.term,
      };

      // Remover chaves undefined
      Object.keys(utm).forEach((key) => {
        const k = key as keyof UtmParams;
        if (!utm[k]) delete utm[k];
      });

      const referrer = isExternalReferrer ? rawReferrer : (existing.referrer || (rawReferrer ? rawReferrer : undefined));

      const updated: AttributionData = {
        utm: Object.keys(utm).length > 0 ? utm : undefined,
        referrer,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignorar erros em ambiguidades de storage
      }
    }
  }, []);
}
