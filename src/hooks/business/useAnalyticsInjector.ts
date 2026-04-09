import { useEffect } from "react";
import { loadSavedPreferences } from "./useCookieConsent";

const GTM_ID = "GTM-5VLZKJ66";
const CLARITY_ID = "w4mjidk4lw";

function injectGTM() {
  if (window.__van360GTMLoaded) {
    return;
  }
  window.__van360GTMLoaded = true;

  const script = document.createElement("script");
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;
  document.head.appendChild(script);

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.cssText = "display:none;visibility:hidden";

  const noscript = document.createElement("noscript");
  noscript.appendChild(iframe);
  document.body.prepend(noscript);
}

function injectClarity() {
  if (window.__van360ClarityLoaded) {
    return;
  }
  window.__van360ClarityLoaded = true;

  const script = document.createElement("script");
  script.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`;
  document.head.appendChild(script);
}

interface AnalyticsInjectorOptions {
  gtm?: boolean;
  clarity?: boolean;
  force?: boolean;
}

export function useAnalyticsInjector({ gtm = false, clarity = false, force = false }: AnalyticsInjectorOptions) {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const prefs = loadSavedPreferences();
    const isPending = prefs === null;

    if (gtm) {
      if (force || isPending || prefs.gtm) {
        injectGTM();
      }
    }

    if (clarity) {
      if (force || isPending || prefs.clarity) {
        injectClarity();
      }
    }
  }, []);
}
