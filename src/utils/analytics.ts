interface CustomWindow extends Window {
  dataLayer?: unknown[];
  fbq?: {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
  };
  _fbq?: unknown;
  __van360AnalyticsLoaded?: boolean;
  Capacitor?: {
    isNativePlatform?: () => boolean;
  };
}

export function initAnalytics(): void {
  if (typeof window === "undefined") return;

  const gtmId = import.meta.env.VITE_PUBLIC_GTM_ID;
  const fbPixelId = import.meta.env.VITE_PUBLIC_FB_PIXEL_ID;

  if (!import.meta.env.PROD || (!gtmId && !fbPixelId)) return;

  const win = window as unknown as CustomWindow;
  if (win.location.pathname.startsWith("/admin")) return;

  const isLocal = win.location.hostname === "localhost" || win.location.hostname === "127.0.0.1";
  const isCapacitor = Boolean(win.Capacitor?.isNativePlatform?.());

  if (isLocal && !isCapacitor) return;
  if (win.__van360AnalyticsLoaded) return;
  win.__van360AnalyticsLoaded = true;

  if (gtmId) {
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    const gtmScript = document.createElement("script");
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.appendChild(gtmScript);
    }
  }

  if (fbPixelId) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue = fbq.queue || [];
        fbq.queue.push(args);
      }
    } as NonNullable<CustomWindow["fbq"]>;

    if (!win.fbq) {
      win.fbq = fbq;
      win._fbq = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];

      const fbScript = document.createElement("script");
      fbScript.async = true;
      fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(fbScript, firstScript);
      } else {
        document.head.appendChild(fbScript);
      }

      fbq("init", fbPixelId);
      fbq("track", "PageView");
    }
  }
}
